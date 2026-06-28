# RAG Chatbot API

A production-ready Retrieval-Augmented Generation (RAG) chatbot built with FastAPI, LangChain, and Groq — designed to answer questions grounded in your own PDF and DOCX documents.

---

## Architecture Overview

The system ingests documents (PDF/DOCX), splits them into chunks, and stores their vector embeddings in a local FAISS index using HuggingFace's `all-MiniLM-L6-v2` model. At query time, the most relevant chunks are retrieved and passed as context to a Groq-hosted LLM (`llama3-8b-8192`) via LangChain's `create_retrieval_chain`. The API is served through FastAPI with structured request/response schemas and built-in error handling.

```
User Question
     │
     ▼
┌──────────┐    ┌────────────┐    ┌────────────┐    ┌──────────┐
│ FastAPI   │───▶│ Retriever  │───▶│ LangChain  │───▶│ Groq LLM │
│ /api/chat │    │ (FAISS)    │    │ RAG Chain  │    │ (llama3) │
└──────────┘    └────────────┘    └────────────┘    └──────────┘
                     │                                    │
                     │         Context + Question         │
                     └────────────────────────────────────┘
                                      │
                                      ▼
                              Grounded Answer
                            + Source Documents
```

---

## Tech Stack

| Component         | Technology                          | Cost  |
|-------------------|-------------------------------------|-------|
| **Backend**       | FastAPI + Uvicorn                   | Free  |
| **LLM**           | Groq API (`llama3-8b-8192`)         | Free tier |
| **Embeddings**    | HuggingFace `all-MiniLM-L6-v2`     | Free (local) |
| **Vector Store**  | FAISS (CPU)                         | Free  |
| **Orchestration** | LangChain `create_retrieval_chain`  | Free  |
| **Doc Parsing**   | PyPDFLoader, Docx2txtLoader         | Free  |
| **Validation**    | Pydantic v2                         | Free  |

---

## Prerequisites

- **Python 3.10+**
- **Groq API key** — Get one for free at [console.groq.com](https://console.groq.com)
- PDF and/or DOCX documents to ingest

---

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/rag-chatbot.git
cd rag-chatbot

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
```

---

## Environment Setup

Copy the example environment file and fill in your Groq API key:

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable             | Description                                      | Default                    |
|----------------------|--------------------------------------------------|----------------------------|
| `GROQ_API_KEY`       | Your Groq API key (required)                     | —                          |
| `GROQ_MODEL`         | Groq model to use                                | `llama3-8b-8192`           |
| `EMBEDDING_MODEL`    | HuggingFace sentence-transformer model           | `all-MiniLM-L6-v2`         |
| `VECTOR_STORE_PATH`  | Path to save/load the FAISS index                | `vector_store/faiss_index` |
| `CHUNK_SIZE`         | Number of characters per document chunk           | `1000`                     |
| `CHUNK_OVERLAP`      | Overlap between consecutive chunks               | `200`                      |
| `TOP_K_RESULTS`      | Number of relevant chunks to retrieve per query  | `7`                        |

---

## Adding Documents

Place your PDF and DOCX files into the `data/raw/` directory:

```bash
data/raw/
├── company_handbook.pdf
├── product_specs.docx
└── research_paper.pdf
```

Unsupported file types are automatically skipped with a warning log.

---

## Running the Ingestion Pipeline

Process your documents and build the FAISS vector index:

```bash
python scripts/ingest_documents.py
```

This will:
1. Load all `.pdf` and `.docx` files from `data/raw/`
2. Split documents into chunks (default: 1000 chars with 200 overlap)
3. Generate embeddings using HuggingFace `all-MiniLM-L6-v2`
4. Build and save the FAISS index to `vector_store/faiss_index/`

> **Note:** Re-run this script whenever you add, remove, or update documents.

---

## Starting the API

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. Interactive docs are at `http://127.0.0.1:8000/docs`.

---

## Usage

### Sample Request

```bash
curl -X POST http://127.0.0.1:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the company leave policy?"}'
```

### Sample Response

```json
{
  "answer": "According to the company handbook, employees are entitled to 21 days of paid annual leave, 10 days of sick leave, and 5 personal days per calendar year.",
  "sources": ["company_handbook.pdf"],
  "retrieved_count": 7,
  "session_id": null
}
```

---

## API Endpoints

| Method | Endpoint      | Description                        | Request Body                          |
|--------|---------------|------------------------------------|---------------------------------------|
| `GET`  | `/`           | Welcome message and docs link      | —                                     |
| `GET`  | `/api/health` | Health check                       | —                                     |
| `POST` | `/api/chat`   | Ask a question against your docs   | `{"question": "...", "session_id": "..."}` |

### Response Codes

| Code  | Meaning                                      |
|-------|----------------------------------------------|
| `200` | Successful response                          |
| `422` | Validation error (empty or missing question) |
| `500` | Server error (missing index, LLM failure)    |

---

## Project Structure

```
rag-chatbot/
├── app/
│   ├── api/routes/chat.py       # FastAPI route handlers
│   ├── core/config.py           # Pydantic settings (loads .env)
│   ├── core/logging.py          # Centralized logging
│   ├── loaders/
│   │   ├── pdf_loader.py        # PDF document loader
│   │   ├── docx_loader.py       # DOCX document loader
│   │   └── document_loader.py   # Aggregator: scans data/raw/
│   ├── schemas/chat.py          # Request/response Pydantic models
│   ├── services/
│   │   ├── embeddings.py        # Cached HuggingFace embeddings
│   │   ├── vector_store.py      # FAISS build/load/retriever
│   │   └── rag_chain.py         # LangChain retrieval chain + Groq
│   └── main.py                  # FastAPI app entry point
├── scripts/
│   └── ingest_documents.py      # Document ingestion CLI
├── tests/
│   ├── test_chat.py             # API endpoint tests
│   ├── test_config.py           # Settings tests
│   └── test_loaders.py          # Document loader tests
├── data/raw/                    # Drop your documents here
├── vector_store/                # FAISS index (auto-generated)
├── .env.example                 # Environment template
├── requirements.txt             # Python dependencies
└── README.md
```

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Groq over OpenAI** | Groq offers a generous free tier with ultra-low latency inference, making it ideal for prototyping and small-scale deployments. |
| **HuggingFace embeddings (local)** | Eliminates the need for an embedding API key. The `all-MiniLM-L6-v2` model runs locally, is fast, and produces high-quality 384-dimensional embeddings. |
| **FAISS over Chroma/Pinecone** | FAISS is lightweight, requires no external server, and performs well for datasets up to millions of vectors. Ideal for local-first RAG. |
| **`create_retrieval_chain`** | LangChain's built-in chain handles retrieval → context injection → LLM invocation in a single composable pipeline. |
| **Pydantic Settings** | Type-safe configuration with automatic `.env` loading and validation at startup. |
| **Singleton embeddings** | The embedding model is cached in memory to avoid reloading the ~80MB model on every request. |
| **Top-K = 7** | Balances context richness with token budget. Groq's `llama3-8b-8192` has an 8K context window; 7 chunks of ~1000 chars fit comfortably. |

---

## Limitations & Future Improvements

### Current Limitations
- **No conversation memory** — each request is independent; no multi-turn context
- **Full re-index required** — adding new documents requires re-running the ingestion script
- **No authentication** — the API is open; not suitable for production without auth
- **CPU-only FAISS** — uses `faiss-cpu`; GPU acceleration available via `faiss-gpu`

### Planned Improvements
- [ ] **Conversation memory** with session-based chat history
- [ ] **Incremental ingestion** — add documents without rebuilding the full index
- [ ] **Streaming responses** via Server-Sent Events (SSE)
- [ ] **API key authentication** with rate limiting
- [ ] **Docker support** for containerized deployment
- [ ] **Frontend UI** — React or Streamlit chat interface
- [ ] **Support for more formats** — `.txt`, `.csv`, `.xlsx`, `.html`
- [ ] **Reranking** with a cross-encoder for improved retrieval precision

---

## Running Tests

```bash
pytest tests/ -v
```

---

## License

MIT
