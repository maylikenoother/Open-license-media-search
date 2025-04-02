# backend/tests/conftest.py
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from main import app
from database import get_db, Base

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test."""
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Return a session
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop tables after test is done
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(test_db):
    """
    Create a test client with the test database.
    This overrides the get_db dependency to use our test database.
    """
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
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
    original_dependency = app.dependency_overrides.get(get_db, get_db)
    
    def mock_token():
        return {
            "sub": "test_user_id",
            "email": "test@example.com",
            "username": "testuser"
        }
    
    app.dependency_overrides[get_db] = original_dependency
    app.dependency_overrides["verify_clerk_token"] = mock_token
    
    yield
    
    if "verify_clerk_token" in app.dependency_overrides:
        del app.dependency_overrides["verify_clerk_token"]