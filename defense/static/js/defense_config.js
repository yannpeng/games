/**
 * Wildwood Defenders (田园守卫战) - Game Configuration
 * Definitions for towers, enemies, maps, upgrades, and wave progression.
 */

const DefenseConfig = {
  CANVAS_WIDTH: 900,
  CANVAS_HEIGHT: 540,
  GRID_COLS: 18,
  GRID_ROWS: 11, // Tile size = 50px x 48px approx (or 50x50 with top/bottom UI margin)
  TILE_SIZE: 50,

  INITIAL_GOLD: 350,
  INITIAL_LIVES: 20,

  // 8 Animal Defender Towers
  TOWERS: {
    rooster: {
      id: 'rooster',
      nameKey: 'tower_rooster_name',
      descKey: 'tower_rooster_desc',
      icon: '🐓',
      cost: 100,
      damage: 18,
      range: 120,
      cooldown: 0.35, // seconds
      color: '#ff3366',
      projectileColor: '#ff9900',
      projectileType: 'peck',
      upgradeCost: 80,
      tierLevels: 3,
      traitKey: 'tower_rooster_trait', // Dawn Cry: +20% attack speed to nearby towers
    },
    hen: {
      id: 'hen',
      nameKey: 'tower_hen_name',
      descKey: 'tower_hen_desc',
      icon: '🐔',
      cost: 120,
      damage: 40,
      range: 130,
      cooldown: 1.1,
      color: '#ffaa00',
      projectileColor: '#ffd700',
      projectileType: 'egg_bomb',
      splashRadius: 75,
      upgradeCost: 95,
      tierLevels: 3,
      economyBonus: 10, // gold every 12s
      traitKey: 'tower_hen_trait', // Egg Bomb AOE & Golden Egg economy
    },
    squirrel: {
      id: 'squirrel',
      nameKey: 'tower_squirrel_name',
      descKey: 'tower_squirrel_desc',
      icon: '🐿️',
      cost: 150,
      damage: 90,
      range: 250,
      cooldown: 1.4,
      color: '#8b5a2b',
      projectileColor: '#d2691e',
      projectileType: 'sniper_acorn',
      critChance: 0.3,
      critMultiplier: 2.2,
      pierce: 2,
      upgradeCost: 120,
      tierLevels: 3,
      traitKey: 'tower_squirrel_trait', // Long range pierce sniper
    },
    deer: {
      id: 'deer',
      nameKey: 'tower_deer_name',
      descKey: 'tower_deer_desc',
      icon: '🦌',
      cost: 140,
      damage: 22,
      range: 135,
      cooldown: 1.3,
      color: '#00e5ff',
      projectileColor: '#00ffff',
      projectileType: 'stomp_wave',
      slowPercent: 0.45,
      slowDuration: 2.2,
      upgradeCost: 110,
      tierLevels: 3,
      traitKey: 'tower_deer_trait', // Stomp slow & ground shockwave
    },
    raccoon: {
      id: 'raccoon',
      nameKey: 'tower_raccoon_name',
      descKey: 'tower_raccoon_desc',
      icon: '🦝',
      cost: 130,
      damage: 12,
      range: 140,
      cooldown: 0.75,
      color: '#00ff88',
      projectileColor: '#39ff14',
      projectileType: 'poison_flask',
      poisonDmg: 8,
      poisonDuration: 3.5,
      bountyBonus: 0.25,
      upgradeCost: 100,
      tierLevels: 3,
      traitKey: 'tower_raccoon_trait', // Poison DOT and +25% extra gold on kill
    },
    eagle: {
      id: 'eagle',
      nameKey: 'tower_eagle_name',
      descKey: 'tower_eagle_desc',
      icon: '🦅',
      cost: 200,
      damage: 130,
      range: 9999, // Global range!
      cooldown: 2.4,
      color: '#a000ff',
      projectileColor: '#bf00ff',
      projectileType: 'dive_claw',
      upgradeCost: 160,
      tierLevels: 3,
      traitKey: 'tower_eagle_trait', // Global patrol, executes <30% HP enemies for 3x dmg
    },
    owl: {
      id: 'owl',
      nameKey: 'tower_owl_name',
      descKey: 'tower_owl_desc',
      icon: '🦉',
      cost: 160,
      damage: 32,
      range: 160,
      cooldown: 0.9,
      color: '#4169e1',
      projectileColor: '#7b68ee',
      projectileType: 'chain_lightning',
      chainTargets: 3,
      detectsStealth: true,
      upgradeCost: 130,
      tierLevels: 3,
      traitKey: 'tower_owl_trait', // True Sight stealth reveal + Chain Lightning
    },
    rabbit: {
      id: 'rabbit',
      nameKey: 'tower_rabbit_name',
      descKey: 'tower_rabbit_desc',
      icon: '🐰',
      cost: 90,
      damage: 9,
      range: 130,
      cooldown: 0.16, // ultra fast gatling!
      color: '#ff69b4',
      projectileColor: '#ff4500',
      projectileType: 'carrot_bullet',
      upgradeCost: 75,
      tierLevels: 3,
      traitKey: 'tower_rabbit_trait', // Ultra high-speed carrot gatling gun
    }
  },

  // Invading Enemy Types
  ENEMIES: {
    fox: {
      id: 'fox',
      nameKey: 'enemy_fox_name',
      icon: '🦊',
      baseHp: 80,
      speed: 2.5,
      bounty: 12,
      scoreValue: 50,
      radius: 14,
      color: '#ff6600',
    },
    boar: {
      id: 'boar',
      nameKey: 'enemy_boar_name',
      icon: '🐗',
      baseHp: 320,
      speed: 1.1,
      armor: 0.2, // 20% damage reduction
      bounty: 25,
      scoreValue: 120,
      radius: 20,
      color: '#8b4513',
    },
    weasel: {
      id: 'weasel',
      nameKey: 'enemy_weasel_name',
      icon: '🦡',
      baseHp: 130,
      speed: 2.0,
      stealth: true, // Requires Owl or close proximity to reveal
      bounty: 18,
      scoreValue: 80,
      radius: 13,
      color: '#708090',
    },
    wolf: {
      id: 'wolf',
      nameKey: 'enemy_wolf_name',
      icon: '🐺',
      baseHp: 220,
      speed: 2.1,
      bounty: 22,
      scoreValue: 100,
      radius: 17,
      color: '#4682b4',
      hasHowl: true, // Buffs nearby allies
    },
    badger: {
      id: 'badger',
      nameKey: 'enemy_badger_name',
      icon: '🦨',
      baseHp: 260,
      speed: 1.4,
      bounty: 28,
      scoreValue: 140,
      radius: 16,
      color: '#2f4f4f',
    },
    bear_boss: {
      id: 'bear_boss',
      nameKey: 'enemy_bear_name',
      icon: '🐻',
      baseHp: 2600,
      speed: 0.85,
      isBoss: true,
      bounty: 150,
      scoreValue: 1000,
      radius: 28,
      color: '#3d1c02',
    },
    harvester_boss: {
      id: 'harvester_boss',
      nameKey: 'enemy_harvester_name',
      icon: '🚜',
      baseHp: 5800,
      speed: 0.75,
      isBoss: true,
      bounty: 300,
      scoreValue: 2500,
      radius: 34,
      color: '#800000',
    }
  },

  // Maps with Custom Waypoints
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
      damage: 180,
      radius: 180
    },
    gold_airdrop: {
      id: 'gold_airdrop',
      nameKey: 'skill_gold_airdrop_name',
      descKey: 'skill_gold_airdrop_desc',
      icon: '🥚',
      cooldown: 45,
      rewardGold: 150
    },
    animal_frenzy: {
      id: 'animal_frenzy',
      nameKey: 'skill_frenzy_name',
      descKey: 'skill_frenzy_desc',
      icon: '⚡',
      cooldown: 50,
      duration: 8,
      speedBoost: 1.0 // +100% attack speed for 8 seconds
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DefenseConfig;
}
