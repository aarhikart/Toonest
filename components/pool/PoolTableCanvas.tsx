'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BallState, ShotParams, PlayerGroup } from '@/lib/pool/types';
import { poolAudio } from '@/lib/pool/audio';
import { POCKET_LOCATIONS, BALL_COLORS } from '@/lib/pool/constants';

interface PoolTableCanvasProps {
  balls: BallState[];
  setBalls: React.Dispatch<React.SetStateAction<BallState[]>>;
  isMyTurn: boolean;
  myGroup: PlayerGroup;
  currentTurn: 'player1' | 'player2';
  spinX: number;
  spinY: number;
  externalPower?: number; // Power from PowerBar or Strike button
  onExternalPowerHandled?: () => void;
  selectedPower?: number; // Current power from slider
  onShotTaken: (shot: ShotParams) => void;
  onTurnEnd: (pottedThisShot: number[], cueScratch: boolean, firstHitBallId: number | null) => void;
  isBallInHand: boolean;
  setIsBallInHand: (val: boolean) => void;
}

const TABLE_WIDTH = 1000;
const TABLE_HEIGHT = 500;
const CUSHION = 44;
const BALL_R = 14;

// Cushion borders
const MIN_X = CUSHION + BALL_R;
const MAX_X = TABLE_WIDTH - CUSHION - BALL_R;
const MIN_Y = CUSHION + BALL_R;
const MAX_Y = TABLE_HEIGHT - CUSHION - BALL_R;

/**
 * Checks whether candidate cue ball placement is legal:
 * 1. Must be inside cushions
 * 2. Cannot be within pocket mouths
 * 3. Cannot collide or overlap with ANY other ball on the table
 */
function isLegalPlacement(
  x: number,
  y: number,
  ballsList: BallState[]
): { valid: boolean; reason?: string } {
  if (x < MIN_X + 4 || x > MAX_X - 4 || y < MIN_Y + 4 || y > MAX_Y - 4) {
    return { valid: false, reason: 'Too close to cushion' };
  }

  for (const pocket of POCKET_LOCATIONS) {
    const d = Math.hypot(x - pocket.x, y - pocket.y);
    const pocketR = pocket.name.includes('center') ? 34 : 40;
    if (d < pocketR + BALL_R + 6) {
      return { valid: false, reason: 'Cannot place inside pocket' };
    }
  }

  for (const b of ballsList) {
    if (b.id === 0 || b.isPocketed) continue;
    const d = Math.hypot(x - b.x, y - b.y);
    if (d < BALL_R * 2 + 4) {
      return { valid: false, reason: 'Cannot overlap another ball' };
    }
  }

  return { valid: true };
}

export function PoolTableCanvas({
  balls,
  setBalls,
  isMyTurn,
  myGroup,
  currentTurn,
  spinX,
  spinY,
  externalPower = 0,
  onExternalPowerHandled,
  selectedPower = 60,
  onShotTaken,
  onTurnEnd,
  isBallInHand,
  setIsBallInHand,
}: PoolTableCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Aiming state: initial aim angle points to the rack (0 radians = rightwards)
  const [aimAngle, setAimAngle] = useState(0); // In radians
  const [dragPower, setDragPower] = useState(0); // 0 to 100
  const [ballsMoving, setBallsMoving] = useState(false);

  // Interaction mode: 'aim' (dragging on felt to rotate angle) or 'pullback' (sliding back to charge shot)
  const [dragMode, setDragMode] = useState<'aim' | 'pullback' | null>(null);
  const lockedAngleRef = useRef(0);

  // Cursor hover state to show appropriate cursor (grab for stick, crosshair for felt)
  const [isHoveringStick, setIsHoveringStick] = useState(false);

  // Ball-in-hand placement cursor state
  const [placementPos, setPlacementPos] = useState<{ x: number; y: number; valid: boolean } | null>(null);

  // Turn tracking refs
  const firstHitRef = useRef<number | null>(null);
  const pottedThisShotRef = useRef<number[]>([]);
  const cueScratchRef = useRef<boolean>(false);
  const spinRef = useRef({ x: spinX, y: spinY });
  spinRef.current = { x: spinX, y: spinY };

  // Cue strike animation
  const [strikeOffset, setStrikeOffset] = useState<number | null>(null);

  // Cue ball position helper
  const getCueBall = useCallback(() => {
    return balls.find((b) => b.id === 0 && !b.isPocketed) || null;
  }, [balls]);

  // Execute a shot with angle and power
  const executeShot = useCallback(
    (angle: number, power: number, sX: number = spinX, sY: number = spinY) => {
      const cueBall = getCueBall();
      if (!cueBall || ballsMoving) return;

      setIsBallInHand(false);
      setPlacementPos(null);
      setDragMode(null);
      setDragPower(0);
      firstHitRef.current = null;
      pottedThisShotRef.current = [];
      cueScratchRef.current = false;

      // Animate cue strike forward into the ball
      setStrikeOffset(-15);
      setTimeout(() => setStrikeOffset(null), 140);

      // Calculate initial velocity (power 10 to 100 -> velocity 5 to 28)
      const clampedPower = Math.min(100, Math.max(10, power));
      const speed = 4 + (clampedPower / 100) * 26;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      poolAudio.playCueHit(clampedPower);

      setBalls((prev) =>
        prev.map((b) =>
          b.id === 0
            ? {
                ...b,
                vx,
                vy,
              }
            : b
        )
      );

      setBallsMoving(true);

      onShotTaken({
        angle,
        power: clampedPower,
        spinX: sX,
        spinY: sY,
        cueX: cueBall.x,
        cueY: cueBall.y,
        timestamp: Date.now(),
      });
    },
    [getCueBall, ballsMoving, spinX, spinY, setIsBallInHand, onShotTaken, setBalls]
  );

  // Listen to external power release (from PowerBar or Strike button)
  useEffect(() => {
    if (externalPower > 0 && isMyTurn && !ballsMoving) {
      executeShot(aimAngle, externalPower, spinX, spinY);
      onExternalPowerHandled?.();
    }
  }, [externalPower, isMyTurn, ballsMoving, aimAngle, spinX, spinY, executeShot, onExternalPowerHandled]);

  // Keyboard Shortcuts (Space to strike, Arrow keys to aim)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMyTurn || ballsMoving) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isBallInHand) {
          executeShot(aimAngle, selectedPower, spinX, spinY);
        }
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        setAimAngle((a) => a - 0.025);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        setAimAngle((a) => a + 0.025);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMyTurn, ballsMoving, isBallInHand, aimAngle, selectedPower, spinX, spinY, executeShot]);

  // Pointer coordinate translator helper
  const getCanvasCoords = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = TABLE_WIDTH / rect.width;
    const scaleY = TABLE_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // Handle Pointer Down
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isMyTurn || ballsMoving) return;
      const { x, y } = getCanvasCoords(e);
      const cueBall = getCueBall();

      // Ball-in-hand placement
      if (isBallInHand) {
        const check = isLegalPlacement(x, y, balls);
        if (check.valid) {
          setBalls((prev) =>
            prev.map((b) => (b.id === 0 ? { ...b, x, y, vx: 0, vy: 0 } : b))
          );
          setPlacementPos(null);
          setIsBallInHand(false);
          poolAudio.playBallClack(0.2);
        }
        return;
      }

      if (!cueBall) return;

      // 1. Check if user clicked directly on another ball to aim straight at it!
      const clickedBall = balls.find(
        (b) => b.id !== 0 && !b.isPocketed && Math.hypot(b.x - x, b.y - y) <= BALL_R * 1.5
      );
      if (clickedBall) {
        // Lock aim directly onto this ball!
        setAimAngle(Math.atan2(clickedBall.y - cueBall.y, clickedBall.x - cueBall.x));
        setDragMode(null);
        return;
      }

      const dx = x - cueBall.x;
      const dy = y - cueBall.y;
      const cosA = Math.cos(aimAngle);
      const sinA = Math.sin(aimAngle);

      // Forward projection along aim direction
      const projForward = dx * cosA + dy * sinA;
      // Perpendicular distance from stick line
      const perpDist = Math.abs(-dx * sinA + dy * cosA);

      // 2. Check if clicking on or near the cue stick (or cue ball)
      // Cue stick is behind cue ball (projForward < 20) and within 90px of line
      if (projForward < 20 && perpDist < 90) {
        // ENTER PULLBACK / SLIDING TO SHOOT MODE!
        setDragMode('pullback');
        lockedAngleRef.current = aimAngle;
        const pull = Math.max(0, -projForward);
        const p = Math.min(100, Math.max(0, (pull / 150) * 100));
        setDragPower(p);
      } else {
        // 3. ENTER AIM ROTATION DRAG MODE!
        setDragMode('aim');
        setAimAngle(Math.atan2(dy, dx));
        setDragPower(0);
      }
    },
    [isMyTurn, ballsMoving, isBallInHand, getCueBall, balls, aimAngle, getCanvasCoords, setBalls, setIsBallInHand]
  );

  // Handle Pointer Move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isMyTurn || ballsMoving) return;
      const { x, y } = getCanvasCoords(e);
      const cueBall = getCueBall();

      if (isBallInHand) {
        const check = isLegalPlacement(x, y, balls);
        setPlacementPos({ x, y, valid: check.valid });
        return;
      }

      if (!cueBall) return;

      const dx = x - cueBall.x;
      const dy = y - cueBall.y;

      if (dragMode === 'pullback') {
        // PULLBACK MODE: Keep aim angle 100% LOCKED!
        // Measure how far user slides backward along the stick line
        const cosA = Math.cos(lockedAngleRef.current);
        const sinA = Math.sin(lockedAngleRef.current);
        const projForward = dx * cosA + dy * sinA;
        const pull = Math.max(0, -projForward);

        // Smooth power charge from 0 to 100%
        const p = Math.min(100, Math.max(0, (pull / 150) * 100));
        setDragPower(p);
      } else if (dragMode === 'aim') {
        // AIM DRAG MODE: Only rotate aim while mouse button is clicked & dragged!
        setAimAngle(Math.atan2(dy, dx));
      } else {
        // FREE HOVER: DO NOT ROTATE THE STICK!
        // This ensures the aim stays 100% steady and focused as requested by user.
        // Check if cursor is hovering over the cue stick so we can show 'grab' cursor:
        const cosA = Math.cos(aimAngle);
        const sinA = Math.sin(aimAngle);
        const projForward = dx * cosA + dy * sinA;
        const perpDist = Math.abs(-dx * sinA + dy * cosA);
        const isOverStick = projForward < 15 && perpDist < 70;
        setIsHoveringStick(isOverStick);
      }
    },
    [isMyTurn, ballsMoving, isBallInHand, getCueBall, balls, dragMode, aimAngle, getCanvasCoords]
  );

  // Handle Pointer Up (Release to Shoot)
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isMyTurn || ballsMoving) return;

      if (isBallInHand) {
        const { x, y } = getCanvasCoords(e);
        const check = isLegalPlacement(x, y, balls);
        if (check.valid) {
          setBalls((prev) =>
            prev.map((b) => (b.id === 0 ? { ...b, x, y, vx: 0, vy: 0 } : b))
          );
          setPlacementPos(null);
          setIsBallInHand(false);
          poolAudio.playBallClack(0.2);
        }
        return;
      }

      if (dragMode === 'pullback') {
        setDragMode(null);
        // If pulled back with at least 5% power, SHOOT!
        if (dragPower >= 5) {
          executeShot(lockedAngleRef.current, dragPower, spinX, spinY);
        }
        setDragPower(0);
      } else if (dragMode === 'aim') {
        // Aiming finished and locked!
        setDragMode(null);
      }
    },
    [isMyTurn, ballsMoving, isBallInHand, dragMode, dragPower, spinX, spinY, balls, executeShot, getCanvasCoords, setBalls, setIsBallInHand]
  );

  // Physics Simulation Step (Runs strictly while ballsMoving is true)
  useEffect(() => {
    if (!ballsMoving) return;

    let animId: number;
    const SUB_STEPS = 10;
    const DT = 1 / SUB_STEPS;
    const FRICTION = Math.pow(0.988, DT);
    const RESTITUTION_BALL = 0.96;
    const RESTITUTION_CUSHION = 0.88;

    const updatePhysics = () => {
      setBalls((prevBalls) => {
        let anyMoving = false;
        const current = prevBalls.map((b) => ({ ...b }));

        for (let step = 0; step < SUB_STEPS; step++) {
          // 1. Move balls and apply table friction
          for (const b of current) {
            if (b.isPocketed) continue;

            b.x += b.vx * DT;
            b.y += b.vy * DT;

            b.vx *= FRICTION;
            b.vy *= FRICTION;

            // Stop threshold
            if (Math.hypot(b.vx, b.vy) < 0.04) {
              b.vx = 0;
              b.vy = 0;
            } else {
              anyMoving = true;
            }

            // 2. Pocket detection
            for (const pocket of POCKET_LOCATIONS) {
              const pDist = Math.hypot(b.x - pocket.x, b.y - pocket.y);
              const pocketMouthR = pocket.name.includes('center') ? 26 : 30;

              if (pDist < pocketMouthR) {
                b.isPocketed = true;
                b.vx = 0;
                b.vy = 0;

                poolAudio.playPocketDrop();

                if (b.id === 0) {
                  cueScratchRef.current = true;
                  poolAudio.playFoul();
                } else {
                  if (!pottedThisShotRef.current.includes(b.id)) {
                    pottedThisShotRef.current.push(b.id);
                  }
                }
              }
            }

            if (b.isPocketed) continue;

            // 3. Cushion Bounces
            const isNearXCenter = Math.abs(b.x - 500) < 32;
            const isNearXCorner = b.x < CUSHION + 26 || b.x > TABLE_WIDTH - CUSHION - 26;

            if (b.y < MIN_Y) {
              if (!isNearXCenter && !isNearXCorner) {
                b.y = MIN_Y;
                b.vy = -b.vy * RESTITUTION_CUSHION;
                poolAudio.playCushionThud(Math.abs(b.vy) / 10);
              }
            } else if (b.y > MAX_Y) {
              if (!isNearXCenter && !isNearXCorner) {
                b.y = MAX_Y;
                b.vy = -b.vy * RESTITUTION_CUSHION;
                poolAudio.playCushionThud(Math.abs(b.vy) / 10);
              }
            }

            const isNearYCorner = b.y < CUSHION + 26 || b.y > TABLE_HEIGHT - CUSHION - 26;
            if (b.x < MIN_X) {
              if (!isNearYCorner) {
                b.x = MIN_X;
                b.vx = -b.vx * RESTITUTION_CUSHION;
                poolAudio.playCushionThud(Math.abs(b.vx) / 10);
              }
            } else if (b.x > MAX_X) {
              if (!isNearYCorner) {
                b.x = MAX_X;
                b.vx = -b.vx * RESTITUTION_CUSHION;
                poolAudio.playCushionThud(Math.abs(b.vx) / 10);
              }
            }
          }

          // 4. Ball-to-Ball Collisions
          for (let i = 0; i < current.length; i++) {
            const b1 = current[i];
            if (b1.isPocketed) continue;

            for (let j = i + 1; j < current.length; j++) {
              const b2 = current[j];
              if (b2.isPocketed) continue;

              const dx = b2.x - b1.x;
              const dy = b2.y - b1.y;
              const dist = Math.hypot(dx, dy);

              if (dist < BALL_R * 2 && dist > 0) {
                if (b1.id === 0 && firstHitRef.current === null) {
                  firstHitRef.current = b2.id;
                } else if (b2.id === 0 && firstHitRef.current === null) {
                  firstHitRef.current = b1.id;
                }

                const nx = dx / dist;
                const ny = dy / dist;

                const overlap = BALL_R * 2 - dist;
                b1.x -= nx * (overlap / 2);
                b1.y -= ny * (overlap / 2);
                b2.x += nx * (overlap / 2);
                b2.y += ny * (overlap / 2);

                const kx = b1.vx - b2.vx;
                const ky = b1.vy - b2.vy;
                const p = 2 * (nx * kx + ny * ky) / 2;

                if (p > 0) {
                  b1.vx -= p * nx * RESTITUTION_BALL;
                  b1.vy -= p * ny * RESTITUTION_BALL;
                  b2.vx += p * nx * RESTITUTION_BALL;
                  b2.vy += p * ny * RESTITUTION_BALL;

                  if (b1.id === 0 || b2.id === 0) {
                    const cue = b1.id === 0 ? b1 : b2;
                    const s = spinRef.current;
                    if (s.y < -0.1) {
                      cue.vx += -nx * Math.abs(s.y) * 4;
                      cue.vy += -ny * Math.abs(s.y) * 4;
                    } else if (s.y > 0.1) {
                      cue.vx += nx * s.y * 3;
                      cue.vy += ny * s.y * 3;
                    }
                  }

                  poolAudio.playBallClack(Math.min(1, p / 12));
                }
              }
            }
          }
        }

        if (!anyMoving) {
          setBallsMoving(false);

          if (cueScratchRef.current) {
            const cue = current.find((b) => b.id === 0);
            if (cue) {
              cue.isPocketed = false;
              let rx = 250;
              let ry = 250;
              while (!isLegalPlacement(rx, ry, current).valid && rx < 450) {
                rx += 25;
              }
              cue.x = rx;
              cue.y = ry;
              cue.vx = 0;
              cue.vy = 0;
            }
          }

          onTurnEnd(
            [...pottedThisShotRef.current],
            cueScratchRef.current,
            firstHitRef.current
          );
        }

        return current;
      });

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [ballsMoving, onTurnEnd, setBalls]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = TABLE_WIDTH * dpr;
    canvas.height = TABLE_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    // 1. Draw Outer Rounded Frame & Metallic Rail Borders
    ctx.save();
    ctx.fillStyle = '#1c1e27';
    ctx.beginPath();
    ctx.roundRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT, 32);
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#333b52';
    ctx.stroke();

    // 2. Draw Table Bed / Blue Felt
    const feltGrad = ctx.createRadialGradient(
      TABLE_WIDTH / 2,
      TABLE_HEIGHT / 2,
      50,
      TABLE_WIDTH / 2,
      TABLE_HEIGHT / 2,
      560
    );
    feltGrad.addColorStop(0, '#1a78be');
    feltGrad.addColorStop(0.5, '#135e9c');
    feltGrad.addColorStop(1, '#0d3d70');

    ctx.fillStyle = feltGrad;
    ctx.fillRect(CUSHION, CUSHION, TABLE_WIDTH - CUSHION * 2, TABLE_HEIGHT - CUSHION * 2);

    // 3. Head String / Kitchen Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(250, CUSHION);
    ctx.lineTo(250, TABLE_HEIGHT - CUSHION);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(250, 250, 3, 0, Math.PI * 2);
    ctx.fill();

    // 4. Cushions
    ctx.fillStyle = '#0f386b';
    ctx.strokeStyle = '#092446';
    ctx.lineWidth = 1;

    ctx.fillRect(CUSHION + 36, CUSHION - 10, 410, 10);
    ctx.fillRect(518, CUSHION - 10, 410, 10);
    ctx.fillRect(CUSHION + 36, TABLE_HEIGHT - CUSHION, 410, 10);
    ctx.fillRect(518, TABLE_HEIGHT - CUSHION, 410, 10);
    ctx.fillRect(CUSHION - 10, CUSHION + 36, 10, 340);
    ctx.fillRect(TABLE_WIDTH - CUSHION, CUSHION + 36, 10, 340);

    // 5. 18 Rail Markers
    ctx.fillStyle = '#f8fafc';
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    [145, 250, 355, 645, 750, 855].forEach((mx) => {
      ctx.beginPath();
      ctx.arc(mx, 16, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, TABLE_HEIGHT - 16, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    [145, 250, 355].forEach((my) => {
      ctx.beginPath();
      ctx.arc(16, my, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(TABLE_WIDTH - 16, my, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // 6. 6 Pockets
    for (const p of POCKET_LOCATIONS) {
      const isSide = p.name.includes('center');
      const pr = isSide ? 23 : 27;

      ctx.beginPath();
      ctx.arc(p.x, p.y, pr + 4, 0, Math.PI * 2);
      ctx.fillStyle = '#374151';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#6b7280';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
      ctx.fillStyle = '#030712';
      ctx.fill();

      const pGrad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, pr);
      pGrad.addColorStop(0, '#000000');
      pGrad.addColorStop(1, '#111827');
      ctx.fillStyle = pGrad;
      ctx.fill();
    }

    // 7. Trajectory Aiming Line & Ghost Ball
    const cueBall = getCueBall();
    const effectiveAngle = dragMode === 'pullback' ? lockedAngleRef.current : aimAngle;

    if (cueBall && isMyTurn && !ballsMoving && !isBallInHand) {
      const cosA = Math.cos(effectiveAngle);
      const sinA = Math.sin(effectiveAngle);

      let closestHitDist = 1200;
      let hitBall: BallState | null = null;

      for (const b of balls) {
        if (b.id === 0 || b.isPocketed) continue;

        const dx = b.x - cueBall.x;
        const dy = b.y - cueBall.y;

        const dot = dx * cosA + dy * sinA;
        if (dot <= 0) continue;

        const perpDistSq = dx * dx + dy * dy - dot * dot;
        if (perpDistSq < (BALL_R * 2) ** 2) {
          const dGhost = dot - Math.sqrt((BALL_R * 2) ** 2 - perpDistSq);
          if (dGhost < closestHitDist && dGhost > 0) {
            closestHitDist = dGhost;
            hitBall = b;
          }
        }
      }

      const aimDist = Math.min(closestHitDist, 750);
      const ghostX = cueBall.x + cosA * aimDist;
      const ghostY = cueBall.y + sinA * aimDist;

      // Outer Glow Line
      ctx.beginPath();
      ctx.moveTo(cueBall.x, cueBall.y);
      ctx.lineTo(ghostX, ghostY);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 5;
      ctx.stroke();

      // Inner Crisp White Laser
      ctx.beginPath();
      ctx.moveTo(cueBall.x, cueBall.y);
      ctx.lineTo(ghostX, ghostY);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // If object ball hit:
      if (hitBall) {
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ef4444';

        ctx.beginPath();
        ctx.arc(ghostX, ghostY, BALL_R, 0, Math.PI * 2);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ghostX, ghostY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.restore();

        const deflDx = hitBall.x - ghostX;
        const deflDy = hitBall.y - ghostY;
        const deflDist = Math.hypot(deflDx, deflDy);

        if (deflDist > 0) {
          const deflNormX = deflDx / deflDist;
          const deflNormY = deflDy / deflDist;

          let headingIntoPocket: { x: number; y: number } | null = null;
          for (const pocket of POCKET_LOCATIONS) {
            const pDx = pocket.x - hitBall.x;
            const pDy = pocket.y - hitBall.y;
            const pDist = Math.hypot(pDx, pDy);
            const dot = (pDx / pDist) * deflNormX + (pDy / pDist) * deflNormY;
            if (dot > 0.96 && pDist < 600) {
              headingIntoPocket = pocket;
              break;
            }
          }

          const targetColor = headingIntoPocket ? '#22c55e' : '#ef4444';
          const targetLength = headingIntoPocket
            ? Math.hypot(headingIntoPocket.x - hitBall.x, headingIntoPocket.y - hitBall.y)
            : 160;

          const endX = hitBall.x + deflNormX * targetLength;
          const endY = hitBall.y + deflNormY * targetLength;

          ctx.save();
          ctx.shadowBlur = 6;
          ctx.shadowColor = targetColor;

          ctx.beginPath();
          ctx.moveTo(hitBall.x, hitBall.y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = targetColor;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          const arrowSize = 7;
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - deflNormX * arrowSize - deflNormY * (arrowSize * 0.7),
            endY - deflNormY * arrowSize + deflNormX * (arrowSize * 0.7)
          );
          ctx.lineTo(
            endX - deflNormX * arrowSize + deflNormY * (arrowSize * 0.7),
            endY - deflNormY * arrowSize - deflNormX * (arrowSize * 0.7)
          );
          ctx.closePath();
          ctx.fillStyle = targetColor;
          ctx.fill();

          if (headingIntoPocket) {
            ctx.beginPath();
            ctx.arc(headingIntoPocket.x, headingIntoPocket.y, 34, 0, Math.PI * 2);
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 3;
            ctx.stroke();
          }

          const tangentX = -deflNormY;
          const tangentY = deflNormX;
          const tanLength = 65;

          ctx.beginPath();
          ctx.moveTo(ghostX, ghostY);
          ctx.lineTo(ghostX + tangentX * tanLength, ghostY + tangentY * tanLength);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.restore();
        }
      }

      // 8. Wooden Cue Stick with Dynamic Pullback
      const currentPower = dragMode === 'pullback' ? dragPower : 0;
      const cuePullback = (currentPower / 100) * 85 + (strikeOffset || 0);
      const cueDistFromBall = BALL_R + 8 + cuePullback;
      const cueTipX = cueBall.x - cosA * cueDistFromBall;
      const cueTipY = cueBall.y - sinA * cueDistFromBall;
      const cueButtX = cueBall.x - cosA * (cueDistFromBall + 270);
      const cueButtY = cueBall.y - sinA * (cueDistFromBall + 270);

      // Cue stick body
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cueTipX, cueTipY);
      ctx.lineTo(cueButtX, cueButtY);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 6.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Shaft highlight
      ctx.beginPath();
      ctx.moveTo(cueTipX, cueTipY);
      ctx.lineTo(cueButtX, cueButtY);
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Ferrule tip
      ctx.beginPath();
      ctx.arc(cueTipX, cueTipY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Golden Pullback Handle Grip at butt of stick
      ctx.beginPath();
      ctx.arc(cueButtX, cueButtY, 9, 0, Math.PI * 2);
      ctx.fillStyle = currentPower > 0 ? '#f59e0b' : '#d97706';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Power indicator & live pullback display
      if (currentPower > 5) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f59e0b';

        // Power arc / track along pullback line
        ctx.beginPath();
        ctx.moveTo(cueBall.x - cosA * (BALL_R + 8), cueBall.y - sinA * (BALL_R + 8));
        ctx.lineTo(cueTipX, cueTipY);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `⚡ ${Math.round(currentPower)}% POWER (RELEASE TO SHOOT)`,
          cueTipX - cosA * 30,
          cueTipY - sinA * 30 - 12
        );
      } else {
        // Subtle hint when hovering near cue stick
        ctx.fillStyle = isHoveringStick ? '#38bdf8' : 'rgba(255, 255, 255, 0.45)';
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          '◄ CLICK & SLIDE STICK TO SHOOT',
          cueButtX - cosA * 20,
          cueButtY - sinA * 20 - 10
        );
      }
      ctx.restore();
    }

    // 9. Ball-in-Hand Placement Ghost Indicator
    if (isBallInHand && placementPos) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(placementPos.x, placementPos.y, BALL_R, 0, Math.PI * 2);

      if (placementPos.valid) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(placementPos.x, placementPos.y, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(placementPos.x - 8, placementPos.y - 8);
        ctx.lineTo(placementPos.x + 8, placementPos.y + 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 10. Render All 16 Balls
    for (const b of balls) {
      if (b.isPocketed) continue;

      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x + 2, b.y + 3, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();

      const isStripe = b.type === 'stripe';
      const isCue = b.type === 'cue';

      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = isStripe ? '#f8fafc' : b.color;
      ctx.fill();

      if (isStripe) {
        ctx.save();
        ctx.clip();
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - BALL_R, b.y - BALL_R * 0.55, BALL_R * 2, BALL_R * 1.1);
        ctx.restore();
      }

      if (!isCue) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R * 0.46, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.fillStyle = '#09090b';
        ctx.font = 'bold 8px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(b.number), b.x, b.y + 0.5);
      } else {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
      }

      const shineGrad = ctx.createRadialGradient(
        b.x - BALL_R * 0.35,
        b.y - BALL_R * 0.35,
        1,
        b.x,
        b.y,
        BALL_R
      );
      shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      shineGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)');
      shineGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');

      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = shineGrad;
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }, [balls, aimAngle, dragMode, isMyTurn, ballsMoving, isBallInHand, dragPower, strikeOffset, placementPos, isHoveringStick, getCueBall]);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setDragMode(null);
          setPlacementPos(null);
          setIsHoveringStick(false);
        }}
        className={`w-full h-auto max-h-[580px] rounded-2xl shadow-2xl touch-none ${
          isBallInHand
            ? 'cursor-move'
            : dragMode === 'pullback'
            ? 'cursor-grabbing'
            : isHoveringStick
            ? 'cursor-grab'
            : 'cursor-crosshair'
        }`}
        style={{ aspectRatio: '2 / 1' }}
      />

      {/* Ball in Hand Notice Overlay */}
      {isBallInHand && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black px-5 py-2 rounded-full text-xs shadow-2xl flex items-center gap-2 animate-bounce pointer-events-none border border-amber-300">
          <span>⚪ Ball in Hand: Click any empty spot to place the cue ball</span>
        </div>
      )}

      {/* On-Table Controls Floating Tip */}
      {isMyTurn && !ballsMoving && !isBallInHand && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/85 backdrop-blur-md text-slate-300 text-[11px] font-semibold px-4 py-1.5 rounded-full border border-slate-800 pointer-events-none flex items-center gap-2 shadow-lg">
          <span>🎯 Aim: Click ball or drag on felt</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400">⚡ Click & slide cue stick to shoot</span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-400">Spacebar to Strike</span>
        </div>
      )}
    </div>
  );
}
