import asyncio
import hashlib
import io
import warnings
from pathlib import Path
from urllib.parse import urlsplit

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from pydantic import TypeAdapter, ValidationError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.profile import Profile
from app.models.profile_photo import ProfilePhoto
from app.schemas.profile_photo import (
    ProfilePhotoCreate,
    ProfilePhotoResponse,
    ProfilePhotoSyncItem,
    ReorderPhotosRequest,
)

router = APIRouter(
    prefix="/profiles/{profile_id}/photos",
    tags=["Profile Photos"],
)


async def get_and_verify_user_profile(
    profile_id: int,
    user_id: int,
    db: AsyncSession,
) -> Profile:
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    if profile.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only manage photos for your own profile",
        )

    return profile


def get_managed_upload_path(url: str) -> Path | None:
    prefix = "/uploads/"
    if not url.startswith(prefix):
        return None

    upload_root = settings.PROFILE_UPLOAD_DIR.resolve()
    path = (upload_root / url[len(prefix) :]).resolve()
    if not path.is_relative_to(upload_root):
        return None

    return path


async def validate_image_upload(photo: UploadFile) -> tuple[bytes, str]:
    if hasattr(photo, "seek"):
        await photo.seek(0)

    image_bytes = await photo.read(settings.PROFILE_PHOTO_MAX_BYTES + 1)
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The selected image is empty")
    if len(image_bytes) > settings.PROFILE_PHOTO_MAX_BYTES:
        raise HTTPException(status_code=413, detail="Images must be 8 MB or smaller")

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(image_bytes)) as image:
                image_format = image.format
                if image_format not in {"JPEG", "PNG", "WEBP"}:
                    raise HTTPException(
                        status_code=415,
                        detail="Only JPEG, PNG, and WebP images are supported",
                    )
                if image.width * image.height > settings.PROFILE_PHOTO_MAX_PIXELS:
                    raise HTTPException(
                        status_code=413,
                        detail="The selected image has too many pixels",
                    )
                image.load()
    except HTTPException:
        raise
    except (
        Image.DecompressionBombError,
        Image.DecompressionBombWarning,
        UnidentifiedImageError,
        OSError,
        ValueError,
    ) as exc:
        raise HTTPException(
            status_code=400,
            detail="The selected file is not a valid supported image",
        ) from exc

    extension = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}[image_format]
    return image_bytes, extension


@router.post("", response_model=ProfilePhotoResponse, status_code=201)
async def add_profile_photo(
    profile_id: int,
    photo_data: ProfilePhotoCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    await get_and_verify_user_profile(profile_id, user_id, db)

    result = await db.execute(
        select(func.count(ProfilePhoto.id)).where(ProfilePhoto.profile_id == profile_id)
    )
    photo_count = result.scalar_one()

    if photo_count >= 6:
        raise HTTPException(
            status_code=400,
            detail="A profile can have a maximum of 6 photos",
        )

    photo = ProfilePhoto(
        profile_id=profile_id,
        url=photo_data.url,
        position=photo_data.position,
    )

    db.add(photo)
    await db.commit()
    await db.refresh(photo)

    return photo


@router.put("/sync", response_model=list[ProfilePhotoResponse])
async def sync_profile_photos(
    profile_id: int,
    manifest: str = Form(...),
    files: list[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    await get_and_verify_user_profile(profile_id, user_id, db)

    try:
        items = TypeAdapter(list[ProfilePhotoSyncItem]).validate_json(manifest)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail="Invalid photo selection") from exc

    if not 2 <= len(items) <= 6:
        raise HTTPException(
            status_code=400,
            detail="A profile gallery must contain between 2 and 6 photos",
        )

    result = await db.execute(
        select(ProfilePhoto)
        .where(ProfilePhoto.profile_id == profile_id)
        .order_by(ProfilePhoto.position)
    )
    existing_photos = list(result.scalars().all())
    existing_by_id = {photo.id: photo for photo in existing_photos}
    existing_by_url = {photo.url: photo for photo in existing_photos}
    selected_photos: list[ProfilePhoto] = []
    selected_urls: set[str] = set()
    retained_ids: set[int] = set()
    used_file_indexes: set[int] = set()
    new_uploads: list[tuple[Path, bytes]] = []

    for item in items:
        if item.kind == "existing":
            photo = existing_by_id.get(item.photo_id or -1)
            if photo is None or item.url is not None or item.file_index is not None:
                raise HTTPException(status_code=400, detail="Invalid existing photo")
            retained_ids.add(photo.id)
        elif item.kind == "url":
            parsed_url = urlsplit(item.url or "")
            if (
                not item.url
                or len(item.url) > 500
                or parsed_url.scheme not in {"http", "https"}
                or not parsed_url.netloc
                or item.photo_id is not None
                or item.file_index is not None
            ):
                raise HTTPException(status_code=400, detail="Invalid photo URL")
            photo = existing_by_url.get(item.url)
            if photo is None:
                photo = ProfilePhoto(
                    profile_id=profile_id,
                    url=item.url,
                    position=len(selected_photos),
                )
            else:
                retained_ids.add(photo.id)
        else:
            file_index = item.file_index
            if (
                file_index is None
                or file_index < 0
                or file_index >= len(files)
                or file_index in used_file_indexes
                or item.photo_id is not None
                or item.url is not None
            ):
                raise HTTPException(status_code=400, detail="Invalid uploaded photo")

            used_file_indexes.add(file_index)
            image_bytes, extension = await validate_image_upload(files[file_index])
            digest = hashlib.sha256(image_bytes).hexdigest()
            photo_url = f"/uploads/profiles/{profile_id}/{digest}.{extension}"
            photo = existing_by_url.get(photo_url)
            if photo is None:
                upload_path = get_managed_upload_path(photo_url)
                if upload_path is None:
                    raise HTTPException(
                        status_code=500, detail="Invalid upload destination"
                    )
                photo = ProfilePhoto(
                    profile_id=profile_id,
                    url=photo_url,
                    position=len(selected_photos),
                )
                new_uploads.append((upload_path, image_bytes))
            else:
                retained_ids.add(photo.id)

        if photo.url in selected_urls:
            raise HTTPException(
                status_code=400, detail="Duplicate photos are not allowed"
            )
        selected_urls.add(photo.url)
        selected_photos.append(photo)

    if used_file_indexes != set(range(len(files))):
        raise HTTPException(status_code=400, detail="Unused photo upload supplied")

    files_created: list[Path] = []
    removed_urls = [
        photo.url for photo in existing_photos if photo.id not in retained_ids
    ]

    try:
        for upload_path, image_bytes in new_uploads:
            await asyncio.to_thread(
                upload_path.parent.mkdir, parents=True, exist_ok=True
            )
            if not upload_path.exists():
                await asyncio.to_thread(upload_path.write_bytes, image_bytes)
                files_created.append(upload_path)

        for photo in existing_photos:
            if photo.id not in retained_ids:
                await db.delete(photo)

        for position, photo in enumerate(selected_photos):
            photo.position = position
            db.add(photo)

        await db.commit()
    except Exception:
        await db.rollback()
        for upload_path in files_created:
            await asyncio.to_thread(upload_path.unlink, missing_ok=True)
        raise

    for photo in selected_photos:
        await db.refresh(photo)

    for photo_url in removed_urls:
        upload_path = get_managed_upload_path(photo_url)
        if upload_path is not None and photo_url not in selected_urls:
            try:
                await asyncio.to_thread(upload_path.unlink, missing_ok=True)
            except OSError:
                pass

    return selected_photos


@router.get("", response_model=list[ProfilePhotoResponse])
async def get_profile_photos(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProfilePhoto)
        .where(ProfilePhoto.profile_id == profile_id)
        .order_by(ProfilePhoto.position)
    )

    return result.scalars().all()


@router.put("/reorder", response_model=list[ProfilePhotoResponse])
async def reorder_profile_photos(
    profile_id: int,
    reorder_data: ReorderPhotosRequest,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    await get_and_verify_user_profile(profile_id, user_id, db)

    photo_ids = [item.photo_id for item in reorder_data.photos]
    positions = [item.position for item in reorder_data.photos]
    if len(photo_ids) != len(set(photo_ids)) or sorted(positions) != list(
        range(len(positions))
    ):
        raise HTTPException(status_code=400, detail="Invalid photo order")

    result = await db.execute(
        select(ProfilePhoto.id).where(ProfilePhoto.profile_id == profile_id)
    )
    if set(result.scalars().all()) != set(photo_ids):
        raise HTTPException(
            status_code=400, detail="Photo order must include the full gallery"
        )

    for item in reorder_data.photos:
        result = await db.execute(
            select(ProfilePhoto).where(
                ProfilePhoto.id == item.photo_id,
                ProfilePhoto.profile_id == profile_id,
            )
        )
        photo = result.scalar_one_or_none()
        if photo:
            photo.position = item.position

    await db.commit()

    # Return photos in updated order
    result = await db.execute(
        select(ProfilePhoto)
        .where(ProfilePhoto.profile_id == profile_id)
        .order_by(ProfilePhoto.position)
    )
    return result.scalars().all()


@router.delete("/{photo_id}", status_code=204)
async def delete_profile_photo(
    profile_id: int,
    photo_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    profile = await get_and_verify_user_profile(profile_id, user_id, db)

    # Check total photos count - prevent removing if active and would leave < 2
    count_result = await db.execute(
        select(func.count(ProfilePhoto.id)).where(ProfilePhoto.profile_id == profile_id)
    )
    total_photos = count_result.scalar_one()

    if profile.is_active and total_photos <= 2:
        raise HTTPException(
            status_code=400,
            detail="Active profiles require a minimum of 2 photos. Please add a replacement before deleting.",
        )

    result = await db.execute(
        select(ProfilePhoto).where(
            ProfilePhoto.id == photo_id,
            ProfilePhoto.profile_id == profile_id,
        )
    )
    photo = result.scalar_one_or_none()

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Photo not found",
        )

    photo_url = photo.url
    await db.delete(photo)
    await db.commit()

    upload_path = get_managed_upload_path(photo_url)
    if upload_path is not None:
        try:
            await asyncio.to_thread(upload_path.unlink, missing_ok=True)
        except OSError:
            pass
