from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pipelines import create_action_items_json, summarize_meeting_transcripts
from limiter.limiter import limiter
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

@router.post("/create_summary", response_model=MeetingTranscriptOutput)
@limiter.limit("6/minute")
async def get_summary_from_raw_transcript(request: Request, payload: MeetingTranscriptPayload):
    """
    This API is for generating summary from transcripts
    """
    try:
        combined_text = " ".join([chunk.text for chunk in payload.transcript])
        
        if not payload.transcript or not combined_text.strip():
            raise HTTPException(status_code=400, detail="Failed to process, Transcripts cannot be empty!!")
        
        summary = summarize_meeting_transcripts(combined_text)
        return {"summary": summary}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Server failed to process Summary")


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
