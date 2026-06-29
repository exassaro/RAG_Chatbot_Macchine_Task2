from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    HUGGINGFACE_API_TOKEN: str = ""
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    VECTOR_STORE_PATH: str = "vector_store/faiss_index"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_RESULTS: int = 7
    
    class Config:
        env_file = ".env"

settings = Settings()
