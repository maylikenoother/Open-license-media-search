# backend/repositories/user_repository.py
from typing import List, Optional, Dict, Any
from pymongo.database import Database
from bson import ObjectId
from datetime import datetime

class UserRepository:
    """
    Repository pattern implementation for user-related database operations.
    This class encapsulates all database interactions related to users.
    """
    
    def __init__(self, db: Database):
        self.db = db
        self.users_collection = db.users
        self.bookmarks_collection = db.bookmarks
        self.search_history_collection = db.search_history
    
    # User methods
    async def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get a user by their ID."""
        return await self.users_collection.find_one({"id": user_id})
    
    async def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get a user by their email."""
        return await self.users_collection.find_one({"email": email})
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict:
        """Create a new user."""
        user_data["created_at"] = datetime.now()
        result = await self.users_collection.insert_one(user_data)
        return {**user_data, "_id": result.inserted_id}
    
    async def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Optional[Dict]:
        """Update an existing user."""
        user = await self.get_user_by_id(user_id)
        if not user:
            return None
        
        # Don't update the ID
        if "_id" in user_data:
            del user_data["_id"]
        
        await self.users_collection.update_one(
            {"id": user_id},
            {"$set": user_data}
        )
        
        return await self.get_user_by_id(user_id)
    
    # Bookmark methods
    async def get_bookmark_by_id(self, bookmark_id: str) -> Optional[Dict]:
        """Get a bookmark by its ID."""
        return await self.bookmarks_collection.find_one({"_id": ObjectId(bookmark_id)})
    
    async def get_bookmark_by_user_and_media(self, user_id: str, media_id: str) -> Optional[Dict]:
        """Get a user's bookmark for a specific media item."""
        return await self.bookmarks_collection.find_one({
            "user_id": user_id,
            "media_id": media_id
        })
    
    async def get_bookmarks_by_user(self, user_id: str) -> List[Dict]:
        """Get all bookmarks for a specific user."""
        cursor = self.bookmarks_collection.find({"user_id": user_id})
        return await cursor.to_list(length=None)
    
    async def create_bookmark(self, bookmark_data: Dict[str, Any]) -> Dict:
        """Create a new bookmark."""
        bookmark_data["created_at"] = datetime.now()
        result = await self.bookmarks_collection.insert_one(bookmark_data)
        return {**bookmark_data, "_id": result.inserted_id}
    
    async def delete_bookmark(self, bookmark_id: str) -> bool:
        """Delete a bookmark by its ID."""
        result = await self.bookmarks_collection.delete_one({"_id": ObjectId(bookmark_id)})
        return result.deleted_count > 0
    
    async def delete_bookmark_by_user_and_media(self, user_id: str, media_id: str) -> bool:
        """Delete a user's bookmark for a specific media item."""
        result = await self.bookmarks_collection.delete_one({
            "user_id": user_id,
            "media_id": media_id
        })
        return result.deleted_count > 0
    
    # Search history methods
    async def get_search_history_by_id(self, history_id: str) -> Optional[Dict]:
        """Get a search history entry by its ID."""
        return await self.search_history_collection.find_one({"_id": ObjectId(history_id)})
    
    async def get_search_history_by_user(self, user_id: str, limit: int = 20) -> List[Dict]:
        """Get search history for a specific user, newest first."""
        cursor = self.search_history_collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=None)
    
    async def create_search_history(self, history_data: Dict[str, Any]) -> Dict:
        """Create a new search history entry."""
        history_data["created_at"] = datetime.now()
        result = await self.search_history_collection.insert_one(history_data)
        return {**history_data, "_id": result.inserted_id}
    
    async def delete_search_history(self, history_id: str) -> bool:
        """Delete a search history entry by its ID."""
        result = await self.search_history_collection.delete_one({"_id": ObjectId(history_id)})
        return result.deleted_count > 0
    
    async def clear_search_history(self, user_id: str) -> int:
        """Clear all search history for a specific user. Returns count of deleted entries."""
        result = await self.search_history_collection.delete_many({"user_id": user_id})
        return result.deleted_count