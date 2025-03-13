import os
import requests
from fastapi import APIRouter, HTTPException, Query
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()


OPENVERSE_API_URL = os.getenv("OPENVERSE_API_URL", "https://api.openverse.engineering/v1/")
OPENVERSE_API_KEY = os.getenv("OPENVERSE_API_KEY")

@router.get("/search")
def search_media(
    query: str = Query(..., description="Search term"),
    media_type: str = Query("images", description="Type of media (images, audio, etc.)"),
    page: int = Query(1, description="Page number"),
    page_size: int = Query(10, description="Number of results per page"),
):

    if media_type not in ["images", "audio"]:
        raise HTTPException(status_code=400, detail="Invalid media type. Use 'images' or 'audio'.")

    url = f"{OPENVERSE_API_URL}{media_type}/"
    headers = {"Authorization": f"Bearer {OPENVERSE_API_KEY}"} if OPENVERSE_API_KEY else {}
    params = {"q": query, "page": page, "page_size": page_size}

    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch media")

    return response.json()
