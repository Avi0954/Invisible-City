import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import get_password_hash


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.lower()).first()

    def create(self, name: str, email: str, password: str, role: UserRole = UserRole.CITIZEN) -> User:
        user = User(
            name=name,
            email=email.lower(),
            password_hash=get_password_hash(password),
            role=role,
            is_active=True
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
