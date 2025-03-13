from fastapi import FastAPI
from backend.middleware.session import add_session_middleware
from backend.routes import users, search, auth_google
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Open License Media Search API")

add_session_middleware(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(auth_google.router, prefix="/auth", tags=["OAuth"])

print(app.routes)

@app.get("/")
def home():
    return {"message": "Search Media for Free!"}
