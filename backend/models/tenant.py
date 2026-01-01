from beanie import Document, Link
from pydantic import BaseModel
from typing import Optional, TYPE_CHECKING
from datetime import datetime


if TYPE_CHECKING:
    from models.user import User

class Tenant(Document):
    user_id: "Link[User]"
    tenant_type: str
    domain: Optional[str] = None
    settings: None
    
    class Settings:
        name = "tenants"

