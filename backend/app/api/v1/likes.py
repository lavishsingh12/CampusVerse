
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.match import Match
from app.models.profile import Profile
from app.models.profile_action import ProfileAction
from app.schemas.like import LikeItemResponse, LikeProfileSummary
from app.schemas.profile_photo import ProfilePhotoResponse

router = APIRouter(prefix="/likes", tags=["Likes"])


async def get_matched_user_ids(
    db: AsyncSession,
    user_id: int,
) -> set[int]:
    """Return IDs of users already matched with the current user."""
    result = await db.execute(
        select(Match.user_one_id, Match.user_two_id).where(
            (Match.user_one_id == user_id)
            | (Match.user_two_id == user_id)
        )
    )

    matched_user_ids: set[int] = set()

    for user_one_id, user_two_id in result.all():
        if user_one_id == user_id:
            matched_user_ids.add(user_two_id)
        else:
            matched_user_ids.add(user_one_id)

    return matched_user_ids


def build_like_response(
    action: ProfileAction,
    profile: Profile,
) -> LikeItemResponse:
    """Build a like response with the profile's photos."""
    photos = sorted(
        profile.photos or [],
        key=lambda photo: photo.position,
    )

    return LikeItemResponse(
        id=action.id,
        created_at=action.created_at,
        profile=LikeProfileSummary(
            id=profile.id,
            user_id=profile.user_id,
            display_name=profile.display_name,
            age=profile.age,
            degree=profile.degree,
            year=profile.year,
            branch=profile.branch,
            bio=profile.bio,
            is_verified=profile.is_verified,
            photos=[
                ProfilePhotoResponse(
                    id=photo.id,
                    profile_id=photo.profile_id,
                    url=photo.url,
                    position=photo.position,
                )
                for photo in photos
            ],
        ),
    )


@router.get("/received", response_model=list[LikeItemResponse])
async def get_received_likes(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Get active profiles that liked the current user, excluding matches."""

    current_profile_result = await db.execute(
        select(Profile.id).where(Profile.user_id == user_id)
    )
    current_profile_id = current_profile_result.scalar_one_or_none()

    if current_profile_id is None:
        return []

    result = await db.execute(
        select(ProfileAction)
        .where(
            ProfileAction.target_profile_id == current_profile_id,
            ProfileAction.action == "like",
        )
        .order_by(ProfileAction.created_at.desc())
    )
    like_actions = result.scalars().all()

    if not like_actions:
        return []

    matched_user_ids = await get_matched_user_ids(db, user_id)

    profiles_result = await db.execute(
        select(Profile)
        .options(selectinload(Profile.photos))
        .where(
            Profile.user_id.in_(
                [action.user_id for action in like_actions]
            ),
            Profile.is_active.is_(True),
        )
    )

    profiles_by_user_id = {
        profile.user_id: profile
        for profile in profiles_result.scalars().all()
    }

    response = []

    for action in like_actions:
        if action.user_id in matched_user_ids:
            continue

        profile = profiles_by_user_id.get(action.user_id)

        if profile is None:
            continue

        response.append(build_like_response(action, profile))

    return response


@router.get("/sent", response_model=list[LikeItemResponse])
async def get_sent_likes(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Get profiles liked by the current user in the past 7 days.
    Keep matched profiles visible in this history.
    """

    cutoff_time = datetime.now(timezone.utc) - timedelta(days=7)

    result = await db.execute(
        select(ProfileAction)
        .where(
            ProfileAction.user_id == user_id,
            ProfileAction.action == "like",
            ProfileAction.created_at >= cutoff_time,
        )
        .order_by(ProfileAction.created_at.desc())
    )
    like_actions = result.scalars().all()

    if not like_actions:
        return []

    liked_profile_ids = [
        action.target_profile_id for action in like_actions
    ]

    profiles_result = await db.execute(
        select(Profile)
        .options(selectinload(Profile.photos))
        .where(
            Profile.id.in_(liked_profile_ids),
            Profile.is_active.is_(True),
        )
    )

    profiles_by_id = {
        profile.id: profile
        for profile in profiles_result.scalars().all()
    }

    response = []

    for action in like_actions:
        profile = profiles_by_id.get(action.target_profile_id)

        if profile is None:
            continue

        # Intentionally do not exclude matched users here.
        response.append(build_like_response(action, profile))

    return response
