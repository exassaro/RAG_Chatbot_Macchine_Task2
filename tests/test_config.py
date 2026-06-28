import pytest

from app.core.config import Settings


def test_settings_loads():
    """Settings should instantiate without error when GROQ_API_KEY is set."""
    settings = Settings(GROQ_API_KEY="test-key")
    assert settings.GROQ_API_KEY == "test-key"


def test_default_groq_model():
    settings = Settings(GROQ_API_KEY="test-key")
    assert settings.GROQ_MODEL == "llama3-8b-8192"


def test_default_top_k_results():
    settings = Settings(GROQ_API_KEY="test-key")
    assert settings.TOP_K_RESULTS == 7


def test_default_chunk_size():
    settings = Settings(GROQ_API_KEY="test-key")
    assert settings.CHUNK_SIZE == 1000


def test_default_chunk_overlap():
    settings = Settings(GROQ_API_KEY="test-key")
    assert settings.CHUNK_OVERLAP == 200


def test_default_embedding_model():
    settings = Settings(GROQ_API_KEY="test-key")
    assert settings.EMBEDDING_MODEL == "all-MiniLM-L6-v2"


def test_default_vector_store_path():
    settings = Settings(GROQ_API_KEY="test-key")
    assert settings.VECTOR_STORE_PATH == "vector_store/faiss_index"
