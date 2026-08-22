/**
 * Game configuration, Tetromino matrices, colors, scoring rules, 50-level speed curve, and SRS kick tables.
 */

// Generate 50-level fall speed curve (ms per gravity step)
const SPEED_50_LEVELS = [];
for (let lvl = 1; lvl <= 50; lvl++) {
  if (lvl <= 10) {
    // Level 1-10: 800ms down to 260ms (gentle learning curve)
    SPEED_50_LEVELS.push(Math.round(800 - (lvl - 1) * 60));
  } else if (lvl <= 25) {
    // Level 11-25: 240ms down to 80ms (intermediate to fast)
    SPEED_50_LEVELS.push(Math.round(240 - (lvl - 10) * 10.6));
  } else if (lvl <= 40) {
    // Level 26-40: 75ms down to 35ms (expert reflexes)
    SPEED_50_LEVELS.push(Math.round(75 - (lvl - 25) * 2.6));
  } else {
    // Level 41-50: 33ms down to 18ms (master tier)
    SPEED_50_LEVELS.push(Math.round(33 - (lvl - 40) * 1.5));
  }
}

const CONFIG = {
  COLS: 10,
  ROWS: 20,
  BUFFER_ROWS: 2, // Hidden buffer rows on top
  BLOCK_SIZE: 30, // Pixel size per grid cell on standard display
  
  MAX_LEVEL: 50,
  LINES_PER_LEVEL: 10, // Lines needed to advance each level in Solo mode

  // Base scoring multipliers (Original Tetris Guidelines)
  SCORE_TABLE: {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    SOFT_DROP: 1,  // per cell
    HARD_DROP: 2,  // per cell
    BACK_TO_BACK_MULTIPLIER: 1.5,
    LEVEL_CLEAR_BONUS: 2000,
    VICTORY_BONUS: 50000, // Completing Level 50
  },

  // Garbage Attack Rules for VS AI Battle Mode (1:1 direct attack + combo & B2B bonus)
  GARBAGE_ATTACK: {
    1: 1, // Single = 1 line sent
    2: 2, // Double = 2 lines sent
    3: 3, // Triple = 3 lines sent
    4: 4, // Tetris = 4 lines sent
    B2B_BONUS: 1, // Back to Back Tetris sends +1 extra line
  },

  SPEED_CURVE: SPEED_50_LEVELS,
  LOCK_DELAY_MS: 500, // Time before piece permanently locks after touching ground
  MAX_LOCK_RESETS: 15, // Maximum moves/rotations allowed to reset lock delay
};

// Tetromino definitions (4x4 or 3x3 matrices in 4 rotational states: 0, 1, 2, 3)
const TETROMINOES = {
  I: {
    name: 'I',
    color: '#00f0ff', // Cyan
    glow: 'rgba(0, 240, 255, 0.6)',
    shapes: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
    ],
  },
  J: {
    name: 'J',
    color: '#0055ff', // Blue
    glow: 'rgba(0, 85, 255, 0.6)',
    shapes: [
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
    ],
  },
  L: {
    name: 'L',
    color: '#ffaa00', // Orange
    glow: 'rgba(255, 170, 0, 0.6)',
    shapes: [
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
    ],
  },
  O: {
    name: 'O',
    color: '#ffee00', // Yellow
    glow: 'rgba(255, 238, 0, 0.6)',
    shapes: [
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
    ],
  },
  S: {
    name: 'S',
    color: '#00ff66', // Green
    glow: 'rgba(0, 255, 102, 0.6)',
    shapes: [
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0],
      ],
      [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
  },
  T: {
    name: 'T',
    color: '#cc00ff', // Purple
    glow: 'rgba(204, 0, 255, 0.6)',
    shapes: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
  },
  Z: {
    name: 'Z',
    color: '#ff0055', // Red
    glow: 'rgba(255, 0, 85, 0.6)',
    shapes: [
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
      ],
    ],
  },
};

// Super Rotation System (SRS) Wall Kick Data for standard pieces (J, L, S, T, Z)
const JLSTZ_KICKS = {
  '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

// Super Rotation System (SRS) Wall Kick Data for I piece
const I_KICKS = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};
