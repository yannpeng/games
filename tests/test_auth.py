"""
Unit and integration tests for user authentication endpoints in Arcade Platform.
"""

import os
import tempfile
import pytest
from fastapi.testclient import TestClient

TEST_DB_FILE = os.path.join(tempfile.gettempdir(), "test_arcade_auth.db")
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


def test_register_and_login(client):
    """Test full registration and login lifecycle."""
    # Register
    res_reg = client.post(
        "/api/auth/register",
        json={"username": "arcade_champ", "password": "password123"},
    )
    assert res_reg.status_code == 201
    data_reg = res_reg.json()
    assert "token" in data_reg
    assert data_reg["user"]["username"] == "arcade_champ"

    # Login
    res_login = client.post(
        "/api/auth/login",
        json={"username": "arcade_champ", "password": "password123"},
    )
    assert res_login.status_code == 200
    data_login = res_login.json()
    assert "token" in data_login
    assert data_login["user"]["username"] == "arcade_champ"


def test_get_profile_with_bearer(client):
    """Test profile endpoint with signed Bearer token."""
    res_reg = client.post(
        "/api/auth/register",
        json={"username": "profile_player", "password": "password123"},
    )
    token = res_reg.json()["token"]

    res_me = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_me.status_code == 200
    assert res_me.json()["username"] == "profile_player"
    assert res_me.json()["language"] == "en"


def test_update_and_persist_language(client):
    """Test updating user language preference and persisting across logins."""
    res_reg = client.post(
        "/api/auth/register",
        json={"username": "polyglot_gamer", "password": "password123"},
    )
    token = res_reg.json()["token"]

    # Update language to Japanese
    res_put = client.put(
        "/api/auth/language",
        headers={"Authorization": f"Bearer {token}"},
        json={"language": "ja"},
    )
    assert res_put.status_code == 200
    assert res_put.json()["language"] == "ja"

    # Verify /me returns updated language
    res_me = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_me.status_code == 200
    assert res_me.json()["language"] == "ja"

    # Update language to Traditional Chinese (zh-TW)
    res_put_tw = client.put(
        "/api/auth/language",
        headers={"Authorization": f"Bearer {token}"},
        json={"language": "zh-TW"},
    )
    assert res_put_tw.status_code == 200
    assert res_put_tw.json()["language"] == "zh-TW"

    # Verify /me returns updated language
    res_me_tw = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_me_tw.status_code == 200
    assert res_me_tw.json()["language"] == "zh-TW"
