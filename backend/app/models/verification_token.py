from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class VerificationToken(Base):
    __tablename__ = "verification_tokens"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # Identifier: can be email (lowercase) or phone number (e.g. +1234567890)
    identifier: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    # Type: 'email_verification', 'phone_verification', 'password_reset'
    token_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    # 6-digit OTP code or secure hash
    code: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
    )

    attempts: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    is_used: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
