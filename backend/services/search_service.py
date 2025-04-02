# backend/services/search_service.py
import os
import requests
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

# Load environment variables
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
        
        # Media types supported by Openverse API
        self.supported_media_types = ["images", "audio"]
        
        # License types supported by Openverse
        self.supported_licenses = [
            "cc0", "pdm", "by", "by-sa", "by-nc", "by-nd", "by-nc-sa", "by-nc-nd"
        ]
    
    def search_media(
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
        # Validate media type
        if media_type not in self.supported_media_types:
            raise ValueError(f"Invalid media type. Use one of {self.supported_media_types}")
        
        # Validate license type if provided
        if license_type and license_type not in self.supported_licenses:
            raise ValueError(f"Invalid license type. Use one of {self.supported_licenses}")
        
        # Build API URL
        url = f"{self.api_url}{media_type}/"
        
        # Set up headers with API key if available
        headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
        
        # Build query parameters
        params = {
            "q": query,
            "page": page,
            "page_size": page_size
        }
        
        # Add optional filters if provided
        if license_type:
            params["license"] = license_type
        if creator:
            params["creator"] = creator
        if tags:
            params["tags"] = tags
        if source:
            params["source"] = source
        
        # Make the API request
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            # Handle HTTP errors
            if response.status_code != 200:
                error_message = f"Openverse API error: {response.status_code}"
                try:
                    error_detail = response.json()
                    error_message += f" - {error_detail.get('detail', '')}"
                except:
                    pass
                raise Exception(error_message)
            
            # Parse and return the response
            result = response.json()
            
            # Add metadata to help with UX
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
            
        except requests.RequestException as e:
            raise Exception(f"Failed to connect to Openverse API: {str(e)}")
    
    def get_media_details(self, media_id: str, media_type: str = "images") -> Dict[str, Any]:
        """
        Get detailed information about a specific media item.
        
        Args:
            media_id: The ID of the media item
            media_type: The type of media (images, audio)
            
        Returns:
            Dict containing media details
            
        Raises:
            ValueError: If an invalid parameter is provided
            Exception: If the API request fails
        """
        # Validate media type
        if media_type not in self.supported_media_types:
            raise ValueError(f"Invalid media type. Use one of {self.supported_media_types}")
        
        # Build API URL
        url = f"{self.api_url}{media_type}/{media_id}/"
        
        # Set up headers with API key if available
        headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
        
        # Make the API request
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            # Handle HTTP errors
            if response.status_code != 200:
                error_message = f"Openverse API error: {response.status_code}"
                try:
                    error_detail = response.json()
                    error_message += f" - {error_detail.get('detail', '')}"
                except:
                    pass
                raise Exception(error_message)
            
            # Parse and return the response
            return response.json()
            
        except requests.RequestException as e:
            raise Exception(f"Failed to connect to Openverse API: {str(e)}")
    
    def get_popular_media(self, media_type: str = "images", limit: int = 20) -> List[Dict[str, Any]]:
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
        # For now, let's implement this by searching for common terms
        # In a real application, you might have a better way to determine popular content
        popular_searches = ["nature", "technology", "art", "music", "people"]
        
        try:
            # Get a random popular search term
            import random
            query = random.choice(popular_searches)
            
            # Search with it
            result = self.search_media(
                query=query,
                media_type=media_type,
                page=1,
                page_size=limit
            )
            
            return result.get("results", [])
            
        except Exception as e:
            raise Exception(f"Failed to get popular media: {str(e)}")