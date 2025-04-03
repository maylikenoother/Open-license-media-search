# backend/tests/conftest.py
import os
import pytest
import asyncio
from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.database import Database
from main import app
from database import get_db

# Use MongoDB Memory Server for testing
MONGODB_TEST_URL = "mongodb://localhost:27017/test_database"

@pytest.fixture(scope="function")
async def test_db():
    """Create a fresh MongoDB test database for each test."""
    client = AsyncIOMotorClient(MONGODB_TEST_URL)
    db = client.get_database()
    
    # Clear existing collections
    for collection in await db.list_collection_names():
        await db[collection].delete_many({})
    
    try:
        yield db
    finally:
        # Clean up after test
        for collection in await db.list_collection_names():
            await db[collection].delete_many({})
        client.close()

@pytest.fixture(scope="function")
def client(test_db):
    """
    Create a test client with the test database.
    This overrides the get_db dependency to use our test database.
    """
    async def override_get_db():
        yield test_db
    
    # Override the get_db dependency
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    app.dependency_overrides.clear()

@pytest.fixture
def mock_verify_token():
    """
    Mock the token verification to return a test user.
    Use this fixture to bypass authentication in tests.
    """
    def mock_token():
        return {
            "sub": "test_user_id",
            "email": "test@example.com",
            "username": "testuser"
        }
    
    app.dependency_overrides["verify_clerk_token"] = mock_token
    
    yield
    
    if "verify_clerk_token" in app.dependency_overrides:
        del app.dependency_overrides["verify_clerk_token"]

# Event loop fixture for running async tests
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()