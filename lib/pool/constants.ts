import { BallState } from './types';

export const TABLE_WIDTH = 1000;
export const TABLE_HEIGHT = 500;
export const CUSHION = 44;
export const BALL_RADIUS = 14;

export const POCKET_LOCATIONS = [
  { x: 32, y: 32, name: 'top-left' },
  { x: 500, y: 22, name: 'top-center' },
  { x: 968, y: 32, name: 'top-right' },
  { x: 32, y: 468, name: 'bottom-left' },
  { x: 500, y: 478, name: 'bottom-center' },
  { x: 968, y: 468, name: 'bottom-right' },
];

export const BALL_COLORS: Record<number, string> = {
  0: '#ffffff', // Cue ball
  1: '#facc15', // 1: Yellow
  2: '#2563eb', // 2: Blue
  3: '#dc2626', // 3: Red
  4: '#7e22ce', // 4: Purple
  5: '#ea580c', // 5: Orange
  6: '#15803d', // 6: Green
  7: '#881337', // 7: Maroon
  8: '#09090b', // 8: Black
  9: '#facc15', // 9: Yellow stripe
  10: '#2563eb', // 10: Blue stripe
  11: '#dc2626', // 11: Red stripe
  12: '#7e22ce', // 12: Purple stripe
  13: '#ea580c', // 13: Orange stripe
  14: '#15803d', // 14: Green stripe
  15: '#881337', // 15: Maroon stripe
};

/**
 * Creates initial 8-Ball Pool triangle rack
 * Coordinates are mapped to virtual table (width: 1000, height: 500, ball radius: 14)
 */
export function getInitialBallRack(): BallState[] {
  const balls: BallState[] = [];
  const R = BALL_RADIUS;

  // 1. Cue Ball at head string (x: 250, y: 250)
  balls.push({
    id: 0,
    number: 0,
    type: 'cue',
    color: BALL_COLORS[0],
    x: 250,
    y: 250,
    vx: 0,
    vy: 0,
    isPocketed: false,
    pocketedOrder: -1,
  });

  // Standard 8-ball pyramid configuration (5 rows)
  // 8-ball is in center (row 3, index 1)
  // Corners: one solid, one stripe
  const pyramidNumbers = [
    [1], // Row 1 (Apex)
    [9, 2], // Row 2
    [3, 8, 10], // Row 3 (8-ball in center!)
    [11, 4, 12, 5], // Row 4
    [6, 13, 7, 14, 15], // Row 5 (Bottom)
  ];

  const apexX = 720;
  const apexY = 250;
  const colSpacing = R * Math.sqrt(3) + 0.5;
  const rowSpacing = R * 2 + 0.5;

  for (let col = 0; col < pyramidNumbers.length; col++) {
    const rowBalls = pyramidNumbers[col];
    const colX = apexX + col * colSpacing;
    const startY = apexY - ((rowBalls.length - 1) * rowSpacing) / 2;

    for (let row = 0; row < rowBalls.length; row++) {
      const num = rowBalls[row];
      let type: 'solid' | 'stripe' | '8ball' = 'solid';
      if (num === 8) type = '8ball';
      else if (num >= 9) type = 'stripe';

      balls.push({
        id: num,
        number: num,
        type,
        color: BALL_COLORS[num],
        x: colX,
        y: startY + row * rowSpacing,
        vx: 0,
        vy: 0,
        isPocketed: false,
        pocketedOrder: -1,
      });
    }
  }

  return balls;
}
