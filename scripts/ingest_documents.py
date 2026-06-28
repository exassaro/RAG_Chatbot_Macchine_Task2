import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.logging import get_logger
from app.loaders.document_loader import load_all_documents
from app.services.vector_store import build_vector_store

logger = get_logger(__name__)


def main():
    logger.info("Starting document ingestion from data/raw/")

    documents = load_all_documents("data/raw")

    if not documents:
        logger.error("No documents found. Add PDF or DOCX files to data/raw/")
        sys.exit(1)

    logger.info(f"Loaded {len(documents)} document(s). Building vector store...")
    build_vector_store(documents)

    logger.info(f"Ingestion complete! FAISS index saved to {settings.VECTOR_STORE_PATH}")


if __name__ == "__main__":
    main()
