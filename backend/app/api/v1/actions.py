from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.core.premium import is_user_premium
from app.db.session import get_db
from app.models.match import Match
from app.models.profile import Profile
from app.models.profile_action import ProfileAction
from app.models.user import User
from app.schemas.profile_action import ProfileActionCreate, ProfileActionResponse

router = APIRouter(prefix="/actions", tags=["Profile Actions"])


@router.post("", response_model=ProfileActionResponse, status_code=201)
async def create_action(
    action_data: ProfileActionCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(
        select(Profile).where(Profile.id == action_data.target_profile_id)
    )
    target_profile = result.scalar_one_or_none()

    if not target_profile:
        raise HTTPException(status_code=404, detail="Target profile not found")

    if target_profile.user_id == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot like or pass your own profile",
        )

    result = await db.execute(
        select(ProfileAction).where(
            ProfileAction.user_id == user_id,
            ProfileAction.target_profile_id == action_data.target_profile_id,
        )
    )
    existing_action = result.scalar_one_or_none()

    if action_data.action == "like" and (
        existing_action is None or existing_action.action != "like"
    ):
        now = datetime.now(timezone.utc)
        start_of_day = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        like_limit = (
            settings.PREMIUM_DAILY_LIKES
            if is_user_premium(user)
            else settings.FREE_DAILY_LIKES
        )

        result = await db.execute(
            select(func.count(ProfileAction.id)).where(
                ProfileAction.user_id == user_id,
                ProfileAction.action == "like",
                ProfileAction.created_at >= start_of_day,
                ProfileAction.created_at <= now,
            )
        )
        today_like_count = result.scalar_one()

        if today_like_count >= like_limit:
            raise HTTPException(
                status_code=429,
                detail=f"Daily like limit of {like_limit} reached",
            )

    if existing_action:
        existing_action.action = action_data.action
        existing_action.created_at = datetime.now(timezone.utc)
        action = existing_action
    else:
        action = ProfileAction(
            user_id=user_id,
            target_profile_id=action_data.target_profile_id,
            action=action_data.action,
        )
        db.add(action)

    await db.flush()

    match_created = False

    if action_data.action == "like":
        target_user_id = target_profile.user_id

        current_profile_result = await db.execute(
            select(Profile.id).where(Profile.user_id == user_id)
        )
        current_profile_id = current_profile_result.scalar_one_or_none()

        if current_profile_id is None:
            raise HTTPException(
                status_code=404,
                detail="Current user profile not found",
            )

        result = await db.execute(
            select(ProfileAction).where(
                ProfileAction.user_id == target_user_id,
                ProfileAction.target_profile_id == current_profile_id,
                ProfileAction.action == "like",
            )
        )
        reciprocal_like = result.scalar_one_or_none()

        if reciprocal_like:
            user_one_id = min(user_id, target_user_id)
            user_two_id = max(user_id, target_user_id)

            result = await db.execute(
                select(Match).where(
                    Match.user_one_id == user_one_id,
                    Match.user_two_id == user_two_id,
                )
            )
            existing_match = result.scalar_one_or_none()

            if not existing_match:
                db.add(
                    Match(
                        user_one_id=user_one_id,
                        user_two_id=user_two_id,
                    )
                )
                match_created = True

    await db.commit()
    await db.refresh(action)

    return ProfileActionResponse(
        id=action.id,
        user_id=action.user_id,
        target_profile_id=action.target_profile_id,
        action=action.action,
        match_created=match_created,
    )

