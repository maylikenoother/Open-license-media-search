# backend/tests/test_user_service.py
import pytest
from unittest.mock import MagicMock, AsyncMock
from datetime import datetime
from bson import ObjectId
from services.user_service import UserService

class TestUserService:
    """Tests for the UserService class."""
    
    def setup_method(self):
        """Set up test environment before each test."""
        self.mock_repository = MagicMock()
        self.user_service = UserService(self.mock_repository)
        
        # Mock user data
        self.test_user = {
            "_id": ObjectId(),
            "id": "test_user_id",
            "username": "testuser",
            "email": "test@example.com",
            "created_at": datetime.now(),
            "is_admin": False
        }
        
        # Mock bookmark data
        self.test_bookmark = {
            "_id": ObjectId(),
            "user_id": "test_user_id",
            "media_id": "test_media_id",
            "media_url": "http://example.com/image.jpg",
            "media_type": "images",
            "media_title": "Test Image",
            "media_creator": "Test Creator",
            "media_license": "CC BY",
            "created_at": datetime.now()
        }
        
        # Mock search history data
        self.test_history = {
            "_id": ObjectId(),
            "user_id": "test_user_id",
            "search_query": "test query",
            "search_params": {"media_type": "images"},
            "result_count": 10,
            "created_at": datetime.now()
        }
    
    @pytest.mark.asyncio
    async def test_get_user_profile(self):
        """Test get_user_profile with valid user."""
        # Set up mock
        self.mock_repository.get_user_by_id = AsyncMock(return_value=self.test_user)
        
        # Call method
        profile = await self.user_service.get_user_profile(user_id="test_user_id")
        
        # Verify result
        assert profile["id"] == "test_user_id"
        assert profile["username"] == "testuser"
        assert profile["email"] == "test@example.com"
        assert "created_at" in profile
        assert profile["is_admin"] is False
        
        # Verify repository call
        self.mock_repository.get_user_by_id.assert_called_once_with("test_user_id")
    
    @pytest.mark.asyncio
    async def test_get_user_profile_not_found(self):
        """Test get_user_profile with non-existent user."""
        # Set up mock
        self.mock_repository.get_user_by_id = AsyncMock(return_value=None)
        
        # Call method and expect exception
        with pytest.raises(ValueError) as exc_info:
            await self.user_service.get_user_profile(user_id="nonexistent_id")
        
        assert "not found" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_create_bookmark(self):
        """Test create_bookmark with valid data."""
        # Set up mocks
        self.mock_repository.get_bookmark_by_user_and_media = AsyncMock(return_value=None)
        self.mock_repository.create_bookmark = AsyncMock(return_value=self.test_bookmark)
        
        # Call method
        bookmark = await self.user_service.create_bookmark(
            user_id="test_user_id",
            media_id="test_media_id",
            media_url="http://example.com/image.jpg",
            media_type="images",
            media_title="Test Image",
            media_creator="Test Creator",
            media_license="CC BY"
        )
        
        # Verify result
        assert "_id" in bookmark or "id" in bookmark
        assert bookmark["media_id"] == "test_media_id"
        assert bookmark["media_url"] == "http://example.com/image.jpg"
        assert bookmark["media_type"] == "images"
        assert bookmark["media_title"] == "Test Image"
        assert bookmark["media_creator"] == "Test Creator"
        assert bookmark["media_license"] == "CC BY"
        assert "created_at" in bookmark
        
        # Verify repository calls
        self.mock_repository.get_bookmark_by_user_and_media.assert_called_once_with(
            "test_user_id", "test_media_id"
        )
        self.mock_repository.create_bookmark.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_create_bookmark_already_exists(self):
        """Test create_bookmark with already bookmarked media."""
        # Set up mock to return existing bookmark
        self.mock_repository.get_bookmark_by_user_and_media = AsyncMock(return_value=self.test_bookmark)
        
        # Call method and expect exception
        with pytest.raises(ValueError) as exc_info:
            await self.user_service.create_bookmark(
                user_id="test_user_id",
                media_id="test_media_id",
                media_url="http://example.com/image.jpg",
                media_type="images"
            )
        
        assert "already bookmarked" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_get_bookmarks(self):
        """Test get_bookmarks with valid user."""
        # Set up mock to return list of bookmarks
        self.mock_repository.get_bookmarks_by_user = AsyncMock(return_value=[self.test_bookmark])
        
        # Call method
        bookmarks = await self.user_service.get_bookmarks(user_id="test_user_id")
        
        # Verify result
        assert len(bookmarks) == 1
        assert bookmarks[0]["media_id"] == "test_media_id"
        
        # Verify repository call
        self.mock_repository.get_bookmarks_by_user.assert_called_once_with("test_user_id")
    
    @pytest.mark.asyncio
    async def test_delete_bookmark(self):
        """Test delete_bookmark with valid bookmark."""
        # Set up mock to return success
        self.mock_repository.delete_bookmark_by_user_and_media = AsyncMock(return_value=True)
        
        # Call method
        result = await self.user_service.delete_bookmark(
            user_id="test_user_id",
            media_id="test_media_id"
        )
        
        # Verify result
        assert "message" in result
        assert "deleted successfully" in result["message"]
        
        # Verify repository call
        self.mock_repository.delete_bookmark_by_user_and_media.assert_called_once_with(
            "test_user_id", "test_media_id"
        )
    
    @pytest.mark.asyncio
    async def test_delete_bookmark_not_found(self):
        """Test delete_bookmark with non-existent bookmark."""
        # Set up mock to return failure
        self.mock_repository.delete_bookmark_by_user_and_media = AsyncMock(return_value=False)
        
        # Call method and expect exception
        with pytest.raises(ValueError) as exc_info:
            await self.user_service.delete_bookmark(
                user_id="test_user_id",
                media_id="nonexistent_id"
            )
        
        assert "not found" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_save_search_history(self):
        """Test save_search_history with valid data."""
        # Set up mock
        self.mock_repository.create_search_history = AsyncMock(return_value=self.test_history)
        
        # Call method
        history = await self.user_service.save_search_history(
            user_id="test_user_id",
            search_query="test query",
            search_params={"media_type": "images"},
            search_results=None
        )
        
        # Verify result
        assert "_id" in history or "id" in history
        assert history["search_query"] == "test query"
        assert history["search_params"] == {"media_type": "images"}
        assert "result_count" in history
        assert "created_at" in history
        
        # Verify repository call
        self.mock_repository.create_search_history.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_search_history(self):
        """Test get_search_history with valid user."""
        # Set up mock
        self.mock_repository.get_search_history_by_user = AsyncMock(return_value=[self.test_history])
        
        # Call method
        history = await self.user_service.get_search_history(user_id="test_user_id")
        
        # Verify result
        assert len(history) == 1
        assert history[0]["search_query"] == "test query"
        
        # Verify repository call
        self.mock_repository.get_search_history_by_user.assert_called_once_with("test_user_id", 20)
    
    @pytest.mark.asyncio
    async def test_delete_search_history(self):
        """Test delete_search_history with valid history entry."""
        # Set up mocks
        self.mock_repository.get_search_history_by_id = AsyncMock(return_value=self.test_history)
        self.mock_repository.delete_search_history = AsyncMock(return_value=True)
        
        # Call method
        result = await self.user_service.delete_search_history(
            user_id="test_user_id",
            history_id=str(self.test_history["_id"])
        )
        
        # Verify result
        assert "message" in result
        assert "deleted successfully" in result["message"]
        
        # Verify repository calls
        self.mock_repository.get_search_history_by_id.assert_called_once()
        self.mock_repository.delete_search_history.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_delete_search_history_not_found(self):
        """Test delete_search_history with non-existent history entry."""
        # Set up mock to return None
        self.mock_repository.get_search_history_by_id = AsyncMock(return_value=None)
        
        # Call method and expect exception
        with pytest.raises(ValueError) as exc_info:
            await self.user_service.delete_search_history(
                user_id="test_user_id",
                history_id="999"
            )
        
        assert "not found" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_clear_search_history(self):
        """Test clear_search_history with valid user."""
        # Set up mock to return count of deleted entries
        self.mock_repository.clear_search_history = AsyncMock(return_value=5)
        
        # Call method
        result = await self.user_service.clear_search_history(user_id="test_user_id")
        
        # Verify result
        assert "message" in result
        assert "cleared successfully" in result["message"]
        assert result["entries_deleted"] == 5
        
        # Verify repository call
        self.mock_repository.clear_search_history.assert_called_once_with("test_user_id")