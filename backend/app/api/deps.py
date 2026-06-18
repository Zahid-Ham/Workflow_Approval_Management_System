import uuid
from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.oauth_service import OAuthService
from app.services.jwt_service import JWTService
from app.models.user import User

# Re-export security dependencies so routes can import from deps
from app.core.security import get_current_user, get_current_requester, get_current_reviewer


async def get_user_repository(db: AsyncSession = Depends(get_db)) -> UserRepository:
    """Dependency injection provider for UserRepository."""
    return UserRepository(db)


async def get_oauth_service() -> OAuthService:
    """Dependency injection provider for OAuthService."""
    return OAuthService()


async def get_jwt_service() -> JWTService:
    """Dependency injection provider for JWTService."""
    return JWTService()


async def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    oauth_service: OAuthService = Depends(get_oauth_service),
    jwt_service: JWTService = Depends(get_jwt_service),
) -> AuthService:
    """Dependency injection provider for AuthService."""
    return AuthService(user_repo=user_repo, oauth_service=oauth_service, jwt_service=jwt_service)