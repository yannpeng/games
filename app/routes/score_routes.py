"""
FastAPI Router for multi-game score submission, Top 50 leaderboards, and personal game history.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from app.database import get_db_cursor
from app.auth import get_current_user, get_current_user_optional
from app.models import ScoreSubmitRequest, ScoreItem, LeaderboardResponse, MyScoresResponse

router = APIRouter(prefix="/api/scores", tags=["Leaderboard & Scores"])


@router.post("/submit", status_code=status.HTTP_201_CREATED)
def submit_score(req: ScoreSubmitRequest, current_user: dict = Depends(get_current_user)):
    """Record a completed game session score associated with current user and game_id."""
    user_id = current_user["user_id"]
    game_id = (req.game_id or "tetris").lower().strip()

    with get_db_cursor() as cur:
        cur.execute(
            """
            INSERT INTO scores (
                user_id, game_id, mode, score, lines, level, start_level, is_cleared, duration_seconds
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                game_id,
                req.mode,
                req.score,
                req.lines,
                req.level,
                req.start_level,
                1 if req.is_cleared else 0,
                req.duration_seconds,
            ),
        )
        score_id = cur.lastrowid

        # Calculate rank in this game's mode
        cur.execute(
            """
            SELECT COUNT(*) + 1 as rank FROM scores 
            WHERE game_id = ? AND mode = ? AND score > ?
            """,
            (game_id, req.mode, req.score),
        )
        rank = cur.fetchone()["rank"]

    return {
        "success": True,
        "score_id": score_id,
        "game_id": game_id,
        "mode": req.mode,
        "score": req.score,
        "rank": rank,
        "is_cleared": req.is_cleared,
    }


@router.get("/top50", response_model=LeaderboardResponse)
def get_top_50(
    game_id: str = Query("tetris", description="Game ID: 'tetris', 'snake'"),
    mode: str = Query("solo", description="Game mode (e.g. solo, vs_ai, classic, battle)"),
):
    """Retrieve top 50 highest scores for a specific game and mode."""
    target_game = game_id.lower().strip()

    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT s.id, s.game_id, s.mode, s.score, s.lines, s.level, s.start_level, 
                   s.is_cleared, s.duration_seconds, s.played_at, u.username
            FROM scores s
            JOIN users u ON s.user_id = u.id
            WHERE s.game_id = ? AND s.mode = ?
            ORDER BY s.score DESC, s.played_at ASC
            LIMIT 50
            """,
            (target_game, mode),
        )
        rows = cur.fetchall()

    scores_list = [
        ScoreItem(
            rank=idx + 1,
            username=row["username"],
            game_id=row["game_id"],
            mode=row["mode"],
            score=row["score"],
            lines=row["lines"],
            level=row["level"],
            start_level=row["start_level"],
            is_cleared=bool(row["is_cleared"]),
            duration_seconds=row["duration_seconds"],
            played_at=str(row["played_at"]),
        )
        for idx, row in enumerate(rows)
    ]

    return {
        "game_id": target_game,
        "mode": mode,
        "count": len(scores_list),
        "scores": scores_list,
    }


@router.get("/my", response_model=MyScoresResponse)
def get_my_scores(
    game_id: Optional[str] = Query("tetris", description="Game ID filter"),
    current_user: dict = Depends(get_current_user),
):
    """Retrieve personal best scores for authenticated user in a given game."""
    user_id = current_user["user_id"]
    target_game = (game_id or "tetris").lower().strip()

    with get_db_cursor() as cur:
        cur.execute(
            """
            SELECT s.id, s.game_id, s.mode, s.score, s.lines, s.level, s.start_level, 
                   s.is_cleared, s.duration_seconds, s.played_at, u.username
            FROM scores s
            JOIN users u ON s.user_id = u.id
            WHERE s.user_id = ? AND s.game_id = ?
            ORDER BY s.score DESC
            LIMIT 20
            """,
            (user_id, target_game),
        )
        rows = cur.fetchall()

    scores_list = [
        ScoreItem(
            rank=idx + 1,
            username=row["username"],
            game_id=row["game_id"],
            mode=row["mode"],
            score=row["score"],
            lines=row["lines"],
            level=row["level"],
            start_level=row["start_level"],
            is_cleared=bool(row["is_cleared"]),
            duration_seconds=row["duration_seconds"],
            played_at=str(row["played_at"]),
        )
        for idx, row in enumerate(rows)
    ]

    return {
        "game_id": target_game,
        "count": len(scores_list),
        "scores": scores_list,
    }
