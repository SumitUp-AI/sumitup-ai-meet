from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pipelines import create_action_items_json, summarize_meeting_transcripts
from pydantic import BaseModel

class MeetingTranscriptPayload(BaseModel):
    transcript: str

class MeetingTranscriptOutput(BaseModel):
    summary: str


router = APIRouter(
    prefix="/api/v1",
    tags=["Summarization", "Action Items API"]
)

# Schema for submitting transcripts


@router.post("/create_summary", response_model=MeetingTranscriptOutput)
async def get_summary_from_raw_transcript(payload: MeetingTranscriptPayload):
    """
    This API is for generating summary from transcripts
    """
    try:
        if payload.transcript.strip() == "":
            raise HTTPException(status_code=400, detail="Transcripts cannot be empty")
        
        summary = summarize_meeting_transcripts(payload.transcript)
        return {"summary": summary}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Server failed to process Summary")
    
    
@router.post("/create_action_items")
async def get_action_items(summary: str):
    """
    This API is for generating summary from transcripts
    """
    # DB logic applies here later
    try:
        if summary.strip() == "":
            raise HTTPException(status_code=400, detail="Summary cannot be empty")
        
        action_items = create_action_items_json(summary)
        return JSONResponse({"items": action_items["items"]})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to process Action items")