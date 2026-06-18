from pydantic import BaseModel, Field

class TokenResponse(BaseModel):
    access_token: str = Field(..., description = 'JWT Bearer Token signature')
    token_type: str = Field(default = 'bearer', description = 'Access token encoding format')


class OAuthLoginResponse(BaseModel):
    login_url: str = Field(..., description = 'Google OAuth authentication screen redirect url')


class TokenPayload(BaseModel):
    sub: str | None = Field(default = None, description = 'User ID corresponding to JWT owner')
    email: str | None = Field(default = None, description = 'User email address')
    role: str | None = Field(default = None, description = 'User permission role level')
