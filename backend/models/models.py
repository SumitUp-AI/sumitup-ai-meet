from pydantic import BaseModel, Field
from beanie import Document, Link
from typing import Optional
from datetime import datetime, timezone
from enum import Enum

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
    
    class Settings:
        name = "users"
        
# Models for Tenant

DEFAULT_SETTINGS = {
   "max_meetings": 6,
   "recording_enabled" : False,
   "realtime_transcription": False,
   "summarization_and_action_items": True,
   "max_team_members": 2,
   "dark_theme": False
}


class TenantType(str, Enum):
    normal = "normal"
    education = "education"
    organization = "organization"

class Tenant(Document):
    tenant_type: TenantType = TenantType.normal
    domain: str
    settings: dict = Field(default_factory=lambda: DEFAULT_SETTINGS)
    
    class Settings:
        name = "tenants"

# Models for Action Items
class ActionItems(Document):
    meeting_id: "Link[Meeting]"
    title: str
    assignee: str
    description: str
    deadline: datetime
    
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
    scheduled = "SCHEDULED"
    ongoing = "ONGOING"
    completed = "COMPLETED"
    processing = "PROCESSING"
    failed = "FAILED"
    
    
class Meeting(Document):
    created_by: "Link[User]"
    tenant_id: "Link[Tenant]"
    name: str
    platform: MeetingPlatform
    language: MeetingLanguage = MeetingLanguage.english
    participant_id: "Link[Participants]"
    transcript_id: "Link[Transcripts]"
    bot_id: Optional[str] = None
    meeting_link: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    state: MeetingState = MeetingState.scheduled
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    mermaid_syntax: str
    
    class Settings:
        name = "meeting"

# Model for Participants
class Participants(Document):
    user_id: "Link[User]"
    role: str
    
    class Settings:
        name = "participants"


# Model for Transcripts
class Transcripts(Document):
     speaker_id: "Link[User]"
     start: datetime
     end: datetime
     transcript: str
     
     class Settings:
         name = "transcripts"
         
# Model for Teams
class Team(Document):
    user_id: "Link[User]"
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