import { BallState, ShotParams, PlayerGroup, BotDifficulty } from './types';

// Standard 6 pocket locations on 1000x500 virtual table
export const POCKET_LOCATIONS = [
  { x: 32, y: 32, name: 'top-left' },
  { x: 500, y: 22, name: 'top-center' },
  { x: 968, y: 32, name: 'top-right' },
  { x: 32, y: 468, name: 'bottom-left' },
  { x: 500, y: 478, name: 'bottom-center' },
  { x: 968, y: 468, name: 'bottom-right' },
];

const BALL_RADIUS = 14;

/**
 * Calculates optimal aim angle, power, and spin for the bot player
 */
export function calculateBotShot(
  balls: BallState[],
  botGroup: PlayerGroup,
  difficulty: BotDifficulty = 'medium'
): ShotParams {
  const cueBall = balls.find((b) => b.id === 0 && !b.isPocketed);
  if (!cueBall) {
    return { angle: 0, power: 50, spinX: 0, spinY: 0 };
  }

  // 1. Determine eligible target balls
  const unpocketed = balls.filter((b) => !b.isPocketed && b.id !== 0);
  let targetBalls: BallState[] = [];

  if (botGroup === 'solids') {
    const solids = unpocketed.filter((b) => b.number >= 1 && b.number <= 7);
    targetBalls = solids.length > 0 ? solids : unpocketed.filter((b) => b.number === 8);
  } else if (botGroup === 'stripes') {
    const stripes = unpocketed.filter((b) => b.number >= 9 && b.number <= 15);
    targetBalls = stripes.length > 0 ? stripes : unpocketed.filter((b) => b.number === 8);
  } else {
    // Open table: any ball except 8-ball
    const nonEight = unpocketed.filter((b) => b.number !== 8);
    targetBalls = nonEight.length > 0 ? nonEight : unpocketed;
  }

  if (targetBalls.length === 0) {
    targetBalls = unpocketed;
  }

  interface CandidateShot {
    targetBall: BallState;
    pocket: { x: number; y: number };
    angle: number;
    cutAngle: number;
    distance: number;
    score: number;
  }

  const candidates: CandidateShot[] = [];

  for (const target of targetBalls) {
    for (const pocket of POCKET_LOCATIONS) {
      // Vector from pocket to target
      const dxTP = target.x - pocket.x;
      const dyTP = target.y - pocket.y;
      const distToPocket = Math.hypot(dxTP, dyTP);
      if (distToPocket === 0) continue;

      const normTPX = dxTP / distToPocket;
      const normTPY = dyTP / distToPocket;

      // Ghost ball position: 2 * R away from target ball center along the line of centers to pocket
      const ghostX = target.x + normTPX * (BALL_RADIUS * 2);
      const ghostY = target.y + normTPY * (BALL_RADIUS * 2);

      // Cue ball to ghost ball vector
      const dxCG = ghostX - cueBall.x;
      const dyCG = ghostY - cueBall.y;
      const distCueToGhost = Math.hypot(dxCG, dyCG);
      if (distCueToGhost === 0) continue;

      const aimAngle = Math.atan2(dyCG, dxCG);

      // Angle of target to pocket vector
      const targetToPocketAngle = Math.atan2(-dyTP, -dxTP);

      // Cut angle: difference between cue trajectory and target trajectory
      let angleDiff = Math.abs(aimAngle - targetToPocketAngle);
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      const cutAngle = Math.abs(angleDiff);

      // Shots requiring > 80 degrees cut are physically very difficult / impossible
      if (cutAngle > (Math.PI / 180) * 80) continue;

      // Check obstacle obstruction
      let obstructed = false;
      for (const obstacle of unpocketed) {
        if (obstacle.id === target.id) continue;

        // Check if obstacle lies close to the cue-to-ghost ray
        const dist = distToSegment(
          obstacle.x,
          obstacle.y,
          cueBall.x,
          cueBall.y,
          ghostX,
          ghostY
        );
        if (dist < BALL_RADIUS * 1.8) {
          obstructed = true;
          break;
        }

        // Check if obstacle lies close to target-to-pocket ray
        const dist2 = distToSegment(
          obstacle.x,
          obstacle.y,
          target.x,
          target.y,
          pocket.x,
          pocket.y
        );
        if (dist2 < BALL_RADIUS * 1.8) {
          obstructed = true;
          break;
        }
      }

      if (obstructed) continue;

      // Score: Prefer straight cuts and closer pockets
      const score =
        (Math.PI - cutAngle) * 200 -
        distToPocket * 0.15 -
        distCueToGhost * 0.1;

      candidates.push({
        targetBall: target,
        pocket,
        angle: aimAngle,
        cutAngle,
        distance: distCueToGhost + distToPocket,
        score,
      });
    }
  }

  // Sort by highest score
  candidates.sort((a, b) => b.score - a.score);

  let chosenAngle = 0;
  let chosenPower = 55;

  if (candidates.length > 0) {
    const best = candidates[0];
    chosenAngle = best.angle;
    // Set power proportional to distance
    chosenPower = Math.min(85, Math.max(35, Math.round(best.distance / 12) + 30));
  } else if (targetBalls.length > 0) {
    // Fallback: hit closest target ball directly
    const first = targetBalls[0];
    chosenAngle = Math.atan2(first.y - cueBall.y, first.x - cueBall.x);
    chosenPower = 60;
  }

  // Apply slight human-like noise based on difficulty
  let noise = 0;
  if (difficulty === 'easy') {
    noise = (Math.random() - 0.5) * 0.09;
  } else if (difficulty === 'medium') {
    noise = (Math.random() - 0.5) * 0.035;
  } else {
    noise = (Math.random() - 0.5) * 0.008;
  }

  return {
    angle: chosenAngle + noise,
    power: chosenPower,
    spinX: (Math.random() - 0.5) * 0.2,
    spinY: (Math.random() - 0.5) * 0.2,
  };
}

/**
 * Minimum distance from point (px, py) to line segment (x1, y1)-(x2, y2)
 */
function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}
