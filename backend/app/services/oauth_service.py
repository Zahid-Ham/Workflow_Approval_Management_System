import logging
import httpx
from urllib.parse import urlencode
from fastapi import HTTPException
from app.core.config import settings

logger = logging.getLogger(__name__)

class OAuthService:
    """
    Service responsible solely for interaction with external Google OAuth APIs.
    """
    def __init__(self):
        pass

    def get_authorization_url(self) -> str:
        """
        Generates the Google OAuth 2.0 Authorization screen URL.
        """
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline',
            'prompt': 'consent'
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    async def get_google_user_profile(self, code: str) -> dict:
        """
        Exchanges code for Google user profile metadata.
        """
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    }
                )
                if res.status_code != 200:
                    logger.error(f"Google token exchange failed: {res.text}")
                    raise HTTPException(status_code=400, detail="Failed to retrieve Google token")
                token_data = res.json()
                access_token = token_data.get("access_token")
                
                headers = {"Authorization": f"Bearer {access_token}"}
                profile_res = await client.get("https://www.googleapis.com/oauth2/v3/userinfo", headers=headers)
                if profile_res.status_code != 200:
                    logger.error(f"Google profile fetch failed: {profile_res.text}")
                    raise HTTPException(status_code=400, detail="Failed to retrieve Google user profile")
                return profile_res.json()
            except Exception as e:
                logger.error(f"Google OAuth error: {str(e)}", exc_info=True)
                raise HTTPException(status_code=400, detail="OAuth authentication failed")
