import os
import secrets
from fastapi import APIRouter, Depends, HTTPException
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from dotenv import load_dotenv
from backend.database import get_db
from sqlalchemy.orm import Session
from backend import crud, schemas
import logging


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
    access_token_params=None,
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
    """ Handles Google OAuth2 callback and verifies state """
    try:
        logger.info(" Attempting to retrieve access token from Google...")

        incoming_state = request.query_params.get("state")
        stored_state = request.session.get("oauth_state")

        logger.info(f"🔄 Incoming State: {incoming_state}, Stored State: {stored_state}") 

        if incoming_state != stored_state:
            raise HTTPException(status_code=400, detail="CSRF Warning! State does not match.")

        token = await oauth.google.authorize_access_token(request)

        logger.info(f" Full Token Response: {token}")

        if "id_token" not in token:
            logger.error("❌ Google authentication failed: 'id_token' is missing!")
            raise HTTPException(status_code=400, detail=f"Google authentication failed: 'id_token' missing in response. Full token response: {token}")

        user_info = await oauth.google.parse_id_token(request, token)
        logger.info(f"🔄 Parsed User Info: {user_info}")

    except Exception as e:
        logger.error(f"❌ Google authentication failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")

    email = user_info.get("email")
    username = user_info.get("name")

    existing_user = crud.get_user_by_email(db, email)
    if not existing_user:
        new_user = schemas.UserCreate(username=username, email=email, password="google_oauth")
        user = crud.create_user(db, new_user)
    else:
        user = existing_user

    return {
        "access_token": token.get("access_token"),
        "id_token": token.get("id_token"),
        "token_type": "bearer",
        "user": user.email
    }
