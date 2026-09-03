import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Full name of user")
    email: EmailStr = Field(..., description="Valid email address")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password (at least 8 characters)")
    role: Optional[UserRole] = Field(default=UserRole.CITIZEN, description="User role (CITIZEN or ADMIN)")


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")


class UserResponse(UserBase):
    id: uuid.UUID
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
