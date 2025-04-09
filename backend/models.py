from pydantic import BaseModel, Field, EmailStr
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

class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }

class User(MongoBaseModel):
    id: Optional[str] = Field(default=None)
    username: str
    email: EmailStr
    created_at: datetime = Field(default_factory=datetime.now)
    is_admin: bool = False

class SearchHistory(MongoBaseModel):
    user_id: str
    search_query: str
    search_params: Optional[Dict[str, Any]] = None
    search_results: Optional[Dict[str, Any]] = None
    result_count: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.now)

class Bookmark(MongoBaseModel):
    user_id: str
    media_id: str
    media_url: str
    media_type: str
    media_title: Optional[str] = None
    media_creator: Optional[str] = None
    media_license: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)