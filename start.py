"""
Server startup script for the Multi-Game Arcade Platform.
Runs FastAPI backend and serves Game Hub on http://127.0.0.1:8000.
"""

import sys
import uvicorn

if __name__ == "__main__":
    print("=" * 65)
    print(" 🎮 Starting Cyberpunk Multi-Game Arcade Platform (赛博街机大厅)...")
    print(" 🌐 Access Hub URL: http://127.0.0.1:8000")
    print(" 🕹️  Tetris Sub-Game: http://127.0.0.1:8000/tetris")
    print(" 🐍 Snake Sub-Game:  http://127.0.0.1:8000/snake")
    print(" 🏆 Features: Unified User Login, Multi-Game Top 50 Leaderboards")
    print("=" * 65)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
