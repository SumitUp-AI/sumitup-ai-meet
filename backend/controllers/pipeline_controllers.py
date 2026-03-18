from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from pipelines import create_action_items_json, summarize_meeting_transcripts
from models.models import Meeting, Transcripts
from middlewares.limiter import limiter
from pydantic import BaseModel
from typing import List, Optional, Tuple
import traceback

class TranscriptData(BaseModel):
    start_time: str
    end_time: str
    speaker: str
    text: str
    
class MeetingTranscriptPayload(BaseModel):
    transcript: List[TranscriptData]

router = APIRouter(
    prefix="/api/v1",
    tags=["Summarization and Action Items API"]
)

async def get_meeting_and_combined_transcript(meeting_id: str, request: Request) -> Tuple[Meeting, str]:
    tenant = request.state.tenant
    meeting: Optional[Meeting] = await Meeting.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if meeting.created_by.ref.id != tenant.id:
        raise HTTPException(status_code=403, detail="Access denied: This meeting does not belong to your tenant")
    
    transcripts: List[Transcripts] = await Transcripts.find(
        Transcripts.meeting_id == meeting
    ).sort(+Transcripts.timestamp_ms).to_list()
    
    if not transcripts:
        raise HTTPException(status_code=400, detail="No transcripts found for this meeting")
    
    combined_text: str = "\n".join([f"{t.speaker_name}: {t.transcript}" for t in transcripts])
    return meeting, combined_text

@router.get("/create_summary")
@limiter.limit("6/minute")
async def get_summary_from_raw_transcript(
    request: Request,
    meeting_id: str
) -> JSONResponse:
    try:
        meeting, combined_text = await get_meeting_and_combined_transcript(meeting_id, request)
        summary: str = summarize_meeting_transcripts(combined_text)
        return JSONResponse(content={
            "meeting_id": str(meeting.id),
            "title": meeting.name,
            "dated_at": meeting.created_at,
            "summary": summary
        })
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server failed to process summary: {str(e)}")

@router.post("/create_action_items")
@limiter.limit("6/minute")
async def get_action_items(
    request: Request,
    meeting_id: str
) -> JSONResponse:
    """
    Generate action items from meeting transcripts.
    """
    try:
        meeting, combined_text = await get_meeting_and_combined_transcript(meeting_id, request)
        action_items = create_action_items_json(combined_text)
        return JSONResponse(content={"items": action_items["items"]})
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process action items: {str(e)}")