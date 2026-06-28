from langchain_community.embeddings import HuggingFaceEmbeddings

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_embeddings_instance: HuggingFaceEmbeddings | None = None


def get_embeddings() -> HuggingFaceEmbeddings:
    """Return a cached HuggingFaceEmbeddings instance."""
    global _embeddings_instance

    if _embeddings_instance is None:
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        _embeddings_instance = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL
        )
        logger.info("Embedding model loaded successfully")

    return _embeddings_instance
