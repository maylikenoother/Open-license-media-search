
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Bookmark
from backend.auth import verify_clerk_token
from fastapi import Path

router = APIRouter()

@router.post("/bookmarks")
def create_bookmark(
    media_id: str,
    media_url: str,
    media_type: str,
    db: Session = Depends(get_db),
    user=Depends(verify_clerk_token)
):
    user_id = user["sub"]
    existing = db.query(Bookmark).filter_by(user_id=user_id, media_id=media_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already bookmarked")

    bookmark = Bookmark(
        user_id=user_id,
        media_id=media_id,
        media_url=media_url,
        media_type=media_type
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    return {"message": "Bookmark saved", "bookmark": bookmark.id}


@router.get("/bookmarks")
def get_bookmarks(
    db: Session = Depends(get_db),
    user=Depends(verify_clerk_token)
):
    user_id = user["sub"]
    bookmarks = db.query(Bookmark).filter_by(user_id=user_id).all()
    return [ 
        {
            "id": b.id,
            "media_id": b.media_id,
            "media_url": b.media_url,
            "media_type": b.media_type,
            "created_at": b.created_at,
        }
        for b in bookmarks
    ]

@router.delete("/bookmarks/{media_id}")
def delete_bookmark(
    media_id: str = Path(..., description="The media ID to remove"),
    db: Session = Depends(get_db),
    user=Depends(verify_clerk_token)
):
    user_id = user["sub"]
    bookmark = db.query(Bookmark).filter_by(user_id=user_id, media_id=media_id).first()

    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(bookmark)
    db.commit()

    return {"message": "Bookmark removed"}