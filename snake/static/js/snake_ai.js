/**
 * Cyberpunk Snake AI Agent
 * Uses A* Pathfinding and Flood-Fill space evaluation to play intelligently in Dual Snake Arena.
 */

class SnakeAiAgent {
  constructor(engine) {
    this.engine = engine;
  }

  decideNextMove() {
    if (!this.engine.aiSnake || !this.engine.aiAlive) return;

    const head = this.engine.aiSnake[0];
    const foods = this.engine.foods;
    const cols = this.engine.cols;
    const rows = this.engine.rows;

    if (foods.length === 0) return;

    // 1. Build obstacle set (walls, obstacles, player snake, self body)
    const obstacles = new Set();
    this.engine.obstacles.forEach(o => obstacles.add(`${o.x},${o.y}`));
    this.engine.snake.forEach(s => obstacles.add(`${s.x},${s.y}`));
    this.engine.aiSnake.slice(0, -1).forEach(s => obstacles.add(`${s.x},${s.y}`));

    // 2. Find nearest food
    let targetFood = foods[0];
    let minDist = Infinity;
    for (const food of foods) {
      const dist = Math.abs(food.x - head.x) + Math.abs(food.y - head.y);
      if (dist < minDist) {
        minDist = dist;
        targetFood = food;
      }
    }

    // 3. BFS Pathfinding to target food
    const path = this.findPath(head, targetFood, obstacles, cols, rows);

    let chosenDir = null;
    if (path && path.length > 1) {
      const nextStep = path[1];
      const dir = { x: nextStep.x - head.x, y: nextStep.y - head.y };
      // Verify path doesn't trap AI in a dead end
      if (this.isSafeMove(nextStep, obstacles, cols, rows)) {
        chosenDir = dir;
      }
    }

    // 4. Fallback: Pick the direction with the largest open area (Flood Fill)
    if (!chosenDir) {
      chosenDir = this.findLongestSurvivalMove(head, obstacles, cols, rows);
    }

    if (chosenDir) {
      this.engine.aiDir = chosenDir;
    }
  }

  findPath(start, goal, obstacles, cols, rows) {
    const queue = [[start]];
    const visited = new Set([`${start.x},${start.y}`]);
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    while (queue.length > 0) {
      const currentPath = queue.shift();
      const current = currentPath[currentPath.length - 1];

      if (current.x === goal.x && current.y === goal.y) {
        return currentPath;
      }

      for (const d of dirs) {
        const nx = current.x + d.x;
        const ny = current.y + d.y;
        const key = `${nx},${ny}`;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          if (!obstacles.has(key) && !visited.has(key)) {
            visited.add(key);
            queue.push([...currentPath, { x: nx, y: ny }]);
          }
        }
      }
    }

    return null;
  }

  isSafeMove(pos, obstacles, cols, rows) {
    const freeArea = this.countFreeArea(pos, obstacles, cols, rows);
    return freeArea >= this.engine.aiSnake.length;
  }

  countFreeArea(start, obstacles, cols, rows) {
    const queue = [start];
    const visited = new Set([`${start.x},${start.y}`]);
    let count = 0;
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    while (queue.length > 0 && count < 60) {
      const curr = queue.shift();
      count++;

      for (const d of dirs) {
        const nx = curr.x + d.x;
        const ny = curr.y + d.y;
        const key = `${nx},${ny}`;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          if (!obstacles.has(key) && !visited.has(key)) {
            visited.add(key);
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }

    return count;
  }

  findLongestSurvivalMove(head, obstacles, cols, rows) {
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    let bestDir = null;
    let maxArea = -1;

    for (const d of dirs) {
      // Don't reverse into own neck immediately
      if (this.engine.aiDir.x + d.x === 0 && this.engine.aiDir.y + d.y === 0) continue;

      const nx = head.x + d.x;
      const ny = head.y + d.y;
      const key = `${nx},${ny}`;

      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !obstacles.has(key)) {
        const area = this.countFreeArea({ x: nx, y: ny }, obstacles, cols, rows);
        if (area > maxArea) {
          maxArea = area;
          bestDir = d;
        }
      }
    }

    return bestDir || this.engine.aiDir;
  }
}
