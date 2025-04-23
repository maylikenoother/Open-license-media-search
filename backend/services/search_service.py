import os
import requests
import aiohttp
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

load_dotenv()

class SearchService:
    """
    Service for handling media search operations using the Openverse API.
    This service implements the business logic for searching media.
    """
    
    def __init__(self):
        """Initialize the search service with API configuration."""
        self.api_url = os.getenv("OPENVERSE_API_URL", "https://api.openverse.engineering/v1/")
        self.api_key = os.getenv("OPENVERSE_API_KEY")

        self.supported_media_types = ["images", "audio"]
        
        self.supported_licenses = [
            "cc0", "pdm", "by", "by-sa", "by-nc", "by-nd", "by-nc-sa", "by-nc-nd"
        ]
    
    async def search_media(
        self, 
        query: str, 
        media_type: str = "images", 
        page: int = 1, 
        page_size: int = 20,
        license_type: Optional[str] = None,
        creator: Optional[str] = None,
        tags: Optional[str] = None,
        source: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Search for media using the Openverse API.
        
        Args:
            query: Search term
            media_type: Type of media (images, audio)
            page: Page number for pagination
            page_size: Number of results per page
            license_type: Filter by license type
            creator: Filter by creator
            tags: Filter by tags
            source: Filter by source
            
        Returns:
            Dict containing search results and metadata
            
        Raises:
            ValueError: If an invalid parameter is provided
            Exception: If the API request fails
        """
        if media_type not in self.supported_media_types:
            raise ValueError(f"Invalid media type. Use one of {self.supported_media_types}")
        
        if license_type and license_type not in self.supported_licenses:
            raise ValueError(f"Invalid license type. Use one of {self.supported_licenses}")

        url = f"{self.api_url}{media_type}/"
        
        headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
        
        params = {
            "q": query,
            "page": page,
            "page_size": page_size
        }
        
        if license_type:
            params["license"] = license_type
        if creator:
            params["creator"] = creator
        if tags:
            params["tags"] = tags
        if source:
            params["source"] = source
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, params=params, timeout=10) as response:
                    if response.status != 200:
                        error_message = f"Openverse API error: {response.status}"
                        try:
                            error_detail = await response.json()
                            error_message += f" - {error_detail.get('detail', '')}"
                        except:
                            pass
                        raise Exception(error_message)
                    

                    result = await response.json()

                    result["search_info"] = {
                        "query": query,
                        "media_type": media_type,
                        "page": page,
                        "page_size": page_size,
                        "license_type": license_type,
                        "creator": creator,
                        "tags": tags,
                        "source": source
                    }
                    
                    return result
                    
        except aiohttp.ClientError as e:
            raise Exception(f"Failed to connect to Openverse API: {str(e)}")
    
    async def get_media_details(salf, media_id: str, media_type: str = "images") -> Dict[str, Any]:
        """
        Get detailed information bout a specific media item.
        
        Args:
            media_id: The ID of the media item
            media_type: The type of media (images, audio)
            
        Returns:
            Dict containing media details
            
        Raises:
            ValueError: If an invalid parameter is provided
            Exception: If the API request fails
        """
        if media_type not in self.supported_media_types:
            raise ValueError(f"Invalid media type. Use one of {self.supported_media_types}")
        
        url = f"{self.api_url}{media_type}/{media_id}/"
        
        headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        error_message = f"Openverse API error: {response.status}"
                        try:
                            error_detail = await response.json()
                            error_message += f" - {error_detail.get('detail', '')}"
                        except:
                            pass
                        raise Exception(error_message)

                    return await response.json()
                    
        except aiohttp.ClientError as e:
            raise Exception(f"Failed to connect to Openverse API: {str(e)}")
    
    async def get_popular_media(self, media_type: str = "images", limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get popular media from Openverse.
        This is a convenience method to help populate the homepage.
        
        Args:
            media_type: The type of media (images, audio)
            limit: Maximum number of items to return
            
        Returns:
            List of popular media items
            
        Raises:
            ValueError: If an invalid parameter is provided
            Exception: If the API request fails
        """
        popular_searches = ["nature", "technology", "art", "music", "people"]
        
        try:
            import random
            query = random.choice(popular_searches)
            
            result = await self.search_media(
                query=query,
                media_type=media_type,
                page=1,
                page_size=limit
            )
            
            return result.get("results", [])
            
        except Exception as e:
            raise Exception(f"Failed to get popular media: {str(e)}")