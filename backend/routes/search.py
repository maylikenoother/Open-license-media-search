from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.database import Database
from typing import Optional
from database import get_db
from services.search_service import SearchService
from services.user_service import UserService
from repositories.user_repository import UserRepository
from auth import verify_clerk_token, get_current_user_id, get_optional_current_user
from schemas import SearchRequest, StandardResponse

router = APIRouter()

@router.get("/search")
async def search_media(
    query: str = Query(..., description="Search term"),
    media_type: str = Query("images", description="Type of media (images, audio)"),
    page: int = Query(1, description="Page number", ge=1),
    page_size: int = Query(20, description="Results per page", ge=1, le=100),
    license_type: Optional[str] = Query(None, description="Filter by license type"),
    creator: Optional[str] = Query(None, description="Filter by creator"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    source: Optional[str] = Query(None, description="Filter by source"),
    db: Database = Depends(get_db),
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Search for media using the Openverse API.
    
    If the user is authenticated, their search query will be saved to their history.
    """
    try:
        search_service = SearchService()
        
        search_results = await search_service.search_media(
            query=query,
            media_type=media_type,
            page=page,
            page_size=page_size,
            license_type=license_type,
            creator=creator,
            tags=tags,
            source=source
        )
        
        if current_user and "sub" in current_user:
            user_id = current_user["sub"]
            user_repository = UserRepository(db)
            user_service = UserService(user_repository)
            
            search_params = {
                "media_type": media_type,
                "page": page,
                "page_size": page_size,
                "license_type": license_type,
                "creator": creator,
                "tags": tags,
                "source": source
            }

            await user_service.save_search_history(
                user_id=user_id,
                search_query=query,
                search_params=search_params,
                search_results=None
            )
    

        search_results["auth_status"] = "authenticated" if current_user else "unauthenticated"
        
        return search_results
    
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/media/{media_type}/{media_id}")
async def get_media_details(
    media_type: str,
    media_id: str,
    db: Database = Depends(get_db)
):
    """
    Get detailed information about a specific media item.
    """
    try:
        search_service = SearchService()
        media_details = await search_service.get_media_details(
            media_id=media_id,
            media_type=media_type
        )
        
        return media_details
    
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/popular/{media_type}")
async def get_popular_media(
    media_type: str = "images",
    limit: int = Query(20, description="Maximum number of results", ge=1, le=50)
):
    """
    Get popular media items.
    """
    try:
        search_service = SearchService()
        popular_media = await search_service.get_popular_media(
            media_type=media_type,
            limit=limit
        )
        
        return {"results": popular_media}
    
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/history")
async def get_search_history(
    limit: int = Query(20, description="Maximum number of entries", ge=1, le=100),
    db: Database = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get the authenticated user's search history.
    """
    try:
        user_repository = UserRepository(db)
        user_service = UserService(user_repository)
        
        history = await user_service.get_search_history(user_id=user_id, limit=limit)
        
        return StandardResponse(
            success=True,
            message="Search history retrieved successfully",
            data=history
        )
    
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/history/{history_id}")
async def delete_search_history_entry(
    history_id: str,
    db: Database = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete a specific search history entry.
    """
    try:
        user_repository = UserRepository(db)
        user_service = UserService(user_repository)
        
        result = await user_service.delete_search_history(user_id=user_id, history_id=history_id)
        
        return StandardResponse(
            success=True,
            message=result["message"],
            data=None
        )
    
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/history")
async def clear_search_history(
    db: Database = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Clear all search history for the authenticated user.
    """
    try:
        user_repository = UserRepository(db)
        user_service = UserService(user_repository)
        
        result = await user_service.clear_search_history(user_id=user_id)
        
        return StandardResponse(
            success=True,
            message=result["message"],
            data={"entries_deleted": result["entries_deleted"]}
        )
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))