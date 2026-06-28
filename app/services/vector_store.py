import os
from typing import List

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings
from app.core.logging import get_logger
from app.services.embeddings import get_embeddings

logger = get_logger(__name__)


def build_vector_store(documents: List[Document]) -> FAISS:
    """Split documents into chunks, build a FAISS index, and save it to disk."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
    )
    splits = text_splitter.split_documents(documents)
    logger.info(f"Created {len(splits)} chunk(s) from {len(documents)} document(s)")

    embeddings = get_embeddings()
    vector_store = FAISS.from_documents(splits, embeddings)

    vector_store.save_local(settings.VECTOR_STORE_PATH)
    logger.info(f"FAISS index saved to {settings.VECTOR_STORE_PATH}")

    return vector_store


def load_vector_store() -> FAISS:
    """Load a FAISS index from disk."""
    if not os.path.exists(settings.VECTOR_STORE_PATH):
        raise FileNotFoundError(
            f"Vector store not found at '{settings.VECTOR_STORE_PATH}'. "
            "Run the ingestion script first to build the index."
        )

    embeddings = get_embeddings()
    vector_store = FAISS.load_local(
        settings.VECTOR_STORE_PATH,
        embeddings,
        allow_dangerous_deserialization=True,
    )
    logger.info(f"FAISS index loaded from {settings.VECTOR_STORE_PATH}")
    return vector_store


def get_retriever():
    """Return a retriever backed by the FAISS vector store."""
    vector_store = load_vector_store()
    return vector_store.as_retriever(
        search_kwargs={"k": settings.TOP_K_RESULTS}
    )
