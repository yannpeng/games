/**
 * Cyberpunk Snake Core Game Engine
 * Manages grid matrix physics, multi-segment body rendering, particle explosions,
 * special food effects, wall obstacles, and duel battle states.
 */

class SnakeEngine {
  constructor(mode = 'classic') {
    this.mode = mode; // 'classic' (10-level campaign) or 'battle' (Dual Snake vs AI)
    this.cols = SNAKE_CONFIG.COLS;
    this.rows = SNAKE_CONFIG.ROWS;
    this.reset();
  }

  reset(level = 1) {
    this.level = Math.max(1, Math.min(10, level));
    this.score = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.isPlaying = false;
    this.isCleared = false;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;

    // Player Snake Setup
    const startY = Math.floor(this.rows / 2);
    this.snake = [
      { x: 8, y: startY },
      { x: 7, y: startY },
      { x: 6, y: startY },
      { x: 5, y: startY }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.growPending = 0;

    // AI Snake Setup (for Battle Mode)
    this.aiSnake = null;
    this.aiDir = { x: -1, y: 0 };
    this.aiScore = 0;
    this.aiGrowPending = 0;
    this.aiAlive = true;

    if (this.mode === 'battle') {
      const aiStartY = Math.floor(this.rows / 2);
      this.aiSnake = [
        { x: 18, y: aiStartY },
        { x: 19, y: aiStartY },
        { x: 20, y: aiStartY },
        { x: 21, y: aiStartY }
      ];
      this.aiDir = { x: -1, y: 0 };
    }

    // Active Food Items & Obstacles
    this.foods = [];
    this.particles = [];
    this.obstacles = this.getObstaclesForLevel(this.level);

    // Initial Food Spawn
    this.spawnFood('APPLE');
    if (Math.random() < 0.6) {
      this.spawnRandomBonusFood();
    }
  }

  getObstaclesForLevel(lvl) {
    if (this.mode === 'battle') return []; // Open arena for battle
    return SNAKE_CONFIG.MAPS[lvl] ? [...SNAKE_CONFIG.MAPS[lvl]] : [];
  }

  setDirection(dx, dy) {
    // Prevent immediate 180-degree reversal
    if (this.dir.x + dx === 0 && this.dir.y + dy === 0) return;
    this.nextDir = { x: dx, y: dy };
  }

  spawnFood(specificType = null) {
    let typeKey = specificType;
    if (!typeKey) {
      const rand = Math.random() * 100;
      if (rand < 70) typeKey = 'APPLE';
      else if (rand < 85) typeKey = 'GOLDEN';
      else if (rand < 95) typeKey = 'SPEED';
      else typeKey = 'SHRINK';
    }

    const foodConfig = SNAKE_CONFIG.FOOD_TYPES[typeKey] || SNAKE_CONFIG.FOOD_TYPES.APPLE;
    const pos = this.getRandomEmptyCell();
    if (!pos) return;

    this.foods.push({
      x: pos.x,
      y: pos.y,
      type: foodConfig.type,
      name: foodConfig.name,
      color: foodConfig.color,
      glow: foodConfig.glow,
      score: foodConfig.score,
      grow: foodConfig.grow,
      icon: foodConfig.icon,
      expiresAt: foodConfig.durationSec > 0 ? Date.now() + foodConfig.durationSec * 1000 : 0
    });
  }

  spawnRandomBonusFood() {
    const bonuses = ['GOLDEN', 'SPEED', 'SHRINK'];
    const pick = bonuses[Math.floor(Math.random() * bonuses.length)];
    this.spawnFood(pick);
  }

  getRandomEmptyCell() {
    const occupied = new Set();

    // Mark obstacles
    this.obstacles.forEach(o => occupied.add(`${o.x},${o.y}`));
    // Mark player snake
    this.snake.forEach(s => occupied.add(`${s.x},${s.y}`));
    // Mark AI snake
    if (this.aiSnake) {
      this.aiSnake.forEach(s => occupied.add(`${s.x},${s.y}`));
    }
    // Mark existing foods
    this.foods.forEach(f => occupied.add(`${f.x},${f.y}`));

    const empty = [];
    for (let x = 1; x < this.cols - 1; x++) {
      for (let y = 1; y < this.rows - 1; y++) {
        if (!occupied.has(`${x},${y}`)) {
          empty.push({ x, y });
        }
      }
    }

    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  updateFoods() {
    const now = Date.now();
    // Remove expired bonus foods
    this.foods = this.foods.filter(f => f.expiresAt === 0 || f.expiresAt > now);

    // Always ensure at least one normal apple exists
    const hasApple = this.foods.some(f => f.type === 'APPLE');
    if (!hasApple) {
      this.spawnFood('APPLE');
    }

    // Occasionally spawn bonus food
    if (this.foods.length < 3 && Math.random() < 0.02) {
      this.spawnRandomBonusFood();
    }
  }

  tick() {
    if (!this.isPlaying || this.isGameOver || this.isPaused) return;

    this.updateFoods();
    this.dir = { ...this.nextDir };

    // Move Player Snake
    const head = this.snake[0];
    const newHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };

    // Wall collision
    if (newHead.x < 0 || newHead.x >= this.cols || newHead.y < 0 || newHead.y >= this.rows) {
      this.handlePlayerDeath('snake.death_wall');
      return;
    }

    // Obstacle collision
    if (this.obstacles.some(o => o.x === newHead.x && o.y === newHead.y)) {
      this.handlePlayerDeath('snake.death_obstacle');
      return;
    }

    // Self collision
    if (this.snake.slice(0, -1).some(s => s.x === newHead.x && s.y === newHead.y)) {
      this.handlePlayerDeath('snake.death_self');
      return;
    }

    // AI snake collision in Battle Mode
    if (this.mode === 'battle' && this.aiSnake) {
      if (this.aiSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        this.handlePlayerDeath('snake.death_ai');
        return;
      }
    }

    // Advance head
    this.snake.unshift(newHead);

    // Check food collision
    const foodIdx = this.foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);
    if (foodIdx !== -1) {
      const food = this.foods[foodIdx];
      this.foods.splice(foodIdx, 1);
      this.score += food.score * this.level;
      this.createParticles(newHead.x, newHead.y, food.color);

      if (food.grow > 0) {
        this.growPending += food.grow;
      } else if (food.grow < 0 && this.snake.length > 3) {
        // Shrink purple food effect
        this.snake.pop();
        if (this.snake.length > 3) this.snake.pop();
      }

      if (this.onEatFood) {
        this.onEatFood(food);
      }

      // Check Campaign Level Advancement
      if (this.mode === 'classic') {
        const target = SNAKE_CONFIG.LEVEL_TARGET_SCORES[this.level - 1];
        if (this.score >= target) {
          if (this.level >= 10) {
            this.isCleared = true;
            this.isGameOver = true;
            this.isPlaying = false;
            if (this.onVictory) this.onVictory();
            return;
          } else {
            this.level++;
            this.obstacles = this.getObstaclesForLevel(this.level);
            if (this.onLevelUp) this.onLevelUp(this.level);
          }
        }
      }
    }

    if (this.growPending > 0) {
      this.growPending--;
    } else {
      this.snake.pop();
    }

    // Tick AI in Battle Mode
    if (this.mode === 'battle' && this.aiSnake && this.aiAlive) {
      this.tickAi();
    }

    this.updateParticles();
  }

  tickAi() {
    if (!this.aiSnake || !this.aiAlive) return;

    const aiHead = this.aiSnake[0];
    const newAiHead = { x: aiHead.x + this.aiDir.x, y: aiHead.y + this.aiDir.y };

    // AI wall check
    if (newAiHead.x < 0 || newAiHead.x >= this.cols || newAiHead.y < 0 || newAiHead.y >= this.rows) {
      this.handleAiDefeated('snake.ai_death_wall');
      return;
    }

    // AI self collision
    if (this.aiSnake.slice(0, -1).some(s => s.x === newAiHead.x && s.y === newAiHead.y)) {
      this.handleAiDefeated('snake.ai_death_self');
      return;
    }

    // AI hitting player snake
    if (this.snake.some(s => s.x === newAiHead.x && s.y === newAiHead.y)) {
      this.handleAiDefeated('snake.ai_death_player');
      return;
    }

    this.aiSnake.unshift(newAiHead);

    // AI Food check
    const foodIdx = this.foods.findIndex(f => f.x === newAiHead.x && f.y === newAiHead.y);
    if (foodIdx !== -1) {
      const food = this.foods[foodIdx];
      this.foods.splice(foodIdx, 1);
      this.aiScore += food.score;
      this.createParticles(newAiHead.x, newAiHead.y, food.color);
      this.aiGrowPending += Math.max(1, food.grow);
    }

    if (this.aiGrowPending > 0) {
      this.aiGrowPending--;
    } else {
      this.aiSnake.pop();
    }
  }

  handlePlayerDeath(reason) {
    this.isGameOver = true;
    this.isPlaying = false;
    this.createParticles(this.snake[0].x, this.snake[0].y, '#ff3366', 25);
    if (this.onDeath) {
      this.onDeath(reason);
    }
  }

  handleAiDefeated(reason) {
    this.aiAlive = false;
    this.score += 5000; // Defeat AI bonus
    this.createParticles(this.aiSnake[0].x, this.aiSnake[0].y, '#00f0ff', 30);
    if (this.onAiDefeated) {
      this.onAiDefeated(reason);
    }
  }

  createParticles(cellX, cellY, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      this.particles.push({
        x: cellX + 0.5,
        y: cellY + 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.04,
        size: 2 + Math.random() * 3
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * 0.1;
      p.y += p.vy * 0.1;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  getSpeedMs() {
    return SNAKE_CONFIG.SPEED_CURVE[this.level - 1] || 100;
  }
}
