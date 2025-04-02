# backend/tests/test_search_service.py
import pytest
from unittest.mock import patch, MagicMock
from services.search_service import SearchService

class TestSearchService:
    """Tests for the SearchService class."""
    
    def setup_method(self):
        """Set up test environment before each test."""
        self.search_service = SearchService()
    
    @patch('services.search_service.requests.get')
    def test_search_media_successful(self, mock_get):
        """Test search_media with successful API response."""
        # Mock API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "results": [
                {"id": "1", "title": "Test Image", "url": "http://example.com/image.jpg"}
            ]
        }
        mock_get.return_value = mock_response
        
        # Call method
        result = self.search_service.search_media(query="test")
        
        # Verify result
        assert "results" in result
        assert len(result["results"]) == 1
        assert result["results"][0]["id"] == "1"
        assert "search_info" in result
        assert result["search_info"]["query"] == "test"
        
        # Verify API call
        mock_get.assert_called_once()
        args, kwargs = mock_get.call_args
        assert kwargs["params"]["q"] == "test"
        assert kwargs["params"]["page"] == 1
        assert kwargs["params"]["page_size"] == 20
    
    @patch('services.search_service.requests.get')
    def test_search_media_with_filters(self, mock_get):
        """Test search_media with filters."""
        # Mock API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"results": []}
        mock_get.return_value = mock_response
        
        # Call method with all parameters
        self.search_service.search_media(
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
        args, kwargs = mock_get.call_args
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
    
    @patch('services.search_service.requests.get')
    def test_search_media_api_error(self, mock_get):
        """Test search_media with API error."""
        # Mock error response
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.json.return_value = {"detail": "Server error"}
        mock_get.return_value = mock_response
        
        # Call method and expect exception
        with pytest.raises(Exception) as exc_info:
            self.search_service.search_media(query="test")
        
        assert "Openverse API error: 500" in str(exc_info.value)
    
    @patch('services.search_service.requests.get')
    def test_get_media_details(self, mock_get):
        """Test get_media_details with successful API response."""
        # Mock API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "id": "123",
            "title": "Detailed Image",
            "url": "http://example.com/image.jpg",
            "creator": "Test Creator",
            "license": "CC BY"
        }
        mock_get.return_value = mock_response
        
        # Call method
        result = self.search_service.get_media_details(media_id="123")
        
        # Verify result
        assert result["id"] == "123"
        assert result["title"] == "Detailed Image"
        
        # Verify API call
        mock_get.assert_called_once()
        args, kwargs = mock_get.call_args
        assert "123" in args[0]