from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_one_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_two_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    user_one: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_one_id],
    )

    user_two: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_two_id],
    )

    __table_args__ = (
        UniqueConstraint(
            "user_one_id",
            "user_two_id",
            name="uq_match_users",
        ),
    )
