/**
 * Intelligent Heuristic AI Opponent for VS AI Battle Mode.
 * Implements Dellacherie evaluation algorithm for real-time optimal piece placement.
 */

class TetrisAI {
  constructor(engine) {
    this.engine = engine;
    this.targetMove = null;
    this.moveTimer = 0;
    this.actionDelay = 150; // ms per action step
  }

  setSpeedByLevel(level) {
    // Humanized pacing from Level 1 (deliberate & beginner-friendly) to Level 30 (master speed)
    const lvl = Math.min(level, 30);
    this.actionDelay = Math.max(70, Math.round(450 - (lvl - 1) * 13));
    this.dropDelay = Math.max(80, Math.round(600 - (lvl - 1) * 18));
  }

  computeBestMove() {
    if (!this.engine.currentPiece || this.engine.isGameOver) return null;

    const type = this.engine.currentPiece.type;
    const def = TETROMINOES[type];
    const rotations = def.shapes.length;

    let bestScore = -Infinity;
    let bestMove = null;

    for (let r = 0; r < rotations; r++) {
      const shape = def.shapes[r];
      const shapeWidth = shape[0].length;

      for (let x = -2; x <= CONFIG.COLS - shapeWidth + 2; x++) {
        // Test if initial x placement is valid at ceiling
        if (!this.engine.isValidPosition(shape, x, CONFIG.BUFFER_ROWS - 1)) {
          // Try at y=0 or 1
          if (!this.engine.isValidPosition(shape, x, 0)) continue;
        }

        // Drop piece to lowest valid position
        let y = 0;
        if (!this.engine.isValidPosition(shape, x, y)) continue;

        while (this.engine.isValidPosition(shape, x, y + 1)) {
          y++;
        }

        // Simulate grid after placement
        const simResult = this.simulatePlacement(shape, x, y, type);
        if (simResult) {
          const score = this.evaluateBoard(simResult.grid, simResult.linesCleared, y, shape);
          if (score > bestScore) {
            bestScore = score;
            bestMove = { rotation: r, x: x };
          }
        }
      }
    }

    this.targetMove = bestMove;
    this.dropTimer = 0;
    return bestMove;
  }

  simulatePlacement(shape, x, y, type) {
    // Deep clone grid
    const simGrid = this.engine.grid.map(row => [...row]);

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const gridX = x + c;
          const gridY = y + r;
          if (gridY < 0 || gridY >= simGrid.length || gridX < 0 || gridX >= CONFIG.COLS) {
            return null; // Out of bounds
          }
          simGrid[gridY][gridX] = 1;
        }
      }
    }

    // Count lines cleared in simulation
    let linesCleared = 0;
    const filteredGrid = simGrid.filter(row => {
      const isFull = row.every(cell => cell !== 0);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (filteredGrid.length < this.engine.rows) {
      filteredGrid.unshift(Array(CONFIG.COLS).fill(0));
    }

    return { grid: filteredGrid, linesCleared };
  }

  evaluateBoard(grid, linesCleared, landingY, shape) {
    const cols = CONFIG.COLS;
    const rows = grid.length;

    // Feature 1: Landing Height (lower is better)
    const landingHeight = rows - landingY;

    // Feature 2: Eroded Piece Cells
    const erodedPieceCells = linesCleared * (shape.length);

    // Feature 3: Row Transitions
    let rowTransitions = 0;
    for (let r = CONFIG.BUFFER_ROWS; r < rows; r++) {
      let prev = 1; // Left boundary is considered solid
      for (let c = 0; c < cols; c++) {
        const curr = grid[r][c] !== 0 ? 1 : 0;
        if (curr !== prev) rowTransitions++;
        prev = curr;
      }
      if (prev === 0) rowTransitions++; // Right boundary is solid
    }

    // Feature 4: Column Transitions
    let colTransitions = 0;
    for (let c = 0; c < cols; c++) {
      let prev = 1; // Top boundary considered solid
      for (let r = CONFIG.BUFFER_ROWS; r < rows; r++) {
        const curr = grid[r][c] !== 0 ? 1 : 0;
        if (curr !== prev) colTransitions++;
        prev = curr;
      }
      if (prev === 0) colTransitions++; // Bottom boundary solid
    }

    // Feature 5: Number of Holes
    let holes = 0;
    for (let c = 0; c < cols; c++) {
      let blockAbove = false;
      for (let r = CONFIG.BUFFER_ROWS; r < rows; r++) {
        if (grid[r][c] !== 0) {
          blockAbove = true;
        } else if (blockAbove) {
          holes++;
        }
      }
    }

    // Feature 6: Cumulative Well Sums
    let wellSums = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = CONFIG.BUFFER_ROWS; r < rows; r++) {
        if (grid[r][c] === 0) {
          const leftSolid = c === 0 || grid[r][c - 1] !== 0;
          const rightSolid = c === cols - 1 || grid[r][c + 1] !== 0;
          if (leftSolid && rightSolid) {
            // Count depth of well
            let depth = 1;
            for (let k = r + 1; k < rows; k++) {
              if (grid[k][c] === 0) depth++;
              else break;
            }
            wellSums += depth * (depth + 1) / 2;
          }
        }
      }
    }

    // Dellacherie optimal weight formulation
    const score =
      (-4.500158825082766 * landingHeight) +
      (3.4181268101392694 * erodedPieceCells) +
      (-3.2178882868487753 * rowTransitions) +
      (-9.348695305445199 * colTransitions) +
      (-7.89926542734967 * holes) +
      (-3.3855972247263626 * wellSums);

    return score;
  }

  update(deltaTime) {
    if (!this.engine.isPlaying || this.engine.isPaused || this.engine.isGameOver) return;

    this.moveTimer += deltaTime;
    if (this.moveTimer < this.actionDelay) return;
    this.moveTimer = 0;

    if (!this.targetMove || !this.engine.currentPiece) {
      this.computeBestMove();
      if (!this.targetMove) return;
    }

    const currentPiece = this.engine.currentPiece;

    // 1. Match rotation
    if (currentPiece.rotation !== this.targetMove.rotation) {
      this.engine.rotate(1);
      return;
    }

    // 2. Match column x
    if (currentPiece.x < this.targetMove.x) {
      this.engine.moveRight();
      return;
    } else if (currentPiece.x > this.targetMove.x) {
      this.engine.moveLeft();
      return;
    }

    // 3. Reached target position! Perform drop after brief human-like pause
    this.dropTimer = (this.dropTimer || 0) + this.actionDelay;
    if (this.dropTimer < this.dropDelay) {
      return;
    }
    this.dropTimer = 0;

    // 4. Drop and lock
    const cleared = this.engine.hardDrop();
    this.targetMove = null;
    return cleared;
  }
}
