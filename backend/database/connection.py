# Database Connection
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.models import User, Tenant, ActionItems, Meeting, Participants, Transcripts, Team, Billing
import asyncio
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
DB_NAME = os.getenv("DB_NAME", "test")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

async def init_db():
    await init_beanie(db, document_models=[User, Tenant, ActionItems, Meeting, Participants, Transcripts, Team, Billing])
    