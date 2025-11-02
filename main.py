"""
DeepVariance FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from routers import datasets, models, jobs, system
from database import initialize_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    print("Initializing database...")
    initialize_db()
    print("Server started successfully!")
    yield
    # Shutdown
    print("Shutting down server...")

app = FastAPI(
    title="DeepVariance API",
    description="REST API for CNN Model Training and Dataset Management",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(models.router, prefix="/api/models", tags=["Models"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Training Jobs"])
app.include_router(system.router, prefix="/api/system", tags=["System"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "DeepVariance API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
