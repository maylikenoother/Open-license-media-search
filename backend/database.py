# backend/database.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.database import Database
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment variable (prioritize Render's env var)
MONGODB_URL = os.getenv('MONGODB_URL') 

if not MONGODB_URL:
    raise ValueError("MongoDB connection string is not set. Check your environment variables.")

# MongoDB client instance with connection pooling and better error handling
try:
    client = AsyncIOMotorClient(
        MONGODB_URL, 
        maxPoolSize=50,  # Adjust based on your needs
        minPoolSize=10,
        waitQueueTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=5000
    )

    # Get database instance (use environment variable or fallback to default)
    DB_NAME = os.getenv('MONGO_DB_NAME', 'openlicensemediadb')
    db = client.get_database(DB_NAME)

    # Define collections
    users_collection = db.users
    search_history_collection = db.search_history
    bookmarks_collection = db.bookmarks

except Exception as e:
    print(f"Critical MongoDB connection error: {e}")
    raise

# Dependency to get DB connection
async def get_db():
    """
    Dependency that yields a MongoDB connection.
    """
    try:
        yield db
    except Exception as e:
        print(f"Database connection error: {e}")
        raise