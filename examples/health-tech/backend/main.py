from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import json
from typing import List

from .database import engine, database
from . import models, router

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Health-Tech Remote Monitoring")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates
# Get the absolute path to the frontend directory
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")
templates = Jinja2Templates(directory=frontend_dir)

# Connect to database on startup
@app.on_event("startup")
async def startup():
    await database.connect()

# Disconnect from database on shutdown
@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Include API routes
app.include_router(router.router, prefix="/api")

# Serve frontend
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Simple data endpoint for dashboard demo
@app.get("/api/demo/motion-metrics")
async def demo_motion_metrics():
    return {
        "patient_id": 1,
        "name": "John Doe",
        "metrics": {
            "gait_speed": [
                {"date": "2023-01-01", "value": 1.2},
                {"date": "2023-01-08", "value": 1.3},
                {"date": "2023-01-15", "value": 1.25},
                {"date": "2023-01-22", "value": 1.4},
                {"date": "2023-01-29", "value": 1.5}
            ],
            "stride_length": [
                {"date": "2023-01-01", "value": 0.6},
                {"date": "2023-01-08", "value": 0.65},
                {"date": "2023-01-15", "value": 0.62},
                {"date": "2023-01-22", "value": 0.7},
                {"date": "2023-01-29", "value": 0.72}
            ],
            "range_of_motion": [
                {"date": "2023-01-01", "value": 85},
                {"date": "2023-01-08", "value": 87},
                {"date": "2023-01-15", "value": 90},
                {"date": "2023-01-22", "value": 92},
                {"date": "2023-01-29", "value": 95}
            ]
        }
    }