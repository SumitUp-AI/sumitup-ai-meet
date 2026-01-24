from fastapi import HTTPException, APIRouter, Request
from fastapi.responses import JSONResponse
from core.helpers.helpers import AttendeeBot
from core.utils.process_meeting import ProcessMeeting
from models.models import MeetingPlatform, Meeting
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timezone


router = APIRouter(
    prefix="/api/v1/",
    tags=["Meeting Processing and Action Items"]
)

class CreateMeeting(BaseModel):
    name: str
    meeting_url: str


@router.post("/create_meeting")
async def create_meeting(request: Request, payload: CreateMeeting):
    meeting_url = payload.meeting_url
    processor = ProcessMeeting(meeting_url=meeting_url)
    detected_platform = processor.detect_meeting_platform()

    try: 
        detected_platform = MeetingPlatform(detected_platform)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Url invalid or Platform not supported")
    
    meeting = Meeting(
        name=payload.name,
        platform=detected_platform,
        started_at=datetime.now(timezone.utc),
        ended_at=None
    )

    # Save to DB Later
    # Trigger Bot action using HTTPx
    



@router.post("/create_physical_meeting")
async def create_physical_meeting(request: Request):
    pass

