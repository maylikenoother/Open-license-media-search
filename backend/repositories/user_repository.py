# backend/repositories/user_repository.py
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from models import Users, Bookmark, SearchHistory

class UserRepository:
    """
    Repository pattern implementation for user-related database operations.
    This class encapsulates all database interactions related to users.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    # User methods
    def get_user_by_id(self, user_id: str) -> Optional[Users]:
        """Get a user by their ID."""
        return self.db.query(Users).filter(Users.id == user_id).first()
    
    def get_user_by_email(self, email: str) -> Optional[Users]:
        """Get a user by their email."""
        return self.db.query(Users).filter(Users.email == email).first()
    
    def create_user(self, user_data: Dict[str, Any]) -> Users:
        """Create a new user."""
        user = Users(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Optional[Users]:
        """Update an existing user."""
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        
        for key, value in user_data.items():
            setattr(user, key, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    # Bookmark methods
    def get_bookmark_by_id(self, bookmark_id: int) -> Optional[Bookmark]:
        """Get a bookmark by its ID."""
        return self.db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
    
    def get_bookmark_by_user_and_media(self, user_id: str, media_id: str) -> Optional[Bookmark]:
        """Get a user's bookmark for a specific media item."""
        return self.db.query(Bookmark).filter(
            Bookmark.user_id == user_id, 
            Bookmark.media_id == media_id
        ).first()
    
    def get_bookmarks_by_user(self, user_id: str) -> List[Bookmark]:
        """Get all bookmarks for a specific user."""
        return self.db.query(Bookmark).filter(Bookmark.user_id == user_id).all()
    
    def create_bookmark(self, bookmark_data: Dict[str, Any]) -> Bookmark:
        """Create a new bookmark."""
        bookmark = Bookmark(**bookmark_data)
        self.db.add(bookmark)
        self.db.commit()
        self.db.refresh(bookmark)
        return bookmark
    
    def delete_bookmark(self, bookmark_id: int) -> bool:
        """Delete a bookmark by its ID."""
        bookmark = self.get_bookmark_by_id(bookmark_id)
        if not bookmark:
            return False
        
        self.db.delete(bookmark)
        self.db.commit()
        return True
    
    def delete_bookmark_by_user_and_media(self, user_id: str, media_id: str) -> bool:
        """Delete a user's bookmark for a specific media item."""
        bookmark = self.get_bookmark_by_user_and_media(user_id, media_id)
        if not bookmark:
            return False
        
        self.db.delete(bookmark)
        self.db.commit()
        return True
    
    # Search history methods
    def get_search_history_by_id(self, history_id: int) -> Optional[SearchHistory]:
        """Get a search history entry by its ID."""
        return self.db.query(SearchHistory).filter(SearchHistory.id == history_id).first()
    
    def get_search_history_by_user(self, user_id: str, limit: int = 20) -> List[SearchHistory]:
        """Get search history for a specific user, newest first."""
        return self.db.query(SearchHistory).filter(
            SearchHistory.user_id == user_id
        ).order_by(SearchHistory.created_at.desc()).limit(limit).all()
    
    def create_search_history(self, history_data: Dict[str, Any]) -> SearchHistory:
        """Create a new search history entry."""
        history = SearchHistory(**history_data)
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history
    
    def delete_search_history(self, history_id: int) -> bool:
        """Delete a search history entry by its ID."""
        history = self.get_search_history_by_id(history_id)
        if not history:
            return False
        
        self.db.delete(history)
        self.db.commit()
        return True
    
    def clear_search_history(self, user_id: str) -> int:
        """Clear all search history for a specific user. Returns count of deleted entries."""
        result = self.db.query(SearchHistory).filter(SearchHistory.user_id == user_id).delete()
        self.db.commit()
        return result