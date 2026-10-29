from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import exists, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.match import Match
from app.models.message_request import MessageRequest
from app.models.profile import Profile
from app.models.profile_action import ProfileAction
from app.schemas.profile import ProfileDetailResponse
from app.schemas.profile_photo import ProfilePhotoResponse
from app.services.explore_relevance import category_ids, score_profiles

router = APIRouter(
    prefix="/discover",
    tags=["Discover"],
)


class ExploreCategoryResponse(BaseModel):
    profiles: list[ProfileDetailResponse]
    member_count: int


@router.get("/explore/counts", response_model=dict[str, int])
async def get_explore_category_counts(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    profiles = await get_discover_profiles(db=db, user_id=user_id)
    return {category_id: len(profiles) for category_id in category_ids()}


@router.get("/explore/{category_id}", response_model=ExploreCategoryResponse)
async def get_explore_category_profiles(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    if category_id not in category_ids():
        raise HTTPException(status_code=404, detail="Explore category not found")

    profiles = await get_discover_profiles(db=db, user_id=user_id)
    viewer_profile = None
    if category_id == "communities":
        result = await db.execute(
            select(Profile).where(Profile.user_id == user_id)
        )
        viewer_profile = result.scalar_one_or_none()

    ranked_profiles = [
        profile
        for profile, _score in score_profiles(
            profiles,
            category_id,
            viewer_profile=viewer_profile,
        )
    ]
    return ExploreCategoryResponse(
        profiles=ranked_profiles,
        member_count=len(ranked_profiles),
    )


@router.get(
    "",
    response_model=list[ProfileDetailResponse],
)
async def get_discover_profiles(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    # ---------------------------------------------------------
    # Discover cooldown
    # ---------------------------------------------------------

    cooldown_time = datetime.now(timezone.utc) - timedelta(
        days=settings.DISCOVER_COOLDOWN_DAYS
    )

    # ---------------------------------------------------------
    # 1. Profiles that the user has LIKED
    #
    # Like stays hidden until rewind or match.
    # ---------------------------------------------------------

    liked_profiles = select(ProfileAction.target_profile_id).where(
        ProfileAction.user_id == user_id,
        ProfileAction.action == "like",
    )

    # ---------------------------------------------------------
    # 2. Profiles that the user has PASSED recently
    #
    # Pass is temporary and expires after cooldown.
    # ---------------------------------------------------------

    recently_passed_profiles = select(ProfileAction.target_profile_id).where(
        ProfileAction.user_id == user_id,
        ProfileAction.action == "pass",
        ProfileAction.created_at >= cooldown_time,
    )

    # ---------------------------------------------------------
    # 4. Recently declined message requests
    #
    # Decline is temporary. After the cooldown expires,
    # the profile can appear again.
    # ---------------------------------------------------------

    recently_declined_request_exists = exists(
        select(MessageRequest.id).where(
            MessageRequest.status == "rejected",
            MessageRequest.created_at >= cooldown_time,
            or_(
                (
                    (MessageRequest.sender_id == user_id)
                    & (MessageRequest.receiver_id == Profile.user_id)
                ),
                (
                    (MessageRequest.sender_id == Profile.user_id)
                    & (MessageRequest.receiver_id == user_id)
                ),
            ),
        )
    )

    # ---------------------------------------------------------
    # 5. Existing match
    #
    # Matched users should never appear in Discover again.
    # ---------------------------------------------------------

    existing_match_exists = exists(
        select(Match.id).where(
            or_(
                (
                    (Match.user_one_id == user_id)
                    & (Match.user_two_id == Profile.user_id)
                ),
                (
                    (Match.user_one_id == Profile.user_id)
                    & (Match.user_two_id == user_id)
                ),
            )
        )
    )

    # ---------------------------------------------------------
    # Final Discover query
    # ---------------------------------------------------------

    result = await db.execute(
        select(Profile)
        .options(selectinload(Profile.photos))
        .where(
            # Only active profiles
            Profile.is_active.is_(True),
            # Don't show own profile
            Profile.user_id != user_id,
            # Hide profiles already liked
            ~Profile.id.in_(liked_profiles),
            # Hide recently passed profiles
            ~Profile.id.in_(recently_passed_profiles),
            # Hide recently declined requests
            ~recently_declined_request_exists,
            # Hide matched users
            ~existing_match_exists,
        )
        .order_by(Profile.id)
    )

    profiles = result.scalars().all()

    return [
        ProfileDetailResponse(
            id=p.id,
            user_id=p.user_id,
            display_name=p.display_name,
            age=p.age,
            degree=p.degree,
            year=p.year,
            branch=p.branch,
            bio=p.bio,
            university=p.university,
            campus=p.campus,
            lifestyle=p.lifestyle,
            interests=p.interests,
            icebreakers=p.icebreakers,
            is_verified=p.is_verified,
            is_active=p.is_active,
            photos=[
                ProfilePhotoResponse(
                    id=photo.id,
                    profile_id=photo.profile_id,
                    url=photo.url,
                    position=photo.position,
                )
                for photo in sorted(p.photos or [], key=lambda x: x.position)
            ],
        )
        for p in profiles
    ]
