from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.token import TokenResponse, TokenRefreshRequest
from app.repositories.user_repository import UserRepository
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.config import settings
from app.core.exceptions import InvisibleCityException
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New User",
    description="Registers a new citizen or admin account and returns authentication tokens."
)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    
    # Prevent duplicate registration
    existing_user = repo.get_by_email(user_in.email)
    if existing_user:
        raise InvisibleCityException(
            message=f"An account with email '{user_in.email}' already exists.",
            status_code=status.HTTP_409_CONFLICT
        )
        
    user = repo.create(
        name=user_in.name,
        email=user_in.email,
        password=user_in.password,
        role=user_in.role
    )
    
    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="User Login",
    description="Authenticates credentials and returns JWT access and refresh tokens."
)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_email(credentials.email)
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise InvisibleCityException(
            message="Invalid email or password.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    if not user.is_active:
        raise InvisibleCityException(
            message="User account is deactivated.",
            status_code=status.HTTP_403_FORBIDDEN
        )
        
    access_token = create_access_token(subject=user.id, role=user.role.value)
    refresh_token = create_refresh_token(subject=user.id)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh Token Exchange",
    description="Exchanges a valid refresh token for new access and refresh tokens."
)
async def refresh_token(request: TokenRefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(request.refresh_token, settings.JWT_REFRESH_SECRET_KEY)
    
    if payload.get("type") != "refresh":
        raise InvisibleCityException(
            message="Invalid refresh token type",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    user_id_str = payload.get("sub")
    repo = UserRepository(db)
    
    import uuid
    try:
        user_id = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise InvisibleCityException(
            message="Invalid subject in token",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    user = repo.get_by_id(user_id)
    if not user or not user.is_active:
        raise InvisibleCityException(
            message="User associated with token is inactive or no longer exists.",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    new_access_token = create_access_token(subject=user.id, role=user.role.value)
    new_refresh_token = create_refresh_token(subject=user.id)
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post(
    "/logout",
    summary="User Logout",
    description="Acknowledges user sign out request."
)
async def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out."}


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get Current User Profile",
    description="Returns current authenticated user details."
)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
