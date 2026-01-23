from fastapi import APIRouter, Depends, HTTPException, status, Body
from dependencies import get_current_user
from models import SuccessResponse
from middleware import auth_rate_limiter
from utils import create_access_token, verify_token
from fastapi.responses import JSONResponse
import hashlib
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Simple in-memory user storage (in production, use a database)
# For now, we'll store user credentials as hash
users_db = {}


def hash_password(password: str) -> str:
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(plain_password) == hashed_password


@router.get("/me", response_model=SuccessResponse)
async def get_current_user_profile(user_id: str = Depends(get_current_user)):
    return SuccessResponse(
        success=True,
        data={
            "id": user_id,
            "email": "user@example.com",
            "name": "Authenticated User",
        }
    )


@router.post("/signup")
async def signup(
    payload: dict = Body(
        ...,
        example={
            "email": "anusha@example.com",
            "password": "Password123",
            "name": "Anusha Qasim"
        }
    )
):
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request body cannot be empty"
        )

    email = payload.get("email")
    password = payload.get("password")
    name = payload.get("name", "")

    # Validate required fields
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    # Check if user already exists
    if email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists with this email"
        )

    # Create new user
    user_id = str(uuid.uuid4())
    users_db[email] = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(password),
        "name": name
    }

    # Generate access token
    access_token = create_access_token(data={"sub": user_id})

    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "data": {
                "id": user_id,
                "email": email,
                "name": name,
                "access_token": access_token,
                "token_type": "bearer"
            },
            "message": "Signup successful"
        }
    )


@router.post("/login")
async def login(
    payload: dict = Body(
        ...,
        example={
            "email": "anusha@example.com",
            "password": "Password123"
        }
    )
):
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request body cannot be empty"
        )

    email = payload.get("email")
    password = payload.get("password")

    # Validate required fields
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    # Find user and verify password
    user = users_db.get(email)
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate access token
    access_token = create_access_token(data={"sub": user["id"]})

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "data": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "access_token": access_token,
                "token_type": "bearer"
            },
            "message": "Login successful"
        }
    )


@router.post("/logout")
async def logout(user_id: str = Depends(get_current_user)):
    return SuccessResponse(
        success=True,
        data={"message": "Logged out successfully"}
    )
