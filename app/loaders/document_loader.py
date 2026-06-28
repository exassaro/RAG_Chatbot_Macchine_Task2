import os
from typing import List

from langchain_core.documents import Document

from app.core.logging import get_logger
from app.loaders.pdf_loader import load_pdf
from app.loaders.docx_loader import load_docx

logger = get_logger(__name__)


def load_all_documents(directory: str = "data/raw") -> List[Document]:
    """Scan a directory for .pdf and .docx files and return all loaded Documents."""
    if not os.path.isdir(directory):
        logger.error(f"Directory not found: {directory}")
        return []

    all_documents: List[Document] = []
    files_processed = 0

    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)

        if not os.path.isfile(file_path):
            continue

        ext = os.path.splitext(filename)[1].lower()

        if ext == ".pdf":
            docs = load_pdf(file_path)
            all_documents.extend(docs)
            files_processed += 1
        elif ext == ".docx":
            docs = load_docx(file_path)
            all_documents.extend(docs)
            files_processed += 1
        else:
            logger.warning(f"Skipping unsupported file type: {filename}")

    logger.info(
        f"Processed {files_processed} file(s) from '{directory}', "
        f"loaded {len(all_documents)} document(s) total"
    )
    return all_documents
