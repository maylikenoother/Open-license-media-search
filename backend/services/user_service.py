from typing import List, Dict, Any, Optional
from repositories.user_repository import UserRepository
from bson import ObjectId

class UserService:
    """
    Service for handling user-related operations.
    This service implements the business logic for user operations.
    """
    
    def __init__(self, user_repository: UserRepository):
        """Initialize with a user repository instance."""
        self.user_repository = user_repository
    
    async def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Get a user's profile information.
        
        Args:
            user_id: The user's ID
            
        Returns:
            Dict containing user profile information
            
        Raises:
            ValueError: If user not found
        """
        user = await self.user_repository.get_user_by_id(user_id)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        if "_id" in user and isinstance(user["_id"], ObjectId):
            user["_id"] = str(user["_id"])
        
        return {
            "id": user.get("id"),
            "username": user.get("username"),
            "email": user.get("email"),
            "created_at": user.get("created_at"),
            "is_admin": user.get("is_admin", False)
        }

    async def create_bookmark(self, 
                       user_id: str, 
                       media_id: str, 
                       media_url: str, 
                       media_type: str,
                       media_title: Optional[str] = None,
                       media_creator: Optional[str] = None,
                       media_license: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new bookmark for a user.
        
        Args:
            user_id: The user's ID
            media_id: The media's ID
            media_url: The media's URL
            media_type: The media's type
            media_title: The media's title (optional)
            media_creator: The media's creator (optional)
            media_license: The media's license (optional)
            
        Returns:
            Dict containing the created bookmark
            
        Raises:
            ValueError: If bookmark already exists
        """
        existing = await self.user_repository.get_bookmark_by_user_and_media(user_id, media_id)
        if existing:
            raise ValueError(f"Media item {media_id} is already bookmarked")

        bookmark_data = {
            "user_id": user_id,
            "media_id": media_id,
            "media_url": media_url,
            "media_type": media_type,
            "media_title": media_title,
            "media_creator": media_creator,
            "media_license": media_license
        }
        
        bookmark = await self.user_repository.create_bookmark(bookmark_data)
        
        if "_id" in bookmark and isinstance(bookmark["_id"], ObjectId):
            bookmark["_id"] = str(bookmark["_id"])
        
        return {
            "id": bookmark.get("_id"),
            "media_id": bookmark.get("media_id"),
            "media_url": bookmark.get("media_url"),
            "media_type": bookmark.get("media_type"),
            "media_title": bookmark.get("media_title"),
            "media_creator": bookmark.get("media_creator"),
            "media_license": bookmark.get("media_license"),
            "created_at": bookmark.get("created_at")
        }
    
    async def get_bookmarks(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all bookmarks for a user.
        
        Args:
            user_id: The user's ID
            
        Returns:
            List of bookmark dictionaries
        """
        bookmarks = await self.user_repository.get_bookmarks_by_user(user_id)
        
        return [
            {
                "id": str(bookmark.get("_id")),
                "media_id": bookmark.get("media_id"),
                "media_url": bookmark.get("media_url"),
                "media_type": bookmark.get("media_type"),
                "media_title": bookmark.get("media_title"),
                "media_creator": bookmark.get("media_creator"),
                "media_license": bookmark.get("media_license"),
                "created_at": bookmark.get("created_at")
            }
            for bookmark in bookmarks
        ]
    
    async def delete_bookmark(self, user_id: str, media_id: str) -> Dict[str, Any]:
        """
        Delete a bookmark.
        
        Args:
            user_id: The user's ID
            media_id: The media's ID
            
        Returns:
            Dict containing success message
            
        Raises:
            ValueError: If bookmark not found
        """
        result = await self.user_repository.delete_bookmark_by_user_and_media(user_id, media_id)
        
        if not result:
            raise ValueError(f"Bookmark for media item {media_id} not found")
        
        return {"message": "Bookmark deleted successfully"}
    
    async def save_search_history(self, 
                          user_id: str, 
                          search_query: str, 
                          search_params: Optional[Dict[str, Any]] = None,
                          search_results: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Save a search to the user's history.
        
        Args:
            user_id: The user's ID
            search_query: The search query
            search_params: Additional search parameters (optional)
            search_results: The search results (optional)
            
        Returns:
            Dict containing the created search history entry
        """
        result_count = None
        if search_results and "results" in search_results:
            result_count = len(search_results["results"])
        
        history_data = {
            "user_id": user_id,
            "search_query": search_query,
            "search_params": search_params,
            "search_results": search_results,
            "result_count": result_count
        }
        
        history = await self.user_repository.create_search_history(history_data)

        if "_id" in history and isinstance(history["_id"], ObjectId):
            history["_id"] = str(history["_id"])
        
        return {
            "id": history.get("_id"),
            "search_query": history.get("search_query"),
            "search_params": history.get("search_params"),
            "result_count": history.get("result_count"),
            "created_at": history.get("created_at")
        }
    
    async def get_search_history(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get search history for a user.
        
        Args:
            user_id: The user's ID
            limit: Maximum number of entries to return
            
        Returns:
            List of search history dictionaries
        """
        history_items = await self.user_repository.get_search_history_by_user(user_id, limit)
        
        return [
            {
                "id": str(item.get("_id")),
                "search_query": item.get("search_query"),
                "search_params": item.get("search_params"),
                "result_count": item.get("result_count"),
                "created_at": item.get("created_at")
            }
            for item in history_items
        ]
    
    async def delete_search_history(self, user_id: str, history_id: str) -> Dict[str, Any]:
        """
        Delete a search history entry.
        
        Args:
            user_id: The user's ID
            history_id: The history entry's ID
            
        Returns:
            Dict containing success message
            
        Raises:
            ValueError: If history entry not found
        """
        history = await self.user_repository.get_search_history_by_id(history_id)
        
        if not history or history.get("user_id") != user_id:
            raise ValueError(f"Search history entry {history_id} not found")
        
        result = await self.user_repository.delete_search_history(history_id)
        
        if not result:
            raise ValueError(f"Failed to delete search history entry {history_id}")
        
        return {"message": "Search history entry deleted successfully"}
    
    async def clear_search_history(self, user_id: str) -> Dict[str, Any]:
        """
        Clear all search history for a user.
        
        Args:
            user_id: The user's ID
            
        Returns:
            Dict containing success message with count
        """
        count = await self.user_repository.clear_search_history(user_id)
        
        return {
            "message": f"Search history cleared successfully",
            "entries_deleted": count
        }