from sqlalchemy.orm import Session
from backend import models, schemas, security 


def get_user_by_email(db: Session, email: str):
    """Retrieve a user by email."""
    return db.query(models.Users).filter(models.Users.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, is_admin: bool = False):
    """Create a new user with a hashed password and assign admin role if specified."""
    hashed_password = security.hash_password(user.password)

    db_user = models.Users(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        isAdmin=is_admin 
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    """Verify user credentials during login."""
    user = get_user_by_email(db, email)
    if not user or not security.verify_password(password, user.password_hash):
        return None
    return user
def create_user_token(db: Session, token_data: schemas.UserTokenCreate):
    """Store an OAuth token for a user."""
    db_token = models.UserToken(
        user_id=token_data.user_id,
        token=token_data.token,
        expires_at=token_data.expires_at
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token
