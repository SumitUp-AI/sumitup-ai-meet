from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pipelines import create_action_items_json, summarize_meeting_transcripts
from models.models import Meeting, Transcripts
from middlewares.limiter import limiter
from pydantic import BaseModel
from typing import List, Optional

# Schema for submitting transcripts

class TranscriptData(BaseModel):
    start_time: str
    end_time: str
    speaker: str
    text: str
    
class MeetingTranscriptPayload(BaseModel):
    transcript: List[TranscriptData]

class MeetingTranscriptOutput(BaseModel):
    dated_at: Optional[str] = None
    organization: Optional[str] = None
    summary: str

class CreateActionItems(BaseModel):
    summary: str
    
router = APIRouter(
    prefix="/api/v1",
    tags=["Summarization and Action Items API"]
)

@router.get("/create_summary", response_model=MeetingTranscriptOutput)
@limiter.limit("6/minute")
async def get_summary_from_raw_transcript(request: Request, meeting_id: str):
    """
    This API is for generating summary from transcripts
    """
    try:
        # 1. Fetch meeting
        meeting = await Meeting.get(meeting_id)
        if not meeting:
             raise HTTPException(status_code=404, detail="Meeting not found")

        # 2. Fetch transcripts
        transcripts = await Transcripts.find(Transcripts.meeting_id.id == meeting.id).sort(+Transcripts.timestamp_ms).to_list()
        
        if not transcripts:
             raise HTTPException(status_code=400, detail="No transcripts found for this meeting")

        # 3. Format transcripts
        formatted_text = []
        for t in transcripts:
             formatted_text.append(f"{t.speaker_name}: {t.transcript}")
        
        combined_text = "\n".join(formatted_text)
        
        # 4. Generate Summary
        summary = summarize_meeting_transcripts(combined_text)
        return JSONResponse(content={
            "meeting_id": meeting_id,
            "summary": summary
        })
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server failed to process Summary: {str(e)}")


@router.post("/create_action_items")
@limiter.limit("6/minute")
async def get_action_items(request: Request, payload: CreateActionItems):
    """
    This API is for generating summary from transcripts
    """
    # DB logic applies here later
    try:
        if payload.summary.strip() == "":
            raise HTTPException(status_code=400, detail="Summary cannot be empty")
        
        action_items = create_action_items_json(payload.summary)
        return JSONResponse({"items": action_items["items"]})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to process Action items")
