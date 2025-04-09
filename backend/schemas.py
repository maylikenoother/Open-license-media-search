from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    id: str
class UserResponse(UserBase):
    id: str
    created_at: datetime
    is_admin: bool = False

    class Config:
        from_attributes = True

class SearchHistoryBase(BaseModel):
    search_query: str
    search_params: Optional[Dict[str, Any]] = None

class SearchHistoryCreate(SearchHistoryBase):
    user_id: str
    search_results: Optional[Dict[str, Any]] = None
    result_count: Optional[int] = None

class SearchHistoryResponse(SearchHistoryBase):
    id: str
    user_id: str
    result_count: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

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
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class SearchRequest(BaseModel):
    query: str
    media_type: str = "images"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    license_type: Optional[str] = None
    creator: Optional[str] = None
    tags: Optional[str] = None
    source: Optional[str] = None

class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None