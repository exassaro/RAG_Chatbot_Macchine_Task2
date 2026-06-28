from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """GET /api/health should return 200 with status ok."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["message"] == "RAG Chatbot is running"


def test_root_endpoint():
    """GET / should return welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome to RAG Chatbot API"
    assert data["docs"] == "/docs"


def test_chat_empty_question():
    """POST /api/chat with empty question should return 422."""
    response = client.post("/api/chat", json={"question": ""})
    assert response.status_code == 422


def test_chat_missing_question():
    """POST /api/chat with no question field should return 422."""
    response = client.post("/api/chat", json={})
    assert response.status_code == 422


@patch("app.api.routes.chat.invoke_chain")
def test_chat_success(mock_invoke):
    """POST /api/chat should return 200 with a mocked invoke_chain."""
    mock_invoke.return_value = {
        "answer": "test answer",
        "sources": ["doc.pdf"],
        "retrieved_count": 3,
    }

    response = client.post("/api/chat", json={"question": "What is RAG?"})
    assert response.status_code == 200

    data = response.json()
    assert data["answer"] == "test answer"
    assert data["sources"] == ["doc.pdf"]
    assert data["retrieved_count"] == 3

    mock_invoke.assert_called_once_with("What is RAG?")


@patch("app.api.routes.chat.invoke_chain")
def test_chat_with_session_id(mock_invoke):
    """POST /api/chat with session_id should echo it back in the response."""
    mock_invoke.return_value = {
        "answer": "test answer",
        "sources": ["doc.pdf"],
        "retrieved_count": 1,
    }

    response = client.post(
        "/api/chat",
        json={"question": "Hello", "session_id": "abc-123"},
    )
    assert response.status_code == 200
    assert response.json()["session_id"] == "abc-123"


@patch("app.api.routes.chat.invoke_chain")
def test_chat_internal_error(mock_invoke):
    """POST /api/chat should return 500 when invoke_chain raises an exception."""
    mock_invoke.side_effect = RuntimeError("LLM connection failed")

    response = client.post("/api/chat", json={"question": "What is RAG?"})
    assert response.status_code == 500
    assert "Internal error" in response.json()["detail"]


@patch("app.api.routes.chat.invoke_chain")
def test_chat_vector_store_not_found(mock_invoke):
    """POST /api/chat should return 500 when vector store is missing."""
    mock_invoke.side_effect = FileNotFoundError("Vector store not found")

    response = client.post("/api/chat", json={"question": "What is RAG?"})
    assert response.status_code == 500
    assert "Vector store not found" in response.json()["detail"]
