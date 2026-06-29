import os
import asyncio
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException, Header
import shutil

from app.core.logging import get_logger
from app.loaders.document_loader import load_all_documents
from app.services.vector_store import build_vector_store

logger = get_logger(__name__)

router = APIRouter(prefix="/api", tags=["Documents"])

DATA_DIR = "data/raw"
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    x_session_id: str = Header(...)
):
    """Upload a PDF or DOCX file, save it, and rebuild the FAISS index."""
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()

    # Validate extension
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Only .pdf and .docx are allowed.",
        )

    session_data_dir = os.path.join(DATA_DIR, x_session_id)
    file_path = os.path.join(session_data_dir, filename)

    try:
        # Read and validate size
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds 50MB limit ({len(contents) / (1024 * 1024):.1f}MB).",
            )

        # Ensure data directory exists
        os.makedirs(session_data_dir, exist_ok=True)

        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)
        logger.info(f"Saved uploaded file: {filename} ({len(contents)} bytes)")

        # Reload all documents and rebuild index in a thread pool
        # to avoid blocking the event loop during CPU-heavy embedding work
        documents = await asyncio.to_thread(load_all_documents, session_data_dir)
        if not documents:
            raise HTTPException(
                status_code=500,
                detail="No documents could be parsed after upload.",
            )

        await asyncio.to_thread(build_vector_store, documents, x_session_id)
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
async def list_documents(x_session_id: str = Header(...)):
    """List all uploaded PDF and DOCX documents with metadata."""
    session_data_dir = os.path.join(DATA_DIR, x_session_id)
    if not os.path.isdir(session_data_dir):
        return {"documents": [], "total": 0}

    documents: List[dict] = []

    for filename in sorted(os.listdir(session_data_dir)):
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue

        file_path = os.path.join(session_data_dir, filename)
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

    logger.info(f"Listed {len(documents)} document(s) in {session_data_dir}")
    return {"documents": documents, "total": len(documents)}


@router.delete("/documents/{filename}")
async def delete_document(filename: str, x_session_id: str = Header(...)):
    """Delete a document and rebuild the vector store."""
    # Guard against path traversal
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")

    session_data_dir = os.path.join(DATA_DIR, x_session_id)
    file_path = os.path.join(session_data_dir, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File '{filename}' not found.")

    try:
        os.remove(file_path)
        logger.info(f"Deleted document: {filename}")

        # Rebuild index from remaining documents
        remaining_docs = await asyncio.to_thread(load_all_documents, session_data_dir)
        if remaining_docs:
            await asyncio.to_thread(build_vector_store, remaining_docs, x_session_id)
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

@router.post("/session/cleanup")
async def cleanup_session(x_session_id: str = Header(...)):
    """Delete all files and vector store for a session."""
    session_data_dir = os.path.join(DATA_DIR, x_session_id)
    if os.path.exists(session_data_dir):
        shutil.rmtree(session_data_dir)
        logger.info(f"Cleaned up data directory for session {x_session_id}")
    
    from app.core.config import settings
    store_path = os.path.join(settings.VECTOR_STORE_BASE_PATH, x_session_id)
    if os.path.exists(store_path):
        shutil.rmtree(store_path)
        logger.info(f"Cleaned up vector store for session {x_session_id}")

    return {"status": "success", "message": "Session cleaned up successfully"}
