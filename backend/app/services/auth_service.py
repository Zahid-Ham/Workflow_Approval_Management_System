import logging
import uuid
from typing import Optional
from app.repositories.user_repository import UserRepository
from app.services.oauth_service import OAuthService
from app.services.jwt_service import JWTService
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.auth import TokenResponse

logger = logging.getLogger(__name__)


class AuthService:
    """
    Service coordinating Google authentication onboarding and JWT session lifecycle.
    """

    def __init__(
        self,
        user_repo: UserRepository,
        oauth_service: OAuthService,
        jwt_service: JWTService,
    ):
        self.user_repo = user_repo
        self.oauth_service = oauth_service
        self.jwt_service = jwt_service

    def get_google_login_url(self) -> str:
        """Fetch external Google authorization page location."""
        return self.oauth_service.get_authorization_url()

    async def get_oauth_login_url(self) -> str:
        """Async-compatible alias for fetching the Google OAuth login URL."""
        return self.oauth_service.get_authorization_url()

    async def authenticate_google_user(self, code: str) -> str:
        """
        Authenticate Google OAuth callback:
        - Exchange auth code for Google profile.
        - Onboard user if email does not exist.
        - Generate and return JWT session token.
        """
        google_profile = await self.oauth_service.get_google_user_profile(code)
        google_id = google_profile.get("sub")
        email = google_profile.get("email")
        name = google_profile.get("name", "Google User")

        # 1. Retrieve user by Google ID
        user = await self.user_repo.get_by_google_id(google_id)
        if not user:
            # 2. Retrieve user by email
            user = await self.user_repo.get_by_email(email)
            if user:
                # Associate existing user with Google ID
                user = await self.user_repo.update(user.id, google_id=google_id)
            else:
                # 3. Onboard new user (Default Role: REQUESTER)
                user = await self.user_repo.create(
                    name=name,
                    email=email,
                    google_id=google_id,
                    role=UserRole.REQUESTER,
                )

        # 4. Generate JWT Token
        token = self.jwt_service.create_token(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role.value if hasattr(user.role, "value") else user.role,
            }
        )
        return token

    async def handle_oauth_callback(self, code: str) -> TokenResponse:
        """Handle OAuth callback and return a TokenResponse with JWT."""
        token = await self.authenticate_google_user(code)
        return TokenResponse(access_token=token, token_type="bearer")

    def verify_jwt_token(self, token: str) -> Optional[dict]:
        """Decode and validate custom session signature claims."""
        return self.jwt_service.decode_token(token)

    async def mock_login(self, role: UserRole) -> TokenResponse:
        """
        Create or retrieve a mock user for the given role and issue a JWT token.
        Only intended for development and testing environments.
        """
        mock_email = f"mock.{role.value.lower()}@example.com"
        user = await self.user_repo.get_by_email(mock_email)
        if not user:
            user = await self.user_repo.create(
                name=f"Mock {role.value}",
                email=mock_email,
                google_id=f"mock_google_id_{role.value.lower()}",
                role=role,
            )
        token = self.jwt_service.create_token(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role.value if hasattr(user.role, "value") else user.role,
            }
        )
        return TokenResponse(access_token=token, token_type="bearer")
