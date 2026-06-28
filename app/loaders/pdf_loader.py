import os
from typing import List

from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document

from app.core.logging import get_logger

logger = get_logger(__name__)


def load_pdf(file_path: str) -> List[Document]:
    """Load a PDF file and return a list of Documents with source metadata."""
    try:
        if not os.path.exists(file_path):
            logger.error(f"PDF file not found: {file_path}")
            return []

        loader = PyPDFLoader(file_path)
        documents = loader.load()

        filename = os.path.basename(file_path)
        for doc in documents:
            doc.metadata["source"] = filename

        logger.info(f"Loaded {len(documents)} document(s) from {filename}")
        return documents

    except Exception as e:
        logger.error(f"Error parsing PDF {file_path}: {e}")
        return []
