# backend/tests/test_search_service.py
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
import aiohttp
from services.search_service import SearchService

class TestSearchService:
    """Tests for the SearchService class."""
    
    def setup_method(self):
        """Set up test environment before each test."""
        self.search_service = SearchService()
    
    @pytest.mark.asyncio
    async def test_search_media_successful(self):
        """Test search_media with successful API response."""
        # Create mock for ClientSession and response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.__aenter__.return_value = mock_response
        mock_response.json = AsyncMock(return_value={
            "results": [
                {"id": "1", "title": "Test Image", "url": "http://example.com/image.jpg"}
            ]
        })
        
        # Create mock for aiohttp.ClientSession
        mock_session = AsyncMock()
        mock_session.get.return_value = mock_response
        
        # Patch ClientSession to return our mock
        with patch('aiohttp.ClientSession', return_value=mock_session):
            # Call method
            result = await self.search_service.search_media(query="test")
            
            # Verify result
            assert "results" in result
            assert len(result["results"]) == 1
            assert result["results"][0]["id"] == "1"
            assert "search_info" in result
            assert result["search_info"]["query"] == "test"
            
            # Verify API call
            mock_session.get.assert_called_once()
            args, kwargs = mock_session.get.call_args
            assert kwargs["params"]["q"] == "test"
            assert kwargs["params"]["page"] == 1
            assert kwargs["params"]["page_size"] == 20
    
    @pytest.mark.asyncio
    async def test_search_media_with_filters(self):
        """Test search_media with filters."""
        # Create mock for response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.__aenter__.return_value = mock_response
        mock_response.json = AsyncMock(return_value={"results": []})
        
        # Create mock for aiohttp.ClientSession
        mock_session = AsyncMock()
        mock_session.get.return_value = mock_response
        
        # Patch ClientSession
        with patch('aiohttp.ClientSession', return_value=mock_session):
            # Call method with all parameters
            await self.search_service.search_media(
                query="test",
                media_type="audio",
                page=2,
                page_size=30,
                license_type="cc0",
                creator="test_creator",
                tags="nature,water",
                source="flickr"
            )
            
            # Verify API call parameters
            args, kwargs = mock_session.get.call_args
            assert kwargs["params"]["q"] == "test"
            assert kwargs["params"]["page"] == 2
            assert kwargs["params"]["page_size"] == 30
            assert kwargs["params"]["license"] == "cc0"
            assert kwargs["params"]["creator"] == "test_creator"
            assert kwargs["params"]["tags"] == "nature,water"
            assert kwargs["params"]["source"] == "flickr"
    
    def test_search_media_invalid_type(self):
        """Test search_media with invalid media type."""
        with pytest.raises(ValueError) as exc_info:
            self.search_service.search_media(query="test", media_type="invalid")
        
        assert "Invalid media type" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_search_media_api_error(self):
        """Test search_media with API error."""
        # Mock error response
        mock_response = AsyncMock()
        mock_response.status = 500
        mock_response.__aenter__.return_value = mock_response
        mock_response.json = AsyncMock(return_value={"detail": "Server error"})
        
        # Create mock for aiohttp.ClientSession
        mock_session = AsyncMock()
        mock_session.get.return_value = mock_response
        
        # Patch ClientSession
        with patch('aiohttp.ClientSession', return_value=mock_session):
            # Call method and expect exception
            with pytest.raises(Exception) as exc_info:
                await self.search_service.search_media(query="test")
            
            assert "Openverse API error: 500" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_get_media_details(self):
        """Test get_media_details with successful API response."""
        # Mock API response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.__aenter__.return_value = mock_response
        mock_response.json = AsyncMock(return_value={
            "id": "123",
            "title": "Detailed Image",
            "url": "http://example.com/image.jpg",
            "creator": "Test Creator",
            "license": "CC BY"
        })
        
        # Create mock for aiohttp.ClientSession
        mock_session = AsyncMock()
        mock_session.get.return_value = mock_response
        
        # Patch ClientSession
        with patch('aiohttp.ClientSession', return_value=mock_session):
            # Call method
            result = await self.search_service.get_media_details(media_id="123")
            
            # Verify result
            assert result["id"] == "123"
            assert result["title"] == "Detailed Image"
            
            # Verify API call
            mock_session.get.assert_called_once()
            args = mock_session.get.call_args[0]
            assert "123" in args[0]