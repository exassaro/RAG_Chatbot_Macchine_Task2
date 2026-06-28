import os
import asyncio
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.core.logging import get_logger
from app.loaders.document_loader import load_all_documents
from app.services.vector_store import build_vector_store

logger = get_logger(__name__)

router = APIRouter(prefix="/api", tags=["Documents"])

DATA_DIR = "data/raw"
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload a PDF or DOCX file, save it, and rebuild the FAISS index."""
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()

    # Validate extension
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Only .pdf and .docx are allowed.",
        )

    file_path = os.path.join(DATA_DIR, filename)

    try:
        # Read and validate size
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds 50MB limit ({len(contents) / (1024 * 1024):.1f}MB).",
            )

        # Ensure data directory exists
        os.makedirs(DATA_DIR, exist_ok=True)

        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)
        logger.info(f"Saved uploaded file: {filename} ({len(contents)} bytes)")

        # Reload all documents and rebuild index in a thread pool
        # to avoid blocking the event loop during CPU-heavy embedding work
        documents = await asyncio.to_thread(load_all_documents, DATA_DIR)
        if not documents:
            raise HTTPException(
                status_code=500,
                detail="No documents could be parsed after upload.",
            )

        await asyncio.to_thread(build_vector_store, documents)
        logger.info(f"Vector store rebuilt after uploading {filename}")

        return {
            "message": "File uploaded and indexed successfully",
            "filename": filename,
            "status": "success",
        }

    except HTTPException:
        raise
    except Exception as e:
        # Clean up saved file on failure
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.warning(f"Cleaned up file after error: {filename}")
        logger.error(f"Upload failed for {filename}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}",
        )


@router.get("/documents")
async def list_documents():
    """List all uploaded PDF and DOCX documents with metadata."""
    if not os.path.isdir(DATA_DIR):
        return {"documents": [], "total": 0}

    documents: List[dict] = []

    for filename in sorted(os.listdir(DATA_DIR)):
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue

        file_path = os.path.join(DATA_DIR, filename)
        if not os.path.isfile(file_path):
            continue

        stat = os.stat(file_path)
        documents.append({
            "name": filename,
            "size_kb": round(stat.st_size / 1024, 2),
            "uploaded_at": datetime.fromtimestamp(
                stat.st_mtime, tz=timezone.utc
            ).isoformat(),
        })

    logger.info(f"Listed {len(documents)} document(s) in {DATA_DIR}")
    return {"documents": documents, "total": len(documents)}


@router.delete("/documents/{filename}")
async def delete_document(filename: str):
    """Delete a document and rebuild the vector store."""
    # Guard against path traversal
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")

    file_path = os.path.join(DATA_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File '{filename}' not found.")

    try:
        os.remove(file_path)
        logger.info(f"Deleted document: {filename}")

        # Rebuild index from remaining documents
        remaining_docs = await asyncio.to_thread(load_all_documents, DATA_DIR)
        if remaining_docs:
            await asyncio.to_thread(build_vector_store, remaining_docs)
            logger.info("Vector store rebuilt after deletion")
        else:
            logger.warning("No documents remaining — vector store not rebuilt")

        return {"message": "Deleted successfully", "filename": filename}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete {filename}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Delete failed: {str(e)}",
        )
