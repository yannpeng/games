"""
FastAPI Router for User Authentication endpoints (register, login, me, logout).
"""

import sqlite3
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status
from app.database import get_db_cursor
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.models import (
    UserRegisterRequest,
    UserLoginRequest,
    UserProfileResponse,
    AuthResponse,
    LanguageUpdateRequest,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest):
    """Register a new player account and return signed session token."""
    username = req.username.strip()
    pwd_hash = hash_password(req.password)

    with get_db_cursor() as cur:
        cur.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cur.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{username}' is already taken.",
            )

        try:
            cur.execute(
                "INSERT INTO users (username, password_hash, language) VALUES (?, ?, 'en')",
                (username, pwd_hash),
            )
            user_id = cur.lastrowid
        except sqlite3.IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '{username}' is already taken.",
            )

        cur.execute("SELECT created_at, last_login, language FROM users WHERE id = ?", (user_id,))
        user_row = cur.fetchone()

    token = create_access_token(user_id, username)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "username": username,
            "language": user_row["language"] or "en",
            "created_at": str(user_row["created_at"]),
            "last_login": str(user_row["last_login"]),
            "best_score": 0,
            "total_games": 0,
        },
    }


@router.post("/login", response_model=AuthResponse)
def login_user(req: UserLoginRequest):
    """Verify player credentials and return active session token."""
    username = req.username.strip()

    with get_db_cursor() as cur:
        cur.execute(
            "SELECT id, username, password_hash, language, created_at, last_login FROM users WHERE username = ?",
            (username,),
        )
        user = cur.fetchone()

        if not user or not verify_password(user["password_hash"], req.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password.",
            )

        cur.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", (user["id"],))

        # Calculate overall best score and total games across all games
        cur.execute("SELECT MAX(score) as best_score, COUNT(*) as total_games FROM scores WHERE user_id = ?", (user["id"],))
        stats = cur.fetchone()
        best_score = stats["best_score"] or 0
        total_games = stats["total_games"] or 0

    token = create_access_token(user["id"], user["username"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "language": user["language"] or "en",
            "created_at": str(user["created_at"]),
            "last_login": str(user["last_login"]),
            "best_score": best_score,
            "total_games": total_games,
        },
    }


@router.get("/me", response_model=UserProfileResponse)
def get_user_profile(
    game_id: Optional[str] = Query(None, description="Optional Game ID for game-specific best score"),
    current_user: dict = Depends(get_current_user),
):
    """Retrieve profile and aggregated play statistics for authenticated user."""
    user_id = current_user["user_id"]

    with get_db_cursor() as cur:
        cur.execute("SELECT id, username, language, created_at, last_login FROM users WHERE id = ?", (user_id,))
        user = cur.fetchone()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        if game_id:
            target_game = game_id.lower().strip()
            cur.execute("SELECT MAX(score) as best_score, COUNT(*) as total_games FROM scores WHERE user_id = ? AND game_id = ?", (user_id, target_game))
            stats = cur.fetchone()
            best_score = stats["best_score"] or 0
            total_games = stats["total_games"] or 0
        else:
            cur.execute("SELECT MAX(score) as best_score, COUNT(*) as total_games FROM scores WHERE user_id = ?", (user_id,))
            stats = cur.fetchone()
            best_score = stats["best_score"] or 0
            total_games = stats["total_games"] or 0

    return {
        "id": user["id"],
        "username": user["username"],
        "language": user["language"] or "en",
        "created_at": str(user["created_at"]),
        "last_login": str(user["last_login"]),
        "best_score": best_score,
        "total_games": total_games,
    }


@router.put("/language")
def update_user_language(req: LanguageUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Persist user preferred language in database."""
    user_id = current_user["user_id"]
    lang = req.language.strip()

    with get_db_cursor() as cur:
        cur.execute("UPDATE users SET language = ? WHERE id = ?", (lang, user_id))

    return {"success": True, "language": lang}
