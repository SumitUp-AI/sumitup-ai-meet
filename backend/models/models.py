from pydantic import BaseModel, Field
from beanie import Document, Link
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from enum import Enum
import secrets
import json
from config.settings import settings
from cryptography.fernet import Fernet, InvalidToken
import logging

logger = logging.getLogger(__name__)

# ============================================
# ENCRYPTION UTILITIES
# ============================================

class EncryptionManager:
    """Handles encryption/decryption of sensitive meeting data"""
    
    _cipher: Optional[Fernet] = None
    _encryption_key: Optional[str] = None
    
    @classmethod
    def _get_cipher(cls) -> Fernet:
        """Get or create Fernet cipher instance"""
        if cls._cipher is None:
            # Get encryption key from environment
            cls._encryption_key = settings.encryption_key
            if not cls._encryption_key:
                # Generate a key for development (in production, always set in env)
                cls._encryption_key = Fernet.generate_key().decode()
                logger.warning(f"No ENCRYPTION_KEY found. Generated temporary key. For production, set ENCRYPTION_KEY in .env")
            cls._cipher = Fernet(cls._encryption_key.encode())
        return cls._cipher
    
    @classmethod
    def encrypt(cls, text: str) -> Optional[str]:
        """Encrypt sensitive text data"""
        if not text:
            return None
        try:
            cipher = cls._get_cipher()
            encrypted = cipher.encrypt(text.encode())
            return encrypted.decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            return None
    
    @classmethod
    def decrypt(cls, encrypted_text: Optional[str]) -> Optional[str]:
        """Decrypt sensitive text data"""
        if not encrypted_text:
            return None
        try:
            cipher = cls._get_cipher()
            decrypted = cipher.decrypt(encrypted_text.encode())
            return decrypted.decode()
        except InvalidToken:
            logger.error("Invalid encryption token - possible key mismatch")
            return None
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            return None


class EncryptedField:
    """
    Descriptor for automatic encryption/decryption of model fields
    """
    def __init__(self, encrypted_field_name: str):
        self.encrypted_field_name = encrypted_field_name
    
    def __get__(self, instance, owner):
        if instance is None:
            return self
        encrypted_value = getattr(instance, self.encrypted_field_name, None)
        if encrypted_value:
            return EncryptionManager.decrypt(encrypted_value)
        return None
    
    def __set__(self, instance, value):
        if value:
            encrypted = EncryptionManager.encrypt(value)
            setattr(instance, self.encrypted_field_name, encrypted)
        else:
            setattr(instance, self.encrypted_field_name, None)


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
    
    # ENCRYPTED FIELDS - Meeting summary (sensitive)
    _summary_encrypted: Optional[str] = Field(default=None, alias="_summary_encrypted")
    summary_status: MeetingSummaryStatus = MeetingSummaryStatus.PENDING
    summary_error: Optional[str] = None
    
    # Property for automatic encryption/decryption
    @property
    def summary(self) -> Optional[str]:
        if self._summary_encrypted:
            return EncryptionManager.decrypt(self._summary_encrypted)
        return None
    
    @summary.setter
    def summary(self, value: Optional[str]):
        if value:
            self._summary_encrypted = EncryptionManager.encrypt(value)
        else:
            self._summary_encrypted = None
    
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
    
    # ENCRYPTED FIELD - Transcript text (most sensitive)
    _transcript_encrypted: Optional[str] = Field(default=None, alias="_transcript_encrypted")
    
    @property
    def transcript(self) -> Optional[str]:
        if self._transcript_encrypted:
            return EncryptionManager.decrypt(self._transcript_encrypted)
        return None
    
    @transcript.setter
    def transcript(self, value: Optional[str]):
        if value:
            self._transcript_encrypted = EncryptionManager.encrypt(value)
        else:
            self._transcript_encrypted = None
    
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


# ============================================
# MIGRATION HELPER
# ============================================

async def migrate_existing_data():
    """
    One-time migration script to encrypt existing plaintext data.
    Run this after adding encryption to your models.
    """
    logger.info("Starting data migration for encryption...")
    
    # Migrate Meetings
    meetings = await Meeting.find(Meeting._summary_encrypted == None).to_list()
    for meeting in meetings:
        if meeting._summary_encrypted is None and meeting.summary:
            # The setter will encrypt it
            meeting.summary = meeting.summary
            await meeting.save()
    logger.info(f"Migrated {len(meetings)} meetings")
    
    # Migrate Transcripts
    transcripts = await Transcripts.find(Transcripts._transcript_encrypted == None).to_list()
    for transcript in transcripts:
        if transcript._transcript_encrypted is None and transcript.transcript:
            transcript.transcript = transcript.transcript
            await transcript.save()
    logger.info(f"Migrated {len(transcripts)} transcripts")
    
    logger.info("Migration complete!")