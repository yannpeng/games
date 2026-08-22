# 赛博街机多游戏聚合平台 (Cyberpunk Multi-Game Arcade Platform)

一个采用赛博朋克霓虹美学、统一 FastAPI 后端与 SQLite 账号战绩体系的现代化网页小游戏聚合平台。

---

## 🎮 当前收录游戏 (Available Games)

### 1. 🕹️ [俄罗斯方块 (Tetris Pro)](file:///d:/_workspace/antigravity/Games/tetris/)
- **路由路径**：`http://127.0.0.1:8000/tetris`
- **核心机制**：7-Bag 随机器、SRS 超级旋转与踢墙、1:1 零延迟实时对战管道、50 级冲关与 Top 50 榜单。

### 2. 🐍 [赛博贪吃蛇 (Neon Snake)](file:///d:/_workspace/antigravity/Games/snake/)
- **路由路径**：`http://127.0.0.1:8000/snake`
- **核心机制**：动态发光蛇身、4种变异能量食物（普通红果、黄金星、疾风蓝核、缩短紫菌）、10级激光路障闯关、A* 寻路双蛇实时竞技。

### 3. 🚀 未来扩展 (Expandable Architecture)
- 平台支持随时通过新增子目录（如 `pacman/`、`minesweeper/`）以极简方式快速挂载新小游戏。

---

## 🚀 启动方式 (Quick Start)

在 `Games/` 根目录下执行：
```bash
uv run python start.py
```
或直接在文件管理器中双击 [start.bat](file:///d:/_workspace/antigravity/Games/start.bat) 启动！浏览器自动打开 **[http://127.0.0.1:8000](http://127.0.0.1:8000)** 进入游戏大厅！
