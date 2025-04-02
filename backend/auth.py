# backend/auth.py
import os
import json
import requests
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from models import Users
from database import get_db

# Load environment variables
load_dotenv()

# Get Clerk configuration from environment variables
CLERK_JWT_ISSUER = os.getenv("CLERK_JWT_ISSUER")
CLERK_JWT_JWKS_URL = os.getenv("CLERK_JWT_JWKS_URL")

# Initialize HTTP Bearer scheme for token extraction
bearer_scheme = HTTPBearer()

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
        response = requests.get(CLERK_JWT_JWKS_URL)
        response.raise_for_status()
        _jwks_cache = response.json()
        # Cache for 1 hour
        _jwks_cache_expiry = current_time + 3600
        return _jwks_cache
    except Exception as e:
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
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unable to find appropriate key"
    )

def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Verify the Clerk JWT token and extract user information.
    Also ensures the user exists in our database.
    """
    token = credentials.credentials
    
    try:
        # Extract the key ID from token header
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        
        if not kid:
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
        
        # Check if user exists in our database, create if not
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token"
            )
        
        user = db.query(Users).filter(Users.id == user_id).first()
        
        # If user doesn't exist in our database, create them
        if not user and payload.get("email"):
            username = payload.get("username", f"user_{user_id[:8]}")
            email = payload.get("email")
            
            user = Users(
                id=user_id,
                username=username,
                email=email
            )
            db.add(user)
            db.commit()
        
        return payload
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )
    except Exception as e:
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token"
        )
    return user_id