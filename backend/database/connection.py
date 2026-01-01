# Database Connection
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.user import User
from models.tenant import Tenant
import asyncio

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "test"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

async def init_db():
    await init_beanie(db, document_models=[User, Tenant])