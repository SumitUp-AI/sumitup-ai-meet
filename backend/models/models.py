from pydantic import Field
from beanie import Document, Link
from typing import Optional
from datetime import datetime, timezone, timedelta
from enum import Enum
import secrets


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"
    LEADER = "LEADER"


class User(Document):
    tenant_id: "Link[Tenant]"
    name: str
    email: str
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

class Tenant(Document):
    tenant_type: TenantType = TenantType.normal
    domain: str

    class Settings:
        name = "tenants"

class TenantSettings(Document):
    tenant: "Link[Tenant]"
    max_meeting_mins: int
    zoom_connected: bool = False
    zoom_access_token: Optional[str] = None
    zoom_refresh_token: Optional[str] = None

    class Settings:
        name = "tenant_settings"


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
    launching = "launching"
    completed = "completed"
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

class MeetingSTTProvider(str, Enum):
    deepgram = "deepgram"
    sarvam = "sarvam"
    openai = "openai"
    gladia = "gladia"
    assemblyai = "assemblyai"

class Meeting(Document):
    created_by: "Link[User]"
    tenant: "Link[Tenant]"
    name: Optional[str] = None
    platform: MeetingPlatform
    language: MeetingLanguage = MeetingLanguage.english
    bot_id: Optional[str] = None
    meeting_link: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    state: Optional[MeetingState] = None
    last_state_change_time: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    team: Optional["Link[Team]"] = None

    class Settings:
        name = "meeting"

class MeetingSummary(Document):
    meeting: "Link[Meeting]"
    summary_text: Optional[str] = None
    summary_status: MeetingSummaryStatus = MeetingSummaryStatus.PENDING
    summary_error: Optional[str] = None

    class Settings:
        name = "meeting_summary"


class ActionItems(Document):
    meeting: "Link[Meeting]"
    title: str
    assignee: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    confidence: Optional[int] = None
    
    class Settings:
        name = "action_items"


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


class MeetingInvitedParticipant(Document):
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

class TeamRole(str, Enum):
    member = 'member'
    leader = 'leader'
    moderator = 'moderator'

class Team(Document):
    tenant: "Link[Tenant]"
    team_name: str
    
    class Settings:
        name = "team"

class TeamMember(Document):
    team: "Link[Team]"
    user: "Link[User]"
    role: TeamRole = TeamRole.member

    class Settings:
        name = "team_members"

class BillingPlan(str, Enum):
    freemium = 'freemium'
    pro = 'pro'
    enterprise = 'enterprise'
    default = 'default'

class Currency(str, Enum):
    pkr = "PKR"
    us = "US"
    inr = "INR"
    yen = "YEN"
    dinar = "DINAR"
    euro = "EURO"
    default = "NONE"

class BillingSubscription(Document):
    tenant: "Link[Tenant]"
    gateway_name: str # Paddle and Lemon Squeezy for US Debit Card and PayPal Transaction, PayFast for Easypaisa, Jazzcash 
    gateway_subscription_id: str
    current_period_end: Optional[datetime] = None
    currency: Currency = Currency.default
    plan_selected: BillingPlan = BillingPlan.default
    amount: Optional[float] = 0.0
    payment_processed: bool
    
    class Settings:
        name = "Billing"