# backend/database.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.database import Database
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment variable
MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise ValueError("MONGODB_URL environment variable is not set")

# MongoDB client instance
client = AsyncIOMotorClient(MONGODB_URL)

# Get database instance
db = client.get_database("openlicensemediadb")

# Define collections
users_collection = db.users
search_history_collection = db.search_history
bookmarks_collection = db.bookmarks

# Dependency to get DB connection
async def get_db():
    """
    Dependency that yields a MongoDB connection.
    """
    try:
        yield db
    except Exception as e:
        print(f"Database connection error: {e}")