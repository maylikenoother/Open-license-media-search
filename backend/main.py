import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from routes import search, users
from dotenv import load_dotenv
from database import client as mongo_client

load_dotenv()

app = FastAPI(
    title="Open License Media Search API",
    description="API for searching and managing open license media",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Local development
    "http://localhost:8000",
    "https://olm-search.onrender.com",
          # Local backend
    os.getenv("FRONTEND_URL", "https://olm-search.onrender.com"),
    os.getenv("ALLOWED_ORIGINS", "").split(",")
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])

@app.get("/")
async def root():
    """Root endpoint for health check and basic info."""
    return {
        "name": "Open License Media Search API",
        "version": "1.0.0",
        "status": "online",
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "api_version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "render_instance": os.getenv("RENDER_INSTANCE_ID", None)
    }

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection when the app shuts down."""
    mongo_client.close()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)