# backend/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Text, TIMESTAMP, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Users(Base):
    """
    User model for storing user information.
    The authentication is handled by Clerk, but we keep a record of users.
    """
    __tablename__ = "users"
    
    id = Column(String(255), primary_key=True, index=True)  # Clerk user ID
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    is_admin = Column(Boolean, default=False)

class SearchHistory(Base):
    """
    Model for storing user search history.
    """
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    search_query = Column(Text, nullable=False)
    search_params = Column(JSON, nullable=True)  # Store additional search parameters
    search_results = Column(JSON, nullable=True)  # Optional to store full results
    result_count = Column(Integer, nullable=True)  # Number of results found
    created_at = Column(TIMESTAMP, server_default=func.now())

class Bookmark(Base):
    """
    Model for storing user bookmarks.
    """
    __tablename__ = "bookmarks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    media_id = Column(Text, nullable=False)
    media_url = Column(Text, nullable=False)
    media_type = Column(String(50), nullable=False)
    media_title = Column(Text, nullable=True)
    media_creator = Column(Text, nullable=True)
    media_license = Column(String(50), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    # Composite unique constraint to prevent duplicate bookmarks
    __table_args__ = (
        # Ensure user can't bookmark the same media item twice
        {'sqlite_autoincrement': True},
    )