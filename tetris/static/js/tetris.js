// Fast 32-bit Mulberry32 PRNG for deterministic seeded 7-Bag generation
function createSeededRandom(seed) {
  let a = (seed >>> 0) || 1;
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class TetrisEngine {
  constructor(mode = 'solo', garbageMode = 'standard') {
    this.mode = mode; // 'solo' or 'vs_ai'
    this.garbageMode = garbageMode; // 'standard', 'cheesy', 'classic'
    this.startLevel = 1;
    this.onAttackCallback = null;
    this.rng = Math.random;
    this.reset(1, null, garbageMode);
  }

  reset(startLevel = 1, seed = null, garbageMode = 'standard') {
    this.cols = CONFIG.COLS;
    this.rows = CONFIG.ROWS + CONFIG.BUFFER_ROWS;
    this.visibleRows = CONFIG.ROWS;
    this.garbageMode = garbageMode;

    // PRNG setup: if seed is given, use deterministic PRNG; else standard Math.random
    if (seed !== null && seed !== undefined) {
      this.rng = createSeededRandom(seed);
    } else {
      this.rng = Math.random;
    }

    // Initialize 2D grid matrix: 0 = empty, object = { color, type, isGarbage }
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));

    // Game state
    this.startLevel = Math.max(1, Math.min(50, startLevel));
    this.level = this.startLevel;
    this.score = 0;
    this.lines = 0;
    this.linesInLevel = 0;
    this.isCleared = false; // Game completion flag (beating Level 50)
    this.isGameOver = false;
    this.isPaused = false;
    this.isPlaying = false;
    this.startTime = 0;
    this.elapsedSeconds = 0;

    // Pieces and Queue
    this.bag = [];
    this.nextQueue = [];
    this.holdPiece = null;
    this.canHold = true;
    this.currentPiece = null;

    // Garbage attacks (for VS Mode)
    this.pendingGarbage = 0;
    this.garbageHole = Math.floor((this.rng ? this.rng() : Math.random()) * this.cols);

    // Lock delay handling
    this.lockTimer = null;
    this.lockResets = 0;
    this.isOnGround = false;

    // Combo & Back-to-Back
    this.combo = -1;
    this.backToBack = false;

    // Initialize 7-bag and next queue
    this.fillBag();
    while (this.nextQueue.length < 3) {
      this.nextQueue.push(this.drawFromBag());
    }
  }

  fillBag() {
    const types = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    for (let i = types.length - 1; i > 0; i--) {
      const randVal = this.rng ? this.rng() : Math.random();
      const j = Math.floor(randVal * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    this.bag.push(...types);
  }

  drawFromBag() {
    if (this.bag.length === 0) {
      this.fillBag();
    }
    return this.bag.shift();
  }

  spawnPiece() {
    // Before spawning, apply any pending garbage in VS mode
    if (this.mode === 'vs_ai' && this.pendingGarbage > 0) {
      this.applyPendingGarbage();
    }

    const type = this.nextQueue.shift();
    this.nextQueue.push(this.drawFromBag());

    const def = TETROMINOES[type];
    const initialRotation = 0;
    const shape = def.shapes[initialRotation];

    // Center piece at top
    const startX = Math.floor((this.cols - shape[0].length) / 2);
    const startY = CONFIG.BUFFER_ROWS - 1;

    this.currentPiece = {
      type: type,
      color: def.color,
      glow: def.glow,
      rotation: initialRotation,
      shape: shape,
      x: startX,
      y: startY,
    };

    this.canHold = true;
    this.lockResets = 0;
    this.isOnGround = false;

    // If spawned piece immediately collides, Top-Out -> Game Over
    if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
      this.isGameOver = true;
      this.isPlaying = false;
      return false;
    }

    return true;
  }

  isValidPosition(shape, testX, testY, customGrid = null) {
    const grid = customGrid || this.grid;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = testX + c;
          const newY = testY + r;

          if (newX < 0 || newX >= this.cols) return false;
          if (newY >= this.rows) return false;
          if (newY >= 0 && grid[newY][newX] !== 0) return false;
        }
      }
    }
    return true;
  }

  moveLeft() {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return false;
    if (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x - 1, this.currentPiece.y)) {
      this.currentPiece.x--;
      this.handleLockReset();
      return true;
    }
    return false;
  }

  moveRight() {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return false;
    if (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x + 1, this.currentPiece.y)) {
      this.currentPiece.x++;
      this.handleLockReset();
      return true;
    }
    return false;
  }

  softDrop() {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return false;
    if (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
      this.score += CONFIG.SCORE_TABLE.SOFT_DROP;
      return true;
    } else {
      this.isOnGround = true;
      return false;
    }
  }

  hardDrop() {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return 0;
    let droppedCells = 0;
    while (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
      droppedCells++;
    }
    this.score += droppedCells * CONFIG.SCORE_TABLE.HARD_DROP;
    return this.lockPiece();
  }

  rotate(direction = 1) {
    if (!this.currentPiece || this.isGameOver || this.isPaused) return false;
    const def = TETROMINOES[this.currentPiece.type];
    if (this.currentPiece.type === 'O') return true;

    const currentRotation = this.currentPiece.rotation;
    const nextRotation = (currentRotation + direction + 4) % 4;
    const nextShape = def.shapes[nextRotation];
    const kickKey = `${currentRotation}->${nextRotation}`;

    const kickTable = this.currentPiece.type === 'I' ? I_KICKS : JLSTZ_KICKS;
    const offsets = kickTable[kickKey] || [[0, 0]];

    for (const [offsetX, offsetY] of offsets) {
      const targetX = this.currentPiece.x + offsetX;
      const targetY = this.currentPiece.y - offsetY;

      if (this.isValidPosition(nextShape, targetX, targetY)) {
        this.currentPiece.rotation = nextRotation;
        this.currentPiece.shape = nextShape;
        this.currentPiece.x = targetX;
        this.currentPiece.y = targetY;
        this.handleLockReset();
        return true;
      }
    }

    return false;
  }

  hold() {
    if (!this.canHold || !this.currentPiece || this.isGameOver || this.isPaused) return false;

    const currentType = this.currentPiece.type;
    if (this.holdPiece === null) {
      this.holdPiece = currentType;
      this.spawnPiece();
    } else {
      const prevHold = this.holdPiece;
      this.holdPiece = currentType;

      const def = TETROMINOES[prevHold];
      const initialRotation = 0;
      const shape = def.shapes[initialRotation];
      const startX = Math.floor((this.cols - shape[0].length) / 2);
      const startY = CONFIG.BUFFER_ROWS - 1;

      this.currentPiece = {
        type: prevHold,
        color: def.color,
        glow: def.glow,
        rotation: initialRotation,
        shape: shape,
        x: startX,
        y: startY,
      };
    }

    this.canHold = false;
    this.lockResets = 0;
    this.isOnGround = false;
    return true;
  }

  handleLockReset() {
    if (this.isOnGround && this.lockResets < CONFIG.MAX_LOCK_RESETS) {
      this.lockResets++;
    }
  }

  getGhostPosition() {
    if (!this.currentPiece) return null;
    let ghostY = this.currentPiece.y;
    while (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, ghostY + 1)) {
      ghostY++;
    }
    return {
      x: this.currentPiece.x,
      y: ghostY,
      shape: this.currentPiece.shape,
      color: this.currentPiece.color,
    };
  }

  lockPiece() {
    if (!this.currentPiece) return 0;

    // Stamp piece blocks into grid
    for (let r = 0; r < this.currentPiece.shape.length; r++) {
      for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
        if (this.currentPiece.shape[r][c]) {
          const gridX = this.currentPiece.x + c;
          const gridY = this.currentPiece.y + r;
          if (gridY >= 0 && gridY < this.rows && gridX >= 0 && gridX < this.cols) {
            this.grid[gridY][gridX] = {
              color: this.currentPiece.color,
              type: this.currentPiece.type,
            };
          }
        }
      }
    }

    // Check for line clears (sends attack lines to opponent)
    const clearedLines = this.clearLines();

    // If in Battle Mode and there's pending garbage incoming, apply garbage rows from bottom
    if (this.mode === 'vs_ai' && this.pendingGarbage > 0) {
      this.applyPendingGarbage();
    }

    // Check if blocks locked above visible ceiling -> Top-Out
    for (let r = 0; r < CONFIG.BUFFER_ROWS; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] !== 0) {
          this.isGameOver = true;
          this.isPlaying = false;
          return clearedLines;
        }
      }
    }

    // Check Level 50 Victory in Solo mode
    if (this.mode === 'solo' && this.isCleared) {
      this.isPlaying = false;
      return clearedLines;
    }

    // Spawn next piece
    if (!this.isGameOver) {
      this.spawnPiece();
    }

    return clearedLines;
  }

  clearLines() {
    let linesCleared = 0;
    const newGrid = [];

    for (let r = 0; r < this.rows; r++) {
      const isFull = this.grid[r].every(cell => cell !== 0);
      if (isFull) {
        linesCleared++;
      } else {
        newGrid.push([...this.grid[r]]);
      }
    }

    while (newGrid.length < this.rows) {
      newGrid.unshift(Array(this.cols).fill(0));
    }

    this.grid = newGrid;

    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.linesInLevel += linesCleared;
      this.combo++;

      // Base points
      let basePoints = 0;
      if (linesCleared === 1) basePoints = CONFIG.SCORE_TABLE.SINGLE;
      else if (linesCleared === 2) basePoints = CONFIG.SCORE_TABLE.DOUBLE;
      else if (linesCleared === 3) basePoints = CONFIG.SCORE_TABLE.TRIPLE;
      else if (linesCleared >= 4) {
        basePoints = CONFIG.SCORE_TABLE.TETRIS;
        if (this.backToBack) {
          basePoints *= CONFIG.SCORE_TABLE.BACK_TO_BACK_MULTIPLIER;
        }
        this.backToBack = true;
      } else {
        this.backToBack = false;
      }

      // Add combo bonus and level multiplier
      const comboBonus = this.combo > 0 ? 50 * this.combo * this.level : 0;
      this.score += Math.floor(basePoints * this.level + comboBonus);

      // Handle Garbage Attack for Battle Mode (Strict 1:1 direct attack: cleared N lines -> send exactly N lines)
      if (this.mode === 'vs_ai') {
        const attackLines = linesCleared;

        console.log(`[VS Mode] Engine cleared ${linesCleared} lines -> Sending ${attackLines} lines to opponent`);

        // Send full attack directly to opponent
        if (this.onAttackCallback) {
          this.onAttackCallback(attackLines);
        }
      }

      // Handle Level Progression in Solo mode (10 lines per level up to 50)
      if (this.mode === 'solo') {
        if (this.linesInLevel >= CONFIG.LINES_PER_LEVEL) {
          this.linesInLevel -= CONFIG.LINES_PER_LEVEL;
          if (this.level < CONFIG.MAX_LEVEL) {
            this.level++;
            this.score += CONFIG.SCORE_TABLE.LEVEL_CLEAR_BONUS * this.level;
          } else if (this.level >= CONFIG.MAX_LEVEL) {
            // Player completed Level 50! Victory!
            this.isCleared = true;
            this.score += CONFIG.SCORE_TABLE.VICTORY_BONUS;
          }
        }
      }
    } else {
      this.combo = -1;
    }

    return linesCleared;
  }

  receiveGarbage(lines) {
    if (lines <= 0) return;

    const count = Math.min(lines, 12);
    const rng = this.rng || Math.random;

    // Shift matrix up immediately in real-time by removing top rows
    this.grid.splice(0, count);

    if (this.garbageMode === 'cheesy') {
      // 1. Cheesy Mode: every row has its own independent random hole
      for (let i = 0; i < count; i++) {
        const hole = Math.floor(rng() * this.cols);
        const row = Array(this.cols).fill(null).map(() => ({
          color: '#4b5563',
          type: 'GARBAGE',
          isGarbage: true,
        }));
        row[hole] = 0;
        this.grid.push(row);
      }
    } else if (this.garbageMode === 'classic') {
      // 2. Classic Mode: all rows in batch share same hole, 35% chance to change hole for next batch
      for (let i = 0; i < count; i++) {
        const row = Array(this.cols).fill(null).map(() => ({
          color: '#4b5563',
          type: 'GARBAGE',
          isGarbage: true,
        }));
        row[this.garbageHole] = 0;
        this.grid.push(row);
      }
      if (rng() < 0.35) {
        this.garbageHole = Math.floor(rng() * this.cols);
      }
    } else {
      // 3. Standard Competitive (Default):
      // Pick a fresh new hole column for this attack batch (different from previous hole if possible)
      let newHole = Math.floor(rng() * this.cols);
      if (this.cols > 1 && newHole === this.garbageHole) {
        newHole = (newHole + 1 + Math.floor(rng() * (this.cols - 1))) % this.cols;
      }
      this.garbageHole = newHole;

      // All rows within this batch share this same hole (allows downstack / counter attack)
      for (let i = 0; i < count; i++) {
        const row = Array(this.cols).fill(null).map(() => ({
          color: '#4b5563',
          type: 'GARBAGE',
          isGarbage: true,
        }));
        row[this.garbageHole] = 0;
        this.grid.push(row);
      }
    }

    // Check if matrix elevated above ceiling -> Top Out
    for (let r = 0; r < CONFIG.BUFFER_ROWS; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] !== 0) {
          this.isGameOver = true;
          this.isPlaying = false;
          break;
        }
      }
    }

    // Trigger callback to notify AI to recalculate immediately
    if (this.onGarbageApplied) {
      this.onGarbageApplied(count);
    }
  }

  applyPendingGarbage() {
    // Kept for backward compatibility
    if (this.pendingGarbage > 0) {
      this.receiveGarbage(this.pendingGarbage);
      this.pendingGarbage = 0;
    }
  }

  getFallSpeed() {
    const idx = Math.min(this.level - 1, CONFIG.SPEED_CURVE.length - 1);
    return CONFIG.SPEED_CURVE[idx];
  }
}
