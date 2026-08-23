# 赛博街机多游戏聚合平台 (Cyberpunk Multi-Game Arcade Platform)

一个采用赛博朋克霓虹美学、全局统一导航架构、FastAPI 异步后端与 SQLite 账号战绩体系的现代化网页小游戏聚合平台（**v2.1.0 正式版**）。

---

## 🎮 当前收录游戏 (Available Games)

### 1. 🕹️ [俄罗斯方块 (Tetris Pro)](file:///d:/_workspace/antigravity/Games/tetris/)
- **路由路径**：`http://127.0.0.1:8000/tetris`
- **核心机制**：7-Bag 随机器、SRS 超级旋转与踢墙、1:1 零延迟实时对战管道、严格 10:20 正方形网格、50 级冲关与 Top 50 榜单。

### 2. 🐍 [赛博贪吃蛇 (Neon Snake)](file:///d:/_workspace/antigravity/Games/snake/)
- **路由路径**：`http://127.0.0.1:8000/snake`
- **核心机制**：动态发光蛇身、4种变异能量食物（普通红果、黄金星、疾风蓝核、缩短紫菌）、10级激光路障闯关、A* 寻路双蛇实时竞技。

### 3. 🐾 [田园守卫战 (Wildwood Defenders)](file:///d:/_workspace/antigravity/Games/defense/)
- **路由路径**：`http://127.0.0.1:8000/defense`
- **核心机制**：策略塔防放置、猫咪萌犬元素、多地图关卡路线、实时弹道物理与波次排行榜。

### 4. 🌐 四语言完整国际化 (i18n Localization)
- 🌐 English (`en`)
- 🇨🇳 简体中文 (`zh`)
- 🇭🇰 繁體中文 (`zh-TW`)
- 🇯🇵 日本語 (`ja`)

---

## 🐳 Docker 部署指南 (Docker Deployment)

本平台已全面支持 Docker 容器化部署，用户数据（账号密码、游戏记录与排行榜）通过数据卷（Volume）自动持久化。

### 方式 1：Docker Run 单命令极简启动 (Recommended)

直接从 Docker Hub 拉取并运行公共镜像：

```bash
docker run -d \
  --name cyberpunk-arcade \
  -p 8000:8000 \
  -v arcade_data:/app/data \
  --restart unless-stopped \
  yannpeng/games:latest
```

启动完成后，打开浏览器访问 **[http://localhost:8000](http://localhost:8000)** 即可开始游玩！

---

### 方式 2：Docker Compose 一键编排启动

在包含 `docker-compose.yml` 的目录下执行：

```bash
docker compose up -d
```

停止并保留数据：
```bash
docker compose down
```

---

### 方式 3：WSL2 / 本地从源码构建与多架构发布 (Build & Publish v2.1.0)

#### 1. 进入 WSL2 / Linux 构建环境
```bash
cd /mnt/d/_workspace/antigravity/Games
docker build -t games:test .
```

#### 2. 本地测试运行
```bash
mkdir -p data
docker run -d -p 8000:8000 -v "$(pwd)/data:/app/data" --name arcade-test games:test
```

#### 3. 使用 Docker Buildx 构建多架构镜像并推送到 Docker Hub (Multi-Arch: AMD64 + ARM64)
```bash
# 登录 Docker Hub
docker login

# 创建并启用 buildx 实例
docker buildx create --use --name arcade-builder

# 构建多平台镜像并直接发布 v2.1.0 与 latest
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t yannpeng/games:latest \
  -t yannpeng/games:v2.1.0 \
  --push .
```

---

## 💻 本地 Python 原生启动 (Native Start without Docker)

在 `Games/` 根目录下执行：
```bash
uv run python start.py
```
或直接在 Windows 文件管理器中双击 [start.bat](file:///d:/_workspace/antigravity/Games/start.bat) 启动！
