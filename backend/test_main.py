import pytest
from fastapi.testclient import TestClient
from main import app
from db import create_tables, engine
from sqlmodel import SQLModel, create_engine
from unittest.mock import patch

# Create test client
client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Todo Backend API is running!"
    assert data["version"] == "1.0.0"

def test_api_docs_available():
    """Test that API documentation is available"""
    response = client.get("/docs")
    assert response.status_code == 200

def test_redoc_available():
    """Test that ReDoc documentation is available"""
    response = client.get("/redoc")
    assert response.status_code == 200

def test_get_auth_me_unauthorized():
    """Test accessing auth/me endpoint without authentication"""
    response = client.get("/api/auth/me")
    # Should return 401 for unauthorized access
    assert response.status_code == 401

if __name__ == "__main__":
    pytest.main([__file__])