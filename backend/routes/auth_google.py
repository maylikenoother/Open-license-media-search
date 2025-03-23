import os
import secrets
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from dotenv import load_dotenv
from backend.database import get_db
from sqlalchemy.orm import Session
from backend import crud, schemas
import logging
import httpx
from datetime import datetime

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
router = APIRouter()

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_params={"scope": "openid email profile"},
    access_token_url="https://oauth2.googleapis.com/token",
    userinfo_endpoint="https://openidconnect.googleapis.com/v1/userinfo",
    client_kwargs={"scope": "openid email profile"},
)

REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")


@router.get("/google/login")
async def google_login(request: Request):
    state = secrets.token_urlsafe(16)
    request.session["oauth_state"] = state
    logger.info(f"🔄 OAuth State Before Redirect: {state}")
    return await oauth.google.authorize_redirect(request, REDIRECT_URI, state=state)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Handles Google OAuth2 callback and manages login/registration."""
    try:
        incoming_state = request.query_params.get("state")
        stored_state = request.session.get("oauth_state")
        if incoming_state != stored_state:
            raise HTTPException(status_code=400, detail="CSRF Warning! State mismatch.")

        token = await oauth.google.authorize_access_token(request)
        id_token = token.get("id_token")
        if not id_token:
            raise HTTPException(status_code=400, detail="Missing ID token from Google")

        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}")

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google ID token")

        user_info = response.json()
        email = user_info.get("email")
        username = user_info.get("name")

        if not email:
            raise HTTPException(status_code=400, detail="Google account email not provided")

        # Check if user exists
        user = crud.get_user_by_email(db, email)
        if not user:
            logger.info(f"👤 New Google user detected: {email}, auto-registering.")
            new_user = schemas.UserCreate(
                username=username,
                email=email,
                password="google_oauth"  # Dummy password
            )
            user = crud.create_user(db, new_user)
        else:
            logger.info(f"✅ Existing Google user found: {email}")

        # Save OAuth token
        access_token = token["access_token"]
        db_token = schemas.UserTokenCreate(
            user_id=user.id,
            token=access_token,
            expires_at=datetime(2025, 12, 31, 23, 59, 59)
        )
        crud.create_user_token(db, db_token)

        # Redirect to frontend
        return RedirectResponse(url=f"http://localhost:5173/auth/token?token={access_token}")

    except Exception as e:
        logger.exception("Google authentication error")
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")
