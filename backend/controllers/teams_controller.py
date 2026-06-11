"""
Teams Controller - Handles team member invitations and management
Provides APIs for inviting SumitUp users to meetings and managing team interactions
"""

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import secrets

# Import models
from models.models import (
    User, Meeting, TeamInvitation, MeetingParticipant, 
    InvitationStatus, UserRole
)

# Import email service
from integrations.email.email_service import EmailService

# Import middleware for rate limiting
from middlewares.limiter import limiter

router = APIRouter(
    prefix="/api/v1",
    tags=["Teams & Invitations"]
)

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class InviteTeamMemberRequest(BaseModel):
    """Request model for inviting team members to a meeting"""
    meeting_id: str
    user_emails: List[str]  # Changed from EmailStr to str
    custom_message: Optional[str] = None

class RespondToInvitationRequest(BaseModel):
    """Request model for responding to an invitation"""
    invitation_token: str
    response: str  # "accept" or "decline"

class TeamMemberResponse(BaseModel):
    """Response model for team member information"""
    id: str
    name: str
    email: str
    profile_picture: Optional[str]
    last_login: Optional[str]
    is_active: bool
    role: str

class InvitationResponse(BaseModel):
    """Response model for invitation information"""
    id: str
    meeting_name: str
    meeting_platform: str
    invited_by_name: str
    custom_message: Optional[str]
    status: str
    sent_at: str
    expires_at: str

# ============================================================================
# TEAM MEMBER ENDPOINTS
# ============================================================================

@router.get("/team/members")
@limiter.limit("10/minute")
async def get_team_members(request: Request) -> List[TeamMemberResponse]:
    """
    Get all team members (users in the same tenant)
    Returns list of users excluding the current user
    """
    try:
        # Get current tenant from middleware
        tenant = request.state.tenant
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Tenant information missing"
            )

        # Get current user from request state (set by auth middleware)
        current_user_id = getattr(request.state, 'user_id', None)
        
        # Find all users in the same tenant (excluding current user)
        users = await User.find(User.tenant_id.id == tenant.id).to_list()
        
        # Filter out the current user client-side (simpler than chaining queries)
        if current_user_id:
            users = [u for u in users if str(u.id) != str(current_user_id)]

        # Transform to response format
        team_members = []
        for user in users:
            team_members.append(TeamMemberResponse(
                id=str(user.id),
                name=user.name,
                email=user.email,
                profile_picture=user.profile_picture,
                last_login=user.last_login.isoformat() if user.last_login else None,
                is_active=user.is_active,
                role=user.role.value
            ))

        return team_members

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch team members: {str(e)}"
        )

# ============================================================================
# INVITATION ENDPOINTS
# ============================================================================

@router.post("/team/invite")
@limiter.limit("5/minute")  # Rate limit invitation sending
async def invite_team_members(
    request: Request, 
    payload: InviteTeamMemberRequest
) -> JSONResponse:
    """
    Invite team members to a meeting
    Validates users exist, creates invitations, and sends emails
    """
    try:
        # Get current tenant and user
        tenant = request.state.tenant
        current_user_id = getattr(request.state, 'user_id', None)
        
        if not tenant or not current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authentication information missing"
            )

        # Validate meeting exists and user has permission
        meeting = await Meeting.get(payload.meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found"
            )

        # Check if current user created the meeting (only hosts can invite)
        if str(meeting.created_by.ref.id) != str(tenant.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only meeting creators can invite participants"
            )

        # Get current user for invitation details
        current_user = await User.get(current_user_id)
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Current user not found"
            )

        # Validate invited users exist in SumitUp and are active
        invited_users = []
        for email in payload.user_emails:
            user = await User.find_one(
                User.email == email,
                User.is_active == True
            )
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User with email '{email}' is not registered on SumitUp"
                )
            invited_users.append(user)

        # Create invitations and send emails
        email_service = EmailService()
        created_invitations = []
        
        for user in invited_users:
            # Skip if this user already has a pending invitation for this meeting
            existing_invitation = await TeamInvitation.find_one(
                TeamInvitation.meeting.id == meeting.id,
                TeamInvitation.invited_user.id == user.id
            )
            if existing_invitation and existing_invitation.status == InvitationStatus.PENDING:
                continue
            
            # Create new invitation
            invitation = TeamInvitation(
                meeting=meeting,
                invited_by=current_user,
                invited_user=user,
                invitation_token=TeamInvitation.generate_invitation_token(),
                custom_message=payload.custom_message,
                status=InvitationStatus.PENDING
            )
            
            await invitation.save()
            created_invitations.append(invitation)
            
            # Send invitation email
            try:
                await email_service.send_meeting_invitation(
                    to_email=user.email,
                    meeting_data={
                        "meeting_name": meeting.name or "Untitled Meeting",
                        "meeting_platform": meeting.platform.value,
                        "meeting_link": meeting.meeting_link or "",  # Actual join link
                        "inviter_name": current_user.name,
                        "custom_message": payload.custom_message
                    },
                    invitation_token=invitation.invitation_token
                )
            except Exception as email_error:
                print(f"Failed to send email to {user.email}: {str(email_error)}")
                # Continue with other invitations even if one email fails

        return JSONResponse(
            content={
                "message": f"Successfully sent {len(created_invitations)} invitations",
                "invitations_sent": len(created_invitations),
                "total_requested": len(payload.user_emails)
            },
            status_code=status.HTTP_201_CREATED
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send invitations: {str(e)}"
        )

@router.get("/team/invitation/{token}")
async def get_invitation_by_token(token: str) -> JSONResponse:
    """
    Fetch a single invitation by its token.
    Used by the frontend invitation response page to show invitation details.
    This endpoint is public — no auth required since it's accessed from email links.
    """
    try:
        invitation = await TeamInvitation.find_one(
            TeamInvitation.invitation_token == token
        )

        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or already responded to"
            )

        # Fetch related data for display
        meeting = await invitation.meeting.fetch()
        invited_by = await invitation.invited_by.fetch()

        return JSONResponse(
            content={
                "id": str(invitation.id),
                "meeting_name": meeting.name or "Untitled Meeting",
                "meeting_platform": meeting.platform.value,
                "invited_by_name": invited_by.name,
                "custom_message": invitation.custom_message,
                "status": invitation.status.value,
                "sent_at": invitation.sent_at.isoformat(),
                "expires_at": invitation.expires_at.isoformat(),
            },
            status_code=status.HTTP_200_OK
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch invitation: {str(e)}"
        )


@router.post("/team/respond")
async def respond_to_invitation(payload: RespondToInvitationRequest) -> JSONResponse:
    """
    Respond to a meeting invitation (accept or decline)
    Updates invitation status and creates participant record if accepted
    """
    try:
        # Validate response
        if payload.response not in ["accept", "decline"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Response must be 'accept' or 'decline'"
            )

        # Find invitation by token
        invitation = await TeamInvitation.find_one(
            TeamInvitation.invitation_token == payload.invitation_token
        )
        
        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid invitation token"
            )

        # Check if invitation is still valid
        if invitation.status != InvitationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has already been responded to"
            )

        if invitation.is_expired:
            # Update status to expired
            invitation.status = InvitationStatus.EXPIRED
            await invitation.save()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invitation has expired"
            )

        # Update invitation status
        invitation.status = (
            InvitationStatus.ACCEPTED if payload.response == "accept" 
            else InvitationStatus.DECLINED
        )
        invitation.responded_at = datetime.now(timezone.utc)
        await invitation.save()

        # If accepted, create participant record
        if payload.response == "accept":
            # Check if participant already exists
            existing_participant = await MeetingParticipant.find_one(
                MeetingParticipant.meeting.id == invitation.meeting.id,
                MeetingParticipant.user.id == invitation.invited_user.id
            )
            
            if not existing_participant:
                participant = MeetingParticipant(
                    meeting=invitation.meeting,
                    user=invitation.invited_user,
                    role="participant",
                    invitation=invitation
                )
                await participant.save()

        # Notify the meeting host about the response
        try:
            meeting = await invitation.meeting.fetch()
            invited_user = await invitation.invited_user.fetch()
            host = await invitation.invited_by.fetch()
            email_service = EmailService()
            await email_service.send_invitation_response_notification(
                to_email=host.email,
                response_data={
                    "user_name": invited_user.name,
                    "meeting_name": meeting.name or "Untitled Meeting",
                    "response": invitation.status.value
                }
            )
        except Exception:
            pass  # Don't fail the response if notification email fails

        return JSONResponse(
            content={
                "message": f"Invitation {payload.response}ed successfully",
                "status": invitation.status.value
            },
            status_code=status.HTTP_200_OK
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to respond to invitation: {str(e)}"
        )

@router.get("/team/invitations")
@limiter.limit("10/minute")
async def get_my_invitations(request: Request) -> List[InvitationResponse]:
    """
    Get all invitations for the current user
    Returns pending, accepted, and declined invitations
    """
    try:
        # Get current user — user_id from JWT is a string, convert for lookup
        current_user_id = getattr(request.state, 'user_id', None)
        if not current_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User authentication required"
            )

        # Fetch all invitations where this user is the invitee
        all_invitations = await TeamInvitation.find().to_list()
        invitations = [
            inv for inv in all_invitations
            if str(inv.invited_user.ref.id) == str(current_user_id)
        ]
        # Sort by most recent first
        invitations.sort(key=lambda x: x.sent_at, reverse=True)

        # Transform to response format
        invitation_responses = []
        for invitation in invitations:
            # Fetch related data
            meeting = await invitation.meeting.fetch()
            invited_by = await invitation.invited_by.fetch()
            
            invitation_responses.append(InvitationResponse(
                id=str(invitation.id),
                meeting_name=meeting.name or "Untitled Meeting",
                meeting_platform=meeting.platform.value,
                invited_by_name=invited_by.name,
                custom_message=invitation.custom_message,
                status=invitation.status.value,
                sent_at=invitation.sent_at.isoformat(),
                expires_at=invitation.expires_at.isoformat()
            ))

        return invitation_responses

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch invitations: {str(e)}"
        )

# ============================================================================
# MEETING PARTICIPANT ENDPOINTS
# ============================================================================

@router.get("/meeting/{meeting_id}/participants")
@limiter.limit("10/minute")
async def get_meeting_participants(request: Request, meeting_id: str):
    """
    Get all participants for a specific meeting
    Returns confirmed participants and pending invitations
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

        # Get all invitations for this meeting, filter pending ones
        all_invitations = await TeamInvitation.find(
            TeamInvitation.meeting.id == meeting.id
        ).to_list()
        pending_invitations = [
            inv for inv in all_invitations
            if inv.status == InvitationStatus.PENDING
        ]

        # Format response
        confirmed_participants = []
        for participant in participants:
            user = await participant.user.fetch()
            confirmed_participants.append({
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": participant.role,
                "status": "confirmed",
                "joined_at": participant.joined_at.isoformat() if participant.joined_at else None
            })

        pending_participants = []
        for invitation in pending_invitations:
            user = await invitation.invited_user.fetch()
            pending_participants.append({
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": "participant",
                "status": "pending",
                "invited_at": invitation.sent_at.isoformat()
            })

        return JSONResponse(
            content={
                "meeting_id": meeting_id,
                "confirmed_participants": confirmed_participants,
                "pending_invitations": pending_participants,
                "total_confirmed": len(confirmed_participants),
                "total_pending": len(pending_participants)
            },
            status_code=status.HTTP_200_OK
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch meeting participants: {str(e)}"
        )