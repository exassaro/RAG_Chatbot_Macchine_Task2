import asyncio

from fastapi import APIRouter, HTTPException

from app.core.logging import get_logger
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag_chain import invoke_chain

logger = get_logger(__name__)

router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Accept a question and return a RAG-powered answer."""
    logger.info(f"Incoming question: {request.question}")

    try:
        result = await asyncio.to_thread(invoke_chain, request.question)
    except FileNotFoundError as e:
        logger.error(f"Vector store not found: {e}")
        raise HTTPException(
            status_code=500,
            detail="Vector store not found. Please upload documents first.",
        )
    except Exception as e:
        logger.error(f"Error invoking RAG chain: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(e)}",
        )

    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"],
        retrieved_count=result["retrieved_count"],
        session_id=request.session_id,
    )


@router.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "message": "RAG Chatbot is running"}
