from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import schemas, crud, database, auth

router = APIRouter()

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """Register a new user if email is not already taken."""
    existing_user = crud.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return crud.create_user(db, user, is_admin=False)


@router.post("/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    """Authenticate user and return JWT token if valid"""
    
    user = crud.get_user_by_email(db, user_credentials.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not auth.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    access_token = auth.create_access_token({"sub": user.email})

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/admin-only")
def admin_only(user: schemas.UserResponse = Depends(auth.get_current_user)):
    """Example of an admin-only route."""
    if not user.isAdmin:
        raise HTTPException(status_code=403, detail="Admin access required")

    return {"message": "Welcome Admin!", "user": user.email}
