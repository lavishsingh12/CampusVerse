from sqlalchemy import Boolean, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    degree: Mapped[str | None] = mapped_column(String(100), nullable=True)
    year: Mapped[str | None] = mapped_column(String(50), nullable=True)
    branch: Mapped[str | None] = mapped_column(String(150), nullable=True)

    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    university: Mapped[str | None] = mapped_column(String(150), nullable=True)
    campus: Mapped[str | None] = mapped_column(String(150), nullable=True)
    lifestyle: Mapped[dict[str, str] | None] = mapped_column(JSON, nullable=True)
    interests: Mapped[list[dict[str, str]] | None] = mapped_column(JSON, nullable=True)
    icebreakers: Mapped[list[dict[str, str]] | None] = mapped_column(
        JSON, nullable=True
    )

    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship(
        "User",
        back_populates="profile",
    )

    photos: Mapped[list["ProfilePhoto"]] = relationship(
        "ProfilePhoto",
        back_populates="profile",
        cascade="all, delete-orphan",
    )
