import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError
from app.core.config import settings
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.database.session import get_db
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.models.enums import UserRole

logger = logging.getLogger(__name__)


def create_access_token(data: dict) -> str:
    """Signs and issues a JWT token."""
    claims = data.copy()
    now = datetime.utcnow()
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    claims.update({"iat": now, "exp": expire})
    return jwt.encode(claims, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_access_token(token: str) -> Optional[dict]:
    """Decodes and validates JWT signature."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        return None


async def get_current_user(
    authorization: str = Header(..., description="Bearer JWT token"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency checking authorization headers and injecting logged-in user profile.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedException("Missing or invalid Authorization header.")
    token = authorization.split(" ", 1)[1]
    payload = verify_access_token(token)
    if payload is None:
        raise UnauthorizedException("Invalid or expired access token.")
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedException("Token payload missing subject claim.")
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedException("Invalid user ID in token.")
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if user is None:
        raise UnauthorizedException("User associated with token no longer exists.")
    return user


async def get_current_requester(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency enforcing that the authenticated user possesses the Requester role.
    """
    if current_user.role != UserRole.REQUESTER:
        raise ForbiddenException("Access restricted to Requester role.")
    return current_user


async def get_current_reviewer(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency enforcing that the authenticated user possesses the Reviewer role.
    """
    if current_user.role != UserRole.REVIEWER:
        raise ForbiddenException("Access restricted to Reviewer role.")
    return current_user
