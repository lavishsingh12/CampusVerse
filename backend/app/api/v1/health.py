from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Check the operational status of the CampusVerse API service.",
)
async def get_health() -> HealthResponse:
    return HealthResponse(status="ok")
