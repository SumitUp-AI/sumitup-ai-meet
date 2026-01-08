from fastapi import HTTPException, APIRouter, Request
from fastapi.responses import JSONResponse

router = APIRouter(
    prefix="/api/v1/",
    tags=["Meeting Processing and Action Items"]
)

@router.post("/create_meeting/{meeting_url}")
async def create_meeting(request: Request):
    pass


@router.post("/create_physical_meeting")
async def create_physical_meeting(request: Request):
    pass

