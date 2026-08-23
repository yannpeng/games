"""
Integration tests for Arcade Hub endpoints and game catalog routing.
"""

import os
import tempfile
import pytest
from fastapi.testclient import TestClient

TEST_DB_FILE = os.path.join(tempfile.gettempdir(), "test_arcade_hub.db")
os.environ["ARCADE_DB_PATH"] = TEST_DB_FILE

from app.main import app
from app.database import init_db


@pytest.fixture(autouse=True)
def setup_database():
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
    return TestClient(app)


def test_list_games_catalog(client):
    """Test /api/games catalog returns registered games."""
    res = client.get("/api/games")
    assert res.status_code == 200
    games = res.json()
    assert len(games) >= 3
    game_ids = [g["id"] for g in games]
    assert "tetris" in game_ids
    assert "snake" in game_ids
    assert "defense" in game_ids


def test_hub_and_game_routes(client):
    """Test that hub and sub-game html routes respond properly."""
    res_hub = client.get("/")
    assert res_hub.status_code == 200

    res_tetris = client.get("/tetris")
    assert res_tetris.status_code == 200

    res_snake = client.get("/snake")
    assert res_snake.status_code == 200

    res_defense = client.get("/defense")
    assert res_defense.status_code == 200
