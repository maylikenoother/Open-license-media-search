# backend/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import requests
import os

# Get your Clerk configuration from environment variables
CLERK_JWT_ISSUER = os.getenv("CLERK_JWT_ISSUER")
CLERK_JWT_JWKS_URL = os.getenv("CLERK_JWT_JWKS_URL")

# HTTP Bearer Auth
bearer_scheme = HTTPBearer()

def get_public_key():
    jwks = requests.get(CLERK_JWT_JWKS_URL).json()
    return jwks['keys'][0]  # You can cache this

def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    try:
        key = get_public_key()
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=None,
            issuer=CLERK_JWT_ISSUER,
            options={"verify_aud": False}
        )
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Clerk JWT: {str(e)}"
        )
