import asyncio
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath("."))

from backend.shared.database import get_database, close_database
from backend.auth.security import hash_password

async def seed_user():
    db = get_database()
    print("--- Seeding Demo User Account ---")

    email = "demo@example.com"
    password = "password123"

    existing = await db.users.find_one({"email": email})
    if existing:
        print(f"Demo user already exists: {email} / {password}")
        await close_database()
        return

    hashed = hash_password(password)
    user_doc = {
        "name": "Demo Consumer",
        "email": email,
        "password_hash": hashed,
        "created_at": datetime.now(timezone.utc)
    }

    res = await db.users.insert_one(user_doc)
    print(f"Created demo user successfully!")
    print(f"  - User ID: {res.inserted_id}")
    print(f"  - Email: {email}")
    print(f"  - Password: {password}")

    await close_database()

if __name__ == "__main__":
    asyncio.run(seed_user())
