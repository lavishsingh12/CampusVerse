from datetime import datetime, timezone

from app.models.user import User


def is_user_premium(user: User) -> bool:
    if not user.is_premium:
        return False

    if user.premium_expires_at is None:
        return False

    return user.premium_expires_at > datetime.now(timezone.utc)
