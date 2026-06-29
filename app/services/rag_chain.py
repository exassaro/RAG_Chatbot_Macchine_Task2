from typing import Dict, Any, List

from langchain_groq import ChatGroq
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

from app.core.config import settings
from app.core.logging import get_logger
from app.services.vector_store import get_retriever

logger = get_logger(__name__)


def build_rag_chain(session_id: str):
    """Build and return a LangChain retrieval chain using Groq LLM."""
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=0.2,
    )

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are a helpful assistant. Answer ONLY using the provided context. "
            "If the context does not have enough information, say: "
            "'I don't have enough information to answer this from the documents.'\n\n"
            "Context: {context}",
        ),
        ("human", "{input}"),
    ])

    retriever = get_retriever(session_id)
    document_chain = create_stuff_documents_chain(llm, prompt)
    retrieval_chain = create_retrieval_chain(retriever, document_chain)

    logger.info("RAG chain built successfully")
    return retrieval_chain


def invoke_chain(question: str, session_id: str) -> Dict[str, Any]:
    """Invoke the RAG chain with a question and return answer + sources."""
    chain = build_rag_chain(session_id)
    result = chain.invoke({"input": question})

    answer: str = result["answer"]
    context_docs: List = result.get("context", [])

    sources = list({
        doc.metadata.get("source", "unknown")
        for doc in context_docs
    })

    logger.info(
        f"Query answered — retrieved {len(context_docs)} chunk(s) "
        f"from {len(sources)} source(s)"
    )

    return {
        "answer": answer,
        "sources": sources,
        "retrieved_count": len(context_docs),
    }
