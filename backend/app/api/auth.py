from typing import List
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.api.deps import get_auth_service, get_current_user, get_user_repository
from app.schemas import TokenResponse, OAuthLoginResponse, UserResponse
from app.services import AuthService
from app.models.user import User
from app.models.enums import UserRole
from app.core.exceptions import ValidationException
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get(
    "/google/login",
    response_model=OAuthLoginResponse,
    summary="Initiate Google OAuth login",
    description="Returns the Google OAuth2 authorization URL to redirect the user for login.",
)
async def google_login(
    auth_service: AuthService = Depends(get_auth_service),
) -> OAuthLoginResponse:
    login_url = await auth_service.get_oauth_login_url()
    return OAuthLoginResponse(login_url=login_url)


@router.get(
    "/google/callback",
    response_model=TokenResponse,
    summary="Handle Google OAuth callback",
    description="Exchanges the OAuth authorization code for an access token. Creates a new user if not found.",
)
async def google_callback(
    code: str = Query(..., description="Authorization code returned by Google OAuth2"),
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    if not code:
        raise ValidationException("Authorization code is required.")
    return await auth_service.handle_oauth_callback(code=code)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
    description="Returns the profile of the currently authenticated user based on the JWT token.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return current_user


@router.get(
    "/reviewers",
    response_model=List[UserResponse],
    summary="List all reviewers",
    description="Returns a list of all users with the Reviewer role. Used when assigning reviewers to requests.",
)
async def list_reviewers(
    user_repo: UserRepository = Depends(get_user_repository),
) -> List[UserResponse]:
    return await user_repo.get_all_by_role(UserRole.REVIEWER)


@router.post(
    "/mock-login",
    response_model=TokenResponse,
    summary="Mock login for testing",
    description="Creates or retrieves a mock user with the specified role and returns a JWT token. For development/testing only.",
)
async def mock_login(
    role: UserRole = Query(default=UserRole.REQUESTER, description="User role for mock login"),
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    from app.services.auth_service import AuthService as AS
    from app.services.oauth_service import OAuthService
    from app.services.jwt_service import JWTService
    user_repo = UserRepository(db)
    auth_service = AS(
        user_repo=user_repo,
        oauth_service=OAuthService(),
        jwt_service=JWTService(),
    )
    return await auth_service.mock_login(role=role)