from fastapi import APIRouter, Depends, HTTPException, status, Body
from pymongo.database import Database
from typing import Optional
from database import get_db
from services.user_service import UserService
from repositories.user_repository import UserRepository
from auth import verify_clerk_token, get_current_user_id
from schemas import BookmarkCreate, BookmarkResponse, StandardResponse

router = APIRouter()

@router.get("/profile")
async def get_user_profile(
    db: Database = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get the authenticated user's profile.
    """
    try:
        user_repository = UserRepository(db)
        user_service = UserService(user_repository)
        
        profile = await user_service.get_user_profile(user_id=user_id)
        
        return StandardResponse(
            success=True,
            message="User profile retrieved successfully",
            data=profile
        )
    
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/bookmarks")
async def create_bookmark(
    media_id: str = Body(...),
    media_url: str = Body(...),
    media_type: str = Body(...),
    media_title: Optional[str] = Body(None),
    media_creator: Optional[str] = Body(None),
    media_license: Optional[str] = Body(None),
    db: Database = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new bookmark for the authenticated user.
    """
    try:
        user_repository = UserRepository(db)
        user_service = UserService(user_repository)
        
        bookmark = await user_service.create_bookmark(
            user_id=user_id,
            media_id=media_id,
            media_url=media_url,
            media_type=media_type,
            media_title=media_title,
            media_creator=media_creator,
            media_license=media_license
        )
        
        return StandardResponse(
            success=True,
            message="Bookmark created successfully",
            data=bookmark
        )
    
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/bookmarks")
async def get_bookmarks(
    db: Database = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get all bookmarks for the authenticated user.
    """
    try:
        user_repository = UserRepository(db)
        user_service = UserService(user_repository)
        
        bookmarks = await user_service.get_bookmarks(user_id=user_id)
        
        return StandardResponse(
            success=True,
            message="Bookmarks retrieved successfully",
            data=bookmarks
        )
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/bookmarks/{media_id}")
async def delete_bookmark(
    media_id: str,
    db: Database = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete a bookmark for the authenticated user.
    """
    try:
        user_repository = UserRepository(db)
        user_service = UserService(user_repository)
        
        result = await user_service.delete_bookmark(user_id=user_id, media_id=media_id)
        
        return StandardResponse(
            success=True,
            message=result["message"],
            data=None
        )
    
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))