# Database Connection
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from config.settings import settings
from models.models import User, Tenant, ActionItems, Meeting, Participants, Transcripts, Team, Billing, TeamInvitation, MeetingParticipant, Embedding
import asyncio

MONGO_URI = settings.mongo_uri
DB_NAME = settings.db_name
MONGODB_ATLAS_URI = settings.mongodb_atlas_uri

client = AsyncIOMotorClient(MONGODB_ATLAS_URI if MONGODB_ATLAS_URI else MONGO_URI, tz_aware=True)
db = client[DB_NAME]

async def init_db():
    await init_beanie(db, document_models=[User, Tenant, ActionItems, Meeting, Participants, Transcripts, Team, Billing, TeamInvitation, MeetingParticipant, Embedding])
    