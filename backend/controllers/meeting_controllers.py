from fastapi import HTTPException, APIRouter, Request, status
from fastapi.responses import JSONResponse
from core.helpers.helpers import AttendeeBot
from core.utils.process_meeting import ProcessMeeting
from models.models import MeetingPlatform, Meeting, Participants, MeetingState, Transcripts
from pydantic import BaseModel
from datetime import datetime, timezone
import os

router = APIRouter(
    prefix="/api/v1",
    tags=["Meeting Processing and Action Items"]
)

class CreateMeeting(BaseModel):
    name: str
    meeting_url: str
    provider: str

class LeaveMeetingPayload(BaseModel):
    meeting_id: str

@router.post("/create_meeting")
async def create_meeting(request: Request, payload: CreateMeeting):
    meeting_url = payload.meeting_url
    meeting_processor = ProcessMeeting(meeting_url=meeting_url)
    detected_platform = meeting_processor.detect_meeting_platform()

    try: 
        detected_platform = MeetingPlatform(detected_platform)
    except (ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Url invalid or Platform not supported")
    
    # Get tenant from request state (set by middleware)
    tenant = request.state.tenant
    if not tenant:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant Object Missing in Payload")

    meeting = Meeting(
        name=payload.name,
        meeting_link=meeting_url,
        platform=detected_platform,
        created_by=tenant,
        started_at=datetime.now(timezone.utc),
        ended_at=None,
    )

    await meeting.save()

    # Create Host Particpant
    host = Participants(tenant=tenant, meeting=meeting, role="host")
    await host.save()
    

    # 4. Trigger Bot
    bot_api_key = os.getenv("ATTENDEE_API_KEY") 
    if not bot_api_key:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="ATTENDEE_API_KEY not configured")

    try:
        bot = AttendeeBot(
            bot="SumitUp Bot",
            api_key=bot_api_key,
            meeting_url=meeting_url,
            provider=payload.provider,
            meeting=meeting,
            language="en"
        )
        
        result = await bot.join_meeting()
        # Refresh meeting object from database to get updated state
        updated_meeting = await Meeting.get(str(meeting.id))
        
        return JSONResponse(content={
            "message": "Meeting has created, See your Meeting Tab for Bot requesting to join meeting!", 
            "meeting_id": str(meeting.id), 
            "bot_data": result,
            "meeting_state": updated_meeting.state if updated_meeting else meeting.state
        })
    except Exception as e:
        meeting.state = MeetingState.fatal_error
        await meeting.save()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Meeting Processing Failed, Server error: {str(e)}")
    

@router.post("/leave_meeting")
async def leave_meeting_endpoint(request: Request, payload: LeaveMeetingPayload):
    meeting = await Meeting.get(payload.meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    bot_api_key = os.getenv("ATTENDEE_API_KEY") 
    if not bot_api_key:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="ATTENDEE_API_KEY requested but not found")

    bot = AttendeeBot(
        bot="Sumitup Meeting Bot", 
        api_key=bot_api_key, 
        meeting_url=meeting.meeting_link, 
        provider="deepgram", 
        language="en",
        meeting=meeting
    )

    try:
        await bot.leave_meeting()
        # Ensure meeting state is updated to ended
        meeting.state = MeetingState.ended
        meeting.ended_at = datetime.now(timezone.utc)
        await meeting.save()
        return JSONResponse(content={"message": "Bot left the meeting"})
    except Exception as e:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to leave: {str(e)}")



@router.get("/get_all_meetings")
async def get_all_meetings_information(request: Request):
    # Filter meetings by current tenant
    tenant = request.state.tenant
    meetings = await Meeting.find(Meeting.created_by.id == tenant.id).sort(-Meeting.started_at).to_list()
    
    if not meetings:
        return []
    
    all_meetings_data = [{
        "id": str(m.id),
        "name": m.name,
        "platform": m.platform,
        "meeting_link": m.meeting_link,
        "started_at": m.started_at.isoformat() if m.started_at else None,
        "ended_at": m.ended_at.isoformat() if m.ended_at else None,
        "state": m.state,
    } for m in meetings]
    
    return all_meetings_data
    
# API Endpoints to show meeting transcription as a whole
@router.get("/view-transcripts")
async def get_transcript(request: Request, meeting_id: str):
    # 1. Fetch meeting to ensure it exists and belongs to the tenant
    tenant = request.state.tenant
    meeting = await Meeting.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    
    # Ensure meeting belongs to the current tenant
    if meeting.created_by.ref.id != tenant.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: This meeting does not belong to your tenant")

    # 2. Fetch all transcript segments sorted by timestamp
    transcripts = await Transcripts.find(Transcripts.meeting_id.id == meeting.id).sort(+Transcripts.timestamp_ms).to_list()

    if not transcripts:
        return JSONResponse(content={"transcript": "No transcript available yet."})

    # 3. Concatenate with Speaker Grouping and Timestamps
    formatted_transcript = []
    current_speaker = None
    current_buffer = []

    for t in transcripts:
        # Format timestamp for this specific segment
        time_str = datetime.fromtimestamp(t.timestamp_ms / 1000, tz=timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        segment_text = f"[{time_str}] {t.transcript}"

        if t.speaker_name != current_speaker:
            # Flush previous speaker's text
            if current_speaker is not None:
                formatted_transcript.append(f"{current_speaker}: {' '.join(current_buffer)}")
            
            # Start new speaker
            current_speaker = t.speaker_name
            current_buffer = [segment_text]
        else:
            # Continue same speaker
            current_buffer.append(segment_text)
    
    # Flush last buffer
    if current_speaker is not None:
        formatted_transcript.append(f"{current_speaker}: {' '.join(current_buffer)}")

    full_text = "\n\n".join(formatted_transcript)

    return JSONResponse(content={
        "transcript": full_text
    })


# API Endpoints to implement later
@router.get("/get_participants/{meeting_id}")
async def get_meeting_participants(request: Request, meeting_id: str):
    pass

@router.post("/create_physical_meeting")
async def create_physical_meeting(request: Request):
    pass