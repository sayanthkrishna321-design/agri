"""
rag/config.py

Configuration settings for AgriSentinelX RAG module.
LLM Provider: Groq (https://console.groq.com)
"""

import os
import json
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Define base workspace directory and project paths
BASE_DIR = Path(__file__).resolve().parent.parent
RAG_DIR = BASE_DIR / "rag"
DOCUMENTS_DIR = RAG_DIR / "documents"
EMBEDDINGS_DIR = RAG_DIR / "embeddings"
FAISS_INDEX_PATH = EMBEDDINGS_DIR / "index.faiss"
METADATA_PATH = EMBEDDINGS_DIR / "metadata.json"
SOURCE_REGISTRY_PATH = DOCUMENTS_DIR / "sources.json"

# Load environment variables from .env file located at workspace root
load_dotenv(dotenv_path=BASE_DIR / ".env")


def get_groq_api_key() -> Optional[str]:
    """
    Retrieves and validates the GROQ_API_KEY from environment variables.

    Returns:
        Optional[str]: The validated Groq API key, or None if unconfigured.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key.strip() == "" or "your_" in api_key.lower():
        return None
    return api_key.strip()


# LLM & Embedding Model Defaults
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-base")

# Chunking Parameters
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "100"))

# Retrieval & Threshold Controls
TOP_K: int = int(os.getenv("TOP_K", "5"))
RELEVANCE_THRESHOLD: float = float(os.getenv("RELEVANCE_THRESHOLD", "0.3"))

# Token Safety Limits (Per-query token cap)
MAX_INPUT_TOKENS: int = int(os.getenv("MAX_INPUT_TOKENS", "6000"))
MAX_OUTPUT_TOKENS: int = int(os.getenv("MAX_OUTPUT_TOKENS", "1000"))

if CHUNK_SIZE < 1 or CHUNK_OVERLAP < 0 or CHUNK_OVERLAP >= CHUNK_SIZE:
    raise ValueError("CHUNK_SIZE must be positive and CHUNK_OVERLAP must be smaller than CHUNK_SIZE.")
if TOP_K < 1 or not 0.0 <= RELEVANCE_THRESHOLD <= 1.0:
    raise ValueError("TOP_K must be positive and RELEVANCE_THRESHOLD must be between 0 and 1.")
if MAX_INPUT_TOKENS < 1 or MAX_OUTPUT_TOKENS < 1:
    raise ValueError("Token limits must be positive integers.")
