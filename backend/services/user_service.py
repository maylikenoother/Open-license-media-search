# backend/services/user_service.py
from typing import List, Dict, Any, Optional
from repositories.user_repository import UserRepository

class UserService:
    """
    Service for handling user-related operations.
    This service implements the business logic for user operations.
    """
    
    def __init__(self, user_repository: UserRepository):
        """Initialize with a user repository instance."""
        self.user_repository = user_repository
    
    # User methods
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Get a user's profile information.
        
        Args:
            user_id: The user's ID
            
        Returns:
            Dict containing user profile information
            
        Raises:
            ValueError: If user not found
        """
        user = self.user_repository.get_user_by_id(user_id)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at,
            "is_admin": user.is_admin
        }
    
    # Bookmark methods
    def create_bookmark(self, 
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
        # Check if bookmark already exists
        existing = self.user_repository.get_bookmark_by_user_and_media(user_id, media_id)
        if existing:
            raise ValueError(f"Media item {media_id} is already bookmarked")
        
        # Create bookmark
        bookmark_data = {
            "user_id": user_id,
            "media_id": media_id,
            "media_url": media_url,
            "media_type": media_type,
            "media_title": media_title,
            "media_creator": media_creator,
            "media_license": media_license
        }
        
        bookmark = self.user_repository.create_bookmark(bookmark_data)
        
        return {
            "id": bookmark.id,
            "media_id": bookmark.media_id,
            "media_url": bookmark.media_url,
            "media_type": bookmark.media_type,
            "media_title": bookmark.media_title,
            "media_creator": bookmark.media_creator,
            "media_license": bookmark.media_license,
            "created_at": bookmark.created_at
        }
    
    def get_bookmarks(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all bookmarks for a user.
        
        Args:
            user_id: The user's ID
            
        Returns:
            List of bookmark dictionaries
        """
        bookmarks = self.user_repository.get_bookmarks_by_user(user_id)
        
        return [
            {
                "id": bookmark.id,
                "media_id": bookmark.media_id,
                "media_url": bookmark.media_url,
                "media_type": bookmark.media_type,
                "media_title": bookmark.media_title,
                "media_creator": bookmark.media_creator,
                "media_license": bookmark.media_license,
                "created_at": bookmark.created_at
            }
            for bookmark in bookmarks
        ]
    
    def delete_bookmark(self, user_id: str, media_id: str) -> Dict[str, Any]:
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
        result = self.user_repository.delete_bookmark_by_user_and_media(user_id, media_id)
        
        if not result:
            raise ValueError(f"Bookmark for media item {media_id} not found")
        
        return {"message": "Bookmark deleted successfully"}
    
    # Search history methods
    def save_search_history(self, 
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
        # Extract result count if results are provided
        result_count = None
        if search_results and "results" in search_results:
            result_count = len(search_results["results"])
        
        # Create history entry
        history_data = {
            "user_id": user_id,
            "search_query": search_query,
            "search_params": search_params,
            "search_results": search_results,
            "result_count": result_count
        }
        
        history = self.user_repository.create_search_history(history_data)
        
        return {
            "id": history.id,
            "search_query": history.search_query,
            "search_params": history.search_params,
            "result_count": history.result_count,
            "created_at": history.created_at
        }
    
    def get_search_history(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get search history for a user.
        
        Args:
            user_id: The user's ID
            limit: Maximum number of entries to return
            
        Returns:
            List of search history dictionaries
        """
        history_items = self.user_repository.get_search_history_by_user(user_id, limit)
        
        return [
            {
                "id": item.id,
                "search_query": item.search_query,
                "search_params": item.search_params,
                "result_count": item.result_count,
                "created_at": item.created_at
            }
            for item in history_items
        ]
    
    def delete_search_history(self, user_id: str, history_id: int) -> Dict[str, Any]:
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
        # Verify the history entry belongs to the user
        history = self.user_repository.get_search_history_by_id(history_id)
        
        if not history or history.user_id != user_id:
            raise ValueError(f"Search history entry {history_id} not found")
        
        # Delete the entry
        result = self.user_repository.delete_search_history(history_id)
        
        if not result:
            raise ValueError(f"Failed to delete search history entry {history_id}")
        
        return {"message": "Search history entry deleted successfully"}
    
    def clear_search_history(self, user_id: str) -> Dict[str, Any]:
        """
        Clear all search history for a user.
        
        Args:
            user_id: The user's ID
            
        Returns:
            Dict containing success message with count
        """
        count = self.user_repository.clear_search_history(user_id)
        
        return {
            "message": f"Search history cleared successfully",
            "entries_deleted": count
        }