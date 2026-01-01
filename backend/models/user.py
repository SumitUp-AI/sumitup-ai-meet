from pydantic import BaseModel, Field
from beanie import Document, Link
from typing import Optional, TYPE_CHECKING
from datetime import datetime, timezone
from enum import Enum

if TYPE_CHECKING:
    from models.tenant import Tenant

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


