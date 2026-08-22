/**
 * Cyberpunk Snake Game Configurations
 * Defines grid dimensions, 10-level speed curve, food item types, and obstacle map templates.
 */

const SNAKE_CONFIG = {
  COLS: 24,
  ROWS: 24,
  INITIAL_LENGTH: 4,
  INITIAL_SPEED_MS: 160,

  // 10-Level Campaign Speed Curve (ms per tick)
  SPEED_CURVE: [
    160, // Lv. 1
    145, // Lv. 2
    130, // Lv. 3
    115, // Lv. 4
    100, // Lv. 5
    90,  // Lv. 6
    80,  // Lv. 7
    70,  // Lv. 8
    60,  // Lv. 9
    50   // Lv. 10 (Max Hyper Speed)
  ],

  // Target score to beat each level in Campaign mode
  LEVEL_TARGET_SCORES: [
    800,   // Lv. 1
    1800,  // Lv. 2
    3000,  // Lv. 3
    4500,  // Lv. 4
    6200,  // Lv. 5
    8000,  // Lv. 6
    10000, // Lv. 7
    12500, // Lv. 8
    15500, // Lv. 9
    20000  // Lv. 10 (VICTORY CLEAR)
  ],

  // Food Item Types
  FOOD_TYPES: {
    APPLE: {
      type: 'APPLE',
      name: '能量晶核',
      color: '#ff3366',
      glow: 'rgba(255, 51, 102, 0.8)',
      score: 100,
      grow: 1,
      durationSec: 0, // permanent until eaten
      weight: 70,
      icon: '🍎'
    },
    GOLDEN: {
      type: 'GOLDEN',
      name: '黄金超载星',
      color: '#ffd700',
      glow: 'rgba(255, 215, 0, 0.9)',
      score: 500,
      grow: 1,
      durationSec: 9, // temporary
      weight: 15,
      icon: '⭐'
    },
    SPEED: {
      type: 'SPEED',
      name: '疾风蓝核',
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.9)',
      score: 250,
      grow: 1,
      durationSec: 8,
      weight: 10,
      icon: '⚡'
    },
    SHRINK: {
      type: 'SHRINK',
      name: '相位紫菌',
      color: '#d800ff',
      glow: 'rgba(216, 0, 255, 0.9)',
      score: 300,
      grow: -1, // shrinks snake length
      durationSec: 8,
      weight: 5,
      icon: '🍄'
    }
  },

  // Obstacle Map Templates for Campaign Levels
  MAPS: {
    1: [], // Clean Open Arena
    2: [   // 4 Corner Obstacles
      { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 5 },
      { x: 19, y: 4 }, { x: 18, y: 4 }, { x: 19, y: 5 },
      { x: 4, y: 19 }, { x: 5, y: 19 }, { x: 4, y: 18 },
      { x: 19, y: 19 }, { x: 18, y: 19 }, { x: 19, y: 18 }
    ],
    3: [   // Center Cross Pillars
      { x: 11, y: 6 }, { x: 12, y: 6 },
      { x: 11, y: 17 }, { x: 12, y: 17 },
      { x: 6, y: 11 }, { x: 6, y: 12 },
      { x: 17, y: 11 }, { x: 17, y: 12 }
    ],
    4: [   // Dual Gateway Lines
      { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 },
      { x: 13, y: 16 }, { x: 14, y: 16 }, { x: 15, y: 16 }, { x: 16, y: 16 }
    ],
    5: [   // Cyber Matrix 4-Pillars
      { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 7, y: 8 }, { x: 8, y: 8 },
      { x: 15, y: 7 }, { x: 16, y: 7 }, { x: 15, y: 8 }, { x: 16, y: 8 },
      { x: 7, y: 15 }, { x: 8, y: 15 }, { x: 7, y: 16 }, { x: 8, y: 16 },
      { x: 15, y: 15 }, { x: 16, y: 15 }, { x: 15, y: 16 }, { x: 16, y: 16 }
    ]
  }
};
