from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.users import router as users_router
from app.api.v1.profiles import router as profiles_router
from app.api.v1.profile_photos import router as profile_photos_router
from app.api.v1.discover import router as discover_router
from app.api.v1.actions import router as actions_router
from app.api.v1.auth import router as auth_router
from app.api.v1.matches import router as matches_router
from app.api.v1.messages import router as messages_router
from app.api.v1.rewind import router as rewind_router
from app.api.v1.message_requests import router as message_requests_router
from app.api.v1.likes import router as likes_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(profiles_router)
api_router.include_router(profile_photos_router)
api_router.include_router(discover_router)
api_router.include_router(actions_router)
api_router.include_router(matches_router)
api_router.include_router(messages_router)
api_router.include_router(rewind_router)
api_router.include_router(message_requests_router)
api_router.include_router(likes_router)

