/**
 * Wildwood Defenders (田园守卫战) - Game Configuration
 * Definitions for 9 Defender Towers (including Golden Shaded Cat & British Longhair Blue Cat),
 * Invading Enemies (including Thief Raccoon), 8-Tower Population Limit, and 4-Tier Evolution.
 */

const DefenseConfig = {
  CANVAS_WIDTH: 900,
  CANVAS_HEIGHT: 540,
  GRID_COLS: 18,
  GRID_ROWS: 11,
  TILE_SIZE: 50,

  INITIAL_GOLD: 380,
  INITIAL_LIVES: 20,
  MAX_TOWERS: 8, // Population Cap: Max 8 towers on the field!

  // 9 Animal Defender Towers
  TOWERS: {
    rabbit: {
      id: 'rabbit',
      nameKey: 'tower_rabbit_name',
      descKey: 'tower_rabbit_desc',
      icon: '🐰',
      cost: 90,
      damage: 10,
      range: 130,
      cooldown: 0.15,
      color: '#ff69b4',
      projectileColor: '#ff4500',
      projectileType: 'carrot_bullet',
      upgradeCost: 80,
      maxLevel: 4,
      traitKey: 'tower_rabbit_trait',
      unlockWave: 1,
    },
    rooster: {
      id: 'rooster',
      nameKey: 'tower_rooster_name',
      descKey: 'tower_rooster_desc',
      icon: '🐓',
      cost: 110,
      damage: 22,
      range: 120,
      cooldown: 0.32,
      color: '#ff3366',
      projectileColor: '#ff9900',
      projectileType: 'peck',
      upgradeCost: 90,
      maxLevel: 4,
      traitKey: 'tower_rooster_trait',
      unlockWave: 1,
    },
    hen: {
      id: 'hen',
      nameKey: 'tower_hen_name',
      descKey: 'tower_hen_desc',
      icon: '🐔',
      cost: 130,
      damage: 48,
      range: 135,
      cooldown: 1.0,
      color: '#ffaa00',
      projectileColor: '#ffd700',
      projectileType: 'egg_bomb',
      splashRadius: 80,
      upgradeCost: 100,
      maxLevel: 4,
      economyBonus: 12,
      traitKey: 'tower_hen_trait',
      unlockWave: 1,
    },
    deer: {
      id: 'deer',
      nameKey: 'tower_deer_name',
      descKey: 'tower_deer_desc',
      icon: '🦌',
      cost: 140,
      damage: 26,
      range: 140,
      cooldown: 1.2,
      color: '#00e5ff',
      projectileColor: '#00ffff',
      projectileType: 'stomp_wave',
      slowPercent: 0.5,
      slowDuration: 2.5,
      upgradeCost: 110,
      maxLevel: 4,
      traitKey: 'tower_deer_trait',
      unlockWave: 2,
    },
    squirrel: {
      id: 'squirrel',
      nameKey: 'tower_squirrel_name',
      descKey: 'tower_squirrel_desc',
      icon: '🐿️',
      cost: 160,
      damage: 105,
      range: 260,
      cooldown: 1.35,
      color: '#8b5a2b',
      projectileColor: '#d2691e',
      projectileType: 'sniper_acorn',
      critChance: 0.35,
      critMultiplier: 2.4,
      pierce: 2,
      upgradeCost: 130,
      maxLevel: 4,
      traitKey: 'tower_squirrel_trait',
      unlockWave: 3,
    },
    owl: {
      id: 'owl',
      nameKey: 'tower_owl_name',
      descKey: 'tower_owl_desc',
      icon: '🦉',
      cost: 180,
      damage: 38,
      range: 170,
      cooldown: 0.85,
      color: '#4169e1',
      projectileColor: '#7b68ee',
      projectileType: 'chain_lightning',
      chainTargets: 4,
      detectsStealth: true,
      upgradeCost: 140,
      maxLevel: 4,
      traitKey: 'tower_owl_trait',
      unlockWave: 4,
    },
    eagle: {
      id: 'eagle',
      nameKey: 'tower_eagle_name',
      descKey: 'tower_eagle_desc',
      icon: '🦅',
      cost: 220,
      damage: 150,
      range: 9999, // Global range
      cooldown: 2.2,
      color: '#a000ff',
      projectileColor: '#bf00ff',
      projectileType: 'dive_claw',
      upgradeCost: 180,
      maxLevel: 4,
      traitKey: 'tower_eagle_trait',
      unlockWave: 5,
    },
    // ULTIMATE CAT 1: Golden Shaded Cat (金渐层战神)
    cat_golden: {
      id: 'cat_golden',
      nameKey: 'tower_cat_golden_name',
      descKey: 'tower_cat_golden_desc',
      icon: '🐱',
      cost: 280,
      damage: 85,
      range: 200,
      cooldown: 0.6,
      color: '#ffd700',
      projectileColor: '#fff275',
      projectileType: 'golden_paw',
      splashRadius: 100,
      critChance: 0.4,
      critMultiplier: 2.8,
      upgradeCost: 220,
      maxLevel: 4,
      traitKey: 'tower_cat_golden_trait', // Golden Fortune: Critical AOE + bonus gold drops
      unlockWave: 8, // Unlocks at Wave 8!
    },
    // ULTIMATE CAT 2: British Longhair Blue Cat (英国长毛蓝猫)
    cat_blue: {
      id: 'cat_blue',
      nameKey: 'tower_cat_blue_name',
      descKey: 'tower_cat_blue_desc',
      icon: '🦁',
      cost: 340,
      damage: 120,
      range: 220,
      cooldown: 0.9,
      color: '#4682b4',
      projectileColor: '#87cefa',
      projectileType: 'blizzard_storm',
      splashRadius: 130,
      freezeChance: 0.5,
      freezeDuration: 2.0,
      upgradeCost: 260,
      maxLevel: 4,
      traitKey: 'tower_cat_blue_trait', // Absolute Zero: Blizzard AOE + freezes enemies solid
      unlockWave: 15, // Unlocks at Wave 15!
    }
  },

  // Invading Enemy Types (including Thief Raccoon)
  ENEMIES: {
    fox: {
      id: 'fox',
      nameKey: 'enemy_fox_name',
      icon: '🦊',
      baseHp: 85,
      speed: 2.6,
      bounty: 12,
      scoreValue: 50,
      radius: 14,
      color: '#ff6600',
    },
    weasel: {
      id: 'weasel',
      nameKey: 'enemy_weasel_name',
      icon: '🦡',
      baseHp: 140,
      speed: 2.0,
      stealth: true, // Invisible unless revealed
      bounty: 18,
      scoreValue: 80,
      radius: 13,
      color: '#708090',
    },
    raccoon: {
      id: 'raccoon',
      nameKey: 'enemy_raccoon_name',
      icon: '🦝',
      baseHp: 200,
      speed: 2.2,
      stealsGold: true, // Thief Raccoon steals gold from player!
      stolenGoldPerHit: 12,
      bounty: 35,
      scoreValue: 150,
      radius: 16,
      color: '#2e8b57',
    },
    wolf: {
      id: 'wolf',
      nameKey: 'enemy_wolf_name',
      icon: '🐺',
      baseHp: 240,
      speed: 2.1,
      bounty: 24,
      scoreValue: 110,
      radius: 17,
      color: '#4682b4',
      hasHowl: true,
    },
    boar: {
      id: 'boar',
      nameKey: 'enemy_boar_name',
      icon: '🐗',
      baseHp: 380,
      speed: 1.1,
      armor: 0.25, // 25% damage reduction
      bounty: 28,
      scoreValue: 130,
      radius: 20,
      color: '#8b4513',
    },
    badger: {
      id: 'badger',
      nameKey: 'enemy_badger_name',
      icon: '🦨',
      baseHp: 300,
      speed: 1.4,
      bounty: 30,
      scoreValue: 160,
      radius: 16,
      color: '#2f4f4f',
    },
    bear_boss: {
      id: 'bear_boss',
      nameKey: 'enemy_bear_name',
      icon: '🐻',
      baseHp: 2800,
      speed: 0.85,
      isBoss: true,
      bounty: 180,
      scoreValue: 1200,
      radius: 28,
      color: '#3d1c02',
    },
    harvester_boss: {
      id: 'harvester_boss',
      nameKey: 'enemy_harvester_name',
      icon: '🚜',
      baseHp: 6500,
      speed: 0.75,
      isBoss: true,
      bounty: 350,
      scoreValue: 3000,
      radius: 34,
      color: '#800000',
    }
  },

  // Maps
  MAPS: [
    {
      id: 'farm_meadow',
      nameKey: 'map_meadow_name',
      descKey: 'map_meadow_desc',
      theme: 'meadow',
      bgGradient: ['#142b14', '#0d1f0d'],
      pathColor: '#c29d5b',
      borderColor: '#2e7d32',
      waypoints: [
        { x: 0, y: 3 },
        { x: 5, y: 3 },
        { x: 5, y: 7 },
        { x: 11, y: 7 },
        { x: 11, y: 2 },
        { x: 15, y: 2 },
        { x: 15, y: 8 },
        { x: 18, y: 8 }
      ],
      obstacles: [
        { col: 3, row: 1 }, { col: 8, row: 4 }, { col: 13, row: 5 }, { col: 2, row: 6 }
      ]
    },
    {
      id: 'whispering_woods',
      nameKey: 'map_woods_name',
      descKey: 'map_woods_desc',
      theme: 'woods',
      bgGradient: ['#0f1d1a', '#081412'],
      pathColor: '#8a6840',
      borderColor: '#00897b',
      waypoints: [
        { x: 0, y: 1 },
        { x: 4, y: 1 },
        { x: 4, y: 9 },
        { x: 8, y: 9 },
        { x: 8, y: 4 },
        { x: 13, y: 4 },
        { x: 13, y: 8 },
        { x: 18, y: 8 }
      ],
      obstacles: [
        { col: 2, row: 4 }, { col: 6, row: 2 }, { col: 10, row: 7 }, { col: 15, row: 3 }
      ]
    },
    {
      id: 'misty_canyon',
      nameKey: 'map_canyon_name',
      descKey: 'map_canyon_desc',
      theme: 'canyon',
      bgGradient: ['#1e1428', '#110b19'],
      pathColor: '#8c7b99',
      borderColor: '#7b1fa2',
      waypoints: [
        { x: 0, y: 5 },
        { x: 3, y: 5 },
        { x: 3, y: 1 },
        { x: 14, y: 1 },
        { x: 14, y: 9 },
        { x: 7, y: 9 },
        { x: 7, y: 5 },
        { x: 11, y: 5 },
        { x: 11, y: 7 },
        { x: 18, y: 7 }
      ],
      obstacles: [
        { col: 5, row: 3 }, { col: 9, row: 3 }, { col: 5, row: 7 }, { col: 12, row: 3 }
      ]
    }
  ],

  // 3 Commander Active Skills
  SKILLS: {
    carrot_rain: {
      id: 'carrot_rain',
      nameKey: 'skill_carrot_rain_name',
      descKey: 'skill_carrot_rain_desc',
      icon: '🥕',
      cooldown: 35,
      cost: 60,
      damage: 220,
      radius: 180
    },
    gold_airdrop: {
      id: 'gold_airdrop',
      nameKey: 'skill_gold_airdrop_name',
      descKey: 'skill_gold_airdrop_desc',
      icon: '🥚',
      cooldown: 45,
      rewardGold: 180
    },
    animal_frenzy: {
      id: 'animal_frenzy',
      nameKey: 'skill_frenzy_name',
      descKey: 'skill_frenzy_desc',
      icon: '⚡',
      cooldown: 50,
      duration: 8,
      speedBoost: 1.0 // +100% attack speed
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DefenseConfig;
}
