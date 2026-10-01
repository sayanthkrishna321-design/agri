"""
AgriSentinelX RAG Package

Exposes public interface functions for Django REST Framework and LangGraph Agent integration.
"""

from rag.retrieve import retrieve_documents, load_vector_store
from rag.answer import generate_grounded_answer
from rag.schemas import AnswerResponse, AnswerStatus, EligibilityResult, SourceCitation, RetrievedChunk
from rag.config import (
    get_groq_api_key,
    GROQ_MODEL,
    EMBEDDING_MODEL,
    TOP_K,
)

# Backward-compatibility aliases
get_gemini_api_key = get_groq_api_key
GEMINI_MODEL = GROQ_MODEL

__all__ = [
    "retrieve_documents",
    "load_vector_store",
    "generate_grounded_answer",
    "AnswerResponse",
    "AnswerStatus",
    "EligibilityResult",
    "SourceCitation",
    "RetrievedChunk",
    "get_groq_api_key",
    "GROQ_MODEL",
    "get_gemini_api_key",
    "GEMINI_MODEL",
    "EMBEDDING_MODEL",
    "TOP_K",
]
