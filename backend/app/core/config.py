from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """
    Application configuration validation class loaded from environment variables.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/workflow_db",
        description="PostgreSQL Connection URI",
    )
    JWT_SECRET_KEY: str = Field(
        default="supersecretjwtkeydonotuseinproduction1234567890",
        description="Key used to sign JWT session cookies",
    )
    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="Encryption algorithm for signing JWTs",
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
        description="Duration of token validity in minutes",
    )
    GOOGLE_CLIENT_ID: str = Field(
        default="",
        description="Google Client ID from Developers Console",
    )
    GOOGLE_CLIENT_SECRET: str = Field(
        default="",
        description="Google Client Secret from Developers Console",
    )
    GOOGLE_REDIRECT_URI: str = Field(
        default="http://localhost:5173/login",
        description="Google Callback Redirect URI",
    )
    FRONTEND_URL: str = Field(
        default="http://localhost:5173",
        description="Origin URL of frontend app client",
    )
    BACKEND_URL: str = Field(
        default="http://localhost:8000",
        description="Origin URL of backend API server",
    )
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Structured logging severity level threshold",
    )
    HOST: str = Field(
        default="0.0.0.0",
        description="Host address for uvicorn server",
    )
    PORT: int = Field(
        default=8000,
        description="Port number for uvicorn server",
    )


settings = Settings()