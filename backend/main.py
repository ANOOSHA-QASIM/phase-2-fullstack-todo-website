from dotenv import load_dotenv
import os

# ✅ LOAD ENV FIRST — BEFORE ANY BACKEND IMPORT
load_dotenv(dotenv_path="backend/.env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import create_tables
from error_handlers import (
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)
from logging_config import setup_logging
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Todo Backend API",
    version="1.0.0",
    description="Secure Todo Backend API with JWT authentication and user isolation"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

@app.on_event("startup")
async def startup_event():
    """Initialize the database tables when the application starts."""
    logger.info("Starting up Todo Backend API...")
    create_tables()
    logger.info("Database tables created successfully")

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {
        "message": "Todo Backend API is running!",
        "version": "1.0.0",
        "documentation": "/docs for API documentation"
    }

# Include routes
from routes import tasks, auth
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])