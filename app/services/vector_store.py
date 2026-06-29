import os
from typing import List

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings
from app.core.logging import get_logger
from app.services.embeddings import get_embeddings

logger = get_logger(__name__)


def build_vector_store(documents: List[Document], session_id: str) -> FAISS:
    """Split documents into chunks, build a FAISS index, and save it to disk."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
    )
    splits = text_splitter.split_documents(documents)
    logger.info(f"Created {len(splits)} chunk(s) from {len(documents)} document(s)")

    embeddings = get_embeddings()
    vector_store = FAISS.from_documents(splits, embeddings)

    store_path = os.path.join(settings.VECTOR_STORE_BASE_PATH, session_id)
    vector_store.save_local(store_path)
    logger.info(f"FAISS index saved to {store_path}")

    return vector_store


def load_vector_store(session_id: str) -> FAISS:
    """Load a FAISS index from disk."""
    store_path = os.path.join(settings.VECTOR_STORE_BASE_PATH, session_id)
    if not os.path.exists(store_path):
        raise FileNotFoundError(
            f"Vector store not found at '{store_path}'. "
            "Please upload documents first."
        )

    embeddings = get_embeddings()
    vector_store = FAISS.load_local(
        store_path,
        embeddings,
        allow_dangerous_deserialization=True,
    )
    logger.info(f"FAISS index loaded from {store_path}")
    return vector_store


def get_retriever(session_id: str):
    """Return a retriever backed by the FAISS vector store."""
    vector_store = load_vector_store(session_id)
    return vector_store.as_retriever(
        search_kwargs={"k": settings.TOP_K_RESULTS}
    )
