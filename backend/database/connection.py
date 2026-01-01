# Database Connection
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.models import User, Tenant
import asyncio

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "test"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

async def init_db():
    await init_beanie(db, document_models=[User, Tenant])
    
    # This is for testing only when data is inserted
    # if await User.count() == 0:
    #     await User(
    #         name="system",
    #         email="system@local",
    #         hashed_password="x",
    #         tenant_id=None,
    #     ).insert()