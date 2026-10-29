from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # A message belongs either to a romantic match or an accepted request.
    # Those concepts must remain independent.
    match_id: Mapped[int | None] = mapped_column(
        ForeignKey("matches.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    message_request_id: Mapped[int | None] = mapped_column(
        ForeignKey("message_requests.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    sender_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    match: Mapped["Match"] = relationship("Match")
    message_request: Mapped["MessageRequest"] = relationship("MessageRequest")
    sender: Mapped["User"] = relationship("User")
