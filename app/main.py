"""
Main FastAPI server for the Multi-Game Arcade Platform.
Mounts game hub, sub-games (Tetris, Snake), and unified REST APIs.
"""

import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routes.auth_routes import router as auth_router
from app.routes.score_routes import router as score_router

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HUB_DIR = os.path.join(BASE_DIR, "hub")
TETRIS_DIR = os.path.join(BASE_DIR, "tetris", "static")
SNAKE_DIR = os.path.join(BASE_DIR, "snake", "static")
DEFENSE_DIR = os.path.join(BASE_DIR, "defense", "static")

app = FastAPI(
    title="Cyberpunk Arcade Platform",
    description="Multi-game web platform with unified auth and leaderboards",
    version="2.2.3",
)

# Enable CORS for local cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware to prevent stale static browser caching
@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    if request.url.path.startswith(("/static", "/hub_static", "/tetris_static", "/snake_static", "/defense_static")):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response

# Include API routers
app.include_router(auth_router)
app.include_router(score_router)


@app.on_event("startup")
def on_startup():
    """Ensure database schema is created and migrated on startup."""
    init_db()


# Mount Static asset directories
if os.path.exists(HUB_DIR):
    app.mount("/hub_static", StaticFiles(directory=HUB_DIR), name="hub_static")

if os.path.exists(TETRIS_DIR):
    app.mount("/tetris_static", StaticFiles(directory=TETRIS_DIR), name="tetris_static")
    app.mount("/static", StaticFiles(directory=TETRIS_DIR), name="static")

if os.path.exists(SNAKE_DIR):
    app.mount("/snake_static", StaticFiles(directory=SNAKE_DIR), name="snake_static")

if os.path.exists(DEFENSE_DIR):
    app.mount("/defense_static", StaticFiles(directory=DEFENSE_DIR), name="defense_static")


# Available games catalog API
@app.get("/api/games")
def list_available_games():
    """List catalog of registered games available on the arcade platform."""
    return [
        {
            "id": "tetris",
            "title": "俄罗斯方块 (Tetris Pro)",
            "subtitle": "7-Bag SRS 竞技引擎 · 50级冲关 · 1:1 人机对决",
            "icon": "🕹️",
            "route": "/tetris",
            "badge": "热门电竞",
            "color": "#00f0ff",
            "modes": ["solo", "vs_ai"],
            "status": "ready",
        },
        {
            "id": "snake",
            "title": "赛博贪吃蛇 (Neon Snake)",
            "subtitle": "霓虹粒子光效 · 道具能量变异 · 双蛇竞技竞技场",
            "icon": "🐍",
            "route": "/snake",
            "badge": "经典街机",
            "color": "#00ff88",
            "modes": ["classic", "battle"],
            "status": "ready",
        },
        {
            "id": "defense",
            "title": "田园守卫战 (Wildwood Defenders)",
            "subtitle": "8大动物守卫 · 30波森林入侵 · 策略塔防",
            "icon": "🐾",
            "route": "/defense",
            "badge": "全新上线",
            "color": "#ffd700",
            "modes": ["campaign", "endless"],
            "status": "ready",
        },
        {
            "id": "coming_soon",
            "title": "吃豆人 / 扫雷 (Pacman & More)",
            "subtitle": "更多经典小游戏正在火热接入中...",
            "icon": "🚀",
            "route": "#",
            "badge": "敬请期待",
            "color": "#a000ff",
            "modes": [],
            "status": "coming_soon",
        },
    ]


# Root Hub View
@app.get("/", response_class=HTMLResponse)
def serve_hub_portal():
    """Serve the Game Selector Arcade Lobby homepage."""
    index_file = os.path.join(HUB_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    return HTMLResponse("<h1>Cyberpunk Arcade Platform Loading...</h1>")


# Tetris Game Route
@app.get("/tetris", response_class=HTMLResponse)
@app.get("/tetris/", response_class=HTMLResponse)
def serve_tetris_game():
    """Serve the Tetris sub-game web page."""
    index_file = os.path.join(TETRIS_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    return HTMLResponse("<h1>Tetris Game Not Found</h1>", status_code=404)


# Snake Game Route
@app.get("/snake", response_class=HTMLResponse)
@app.get("/snake/", response_class=HTMLResponse)
def serve_snake_game():
    """Serve the Snake sub-game web page."""
    index_file = os.path.join(SNAKE_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    return HTMLResponse("<h1>Snake Game Not Found</h1>", status_code=404)


# Wildwood Defenders Tower Defense Game Route
@app.get("/defense", response_class=HTMLResponse)
@app.get("/defense/", response_class=HTMLResponse)
def serve_defense_game():
    """Serve the Wildwood Defenders tower defense sub-game web page."""
    index_file = os.path.join(DEFENSE_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    return HTMLResponse("<h1>Wildwood Defenders Game Not Found</h1>", status_code=404)

