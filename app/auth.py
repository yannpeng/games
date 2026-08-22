"""
User authentication, password hashing, and signed bearer token management.
"""

import os
import hmac
import hashlib
import base64
import time
from typing import Optional
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_db_cursor

SECRET_KEY = os.environ.get("ARCADE_SECRET_KEY", "super-secret-arcade-neon-key-2026")
security_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash password with PBKDF2-HMAC-SHA256 and unique random salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"pbkdf2:sha256:100000${salt.hex()}${key.hex()}"


def verify_password(stored_hash: str, password: str) -> bool:
    """Verify password against stored PBKDF2 hash."""
    try:
        parts = stored_hash.split("$")
        if len(parts) != 3:
            return False
        iterations = int(parts[0].split(":")[2])
        salt = bytes.fromhex(parts[1])
        expected_key = bytes.fromhex(parts[2])
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(key, expected_key)
    except Exception:
        return False


def create_access_token(user_id: int, username: str) -> str:
    """Generate a tamper-proof signed bearer token containing payload and HMAC signature."""
    payload = f"{user_id}:{username}:{int(time.time())}"
    sig = hmac.new(SECRET_KEY.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    raw_token = f"{payload}:{sig}"
    return base64.urlsafe_b64encode(raw_token.encode("utf-8")).decode("utf-8")


def decode_access_token(token_str: str) -> Optional[dict]:
    """Decode and verify signed bearer token signature."""
    try:
        raw_token = base64.urlsafe_b64decode(token_str.encode("utf-8")).decode("utf-8")
        parts = raw_token.split(":")
        if len(parts) != 4:
            return None
        user_id_str, username, timestamp_str, sig = parts
        payload = f"{user_id_str}:{username}:{timestamp_str}"
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        return {"user_id": int(user_id_str), "username": username, "timestamp": int(timestamp_str)}
    except Exception:
        return None


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> dict:
    """Dependency to extract authenticated user from Bearer header."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = decode_access_token(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> Optional[dict]:
    """Optional dependency for routes that allow both guest and authenticated users."""
    if not credentials:
        return None
    return decode_access_token(credentials.credentials)
