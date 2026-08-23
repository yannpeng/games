"""
Unit and integration tests for multi-game score recording and game-specific leaderboards.
"""

import os
import tempfile
import pytest
from fastapi.testclient import TestClient

TEST_DB_FILE = os.path.join(tempfile.gettempdir(), "test_arcade_scores.db")
os.environ["ARCADE_DB_PATH"] = TEST_DB_FILE

from app.main import app
from app.database import init_db


@pytest.fixture(autouse=True)
def setup_database():
    """Initialize fresh test database for tests."""
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass
    init_db()
    yield
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except OSError:
            pass


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


def test_submit_and_isolate_multi_game_scores(client):
    """Test submitting scores for both Tetris and Snake and verifying separate leaderboards."""
    # Register players
    res_tet = client.post("/api/auth/register", json={"username": "tetris_master", "password": "password123"})
    token_tet = res_tet.json()["token"]

    res_snk = client.post("/api/auth/register", json={"username": "snake_master", "password": "password123"})
    token_snk = res_snk.json()["token"]

    # Submit Tetris score
    res1 = client.post(
        "/api/scores/submit",
        headers={"Authorization": f"Bearer {token_tet}"},
        json={
            "game_id": "tetris",
            "mode": "solo",
            "score": 95000,
            "lines": 500,
            "level": 50,
            "is_cleared": True,
            "duration_seconds": 600,
        },
    )
    assert res1.status_code == 201

    # Submit Snake score
    res2 = client.post(
        "/api/scores/submit",
        headers={"Authorization": f"Bearer {token_snk}"},
        json={
            "game_id": "snake",
            "mode": "classic",
            "score": 12000,
            "lines": 28,  # length
            "level": 8,
            "is_cleared": False,
            "duration_seconds": 300,
        },
    )
    assert res2.status_code == 201

    # Verify Tetris Leaderboard
    res_lb_tet = client.get("/api/scores/top50?game_id=tetris&mode=solo")
    assert res_lb_tet.status_code == 200
    data_tet = res_lb_tet.json()
    assert data_tet["game_id"] == "tetris"
    assert data_tet["count"] == 1
    assert data_tet["scores"][0]["username"] == "tetris_master"
    assert data_tet["scores"][0]["score"] == 95000

    # Verify Snake Leaderboard
    res_lb_snk = client.get("/api/scores/top50?game_id=snake&mode=classic")
    assert res_lb_snk.status_code == 200
    data_snk = res_lb_snk.json()
    assert data_snk["game_id"] == "snake"
    assert data_snk["count"] == 1
    assert data_snk["scores"][0]["username"] == "snake_master"
    assert data_snk["scores"][0]["score"] == 12000
    assert data_snk["scores"][0]["lines"] == 28

    # Test POST /api/scores root endpoint
    res3 = client.post(
        "/api/scores",
        headers={"Authorization": f"Bearer {token_tet}"},
        json={
            "game_id": "tetris",
            "mode": "vs_ai",
            "score": 45000,
            "lines": 40,
            "level": 1,
            "is_cleared": False,
            "duration_seconds": 120,
        },
    )
    assert res3.status_code == 201

    # Verify Leaderboard via /api/scores/leaderboard/tetris
    res_lb_vs = client.get("/api/scores/leaderboard/tetris?mode=vs_ai")
    assert res_lb_vs.status_code == 200
    assert res_lb_vs.json()["count"] == 1
    assert res_lb_vs.json()["scores"][0]["score"] == 45000
