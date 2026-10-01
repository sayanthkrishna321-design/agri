"""
rag/retrieve.py

Vector Retrieval module for AgriSentinelX RAG system.
Loads FAISS vector index and metadata registry, encodes user queries,
performs similarity search, applies relevance thresholds, and returns structured Pydantic RetrievedChunk instances.
"""

import json
import logging
from pathlib import Path
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np

try:
    import faiss
except ImportError:
    faiss = None

from rag.config import (
    FAISS_INDEX_PATH, METADATA_PATH, EMBEDDING_MODEL,
    TOP_K, RELEVANCE_THRESHOLD
)
from rag.ingest import get_embedding_model, format_text_for_embedding
from rag.schemas import RetrievedChunk

# Set up logging for retrieval tracking
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("AgriSentinelX.Retrieve")

# Global singleton cache for loaded FAISS index and metadata
_FAISS_INDEX_CACHE: Any = None
_METADATA_REGISTRY_CACHE: Optional[Dict[str, Any]] = None


def load_vector_store(
    index_path: Path = FAISS_INDEX_PATH,
    metadata_path: Path = METADATA_PATH,
    force_reload: bool = False
) -> bool:
    """
    Loads and caches the FAISS index and metadata registry from disk into memory.

    Args:
        index_path (Path): Path to index.faiss.
        metadata_path (Path): Path to metadata.json.
        force_reload (bool): Reload from disk even if cached.

    Returns:
        bool: True if vector store loaded successfully, False otherwise.
    """
    global _FAISS_INDEX_CACHE, _METADATA_REGISTRY_CACHE

    if force_reload:
        _FAISS_INDEX_CACHE = None
        _METADATA_REGISTRY_CACHE = None

    if not index_path.exists() or not metadata_path.exists():
        logger.warning(f"Vector store files not found at '{index_path}' or '{metadata_path}'. Run ingestion first.")
        return False

    try:
        if _FAISS_INDEX_CACHE is None:
            logger.info(f"Loading FAISS index from '{index_path}'...")
            _FAISS_INDEX_CACHE = faiss.read_index(str(index_path))

        if _METADATA_REGISTRY_CACHE is None:
            logger.info(f"Loading metadata registry from '{metadata_path}'...")
            with open(metadata_path, "r", encoding="utf-8") as f:
                _METADATA_REGISTRY_CACHE = json.load(f)

        return True
    except Exception as e:
        logger.error(f"Failed to load vector store from disk: {e}")
        return False


def retrieve_documents(
    query: str,
    state: Optional[str] = None,
    district: Optional[str] = None,
    crop: Optional[str] = None,
    season: Optional[str] = None,
    year: Optional[int] = None,
    top_k: int = TOP_K,
    relevance_threshold: float = RELEVANCE_THRESHOLD
) -> List[RetrievedChunk]:
    """
    Retrieves top_k relevant document chunks for a natural language or Hinglish user query.

    Args:
        query (str): Natural language user question (e.g. "What crop insurance guidelines apply to cotton in Maharashtra?")
        state (Optional[str]): Filter by Indian state.
        district (Optional[str]): Filter by district.
        crop (Optional[str]): Filter by crop.
        season (Optional[str]): Filter by season (Kharif, Rabi).
        year (Optional[int]): Filter by scheme year.
        top_k (int): Maximum number of chunks to return.
        relevance_threshold (float): Minimum relevance score threshold.

    Returns:
        List[RetrievedChunk]: List of validated Pydantic RetrievedChunk instances sorted by score.
    """
    if not query or not query.strip():
        logger.warning("Empty query provided to retrieve_documents.")
        return []

    # Ensure FAISS index and metadata are loaded into memory
    if not load_vector_store():
        return []

    index = _FAISS_INDEX_CACHE
    metadata_store = _METADATA_REGISTRY_CACHE or {}
    chunk_list = metadata_store.get("chunks", [])

    if len(chunk_list) == 0:
        logger.warning("FAISS vector store and metadata registry are empty.")
        return []

    model_name = metadata_store.get("embedding_model", EMBEDDING_MODEL)
    model = get_embedding_model(model_name)

    retrieved_results: List[RetrievedChunk] = []

    # If FAISS index or sentence-transformers model is unavailable, use keyword fallback retrieval
    if index is None or model is None:
        logger.info("Using text keyword similarity fallback for retrieval.")
        query_words = set(query.lower().split())
        scored_chunks = []
        for chunk in chunk_list:
            text_lower = chunk["text"].lower()
            matches = sum(1 for word in query_words if word in text_lower)
            score = round(min(0.5 + (matches * 0.1), 0.95), 4)
            if matches > 0 or len(chunk_list) <= 3:
                scored_chunks.append((score, chunk))
        
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        for score, chunk_data in scored_chunks[:top_k]:
            retrieved_results.append(
                RetrievedChunk(
                    chunk_id=chunk_data["chunk_id"],
                    text=chunk_data["text"],
                    document_title=chunk_data["document_title"],
                    page=chunk_data.get("page"),
                    source_url=chunk_data.get("source_url"),
                    relevance_score=score,
                    metadata={
                        "document_id": chunk_data["document_id"],
                        "file_name": chunk_data["file_name"],
                        "file_path": chunk_data["file_path"],
                        "char_count": chunk_data.get("char_count", len(chunk_data["text"]))
                    }
                )
            )
        return retrieved_results

    # Format user query with e5 prefix if using e5 embedding model
    formatted_query = format_text_for_embedding(query, is_query=True, model_name=model_name)

    # Embed search query into float32 normalized vector
    query_vector = model.encode(
        [formatted_query],
        show_progress_bar=False,
        normalize_embeddings=True
    )
    query_vector_np = np.array(query_vector, dtype=np.float32)

    # Execute inner product vector search on FAISS index
    search_k = min(max(top_k * 3, 10), index.ntotal)  # Fetch extra candidates for metadata filtering
    scores, indices = index.search(query_vector_np, search_k)

    retrieved_results: List[RetrievedChunk] = []

    for score, idx in zip(scores[0], indices[0]):
        if idx < 0 or idx >= len(chunk_list):
            continue

        raw_score = float(score)

        # Apply relevance score cutoff
        if raw_score < relevance_threshold:
            logger.debug(f"Candidate chunk index {idx} score {raw_score:.4f} below threshold {relevance_threshold}.")
            continue

        chunk_data = chunk_list[idx]

        # Optional metadata filtering
        if state and chunk_data.get("state") and chunk_data["state"].lower() != state.lower():
            continue
        if district and chunk_data.get("district") and chunk_data["district"].lower() != district.lower():
            continue
        if crop and chunk_data.get("crop") and chunk_data["crop"].lower() != crop.lower():
            continue
        if season and chunk_data.get("season") and chunk_data["season"].lower() != season.lower():
            continue
        if year and chunk_data.get("year") and chunk_data["year"] != year:
            continue

        # Convert dictionary to Pydantic RetrievedChunk instance
        retrieved_chunk = RetrievedChunk(
            chunk_id=chunk_data["chunk_id"],
            text=chunk_data["text"],
            document_title=chunk_data["document_title"],
            page=chunk_data.get("page"),
            source_url=chunk_data.get("source_url"),
            relevance_score=round(raw_score, 4),
            metadata={
                "document_id": chunk_data["document_id"],
                "file_name": chunk_data["file_name"],
                "file_path": chunk_data["file_path"],
                "char_count": chunk_data.get("char_count", len(chunk_data["text"]))
            }
        )
        retrieved_results.append(retrieved_chunk)

        if len(retrieved_results) >= top_k:
            break

    logger.info(
        f"Retrieval query '{query[:40]}...' produced {len(retrieved_results)} relevant chunk(s) "
        f"(top score: {retrieved_results[0].relevance_score if retrieved_results else 'None'})."
    )

    return retrieved_results
