from beanie import PydanticObjectId
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status
from fastapi.responses import JSONResponse
from ai.visual_summaries import generate_visual_summary
from core.utils.meeting_postprocessing import MeetingPostProcessing
from models.models import Meeting, MeetingSummaryStatus, ActionItems, Transcripts, MeetingSummary
from middlewares.limiter import limiter
from pydantic import BaseModel
from typing import List, Optional
import traceback
import logging

logger = logging.getLogger(__name__)

class TranscriptData(BaseModel):       
    start_time: str
    end_time: str
    speaker: str
    text: str

class MeetingTranscriptPayload(BaseModel): 
    transcript: List[TranscriptData]

class GenerateFlowPayload(BaseModel):
    meeting_id: str
    summary: Optional[str] = None
    action_items: Optional[List[dict]] = None


router = APIRouter(
    prefix="/api/v1",
    tags=["Summarization and Action Items API"]
)
processor = MeetingPostProcessing()

@router.get("/get_meeting_processing_update")
@limiter.limit("20/minute")           
async def get_meeting_processing_update(
    request: Request,
    meeting_id: str
) -> JSONResponse:
    # This endpoint is now purely for checking status
    meeting = await Meeting.get(PydanticObjectId(meeting_id))
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return JSONResponse(content={
        "meeting_id": meeting_id,
        "status": meeting.summary_status,
        "has_summary": meeting.summary is not None,
        "error": meeting.summary_error or None
    })

@router.get("/create_summary")
@limiter.limit("6/minute")
async def get_summary(
    request: Request,
    meeting_id: str,
    background_tasks: BackgroundTasks
) -> JSONResponse:
    try:
        meeting = await Meeting.get(PydanticObjectId(meeting_id))
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting Not Found")
        summary = await MeetingSummary.find_one(MeetingSummary.meeting.id == meeting.id) 
        if not summary:
            raise HTTPException(status_code=404, detail="Summary for Meeting Not Found")

        # Trigger logic: If pending, start the pipeline
        if summary.summary_status == MeetingSummaryStatus.PENDING:
            summary.summary_status = MeetingSummaryStatus.PROCESSING
            await summary.save()
            background_tasks.add_task(
                processor.execute_complete_pipeline,
                meeting_id=meeting_id
            )
            return JSONResponse(
                status_code=202,
                content={"status": "processing", "message": "Pipeline started"}
            )

        # Handle existing states
        if summary.summary_status == MeetingSummaryStatus.PROCESSING:
            return JSONResponse(status_code=202, content={"status": "processing"})

        if summary.summary_status == MeetingSummaryStatus.FAILED:
            return JSONResponse(content={"status": "failed", "error": summary.summary_error})
        
        # If READY, return the data
        return JSONResponse(content={
            "meeting_id": str(meeting_id),
            "summary": summary.summary_text,
            "title": meeting.name,
            "platform": meeting.platform,
            "started_at": str(meeting.created_at),
            "summary_status": summary.summary_status
        })

    except Exception as e:
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/create_action_items")
@limiter.limit("6/minute")
async def get_action_items(
    request: Request,
    meeting_id: str
) -> JSONResponse:
    try:
        meeting = await Meeting.get(PydanticObjectId(meeting_id))
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )

        items = await ActionItems.find(
            ActionItems.meeting.id == meeting.id
        ).to_list()

        if not items:
            return JSONResponse(content={"items": []})

        serialized = [
            {
                "id": str(item.id),
                "title": item.title,
                "assignee": item.assignee,
                "description": item.description,
                "deadline": str(item.deadline) if item.deadline else None,
                "confidence": item.confidence / 100  # stored as int, return as float
            }
            for item in items
        ]

        return JSONResponse(content={"items": serialized})

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get action items: {str(e)}"
        )


@router.post("/generate-flow-diagram")
@limiter.limit("6/minute")
async def generate_flow_diagram(
    request: Request,
    payload: GenerateFlowPayload
) -> JSONResponse:
    tenant = request.state.tenant

    # Fetch meeting
    meeting = await Meeting.get(payload.meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Use provided data or fetch from DB
    summary = payload.summary
    action_items = payload.action_items

    if not action_items:
        db_items = await ActionItems.find(
            ActionItems.meeting.id == meeting.id
        ).to_list()
        action_items = [
            {"title": item.title, "assignee": item.assignee}
            for item in db_items
        ]

    try:
        diagram = await generate_visual_summary(
            summary=summary or "",
            action_items=action_items or [],
            meeting_title=meeting.name or "Meeting"
        )
        return JSONResponse(content={**diagram, "cached": False})

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate diagram: {str(e)}"
        )