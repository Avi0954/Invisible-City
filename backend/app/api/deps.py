import uuid
from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.core.security import decode_token
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.core.exceptions import InvisibleCityException

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency for extracting and validating the current authenticated user from JWT Bearer header."""
    if not credentials:
        raise InvisibleCityException(
            message="Not authenticated. Missing Authorization Bearer header.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    token = credentials.credentials
    payload = decode_token(token, settings.JWT_SECRET_KEY)
    
    token_type = payload.get("type")
    if token_type != "access":
        raise InvisibleCityException(
            message="Invalid token type for authentication.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise InvisibleCityException(
            message="Invalid token subject",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise InvisibleCityException(
            message="Malformed user ID in token",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise InvisibleCityException(
            message="Authenticated user no longer exists",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    if not user.is_active:
        raise InvisibleCityException(
            message="User account is deactivated",
            status_code=status.HTTP_403_FORBIDDEN
        )
        
    return user


def require_roles(allowed_roles: List[UserRole]):
    """Higher-order dependency for Role-Based Access Control (RBAC)."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise InvisibleCityException(
                message=f"Access forbidden: User role '{current_user.role.value}' is not authorized for this resource.",
                status_code=status.HTTP_403_FORBIDDEN
            )
        return current_user
    return role_checker
