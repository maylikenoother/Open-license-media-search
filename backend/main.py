from fastapi import FastAPI
from backend.routes import users

app = FastAPI(title="Open License Media Search API")

app.include_router(users.router, prefix="/users", tags=["Users"])

@app.get("/")
def home():
    return {"message": "Welcome to Open License Media Search API"}
