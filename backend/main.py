from fastapi import FastAPI
from backend.routes import search
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Open License Media Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api", tags=["Search"])

print(app.routes)

@app.get("/")
def home():
    return {"message": "Search Media for Free!"}
