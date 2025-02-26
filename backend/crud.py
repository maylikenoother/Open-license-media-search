from sqlalchemy.orm import Session
from backend import models, schemas, security  # ✅ Import security for password hashing

def get_user_by_email(db: Session, email: str):
    return db.query(models.Users).filter(models.Users.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.hash_password(user.password)  # ✅ Uses security.py for hashing
    db_user = models.Users(username=user.username, email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    """Verify user credentials during login"""
    user = get_user_by_email(db, email)
    if not user or not security.verify_password(password, user.password_hash):  # ✅ Uses security.py for verification
        return None  # Invalid credentials
    return user
