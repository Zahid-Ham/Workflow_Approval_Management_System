import pytest
from fastapi.testclient import TestClient
from app.core.exceptions import NotFoundException, ConflictException
from main import app

client = TestClient(app)
client_no_raise = TestClient(app, raise_server_exceptions=False)


# Temporary test endpoints registered on the main app
@app.get("/test-not-found-exception")
async def trigger_not_found():
    raise NotFoundException("Sample resource not found.")


@app.get("/test-generic-exception")
async def trigger_generic():
    raise ValueError("Database crash dummy error.")


def test_not_found_exception_handling():
    """Assures NotFoundException maps to 404."""
    response = client.get("/test-not-found-exception")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "Sample resource not found." in data["detail"]


def test_generic_exception_handling():
    """Assures unhandled exceptions convert to 500 error formats."""
    response = client_no_raise.get("/test-generic-exception")
    assert response.status_code == 500
    data = response.json()
    assert "detail" in data
