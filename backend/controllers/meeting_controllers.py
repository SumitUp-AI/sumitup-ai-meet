from fastapi import HTTPException, APIRouter, Request, status
from fastapi.responses import JSONResponse
from core.helpers.helpers import AttendeeBot
from core.utils.process_meeting import ProcessMeeting
from models.models import (
    MeetingPlatform, Meeting, Participants, MeetingState, Transcripts,
    TeamInvitation, MeetingParticipant, InvitationStatus
)
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
        "is_owner": True,
    } for m in meetings]
    
    return all_meetings_data


@router.get("/get_shared_meetings")
async def get_shared_meetings(request: Request):
    """
    Returns meetings the current user was invited to and accepted.
    These are meetings owned by someone else but the user is a confirmed participant.
    """
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User authentication required")

    # Find all MeetingParticipant records for this user
    participants = await MeetingParticipant.find(
        MeetingParticipant.user.id == user_id
    ).to_list()

    if not participants:
        return []

    shared_meetings = []
    for p in participants:
        meeting = await p.meeting.fetch()
        if not meeting:
            continue
        shared_meetings.append({
            "id": str(meeting.id),
            "name": meeting.name,
            "platform": meeting.platform,
            "meeting_link": meeting.meeting_link,
            "started_at": meeting.started_at.isoformat() if meeting.started_at else None,
            "ended_at": meeting.ended_at.isoformat() if meeting.ended_at else None,
            "state": meeting.state,
            "is_owner": False,
        })

    return shared_meetings
    
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
    transcripts = await Transcripts.find(Transcripts.meeting_id == meeting).sort(+Transcripts.timestamp_ms).to_list()

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


# ============================================================================
# TEAM-RELATED MEETING ENDPOINTS - New additions for team functionality
# ============================================================================

@router.get("/meeting/{meeting_id}/team")
async def get_meeting_team_info(request: Request, meeting_id: str):
    """
    Get comprehensive team information for a meeting
    Returns confirmed participants, pending invitations, and invitation history
    """
    try:
        # Validate meeting exists and user has access
        tenant = request.state.tenant
        meeting = await Meeting.get(meeting_id)
        
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )

        if meeting.created_by.ref.id != tenant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this meeting"
            )

        # Get confirmed participants
        participants = await MeetingParticipant.find(
            MeetingParticipant.meeting.id == meeting.id
        ).to_list()

        # Get all invitations (pending, accepted, declined)
        invitations = await TeamInvitation.find(
            TeamInvitation.meeting.id == meeting.id
        ).sort(-TeamInvitation.sent_at).to_list()

        # Format confirmed participants
        confirmed_participants = []
        for participant in participants:
            user = await participant.user.fetch()
            confirmed_participants.append({
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "profile_picture": user.profile_picture,
                "role": participant.role,
                "status": "confirmed",
                "joined_at": participant.joined_at.isoformat() if participant.joined_at else None,
                "added_at": participant.added_at.isoformat()
            })

        # Format invitations by status
        pending_invitations = []
        accepted_invitations = []
        declined_invitations = []
        
        for invitation in invitations:
            user = await invitation.invited_user.fetch()
            invited_by = await invitation.invited_by.fetch()
            
            invitation_data = {
                "id": str(invitation.id),
                "user_id": str(user.id),
                "user_name": user.name,
                "user_email": user.email,
                "user_profile_picture": user.profile_picture,
                "invited_by": invited_by.name,
                "custom_message": invitation.custom_message,
                "sent_at": invitation.sent_at.isoformat(),
                "expires_at": invitation.expires_at.isoformat(),
                "responded_at": invitation.responded_at.isoformat() if invitation.responded_at else None,
                "is_expired": invitation.is_expired
            }
            
            if invitation.status == InvitationStatus.PENDING:
                pending_invitations.append(invitation_data)
            elif invitation.status == InvitationStatus.ACCEPTED:
                accepted_invitations.append(invitation_data)
            elif invitation.status == InvitationStatus.DECLINED:
                declined_invitations.append(invitation_data)

        return JSONResponse(
            content={
                "meeting_id": meeting_id,
                "meeting_name": meeting.name,
                "confirmed_participants": confirmed_participants,
                "pending_invitations": pending_invitations,
                "accepted_invitations": accepted_invitations,
                "declined_invitations": declined_invitations,
                "summary": {
                    "total_confirmed": len(confirmed_participants),
                    "total_pending": len(pending_invitations),
                    "total_accepted": len(accepted_invitations),
                    "total_declined": len(declined_invitations),
                    "total_invited": len(invitations)
                }
            },
            status_code=status.HTTP_200_OK
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch meeting team information: {str(e)}"
        )

@router.get("/meeting/{meeting_id}/participants/summary")
async def get_meeting_participants_summary(request: Request, meeting_id: str):
    """
    Get a quick summary of meeting participants
    Lightweight endpoint for displaying participant counts and basic info
    """
    try:
        # Validate meeting exists and user has access
        tenant = request.state.tenant
        meeting = await Meeting.get(meeting_id)
        
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )

        if meeting.created_by.ref.id != tenant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this meeting"
            )

        # Count participants and invitations
        confirmed_count = await MeetingParticipant.find(
            MeetingParticipant.meeting.id == meeting.id
        ).count()
        
        pending_count = await TeamInvitation.find(
            TeamInvitation.meeting.id == meeting.id,
            TeamInvitation.status == InvitationStatus.PENDING
        ).count()

        return JSONResponse(
            content={
                "meeting_id": meeting_id,
                "confirmed_participants": confirmed_count,
                "pending_invitations": pending_count,
                "total_team_size": confirmed_count + pending_count
            },
            status_code=status.HTTP_200_OK
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch participants summary: {str(e)}"
        )

# API Endpoints to implement later
@router.get("/get_participants/{meeting_id}")
async def get_meeting_participants(request: Request, meeting_id: str):
    """
    Legacy endpoint - redirects to new team endpoint
    Maintained for backward compatibility
    """
    return await get_meeting_team_info(request, meeting_id)

@router.post("/create_physical_meeting")
async def create_physical_meeting(request: Request):
    pass