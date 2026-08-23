"""
Pydantic schemas and request/response models for the Arcade Hub API.
"""

from typing import List, Literal
from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_\u4e00-\u9fa5]+$")
    password: str = Field(..., min_length=6, max_length=64)


class UserLoginRequest(BaseModel):
    username: str = Field(..., max_length=64)
    password: str = Field(..., max_length=64)


class UserProfileResponse(BaseModel):
    id: int
    username: str
    language: str = "en"
    created_at: str
    last_login: str
    best_score: int = 0
    total_games: int = 0


class LanguageUpdateRequest(BaseModel):
    language: str = Field(..., pattern=r"^(en|zh|zh-TW|ja)$")


class AuthResponse(BaseModel):
    token: str
    user: UserProfileResponse


class ScoreSubmitRequest(BaseModel):
    game_id: Literal["tetris", "snake", "defense"] = Field("tetris", description="Game identifier: 'tetris', 'snake', etc.")
    mode: str = Field(..., max_length=32, description="Mode identifier: 'solo', 'vs_ai', 'classic', 'battle', etc.")
    score: int = Field(..., ge=0, le=100_000_000)
    lines: int = Field(0, ge=0, le=10000, description="Lines cleared in Tetris or Snake length")
    level: int = Field(1, ge=1, le=100)
    start_level: int = Field(1, ge=1, le=100)
    is_cleared: bool = False
    duration_seconds: int = Field(0, ge=0, le=86400)


class ScoreItem(BaseModel):
    rank: int
    username: str
    game_id: str
    mode: str
    score: int
    lines: int
    level: int
    start_level: int
    is_cleared: bool
    duration_seconds: int
    played_at: str


class LeaderboardResponse(BaseModel):
    game_id: str
    mode: str
    count: int
    scores: List[ScoreItem]


class MyScoresResponse(BaseModel):
    game_id: str
    count: int
    scores: List[ScoreItem]
