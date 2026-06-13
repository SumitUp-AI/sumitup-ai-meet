from pydantic import BaseModel, Field
from beanie import Document, Link
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from enum import Enum
import secrets

import logging

logger = logging.getLogger(__name__)


# ============================================
# MODELS
# ============================================

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
    
    is_active: bool = True
    last_login: Optional[datetime] = None
    profile_picture: Optional[str] = None
    
    class Settings:
        name = "users"


class TenantType(str, Enum):
    normal = "normal"
    education = "education"
    organization = "organization"


DEFAULT_SETTINGS = {
    "max_meetings": 15,
    "recording_enabled": False,
    "realtime_transcription": False,
    "summarization_and_action_items": True,
    "billing_mode": True
}


class Tenant(Document):
    tenant_type: TenantType = TenantType.normal
    domain: str
    settings: dict = Field(default_factory=lambda: DEFAULT_SETTINGS)
    zoom_connected: bool = False
    zoom_access_token: Optional[str] = None
    zoom_refresh_token: Optional[str] = None
    
    class Settings:
        name = "tenants"


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
    ready = "ready"
    joining = "joining"
    joined_not_recording = "joined_not_recording"
    joined_recording = "joined_recording"
    leaving = "leaving"
    post_processing = "post_processing"
    fatal_error = "fatal_error"
    waiting_room = "waiting_room"
    ended = "ended"
    data_deleted = "data_deleted"
    scheduled = "scheduled"
    staged = "staged"
    joined_recording_paused = "joined_recording_paused"
    joining_breakout_room = "joining_breakout_room"
    leaving_breakout_room = "leaving_breakout_room"
    joined_recording_permission_denied = "joined_recording_permission_denied"


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
    last_state_change_time: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    
    # Plain text fields - no encryption
    summary: Optional[str] = None
    summary_status: MeetingSummaryStatus = MeetingSummaryStatus.PENDING
    summary_error: Optional[str] = None
    
    class Settings:
        name = "meeting"


class ActionItems(Document):
    meeting: "Link[Meeting]"
    title: str
    assignee: Optional[str] = None
    description: Optional[str] = None
    deadline: datetime
    confidence: int = None
    
    class Settings:
        name = "action_items"


class Participants(Document):
    tenant: "Link[Tenant]"
    meeting: "Link[Meeting]"
    role: str
    
    class Settings:
        name = "participants"


class Transcripts(Document):
    meeting_id: "Link[Meeting]"
    speaker_id: str
    speaker_name: str
    duration_ms: int
    timestamp_ms: int
    
    # Plain text field - no encryption
    transcript: str
    
    class Settings:
        name = "transcripts"


class Embedding(Document):
    meeting_id: "Link[Meeting]"
    chunk: str
    vector_embedding: list[float]

    class Settings:
        name = "embedding"


class InvitationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"


class TeamInvitation(Document):
    meeting: "Link[Meeting]"
    invited_by: "Link[User]"
    invited_user: "Link[User]"
    invitation_token: str
    custom_message: Optional[str] = None
    status: InvitationStatus = InvitationStatus.PENDING
    
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=7))
    responded_at: Optional[datetime] = None
    
    @property
    def is_expired(self) -> bool:
        expires = self.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) > expires
    
    @property
    def is_pending(self) -> bool:
        return self.status == InvitationStatus.PENDING and not self.is_expired
    
    @staticmethod
    def generate_invitation_token() -> str:
        return secrets.token_urlsafe(32)
    
    class Settings:
        name = "team_invitations"
        indexes = [
            "invitation_token",
            "invited_user",
            "meeting",
            "status"
        ]


class MeetingParticipant(Document):
    meeting: "Link[Meeting]"
    user: "Link[User]"
    role: str = "participant"
    invitation: Optional["Link[TeamInvitation]"] = None
    joined_at: Optional[datetime] = None
    left_at: Optional[datetime] = None
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Settings:
        name = "meeting_participants"
        indexes = [
            "meeting",
            "user",
            ("meeting", "user")
        ]


class Team(Document):
    user_id: "Link[Tenant]"
    team_name: str
    organization: str
    role: str
    
    class Settings:
        name = "team"


class Mode(str, Enum):
    self_host = "Self_Hosted"
    cloud = "Cloud"
    partial_self_hosted = "Partial_Self_Hosted"


class MinimumHour(int, Enum):
    cloud_version = 6
    self_hosted = 0
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