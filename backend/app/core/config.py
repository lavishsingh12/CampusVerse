from pathlib import Path
from typing import List, Union

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusVerse API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "supersecret_default_key_change_in_production"
    # Disabled by default.  Local bypasses must be explicitly opted into and
    # are never valid outside development.
    ALLOW_DEV_EMAIL_VERIFICATION_BYPASS: bool = False
    DEV_EMAIL_VERIFICATION_BYPASS_ADDRESSES: List[str] = []
    PENDING_MESSAGE_REQUEST_LIMIT: int = 3

    # Authentication & Verification
    GOOGLE_CLIENT_ID: str = ""
    OTP_EXPIRE_MINUTES: int = 10
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    OTP_MAX_ATTEMPTS: int = 5
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # SMS Provider Configuration (e.g. Twilio or similar)
    SMS_PROVIDER_ACCOUNT_SID: str = ""
    SMS_PROVIDER_AUTH_TOKEN: str = ""
    SMS_PROVIDER_FROM_NUMBER: str = ""

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/campusverse"
    )

    # Supabase Credentials
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Profile photo uploads
    PROFILE_UPLOAD_DIR: Path = Path(__file__).resolve().parents[2] / "uploads"
    PROFILE_PHOTO_MAX_BYTES: int = 8 * 1024 * 1024
    PROFILE_PHOTO_MAX_PIXELS: int = 20_000_000

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Premium Limits
    FREE_DAILY_LIKES: int = 10
    PREMIUM_DAILY_LIKES: int = 20

    FREE_DAILY_REWINDS: int = 1
    FREE_WEEKLY_MESSAGE_REQUESTS: int = 3
    DISCOVER_COOLDOWN_DAYS: int = 10
    PREMIUM_EXPOSURE_MULTIPLIER: float = 1.5

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    @field_validator("DEV_EMAIL_VERIFICATION_BYPASS_ADDRESSES", mode="before")
    @classmethod
    def assemble_dev_addresses(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [email.strip().lower() for email in v.split(",") if email.strip()]
        return [email.strip().lower() for email in v]

    @property
    def dev_email_bypass_enabled(self) -> bool:
        return self.ENVIRONMENT.lower() == "development" and self.ALLOW_DEV_EMAIL_VERIFICATION_BYPASS

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
