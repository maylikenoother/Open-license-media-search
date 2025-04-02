# backend/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    id: str  # Clerk user ID

class UserResponse(UserBase):
    id: str
    created_at: datetime
    is_admin: bool = False

    class Config:
        from_attributes = True

# Search History Schemas
class SearchHistoryBase(BaseModel):
    search_query: str
    search_params: Optional[Dict[str, Any]] = None

class SearchHistoryCreate(SearchHistoryBase):
    user_id: str
    search_results: Optional[Dict[str, Any]] = None
    result_count: Optional[int] = None

class SearchHistoryResponse(SearchHistoryBase):
    id: int
    user_id: str
    result_count: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Bookmark Schemas
class BookmarkBase(BaseModel):
    media_id: str
    media_url: str
    media_type: str
    media_title: Optional[str] = None
    media_creator: Optional[str] = None
    media_license: Optional[str] = None

class BookmarkCreate(BookmarkBase):
    user_id: str

class BookmarkResponse(BookmarkBase):
    id: int
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Search Request Schemas
class SearchRequest(BaseModel):
    query: str
    media_type: str = "images"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    license_type: Optional[str] = None
    creator: Optional[str] = None
    tags: Optional[str] = None
    source: Optional[str] = None

# API Response Schemas
class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None