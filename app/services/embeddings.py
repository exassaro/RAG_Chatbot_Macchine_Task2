from langchain_huggingface import HuggingFaceEndpointEmbeddings

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_embeddings_instance: HuggingFaceEndpointEmbeddings | None = None


def get_embeddings() -> HuggingFaceEndpointEmbeddings:
    """Return a cached HuggingFaceEndpointEmbeddings instance.

    Uses the free Hugging Face Inference API instead of loading the model
    locally, reducing memory usage from ~400MB to near zero.
    """
    global _embeddings_instance

    if _embeddings_instance is None:
        logger.info(f"Connecting to HF Inference API for model: {settings.EMBEDDING_MODEL}")
        _embeddings_instance = HuggingFaceEndpointEmbeddings(
            model=settings.EMBEDDING_MODEL,
            huggingfacehub_api_token=settings.HUGGINGFACE_API_TOKEN,
        )
        logger.info("HF Inference API embedding client ready")

    return _embeddings_instance
