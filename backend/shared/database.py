from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.shared.config import get_settings
from typing import Optional

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

db_manager = DatabaseManager()

def get_database() -> AsyncIOMotorDatabase:
    if db_manager.db is None:
        settings = get_settings()
        db_manager.client = AsyncIOMotorClient(settings.mongodb_uri)
        db_manager.db = db_manager.client[settings.mongodb_database]
    return db_manager.db

async def close_database():
    if db_manager.client is not None:
        db_manager.client.close()
        db_manager.client = None
        db_manager.db = None
