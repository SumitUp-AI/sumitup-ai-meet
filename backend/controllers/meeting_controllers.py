from fastapi import HTTPException, APIRouter, Request
from fastapi.responses import JSONResponse
from core.helpers.helpers import AttendeeBot
from core.utils.process_meeting import ProcessMeeting
from models.models import MeetingPlatform, Meeting, User, Tenant, Participants, MeetingState, Transcripts
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

class LeaveMeetingPayload(BaseModel):
    meeting_id: str



@router.post("/create_meeting")
async def create_meeting(request: Request, payload: CreateMeeting):
    meeting_url = payload.meeting_url
    processor = ProcessMeeting(meeting_url=meeting_url)
    detected_platform = processor.detect_meeting_platform()

    try: 
        detected_platform = MeetingPlatform(detected_platform)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Url invalid or Platform not supported")
    
    # 1. Resolve Dependencies (Picking first available for now)
    user = await User.find_one()
    tenant = await Tenant.find_one()
    
    if not user or not tenant:
        raise HTTPException(status_code=500, detail="User or Tenant configuration missing in DB")

    # 2. Create Participant Entry (The Host/Bot Requestor)
    participant = Participants(user_id=user.id, role="host")
    await participant.save()
    
    # 3. Save Meeting to DB
    meeting = Meeting(
        name=payload.name,
        meeting_link=meeting_url,
        platform=detected_platform,
        created_by=user.id,
        tenant_id=tenant.id,
        participant_id=participant.id,
        started_at=datetime.now(timezone.utc),
        ended_at=None,
    )
    await meeting.save()

    # 4. Trigger Bot
    bot_api_key = os.getenv("ATTENDEE_API_KEY") 
    if not bot_api_key:
         raise HTTPException(status_code=500, detail="ATTENDEE_API_KEY not configured")

    try:
        bot = AttendeeBot(
            bot="SumitUp Bot",
            api_key=bot_api_key,
            meeting_url=meeting_url,
            provider="assemblyai", # Defaulting provider
            meeting=meeting
        )
        
        result = await bot.join_meeting()
        # The bot_id is automatically saved to 'meeting' object by join_meeting() logic
        
        return JSONResponse(content={
            "message": "Bot Initiated", 
            "meeting_id": str(meeting.id), 
            "bot_data": result
        })
    except Exception as e:

        meeting.state = MeetingState.fatal_error
        await meeting.save()
        raise HTTPException(status_code=500, detail=f"Bot failed to join: {str(e)}")
    

@router.post("/leave_meeting")
async def leave_meeting_endpoint(request: Request, payload: LeaveMeetingPayload):

    meeting = await Meeting.get(payload.meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    bot_api_key = os.getenv("ATTENDEE_API_KEY") 
    if not bot_api_key:
         raise HTTPException(status_code=500, detail="ATTENDEE_API_KEY requested but not found")

    bot = AttendeeBot(
        bot="SumitUp Bot", 
        api_key=bot_api_key, 
        meeting_url=meeting.meeting_link, 
        provider="assemblyai", 
        meeting=meeting
    )

    try:
        await bot.leave_meeting()
        return JSONResponse(content={"message": "Bot left the meeting"})
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Failed to leave: {str(e)}")


@router.post("/create_physical_meeting")
async def create_physical_meeting(request: Request):
    pass

@router.get("/get_all_meetings")
async def get_all_meetings_information(request: Request):
    meetings = await Meeting.find_all().sort(-Meeting.started_at).to_list()
    
    if not meetings:
        return []
    
    all_meetings_data = [{
        "id": str(m.id),
        "name": m.name,
        "platform": m.platform,
        "meeting_link": m.meeting_link,
        "started_at": m.started_at.isoformat() if m.started_at else None,
        "state": m.state,
    } for m in meetings]
    
    return all_meetings_data
    

@router.get("/get_meeting_status/{meeting_id}")
async def get_current_meeting_status(request: Request, meeting_id: str):
    # We have to implement Websocket here for realtime update for status of meeting
    pass



@router.get("/transcript")
async def get_transcript(meeting_id: str):
    # 1. Fetch meeting to ensure it exists
    meeting = await Meeting.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

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
        "meeting_id": meeting_id,
        "transcript": full_text
    })
