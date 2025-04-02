# backend/auth.py
import os
import json
import requests
import logging
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from models import Users
from database import get_db

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get Clerk configuration from environment variables
CLERK_JWT_ISSUER = os.getenv("CLERK_JWT_ISSUER")
CLERK_JWT_JWKS_URL = os.getenv("CLERK_JWT_JWKS_URL")

if not CLERK_JWT_ISSUER or not CLERK_JWT_JWKS_URL:
    logger.warning("Clerk JWT configuration missing: CLERK_JWT_ISSUER or CLERK_JWT_JWKS_URL not set")

# Initialize HTTP Bearer scheme for token extraction
bearer_scheme = HTTPBearer(auto_error=False)

# Cache for JWKS to avoid repeated requests
_jwks_cache = None
_jwks_cache_expiry = 0

def get_jwks():
    """
    Fetch and cache JSON Web Key Set (JWKS) from Clerk.
    Caches the keys to reduce API calls.
    """
    global _jwks_cache, _jwks_cache_expiry
    import time
    
    current_time = time.time()
    
    # If we have a valid cache, return it
    if _jwks_cache and current_time < _jwks_cache_expiry:
        return _jwks_cache
    
    # Otherwise, fetch new keys
    try:
        logger.info(f"Fetching JWKS from {CLERK_JWT_JWKS_URL}")
        response = requests.get(CLERK_JWT_JWKS_URL)
        response.raise_for_status()
        _jwks_cache = response.json()
        # Cache for 1 hour
        _jwks_cache_expiry = current_time + 3600
        return _jwks_cache
    except Exception as e:
        logger.error(f"Failed to fetch JWKS: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch JWKS: {str(e)}"
        )

def get_key_from_jwks(kid: str):
    """
    Get the key with matching kid from JWKS.
    """
    jwks = get_jwks()
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return key
    logger.warning(f"Unable to find key with kid: {kid}")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unable to find appropriate key"
    )

async def extract_token_from_request(request: Request) -> Optional[str]:
    """
    Extract token from request in multiple ways:
    1. Authorization header with Bearer prefix
    2. Authorization header without Bearer prefix
    3. X-Session-Token header
    4. clerk-token in cookies
    """
    # Try Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header:
        if auth_header.startswith("Bearer "):
            return auth_header[7:]  # Remove 'Bearer ' prefix
        return auth_header  # Use header value as-is
    
    # Try X-Session-Token header
    session_token = request.headers.get("X-Session-Token")
    if session_token:
        return session_token
    
    # Try cookies
    cookies = request.cookies
    if cookies and "clerk-token" in cookies:
        return cookies["clerk-token"]
    
    return None

async def verify_clerk_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Verify the Clerk JWT token and extract user information.
    Also ensures the user exists in our database.
    """
    # Get token from multiple possible sources
    token = None
    
    # First try the standard HTTPBearer credentials
    if credentials:
        token = credentials.credentials
    
    # If not found, try other methods
    if not token:
        token = await extract_token_from_request(request)
    
    if not token:
        logger.warning("No auth token found in request")
        # Log all headers to debug the issue
        logger.info(f"Request headers: {dict(request.headers)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No credentials provided"
        )
    
    try:
        # Extract the key ID from token header
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        
        if not kid:
            logger.warning("No key ID found in token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No key ID found in token"
            )
        
        # Get the key with matching kid
        key = get_key_from_jwks(kid)
        
        # Verify and decode the token
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=None,
            issuer=CLERK_JWT_ISSUER,
            options={"verify_aud": False}
        )
        
        # Log successful token validation
        logger.info(f"Token validated successfully for user: {payload.get('sub')}")
        
        # Check if user exists in our database, create if not
        user_id = payload.get("sub")
        if not user_id:
            logger.warning("Invalid user ID in token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token"
            )
        
        user = db.query(Users).filter(Users.id == user_id).first()
        
        # If user doesn't exist in our database, create them
        if not user and payload.get("email"):
            username = payload.get("username", f"user_{user_id[:8]}")
            email = payload.get("email")
            
            logger.info(f"Creating new user: {username}, {email}")
            user = Users(
                id=user_id,
                username=username,
                email=email
            )
            db.add(user)
            db.commit()
        
        return payload
        
    except JWTError as e:
        logger.error(f"Invalid authentication token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )
    except Exception as e:
        logger.exception(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )

def get_current_user_id(payload: Dict[str, Any] = Depends(verify_clerk_token)) -> str:
    """
    Extract and return only the user ID from the token payload.
    """
    user_id = payload.get("sub")
    if not user_id:
        logger.warning("Invalid user ID in token payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token"
        )
    return user_id

# Optional dependency for endpoints that can work with or without authentication
async def get_optional_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[Dict[str, Any]]:
    """
    Try to get the current user, but don't require authentication.
    Returns None if no valid authentication is provided.
    """
    try:
        token = await extract_token_from_request(request)
        if not token:
            return None
        
        # Extract the key ID from token header
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        
        if not kid:
            return None
        
        # Get the key with matching kid
        key = get_key_from_jwks(kid)
        
        # Verify and decode the token
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=None,
            issuer=CLERK_JWT_ISSUER,
            options={"verify_aud": False}
        )
        
        return payload
    except Exception:
        return None