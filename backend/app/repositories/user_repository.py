import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.models.enums import UserRole


class UserRepository:
    """
    Repository layer for managing User database operations.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """Fetch user profile by its UUID primary key."""
        result = await self.db.execute(select(User).filter(User.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[User]:
        """Fetch user profile by its email address."""
        result = await self.db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get_by_google_id(self, google_id: str) -> Optional[User]:
        """Fetch user profile by Google unique ID."""
        result = await self.db.execute(select(User).filter(User.google_id == google_id))
        return result.scalars().first()

    async def create(self, name: str, email: str, google_id: str, role: UserRole) -> User:
        """Insert a new user record in the database."""
        user = User(name=name, email=email, google_id=google_id, role=role)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update(self, user_id: uuid.UUID, **kwargs) -> Optional[User]:
        """Update user fields by providing keyword arguments for fields to change."""
        user = await self.get_by_id(user_id)
        if user:
            for k, v in kwargs.items():
                setattr(user, k, v)
            await self.db.commit()
            await self.db.refresh(user)
        return user

    async def get_reviewers(self) -> List[User]:
        """Fetch all users with the Reviewer role."""
        result = await self.db.execute(
            select(User).filter(User.role == UserRole.REVIEWER)
        )
        return list(result.scalars().all())

    async def get_all_by_role(self, role: UserRole) -> List[User]:
        """Fetch all users with a specific role."""
        result = await self.db.execute(
            select(User).filter(User.role == role).order_by(User.name)
        )
        return list(result.scalars().all())
