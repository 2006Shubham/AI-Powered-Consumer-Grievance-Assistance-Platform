import pytest
from backend.auth.security import hash_password, verify_password, create_access_token, get_settings
from jose import jwt

def test_password_hashing():
    raw = "mysecretpassword123"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_jwt_token_creation_and_decoding():
    user_id = "65f123456789abcdef012345"
    token = create_access_token({"sub": user_id})
    assert isinstance(token, str) and len(token) > 0

    settings = get_settings()
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    assert payload.get("sub") == user_id
    assert "exp" in payload
