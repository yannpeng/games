"""
SQLite database connection and schema management for Multi-Game Arcade Platform.
Supports multi-game high scores (Tetris, Snake, etc.) with game_id indexing.
"""

import os
import sqlite3
from contextlib import contextmanager

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get_db_path():
    """Retrieve dynamic database file path with auto-created parent directory."""
    path = os.environ.get("ARCADE_DB_PATH", os.path.join(BASE_DIR, "arcade_games.db"))
    db_dir = os.path.dirname(os.path.abspath(path))
    if db_dir and not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir, exist_ok=True)
        except OSError:
            pass
    return path


def get_db_connection():
    """Create a connection to SQLite database with Row factory and permission fallback."""
    db_path = get_db_path()
    try:
        conn = sqlite3.connect(db_path, check_same_thread=False)
    except sqlite3.OperationalError:
        # Fallback to local BASE_DIR if mounted path is inaccessible
        fallback_path = os.path.join(BASE_DIR, "arcade_games.db")
        print(f"[WARN] Failed to open database at {db_path}, falling back to {fallback_path}")
        conn = sqlite3.connect(fallback_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db_cursor():
    """Context manager for safe database transactions."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Initialize database tables and indexes for users and multi-game scores."""
    with get_db_cursor() as cur:
        # 1. Users table
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                language TEXT NOT NULL DEFAULT 'en',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # Check and migrate users schema if language column is missing
        cur.execute("PRAGMA table_info(users)")
        existing_user_cols = [row["name"] for row in cur.fetchall()]
        if "language" not in existing_user_cols:
            cur.execute("ALTER TABLE users ADD COLUMN language TEXT NOT NULL DEFAULT 'en'")

        # 2. Universal scores table with game_id support
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                game_id TEXT NOT NULL DEFAULT 'tetris',
                mode TEXT NOT NULL,
                score INTEGER NOT NULL,
                lines INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                start_level INTEGER DEFAULT 1,
                is_cleared BOOLEAN DEFAULT 0,
                duration_seconds INTEGER DEFAULT 0,
                played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """
        )

        # 3. Check and migrate schema if game_id column is missing
        cur.execute("PRAGMA table_info(scores)")
        existing_cols = [row["name"] for row in cur.fetchall()]
        if "game_id" not in existing_cols:
            cur.execute("ALTER TABLE scores ADD COLUMN game_id TEXT NOT NULL DEFAULT 'tetris'")

        # 4. Performance indexes for leaderboards
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_scores_game_mode_score 
            ON scores(game_id, mode, score DESC)
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_scores_user_game 
            ON scores(user_id, game_id)
            """
        )
