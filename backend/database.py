import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.database import Database
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv('MONGODB_URL') 

if not MONGODB_URL:
    raise ValueError("MongoDB connection string is not set. Check your environment variables.")

try:
    client = AsyncIOMotorClient(
        MONGODB_URL, 
        maxPoolSize=50,
        minPoolSize=10,
        waitQueueTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=5000
    )

    DB_NAME = os.getenv('MONGO_DB_NAME', 'openlicensemediadb')
    db = client.get_database(DB_NAME)

    users_collection = db.users
    search_history_collection = db.search_history
    bookmarks_collection = db.bookmarks

except Exception as e:
    print(f"Critical MongoDB connection error: {e}")
    raise

async def get_db():
    """
    Dependency that yields a MongoDB connection.
    """
    try:
        yield db
    except Exception as e:
        print(f"Database connection error: {e}")
        raise