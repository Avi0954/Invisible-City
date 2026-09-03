import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Any, Dict
from app.core.config import settings
from app.core.exceptions import InvisibleCityException
from fastapi import status


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a stored bcrypt hash safely."""
    try:
        password_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generates a secure bcrypt hash for a plain text password."""
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def create_access_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a short-lived JWT access token containing subject (user_id) and role."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": str(subject),
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a long-lived JWT refresh token."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode = {
        "sub": str(subject),
        "type": "refresh",
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(to_encode, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str, secret_key: str) -> Dict[str, Any]:
    """Decodes and validates a JWT token using the specified secret key."""
    try:
        payload = jwt.decode(token, secret_key, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise InvisibleCityException(
            message="Token has expired",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    except jwt.InvalidTokenError:
        raise InvisibleCityException(
            message="Invalid token credentials",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
