from pydantic import BaseModel, Field
from beanie import Document, Link
from typing import Optional
from datetime import datetime, timezone
from enum import Enum
import secrets

# Models for User
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"
    LEADER = "LEADER"


class User(Document):
    tenant_id: "Link[Tenant]"
    name: str
    email: str
    profile_url: Optional[str] = None
    hashed_password: str
    role: UserRole = UserRole.MEMBER
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # New fields for team functionality (non-breaking additions)
    is_active: bool = True  # User account status
    last_login: Optional[datetime] = None  # Track user activity
    profile_picture: Optional[str] = None  # User avatar URL
    
    class Settings:
        name = "users"
        
# Models for Tenant

DEFAULT_SETTINGS = {
   "max_meetings": 15,
   "recording_enabled" : False,
   "realtime_transcription": False,
   "summarization_and_action_items": True,
   "max_team_members": 3,
   "billing_mode": True
}


class TenantType(str, Enum):
    normal = "normal"
    education = "education"
    organization = "organization"

class Tenant(Document):
    tenant_type: TenantType = TenantType.normal
    domain: str
    settings: dict = Field(default_factory=lambda: DEFAULT_SETTINGS)
    zoom_connected: bool = False
    zoom_access_token: Optional[str] = None
    zoom_refresh_token: Optional[str] = None
    
    class Settings:
        name = "tenants"

# Models for Action Items
class ActionItems(Document):
    tenant: "Link[Tenant]"
    meeting: "Link[Meeting]"
    title: str = None
    assignee: str = None
    description: str = None
    deadline: datetime
    confidence: int = None
    class Settings:
        name = "action_items"
        
# Models for Meeting with Enums
class MeetingPlatform(str, Enum):
    zoom = "ZOOM"
    meet = "GMEET"
    teams = "MSTEAMS"
    by_voice = "VOICE"

class MeetingLanguage(str, Enum):
    english = "English"
    chinese = "Chinese"
    latin = "Latin"
    spanish = "Spanish"
    russian = "Russian"
    korean = "Korean"

class MeetingState(str, Enum):
    ready="ready"
    joining="joining"
    joined_not_recording="joined_not_recording"
    joined_recording="joined_recording"
    leaving="leaving"
    post_processing="post_processing"
    fatal_error="fatal_error"
    waiting_room="waiting_room"
    ended="ended"
    data_deleted="data_deleted"
    scheduled="scheduled"
    staged="staged"
    joined_recording_paused="joined_recording_paused"
    joining_breakout_room="joining_breakout_room"
    leaving_breakout_room="leaving_breakout_room"
    joined_recording_permission_denied="joined_recording_permission_denied"
    
class MeetingSummaryStatus(str, Enum):
    PENDING = "pending"
    READY = "ready"
    PROCESSING = "processing"
    FAILED = "failed"

class Meeting(Document):
    created_by: "Link[Tenant]"
    name: Optional[str] = None
    platform: MeetingPlatform
    language: MeetingLanguage = MeetingLanguage.english
    bot_id: Optional[str] = None
    meeting_link: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    state: Optional[MeetingState] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    last_state_change_time: Optional[datetime] = None
    summary: Optional[str] = None
    summary_status: MeetingSummaryStatus = MeetingSummaryStatus.PENDING
    summary_error: Optional[str] = None
    action_items_generated: bool = False
    participants_count: int = 0

    class Settings:
        name = "meeting"

# Model for Participants
class Participants(Document):
    tenant: "Link[Tenant]"
    meeting: "Link[Meeting]"
    role: str
    
    class Settings:
        name = "participants"


# Model for Transcripts
class Transcripts(Document):
     meeting_id: "Link[Meeting]"
     speaker_id: str
     speaker_name: str
     duration_ms: int
     timestamp_ms: int
     transcript: str
     
     class Settings:
         name = "transcripts"

# TEAM INVITATION MODELS - New additions for team functionality

class InvitationStatus(str, Enum):
    """Status of team invitations"""
    PENDING = "pending"      # Invitation sent, awaiting response
    ACCEPTED = "accepted"    # User accepted the invitation
    DECLINED = "declined"    # User declined the invitation
    EXPIRED = "expired"      # Invitation expired (7 days)

class TeamInvitation(Document):
    """
    Model for team meeting invitations
    Tracks invitations sent to SumitUp users for specific meetings
    """
    # Core relationships
    meeting: "Link[Meeting]"           # Which meeting they're invited to
    invited_by: "Link[User]"          # Who sent the invitation (meeting host)
    invited_user: "Link[User]"        # SumitUp user being invited
    
    # Invitation details
    invitation_token: str             # Unique token for accepting/declining
    custom_message: Optional[str] = None  # Optional message from host
    status: InvitationStatus = InvitationStatus.PENDING
    
    # Timestamps
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime              # Auto-set to 7 days from sent_at
    responded_at: Optional[datetime] = None  # When user responded
    
    def __init__(self, **data):
        """Initialize invitation with auto-expiration"""
        super().__init__(**data)
        # Set expiration to 7 days from now if not provided
        if not hasattr(self, 'expires_at') or self.expires_at is None:
            from datetime import timedelta
            self.expires_at = self.sent_at + timedelta(days=7)
    
    @property
    def is_expired(self) -> bool:
        """Check if invitation has expired"""
        return datetime.now(timezone.utc) > self.expires_at
    
    @property
    def is_pending(self) -> bool:
        """Check if invitation is still pending"""
        return self.status == InvitationStatus.PENDING and not self.is_expired
    
    @staticmethod
    def generate_invitation_token() -> str:
        """Generate a secure invitation token"""
        return secrets.token_urlsafe(32)
    
    class Settings:
        name = "team_invitations"
        indexes = [
            "invitation_token",       # For quick token lookups
            "invited_user",          # For user's invitation list
            "meeting",               # For meeting's invitation list
            "status"                 # For filtering by status
        ]

class MeetingParticipant(Document):
    """
    Model for confirmed meeting participants
    Created when user accepts invitation or is added directly
    """
    # Core relationships
    meeting: "Link[Meeting]"          # Which meeting
    user: "Link[User]"               # Which user
    
    # Participation details
    role: str = "participant"        # "host" or "participant"
    invitation: Optional["Link[TeamInvitation]"] = None  # Link to original invitation
    
    # Activity tracking
    joined_at: Optional[datetime] = None    # When they joined the meeting
    left_at: Optional[datetime] = None      # When they left the meeting
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "meeting_participants"
        indexes = [
            "meeting",               # For meeting participant lists
            "user",                  # For user's meeting history
            ("meeting", "user")      # Compound index for unique constraints
        ]
         
# Model for Teams
class Team(Document):
    user_id: "Link[Tenant]"
    team_name: str
    organization: str
    role: str
    
    class Settings:
        name = "team"

# Model for Billing
class Mode(str, Enum):
    self_host = "Self_Hosted"
    cloud = "Cloud"
    partial_self_hosted = "Partial_Self_Hosted"

class MinimumHour(int, Enum):
    cloud_version = 6
    self_hosted = 0 # For Users, using in Self Hosted Version
    pro_plan = 24
    
class Billing(Document):
    tenant_id: "Link[Tenant]"
    stripe_id: str
    payment_processed: bool
    plan_selected: str
    mode: Mode = Mode.cloud
    limited_hours: MinimumHour = MinimumHour.cloud_version
    
    class Settings:
        name = "Billing"