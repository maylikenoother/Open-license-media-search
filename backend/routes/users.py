# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# # from backend import schemas, auth

# router = APIRouter()

# # @router.get("/admin-only")
# # def admin_only(user: schemas.UserResponse = Depends(auth.get_current_user)):
# #     """Example of an admin-only route."""
# #     if not user.isAdmin:
# #         raise HTTPException(status_code=403, detail="Admin access required")

# #     return {"message": "Welcome Admin!", "user": user.email}
