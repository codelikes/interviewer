import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

def test_read_root():
    """Test the root endpoint returns the expected response."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Interviewer API"}

def test_health_check():
    """Test the health check endpoint returns healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"} 