import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.logging import get_logger
from app.api.routes.chat import router as chat_router
from app.api.routes.upload import router as upload_router

logger = get_logger(__name__)

app = FastAPI(
    title="RAG Chatbot API",
    version="1.0.0",
    description="RAG Chatbot using Groq + FAISS + LangChain",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000","https://rag-chatbot-macchine-task2.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(upload_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to RAG Chatbot API", "docs": "/docs"}


@app.on_event("startup")
async def startup_event():
    os.makedirs("data/raw", exist_ok=True)
    os.makedirs("vector_store", exist_ok=True)
    logger.info("Directories verified")
    logger.info("RAG Chatbot API started")
