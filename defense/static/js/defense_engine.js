/**
 * Wildwood Defenders - Core Game Engine & Simulation
 * 60 FPS HTML5 Canvas engine for Tower Defense simulation, pathfinding,
 * projectiles, particle effects, combat calculations, and population limits.
 */

class DefenseEngine {
  constructor(canvas, config, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.audio = audio;

    this.width = config.CANVAS_WIDTH || 900;
    this.height = config.CANVAS_HEIGHT || 540;
    this.tileSize = config.TILE_SIZE || 45;
    this.cols = config.GRID_COLS || 20;
    this.rows = config.GRID_ROWS || 12;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Game State
    this.gold = config.INITIAL_GOLD;
    this.lives = config.INITIAL_LIVES;
    this.maxTowers = config.MAX_TOWERS || 8;
    this.score = 0;
    this.wave = 0;
    this.maxWaves = 30;
    this.isEndless = false;
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.gameSpeed = 1; // 1x, 2x, 4x
    this.autoWave = false;

    // Active map
    this.currentMapIndex = 0;
    this.map = config.MAPS[0];

    // Entities
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];

    // Wave spawning state
    this.waveActive = false;
    this.waveSpawnQueue = [];
    this.spawnTimer = 0;

    // Selected tower / build mode
    this.selectedTower = null;
    this.placingTowerType = null;
    this.hoverTile = null;

    // Commander Skill Cooldowns
    this.skillCooldowns = {
      carrot_rain: 0,
      gold_airdrop: 0,
      animal_frenzy: 0,
    };
    this.frenzyTimer = 0;

    // Screen Shake
    this.shakeTimer = 0;
    this.shakeIntensity = 0;

    // Animation frame handle
    this.animationFrameId = null;
    this.lastTime = performance.now();

    // Callbacks for UI updates
    this.onStateChange = null;
    this.onWaveComplete = null;
    this.onGameOver = null;
    this.onVictory = null;

    this.initMapGrid();
  }

  initMapGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = {
          col: c,
          row: r,
          isPath: false,
          isObstacle: false,
          tower: null,
        };
      }
    }

    // Mark Path Tiles from Waypoints
    const wp = this.map.waypoints;
    for (let i = 0; i < wp.length - 1; i++) {
      const p1 = wp[i];
      const p2 = wp[i + 1];

      const minX = Math.min(p1.x, p2.x);
      const maxX = Math.max(p1.x, p2.x);
      const minY = Math.min(p1.y, p2.y);
      const maxY = Math.max(p1.y, p2.y);

      for (let r = minY; r <= maxY; r++) {
        for (let c = minX; c <= maxX; c++) {
          if (r < this.rows && c < this.cols) {
            this.grid[r][c].isPath = true;
          }
        }
      }
    }

    // Mark Obstacles
    if (this.map.obstacles) {
      this.map.obstacles.forEach((obs) => {
        if (obs.row < this.rows && obs.col < this.cols && !this.grid[obs.row][obs.col].isPath) {
          this.grid[obs.row][obs.col].isObstacle = true;
        }
      });
    }
  }

  setMap(mapIndex) {
    if (mapIndex >= 0 && mapIndex < this.config.MAPS.length) {
      this.currentMapIndex = mapIndex;
      this.map = this.config.MAPS[mapIndex];
      this.resetGame();
    }
  }

  resetGame() {
    this.gold = this.config.INITIAL_GOLD;
    this.lives = this.config.INITIAL_LIVES;
    this.score = 0;
    this.wave = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.waveActive = false;
    this.waveSpawnQueue = [];
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.selectedTower = null;
    this.placingTowerType = null;
    this.skillCooldowns = { carrot_rain: 0, gold_airdrop: 0, animal_frenzy: 0 };
    this.frenzyTimer = 0;

    this.initMapGrid();
    this.notifyState();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  pause() {
    this.isPaused = !this.isPaused;
    this.notifyState();
  }

  setSpeed(multiplier) {
    this.gameSpeed = multiplier;
    this.notifyState();
  }

  toggleAutoWave() {
    this.autoWave = !this.autoWave;
    this.notifyState();
    return this.autoWave;
  }

  // --- Wave Generation & Control ---
  startNextWave() {
    if (this.waveActive || this.isGameOver || this.isVictory) return;

    this.wave++;
    this.waveActive = true;
    this.waveSpawnQueue = this.generateWaveEnemies(this.wave);
    this.spawnTimer = 0;

    this.audio.playWaveStart();
    this.createFloatingText(this.width / 2, this.height / 2 - 40, `WAVE ${this.wave}`, '#00f0ff', 32);
    this.notifyState();
  }

  generateWaveEnemies(waveNum) {
    const queue = [];
    const hpMultiplier = Math.pow(1.11, waveNum - 1);

    // Boss Waves every 5 waves
    const isBossWave = waveNum % 5 === 0;

    if (isBossWave) {
      if (waveNum >= 20) {
        queue.push({ type: 'harvester_boss', hpScale: hpMultiplier * 1.25, delay: 1.0 });
      } else {
        queue.push({ type: 'bear_boss', hpScale: hpMultiplier, delay: 1.0 });
      }
    }

    // Minion squad
    const count = 6 + Math.floor(waveNum * 2.2);
    for (let i = 0; i < count; i++) {
      let type = 'fox';
      const rand = Math.random();

      if (waveNum >= 2 && rand > 0.35) type = 'weasel';
      if (waveNum >= 3 && rand > 0.55) type = 'raccoon'; // Thief raccoon starts appearing!
      if (waveNum >= 5 && rand > 0.72) type = 'wolf';
      if (waveNum >= 7 && rand > 0.82) type = 'boar';
      if (waveNum >= 10 && rand > 0.9) type = 'badger';

      queue.push({
        type: type,
        hpScale: hpMultiplier,
        delay: 0.4 + Math.random() * 0.35,
      });
    }

    return queue;
  }

  // --- Main Game Loop ---
  gameLoop(currentTime) {
    if (!this.isRunning) return;

    const dtRaw = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    const dt = Math.min(dtRaw, 0.1) * (this.isPaused ? 0 : this.gameSpeed);

    if (!this.isPaused) {
      this.update(dt);
    }

    this.render();
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // 1. Update Screen Shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
    }

    // 2. Update Skill Cooldowns & Buffs
    Object.keys(this.skillCooldowns).forEach((k) => {
      if (this.skillCooldowns[k] > 0) {
        this.skillCooldowns[k] = Math.max(0, this.skillCooldowns[k] - dt);
      }
    });
    if (this.frenzyTimer > 0) {
      this.frenzyTimer = Math.max(0, this.frenzyTimer - dt);
    }

    // 3. Spawning Wave Enemies
    if (this.waveActive && this.waveSpawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const next = this.waveSpawnQueue.shift();
        this.spawnEnemy(next.type, next.hpScale);
        this.spawnTimer = next.delay;
      }
    }

    // 4. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, this.map.waypoints, this.tileSize, this);

      // Reached End of Path
      if (e.reachedEnd) {
        this.lives -= e.isBoss ? 5 : 1;
        this.shake(0.3, 8);
        this.audio.playHit();
        this.enemies.splice(i, 1);
        this.createFloatingText(e.x, e.y, `-1 LIFE`, '#ff3366', 20);

        if (this.lives <= 0) {
          this.lives = 0;
          this.handleGameOver();
          return;
        }
        this.notifyState();
      } else if (e.isDead) {
        // Enemy Killed
        let earnedGold = e.bounty;
        if (e.stolenGoldTotal > 0) {
          earnedGold += e.stolenGoldTotal; // Recover all stolen gold!
          this.createFloatingText(e.x, e.y - 25, `RECOVERED +${e.stolenGoldTotal}G!`, '#00f0ff', 16);
        }

        this.gold += earnedGold;
        this.score += e.scoreValue;
        this.createFloatingText(e.x, e.y - 10, `+${earnedGold}G`, '#ffd700', 16);
        this.createParticleBurst(e.x, e.y, e.color, 12);
        this.audio.playExplode();
        this.enemies.splice(i, 1);
        this.notifyState();
      }
    }

    // 5. Update Towers (Targeting & Attack)
    this.towers.forEach((tower) => {
      tower.update(dt, this.enemies, this.towers, this, this.frenzyTimer > 0);
    });

    // 6. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(dt, this);
      if (p.isDestroyed) {
        this.projectiles.splice(i, 1);
      }
    }

    // 7. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.update(dt);
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 8. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.update(dt);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // 9. Check Wave Completion
    if (this.waveActive && this.waveSpawnQueue.length === 0 && this.enemies.length === 0) {
      this.waveActive = false;
      const waveBonus = 25 + this.wave * 6;
      this.gold += waveBonus;
      this.score += this.wave * 120;
      this.createFloatingText(this.width / 2, this.height / 2, `WAVE CLEARED! +${waveBonus}G`, '#00ff88', 26);
      this.notifyState();

      if (this.onWaveComplete) {
        this.onWaveComplete(this.wave);
      }

      if (this.wave >= this.maxWaves && !this.isEndless) {
        this.handleVictory();
        return;
      }

      if (this.autoWave && !this.isGameOver && !this.isVictory) {
        setTimeout(() => {
          if (!this.waveActive && !this.isGameOver) {
            this.startNextWave();
          }
        }, 1200 / this.gameSpeed);
      }
    }
  }

  spawnEnemy(typeKey, hpScale = 1.0) {
    const proto = this.config.ENEMIES[typeKey] || this.config.ENEMIES.fox;
    const startWp = this.map.waypoints[0];
    const enemy = new DefenseEnemy({
      ...proto,
      type: typeKey,
      hp: Math.round(proto.baseHp * hpScale),
      maxHp: Math.round(proto.baseHp * hpScale),
      x: startWp.x * this.tileSize + this.tileSize / 2,
      y: startWp.y * this.tileSize + this.tileSize / 2,
    });
    this.enemies.push(enemy);
  }

  // --- Tower Construction & Management ---
  canBuildTower(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
    if (this.towers.length >= this.maxTowers) return false; // Enforce Max 8 Towers Limit!
    const cell = this.grid[row][col];
    return !cell.isPath && !cell.isObstacle && cell.tower === null;
  }

  buildTower(typeId, col, row) {
    const proto = this.config.TOWERS[typeId];
    if (!proto || this.gold < proto.cost) return false;

    if (this.towers.length >= this.maxTowers) {
      this.createFloatingText(this.width / 2, this.height / 2, `MAX TOWERS LIMIT (${this.maxTowers}) REACHED! UPGRADE INSTEAD!`, '#ff0055', 20);
      this.shake(0.2, 5);
      return false;
    }

    if (!this.canBuildTower(col, row)) return false;

    this.gold -= proto.cost;
    const tower = new DefenseTower(typeId, col, row, proto, this.tileSize);
    this.grid[row][col].tower = tower;
    this.towers.push(tower);

    this.audio.playPlace();
    this.createParticleBurst(tower.x, tower.y, proto.color, 18);
    this.notifyState();
    return true;
  }

  upgradeTower(tower) {
    if (!tower || tower.level >= 4 || this.gold < tower.upgradeCost) {
      return false;
    }

    this.gold -= tower.upgradeCost;
    tower.level++;
    
    // Massive Power Surge on Evolution
    tower.damage = Math.round(tower.damage * 1.7);
    tower.range = Math.round(tower.range * 1.15);
    tower.upgradeCost = Math.round(tower.upgradeCost * 1.65);

    this.audio.playUpgrade();
    const burstColor = tower.level === 4 ? '#ffd700' : tower.level === 3 ? '#bf00ff' : '#00f0ff';
    this.createParticleBurst(tower.x, tower.y, burstColor, tower.level === 4 ? 36 : 22);

    const lvlName = tower.level === 4 ? `👑 v4 (MAX) ${window.ArcadeI18n ? window.ArcadeI18n.t('defense.ultimate_awakening') : 'Ultimate Awakening!'}` : `v${tower.level} ${window.ArcadeI18n ? window.ArcadeI18n.t('defense.upgrade_success') : 'Enhanced!'}`;
    this.createFloatingText(tower.x, tower.y - 20, lvlName, burstColor, tower.level === 4 ? 20 : 16);
    this.notifyState();
    return true;
  }

  sellTower(tower) {
    if (!tower) return false;
    const refund = Math.round(tower.totalInvested * 0.7);
    this.gold += refund;

    this.grid[tower.row][tower.col].tower = null;
    const idx = this.towers.indexOf(tower);
    if (idx !== -1) this.towers.splice(idx, 1);

    if (this.selectedTower === tower) {
      this.selectedTower = null;
    }

    this.audio.playSell();
    this.createFloatingText(tower.x, tower.y, `+${refund}G`, '#ffd700', 16);
    this.notifyState();
    return true;
  }

  // --- Commander Skills ---
  triggerSkill(skillId) {
    const skill = this.config.SKILLS[skillId];
    if (!skill || this.skillCooldowns[skillId] > 0) return false;

    this.skillCooldowns[skillId] = skill.cooldown;
    this.audio.playSkill();

    if (skillId === 'carrot_rain') {
      this.enemies.forEach((e) => {
        e.takeDamage(skill.damage, this);
        this.createParticleBurst(e.x, e.y, '#ff6600', 8);
      });
      this.shake(0.4, 10);
      this.createFloatingText(this.width / 2, this.height / 2, 'CARROT BARRAGE!', '#ff6600', 28);
    } else if (skillId === 'gold_airdrop') {
      this.gold += skill.rewardGold;
      this.createFloatingText(this.width / 2, this.height / 2, `+${skill.rewardGold} GOLD AIRDROP!`, '#ffd700', 28);
    } else if (skillId === 'animal_frenzy') {
      this.frenzyTimer = skill.duration;
      this.createFloatingText(this.width / 2, this.height / 2, '⚡ ANIMAL FRENZY 2X ATK SPEED!', '#00e5ff', 28);
    }

    this.notifyState();
    return true;
  }

  shake(duration, intensity) {
    this.shakeTimer = duration;
    this.shakeIntensity = intensity;
  }

  createParticleBurst(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      this.particles.push(
        new DefenseParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 0.4 + Math.random() * 0.35)
      );
    }
  }

  createFloatingText(x, y, text, color = '#fff', size = 16) {
    this.floatingTexts.push(new DefenseFloatingText(x, y, text, color, size));
  }

  handleGameOver() {
    this.isRunning = false;
    this.isGameOver = true;
    this.audio.playDefeat();
    this.notifyState();
    if (this.onGameOver) {
      this.onGameOver({ wave: this.wave, score: this.score });
    }
  }

  handleVictory() {
    this.isRunning = false;
    this.isVictory = true;
    this.audio.playVictory();
    this.notifyState();
    if (this.onVictory) {
      this.onVictory({ wave: this.wave, score: this.score });
    }
  }

  notifyState() {
    if (this.onStateChange) {
      this.onStateChange({
        gold: this.gold,
        lives: this.lives,
        score: this.score,
        wave: this.wave,
        maxWave: this.maxWaves,
        maxWaves: this.maxWaves,
        towers: this.towers,
        towerCount: this.towers ? this.towers.length : 0,
        maxTowers: this.maxTowers,
        isRunning: this.isRunning,
        waveActive: this.isRunning,
        isPaused: this.isPaused,
        isGameOver: this.isGameOver,
        isVictory: this.isVictory,
        gameSpeed: this.gameSpeed,
        autoWave: this.autoWave,
        selectedTower: this.selectedTower,
        skillCooldowns: this.skillCooldowns,
        frenzyTimer: this.frenzyTimer,
      });
    }
  }

  // --- Rendering ---
  render() {
    const ctx = this.ctx;
    ctx.save();

    if (this.shakeTimer > 0) {
      const dx = (Math.random() - 0.5) * this.shakeIntensity;
      const dy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(dx, dy);
    }

    // 1. Draw Map Background
    const bgGrad = ctx.createLinearGradient(0, 0, this.width, this.height);
    bgGrad.addColorStop(0, this.map.bgGradient[0]);
    bgGrad.addColorStop(1, this.map.bgGradient[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Draw Grid Pattern & Path
    this.renderGrid(ctx);
    this.renderPath(ctx);

    // 3. Draw Towers
    this.towers.forEach((t) => t.render(ctx, this.tileSize));

    // 4. Draw Enemies
    this.enemies.forEach((e) => e.render(ctx));

    // 5. Draw Projectiles
    this.projectiles.forEach((p) => p.render(ctx));

    // 6. Draw Placement & Range Overlays
    this.renderOverlays(ctx);

    // 7. Draw Particles & Floating Text
    this.particles.forEach((pt) => pt.render(ctx));
    this.floatingTexts.forEach((ft) => ft.render(ctx));

    ctx.restore();
  }

  renderGrid(ctx) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = c * this.tileSize;
        const y = r * this.tileSize;
        const cell = this.grid[r][c];

        if (cell.isObstacle) {
          ctx.fillStyle = 'rgba(40, 60, 40, 0.6)';
          ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🌲', x + this.tileSize / 2, y + this.tileSize / 2);
        } else {
          ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        }
      }
    }
  }

  renderPath(ctx) {
    const wp = this.map.waypoints;
    if (wp.length < 2) return;

    ctx.save();
    ctx.strokeStyle = this.map.pathColor;
    ctx.lineWidth = this.tileSize * 0.72;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(wp[0].x * this.tileSize + this.tileSize / 2, wp[0].y * this.tileSize + this.tileSize / 2);
    for (let i = 1; i < wp.length; i++) {
      ctx.lineTo(wp[i].x * this.tileSize + this.tileSize / 2, wp[i].y * this.tileSize + this.tileSize / 2);
    }
    ctx.stroke();

    ctx.strokeStyle = this.map.borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    const startX = wp[0].x * this.tileSize + this.tileSize / 2;
    const startY = wp[0].y * this.tileSize + this.tileSize / 2;
    const endX = wp[wp.length - 1].x * this.tileSize + this.tileSize / 2;
    const endY = wp[wp.length - 1].y * this.tileSize + this.tileSize / 2;

    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚪', startX, startY);
    ctx.fillText('🏡', endX, endY);

    ctx.restore();
  }

  renderOverlays(ctx) {
    // 1. Range of selected tower
    if (this.selectedTower) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.selectedTower.x, this.selectedTower.y, this.selectedTower.range, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Hover placement preview
    if (this.placingTowerType && this.hoverTile) {
      const { col, row } = this.hoverTile;
      const canBuild = this.canBuildTower(col, row);
      const x = col * this.tileSize;
      const y = row * this.tileSize;
      const proto = this.config.TOWERS[this.placingTowerType];

      ctx.save();
      ctx.fillStyle = canBuild ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 0, 85, 0.35)';
      ctx.fillRect(x, y, this.tileSize, this.tileSize);
      ctx.strokeStyle = canBuild ? '#00ff88' : '#ff0055';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, this.tileSize, this.tileSize);

      if (proto) {
        ctx.beginPath();
        ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, proto.range, 0, Math.PI * 2);
        ctx.fillStyle = canBuild ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 0, 85, 0.08)';
        ctx.fill();
        ctx.strokeStyle = canBuild ? '#00ff88' : '#ff0055';
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(proto.icon, x + this.tileSize / 2, y + this.tileSize / 2);
      }
      ctx.restore();
    }
  }
}

// --- Enemy Entity ---
class DefenseEnemy {
  constructor(data) {
    Object.assign(this, data);
    this.waypointIndex = 0;
    this.reachedEnd = false;
    this.isDead = false;
    this.slowTimer = 0;
    this.slowFactor = 1.0;
    this.freezeTimer = 0;
    this.poisonTimer = 0;
    this.poisonDmg = 0;
    this.revealedTimer = 0;
    this.stolenGoldTotal = 0;
    this.stealCooldown = 0;
  }

  update(dt, waypoints, tileSize, engine) {
    if (this.isDead || this.reachedEnd) return;

    // Freeze & Slow check
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      return; // Completely immobilized!
    }

    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.slowFactor = 1.0;
    }

    // Poison DOT
    if (this.poisonTimer > 0) {
      this.poisonTimer -= dt;
      this.hp -= this.poisonDmg * dt;
      if (this.hp <= 0) {
        this.isDead = true;
        return;
      }
    }

    // Thief Raccoon Stealing Logic
    if (this.stealsGold && this.stealCooldown > 0) {
      this.stealCooldown -= dt;
    }
    if (this.stealsGold && this.stealCooldown <= 0 && engine.gold > 15) {
      // Check proximity to towers
      engine.towers.forEach((t) => {
        if (Math.hypot(t.x - this.x, t.y - this.y) <= 120 && this.stealCooldown <= 0) {
          const stolen = Math.min(engine.gold, 15);
          engine.gold -= stolen;
          this.stolenGoldTotal += stolen;
          this.stealCooldown = 4.0;
          engine.createFloatingText(this.x, this.y - 18, `-${stolen}G STOLEN!`, '#ff0055', 14);
          engine.notifyState();
        }
      });
    }

    // Move towards next waypoint
    if (this.waypointIndex < waypoints.length - 1) {
      const targetWp = waypoints[this.waypointIndex + 1];
      const targetX = targetWp.x * tileSize + tileSize / 2;
      const targetY = targetWp.y * tileSize + tileSize / 2;

      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.hypot(dx, dy);

      const moveStep = this.speed * 40 * this.slowFactor * dt;

      if (dist <= moveStep) {
        this.x = targetX;
        this.y = targetY;
        this.waypointIndex++;
        if (this.waypointIndex >= waypoints.length - 1) {
          this.reachedEnd = true;
        }
      } else {
        this.x += (dx / dist) * moveStep;
        this.y += (dy / dist) * moveStep;
      }
    } else {
      this.reachedEnd = true;
    }
  }

  takeDamage(dmg, engine, isCrit = false) {
    const effectiveDmg = Math.max(1, dmg * (1 - (this.armor || 0)));
    this.hp -= effectiveDmg;

    engine.createFloatingText(
      this.x + (Math.random() - 0.5) * 16,
      this.y - 12,
      `-${Math.round(effectiveDmg)}${isCrit ? '!' : ''}`,
      isCrit ? '#ff0055' : '#ffffff',
      isCrit ? 18 : 13
    );

    if (this.hp <= 0) {
      this.isDead = true;
    }
  }

  applyFreeze(duration) {
    this.freezeTimer = Math.max(this.freezeTimer, duration);
  }

  applySlow(factor, duration) {
    this.slowFactor = Math.min(this.slowFactor, 1 - factor);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  applyPoison(dps, duration) {
    this.poisonDmg = dps;
    this.poisonTimer = Math.max(this.poisonTimer, duration);
  }

  render(ctx) {
    if (this.stealth && this.revealedTimer <= 0) {
      ctx.globalAlpha = 0.35;
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // Base Glow
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.isBoss ? 16 : 8;
    ctx.fill();

    // Freeze / Slow / Poison Rings
    if (this.freezeTimer > 0) {
      ctx.strokeStyle = '#87cefa';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (this.slowTimer > 0) {
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Icon
    ctx.font = `${Math.round(this.radius * 1.3)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, 0, 0);

    // HP Bar
    const barWidth = this.radius * 2.2;
    const barHeight = 4;
    const hpRatio = Math.max(0, this.hp / this.maxHp);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(-barWidth / 2, -this.radius - 8, barWidth, barHeight);

    ctx.fillStyle = hpRatio > 0.5 ? '#00ff88' : hpRatio > 0.2 ? '#ffbb00' : '#ff0055';
    ctx.fillRect(-barWidth / 2, -this.radius - 8, barWidth * hpRatio, barHeight);

    ctx.restore();
    ctx.globalAlpha = 1.0;
  }
}

// --- Tower Entity ---
class DefenseTower {
  constructor(typeId, col, row, proto, tileSize) {
    this.typeId = typeId;
    this.col = col;
    this.row = row;
    this.x = col * tileSize + tileSize / 2;
    this.y = row * tileSize + tileSize / 2;
    this.level = 1;

    Object.assign(this, proto);
    this.totalInvested = proto.cost;
    this.cooldownTimer = 0;
    this.economyTimer = 0;
    this.angle = 0;
  }

  update(dt, enemies, allTowers, engine, hasFrenzy = false) {
    // 1. Hen Periodic Economy
    if (this.economyBonus) {
      this.economyTimer += dt;
      if (this.economyTimer >= 10) {
        this.economyTimer = 0;
        engine.gold += this.economyBonus;
        engine.createFloatingText(this.x, this.y - 15, `+${this.economyBonus}G EGG!`, '#ffd700', 14);
      }
    }

    // 2. Rooster Aura
    let attackSpeedMultiplier = hasFrenzy ? 2.0 : 1.0;
    allTowers.forEach((other) => {
      if (other !== this && other.typeId === 'rooster') {
        const d = Math.hypot(other.x - this.x, other.y - this.y);
        if (d <= other.range) {
          attackSpeedMultiplier *= 1.25;
        }
      }
    });

    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dt * attackSpeedMultiplier;
    }

    if (this.cooldownTimer <= 0) {
      const target = this.findTarget(enemies);
      if (target) {
        this.attack(target, engine);
        this.cooldownTimer = this.cooldown;
      }
    }
  }

  findTarget(enemies) {
    let best = null;
    let maxProgress = -1;
    let maxHp = -1;

    for (const e of enemies) {
      if (e.isDead || e.reachedEnd) continue;

      const dist = Math.hypot(e.x - this.x, e.y - this.y);
      if (dist <= this.range) {
        if (this.typeId === 'eagle') {
          if (e.hp > maxHp) {
            maxHp = e.hp;
            best = e;
          }
        } else {
          if (e.waypointIndex > maxProgress) {
            maxProgress = e.waypointIndex;
            best = e;
          }
        }
      }
    }
    return best;
  }

  attack(target, engine) {
    this.angle = Math.atan2(target.y - this.y, target.x - this.x);
    engine.audio.playShoot(this.projectileType);

    if (this.typeId === 'deer') {
      // Deer Ground Stomp AOE
      engine.enemies.forEach((e) => {
        if (Math.hypot(e.x - this.x, e.y - this.y) <= this.range) {
          e.takeDamage(this.damage, engine);
          e.applySlow(this.slowPercent || 0.5, this.slowDuration || 2.5);
        }
      });
      engine.createParticleBurst(this.x, this.y, '#00e5ff', 18);
    } else if (this.typeId === 'owl') {
      // Chain Lightning + True sight
      let curr = target;
      let hitCount = 0;
      const hitList = [curr];

      while (curr && hitCount < (this.chainTargets || 4)) {
        curr.takeDamage(this.damage, engine);
        curr.revealedTimer = 4.0;
        hitCount++;

        let nextTarget = null;
        let minDist = 160;
        engine.enemies.forEach((e) => {
          if (!hitList.includes(e) && !e.isDead) {
            const d = Math.hypot(e.x - curr.x, e.y - curr.y);
            if (d < minDist) {
              minDist = d;
              nextTarget = e;
            }
          }
        });
        if (nextTarget) {
          hitList.push(nextTarget);
          curr = nextTarget;
        } else {
          break;
        }
      }
    } else {
      // Spawn Projectile
      engine.projectiles.push(
        new DefenseProjectile({
          x: this.x,
          y: this.y,
          target: target,
          tower: this,
          speed: this.projectileType === 'carrot_bullet' ? 700 : 450,
          color: this.projectileColor,
          type: this.projectileType,
        })
      );
    }
  }

  render(ctx, tileSize) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Tower Base Platform
    ctx.beginPath();
    ctx.arc(0, 0, tileSize * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#1c2420';
    ctx.strokeStyle = this.level === 4 ? '#ffd700' : this.color;
    ctx.lineWidth = this.level === 4 ? 3.5 : 2;
    ctx.shadowColor = this.level === 4 ? '#ffd700' : this.color;
    ctx.shadowBlur = 6 + this.level * 5;
    ctx.fill();
    ctx.stroke();

    // Tower Animal Icon
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    // Level Badges (v1, v2, v3, v4)
    ctx.font = 'bold 11px sans-serif';
    let badgeText = `v${this.level}`;
    let badgeBg = this.level === 4 ? '#ffd700' : this.level === 3 ? '#bf00ff' : this.level === 2 ? '#00f0ff' : '#00ff88';
    let badgeColor = (this.level === 4 || this.level === 2 || this.level === 1) ? '#000' : '#fff';

    const bx = tileSize * 0.24;
    const by = -tileSize * 0.28;
    ctx.fillStyle = badgeBg;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(bx - 11, by - 7, 22, 14, 4);
      ctx.fill();
    } else {
      ctx.fillRect(bx - 11, by - 7, 22, 14);
    }

    ctx.fillStyle = badgeColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, bx, by);

    ctx.restore();
  }
}

// --- Projectile Entity ---
class DefenseProjectile {
  constructor(data) {
    Object.assign(this, data);
    this.isDestroyed = false;
  }

  update(dt, engine) {
    if (this.isDestroyed) return;

    if (this.target.isDead) {
      this.isDestroyed = true;
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt;

    if (dist <= step) {
      this.hit(engine);
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }
  }

  hit(engine) {
    this.isDestroyed = true;
    const t = this.tower;

    if (t.projectileType === 'golden_paw') {
      // Golden Shaded Cat AOE Explosion + Bonus Gold Drop!
      engine.enemies.forEach((e) => {
        if (Math.hypot(e.x - this.x, e.y - this.y) <= (t.splashRadius || 100)) {
          const isCrit = Math.random() < (t.critChance || 0.4);
          const dmg = isCrit ? t.damage * (t.critMultiplier || 2.8) : t.damage;
          e.takeDamage(dmg, engine, isCrit);
        }
      });
      // 30% chance to drop bonus coin
      if (Math.random() < 0.3) {
        engine.gold += 15;
        engine.createFloatingText(this.x, this.y - 20, '+15G LUCKY COIN! 💰', '#ffd700', 16);
      }
      engine.createParticleBurst(this.x, this.y, '#ffd700', 22);
      engine.audio.playExplode();
    } else if (t.projectileType === 'blizzard_storm') {
      // British Longhair Blue Cat Blizzard AOE + Freeze!
      engine.enemies.forEach((e) => {
        if (Math.hypot(e.x - this.x, e.y - this.y) <= (t.splashRadius || 130)) {
          e.takeDamage(t.damage, engine);
          if (Math.random() < (t.freezeChance || 0.5)) {
            e.applyFreeze(t.freezeDuration || 2.0);
          }
        }
      });
      engine.createParticleBurst(this.x, this.y, '#87cefa', 24);
      engine.audio.playExplode();
    } else if (t.splashRadius) {
      // Hen Egg Bomb
      engine.enemies.forEach((e) => {
        if (Math.hypot(e.x - this.x, e.y - this.y) <= t.splashRadius) {
          e.takeDamage(t.damage, engine);
        }
      });
      engine.createParticleBurst(this.x, this.y, t.projectileColor, 14);
      engine.audio.playExplode();
    } else if (t.typeId === 'eagle' && this.target.hp / this.target.maxHp < 0.3) {
      // Eagle 3x Execute
      this.target.takeDamage(t.damage * 3, engine, true);
      engine.createParticleBurst(this.x, this.y, '#bf00ff', 16);
    } else {
      // Direct Hit
      const isCrit = Math.random() < (t.critChance || 0);
      const dmg = isCrit ? t.damage * (t.critMultiplier || 2) : t.damage;
      this.target.takeDamage(dmg, engine, isCrit);
      engine.createParticleBurst(this.x, this.y, this.color, 6);
    }
  }

  render(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
}

// --- Particle Entity ---
class DefenseParticle {
  constructor(x, y, vx, vy, color, life = 0.5) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.maxLife = life;
    this.life = life;
    this.size = 3 + Math.random() * 2.5;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  render(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// --- Floating Text Entity ---
class DefenseFloatingText {
  constructor(x, y, text, color = '#fff', size = 16) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.size = size;
    this.life = 0.95;
    this.maxLife = 0.95;
  }

  update(dt) {
    this.y -= 28 * dt;
    this.life -= dt;
  }

  render(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${this.size}px sans-serif`;
    ctx.fillStyle = this.color;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DefenseEngine;
}
