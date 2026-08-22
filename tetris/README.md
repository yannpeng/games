# 经典俄罗斯方块网页版 (Classic Web Tetris)

🎮 一款基于 **FastAPI + SQLite + 原生 HTML5 Canvas** 开发的经典俄罗斯方块网页游戏，支持 **50级个人闯关模式** 与 **人机对战模式（1:1实时顶升）**、**用户注册与登录**、**个人战绩记录** 以及 **全球排名前50排行榜（Top 50 Leaderboard）**。

---

## 📁 目录结构 (Directory Structure)

```text
d:/_workspace/antigravity/Games/tetris/
├── docs/                               # 📁 项目官方文档
│   ├── implementation_plan.md          # 架构实施计划与设计细节
│   ├── game_mechanics.md               # 50级速度曲线与 1:1 攻击机制
│   ├── ai_algorithm.md                 # Dellacherie 启发式 AI 算法
│   └── api_reference.md                # SQLite & REST API 文档
├── app/                                # 🐍 后端 Python 服务
│   ├── main.py                         # FastAPI 路由与静态挂载
│   ├── database.py                     # SQLite 数据库连接与表结构
│   ├── models.py                       # Pydantic 数据模型
│   ├── auth.py                         # PBKDF2 密码哈希与会话管理
│   └── routes/                         # API 路由拆分 (auth_routes, score_routes)
├── static/                             # 🌐 前端静态资源
│   ├── index.html                      # 单页前端界面
│   ├── css/style.css                   # 赛博朋克霓虹暗色样式与移动端手柄
│   └── js/                             # 前端逻辑
│       ├── config.js                   # 50级速度曲线与SRS旋转踢墙矩阵
│       ├── audio.js                    # Web Audio API 8-bit 合成音效
│       ├── api.js                      # 前端 REST API 通信
│       ├── tetris.js                   # 7-Bag 随机器与核心引擎
│       ├── ai.js                       # 启发式 AI 对手
│       └── app.js                      # UI 事件交互与主循环
├── tests/                              # 🧪 自动化单元测试
├── pyproject.toml                      # UV 项目配置文件
└── README.md                           # 项目说明
```

---

## 🚀 快速启动指南 (Getting Started)

本项目使用 `uv` 进行高效的 Python 依赖管理与运行。

### 1. 启动游戏服务
```bash
uv run python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
或直接运行：
```bash
uv run python start.py
```

### 2. 打开浏览器游玩
打开浏览器访问：**[http://127.0.0.1:8000](http://127.0.0.1:8000)** 即可畅玩！

---

## 🧪 运行自动化测试 (Automated Testing)
```bash
uv run python -m pytest tests/ -v
```
