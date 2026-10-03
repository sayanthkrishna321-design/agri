"""
rag/ingest.py

PDF Ingestion, Text Chunking, Vector Embedding & FAISS Indexing module for AgriSentinelX RAG system.
Handles:
1. Finding PDF files in rag/documents/
2. Extracting page-by-page text with page numbers
3. Cleaning whitespace and noise
4. Splitting text into metadata-aware chunks with overlap
5. Generating vector embeddings using sentence-transformers (intfloat/multilingual-e5-base)
6. Building and persisting FAISS vector index + JSON metadata sidecar
"""

import os
import re
import json
import hashlib
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import faiss
except ImportError:
    faiss = None

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

from rag.config import (
    DOCUMENTS_DIR, EMBEDDINGS_DIR, FAISS_INDEX_PATH, METADATA_PATH, SOURCE_REGISTRY_PATH,
    EMBEDDING_MODEL, CHUNK_SIZE, CHUNK_OVERLAP
)

# Set up logging for ingestion tracking
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("AgriSentinelX.Ingest")

# Singleton cache for SentenceTransformer model to avoid repeated disk reloads
_EMBEDDING_MODEL_CACHE: Any = None


def get_embedding_model(model_name: str = EMBEDDING_MODEL) -> Any:
    """
    Loads and caches the SentenceTransformer embedding model if available.

    Args:
        model_name (str): HuggingFace model identifier.

    Returns:
        SentenceTransformer or None: Loaded embedding model instance.
    """
    global _EMBEDDING_MODEL_CACHE
    if _EMBEDDING_MODEL_CACHE is None:
        if SentenceTransformer is None:
            logger.warning("sentence_transformers package is not installed. Neural embeddings disabled.")
            return None
        logger.info(f"Loading SentenceTransformer model '{model_name}'...")
        try:
            _EMBEDDING_MODEL_CACHE = SentenceTransformer(model_name)
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer model '{model_name}': {e}")
            _EMBEDDING_MODEL_CACHE = None
    return _EMBEDDING_MODEL_CACHE


def clean_text(raw_text: str) -> str:
    """
    Cleans raw PDF extracted text by removing unnecessary control characters,
    normalizing spaces, and trimming blank lines.

    Args:
        raw_text (str): Raw string extracted from PDF page.

    Returns:
        str: Cleaned, structured plain text.
    """
    if not raw_text:
        return ""

    # Replace null bytes and non-printable control characters
    text = raw_text.replace("\x00", "")

    # Replace multiple horizontal spaces/tabs with single space
    text = re.sub(r"[ \t]+", " ", text)

    # Normalize excessive newlines (keep maximum of 2 newlines for paragraph breaks)
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    # Strip leading and trailing whitespace
    return text.strip()


def extract_pdf_pages(pdf_path: Path) -> List[Dict[str, Any]]:
    """
    Extracts page-by-page text from a single PDF document while preserving page numbers.

    Args:
        pdf_path (Path): Absolute path to the target PDF file.

    Returns:
        List[Dict[str, Any]]: List of dictionary objects containing page number and cleaned text.
    """
    extracted_pages: List[Dict[str, Any]] = []

    if not pdf_path.exists():
        logger.error(f"File not found: {pdf_path}")
        return extracted_pages

    try:
        reader = pypdf.PdfReader(str(pdf_path))
        num_pages = len(reader.pages)

        if num_pages == 0:
            logger.warning(f"PDF document is empty (0 pages): {pdf_path.name}")
            return extracted_pages

        logger.info(f"Extracting {num_pages} pages from '{pdf_path.name}'...")

        for i, page in enumerate(reader.pages):
            page_number = i + 1  # 1-indexed page numbering for human readability
            try:
                page_text = page.extract_text() or ""
                cleaned = clean_text(page_text)

                if cleaned:
                    extracted_pages.append({
                        "page": page_number,
                        "text": cleaned,
                        "char_count": len(cleaned)
                    })
                else:
                    logger.warning(f"Page {page_number} in '{pdf_path.name}' contains no readable text.")

            except Exception as e:
                logger.error(f"Failed to extract text from page {page_number} of '{pdf_path.name}': {e}")
                continue

    except pypdf.errors.PdfReadError as err:
        logger.error(f"Corrupted or invalid PDF format '{pdf_path.name}': {err}")
    except Exception as ex:
        logger.error(f"Unexpected error reading PDF '{pdf_path.name}': {ex}")

    return extracted_pages


def load_all_documents(documents_dir: Optional[Path] = None) -> List[Dict[str, Any]]:
    """
    Discovers and ingests all PDF files inside the specified documents directory.

    Args:
        documents_dir (Optional[Path]): Directory containing PDF files. Defaults to DOCUMENTS_DIR.

    Returns:
        List[Dict[str, Any]]: List of extracted document page records.
    """
    target_dir = documents_dir or DOCUMENTS_DIR

    if not target_dir.exists():
        logger.error(f"Documents directory does not exist: {target_dir}")
        return []

    pdf_files = list(target_dir.glob("*.pdf"))

    if not pdf_files:
        logger.warning(f"No PDF files found in '{target_dir}'. Place agricultural PDF scheme documents here.")
        return []

    all_document_pages: List[Dict[str, Any]] = []
    try:
        source_registry = json.loads(SOURCE_REGISTRY_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        source_registry = {}

    for idx, pdf_path in enumerate(sorted(pdf_files), start=1):
        doc_id = f"DOC{idx:03d}"
        if pdf_path.stem.lower().startswith("sample_"):
            logger.warning("Skipping placeholder PDF '%s'; add a verified source document instead.", pdf_path.name)
            continue
        registered_source = source_registry.get(pdf_path.name)
        if not registered_source or not registered_source.get("source_url") or not registered_source.get("sha256"):
            logger.warning("Skipping unregistered PDF '%s'; record source_url and sha256 in sources.json.", pdf_path.name)
            continue
        digest = hashlib.sha256(pdf_path.read_bytes()).hexdigest()
        if digest.lower() != str(registered_source["sha256"]).lower():
            logger.warning("Skipping PDF '%s'; its hash does not match the source registry.", pdf_path.name)
            continue
        doc_title = pdf_path.stem.replace("_", " ").replace("-", " ").title()

        logger.info(f"Ingesting [{doc_id}] {pdf_path.name}...")
        pages = extract_pdf_pages(pdf_path)

        for p in pages:
            all_document_pages.append({
                "document_id": doc_id,
                "document_title": registered_source.get("title") or doc_title,
                "source_url": registered_source["source_url"],
                "publisher": registered_source.get("publisher"),
                "sha256": digest,
                "file_name": pdf_path.name,
                "file_path": pdf_path.name,
                "page": p["page"],
                "text": p["text"]
            })

    logger.info(f"Successfully processed {len(pdf_files)} PDF(s), resulting in {len(all_document_pages)} page records.")
    return all_document_pages


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP) -> List[str]:
    """
    Splits text into chunks of maximum `chunk_size` characters with `chunk_overlap`.
    Snaps split points to word boundaries to prevent cutting words in half.

    Args:
        text (str): Input text string.
        chunk_size (int): Target character size per chunk.
        chunk_overlap (int): Overlap character length between consecutive chunks.

    Returns:
        List[str]: List of text chunk strings.
    """
    if chunk_size < 1 or chunk_overlap < 0 or chunk_overlap >= chunk_size:
        raise ValueError("chunk_size must be positive and chunk_overlap must be in [0, chunk_size).")
    if not text or not text.strip():
        return []

    cleaned = text.strip()
    if len(cleaned) <= chunk_size:
        return [cleaned]

    chunks: List[str] = []
    start = 0
    text_len = len(cleaned)

    while start < text_len:
        end = min(start + chunk_size, text_len)

        # Snap to word boundary if not at end of document
        if end < text_len:
            last_space = cleaned.rfind(" ", start, end)
            if last_space != -1 and last_space > start + (chunk_size // 2):
                end = last_space

        chunk_str = cleaned[start:end].strip()
        if chunk_str:
            chunks.append(chunk_str)

        if end >= text_len:
            break

        start = max(end - chunk_overlap, start + 1)

    return chunks


def chunk_documents(
    document_pages: List[Dict[str, Any]],
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP
) -> List[Dict[str, Any]]:
    """
    Takes extracted page records and breaks them into metadata-aware chunks.
    Every chunk gets a unique chunk_id (e.g. DOC001_PAGE01_CHUNK01) while maintaining
    the exact document_id, title, page, and file references.

    Args:
        document_pages (List[Dict[str, Any]]): List of extracted page records.
        chunk_size (int): Size per chunk in characters.
        chunk_overlap (int): Overlap between chunks in characters.

    Returns:
        List[Dict[str, Any]]: Structured list of chunk objects with complete metadata.
    """
    all_chunks: List[Dict[str, Any]] = []

    for page_record in document_pages:
        doc_id = page_record["document_id"]
        doc_title = page_record["document_title"]
        file_name = page_record["file_name"]
        file_path = page_record["file_path"]
        page_num = page_record["page"]
        text_content = page_record["text"]

        text_chunks = chunk_text(text_content, chunk_size=chunk_size, chunk_overlap=chunk_overlap)

        for chunk_idx, snippet in enumerate(text_chunks, start=1):
            chunk_id = f"{doc_id}_PAGE{page_num:02d}_CHUNK{chunk_idx:02d}"
            all_chunks.append({
                "chunk_id": chunk_id,
                "document_id": doc_id,
                "document_title": doc_title,
                "source_url": page_record.get("source_url"),
                "publisher": page_record.get("publisher"),
                "sha256": page_record.get("sha256"),
                "file_name": file_name,
                "file_path": file_path,
                "page": page_num,
                "text": snippet,
                "char_count": len(snippet)
            })

    logger.info(f"Chunking complete: Generated {len(all_chunks)} chunks from {len(document_pages)} pages.")
    return all_chunks


def format_text_for_embedding(text: str, is_query: bool = False, model_name: str = EMBEDDING_MODEL) -> str:
    """
    Formats text string with model-specific prefixes if required.
    For e5 models (like intfloat/multilingual-e5-base), prefixes 'passage: ' for documents
    and 'query: ' for search queries.

    Args:
        text (str): Raw text string.
        is_query (bool): Whether the text is a search query or a document chunk.
        model_name (str): SentenceTransformers model name.

    Returns:
        str: Formatted string ready for tokenization & embedding.
    """
    if "e5" in model_name.lower():
        prefix = "query: " if is_query else "passage: "
        if not text.startswith(prefix):
            return f"{prefix}{text}"
    return text


def generate_embeddings(
    chunks: List[Dict[str, Any]],
    model_name: str = EMBEDDING_MODEL
) -> np.ndarray:
    """
    Generates normalized float32 vector embeddings for a list of document chunks.

    Args:
        chunks (List[Dict[str, Any]]): List of chunk records containing 'text'.
        model_name (str): HuggingFace embedding model name.

    Returns:
        np.ndarray: NumPy array of shape (num_chunks, embedding_dim) with dtype float32.
    """
    model = get_embedding_model(model_name)
    dim = getattr(model, "get_embedding_dimension", getattr(model, "get_sentence_embedding_dimension", lambda: 768))()

    if not chunks:
        logger.warning(f"No text chunks provided to generate_embeddings. Returning empty array with dimension {dim}.")
        return np.empty((0, dim), dtype=np.float32)

    # Apply e5 prefix formatting if applicable
    formatted_texts = [
        format_text_for_embedding(c["text"], is_query=False, model_name=model_name)
        for c in chunks
    ]

    logger.info(f"Generating embeddings for {len(formatted_texts)} chunk(s) using '{model_name}'...")
    embeddings = model.encode(
        formatted_texts,
        batch_size=32,
        show_progress_bar=False,
        normalize_embeddings=True
    )

    embeddings_np = np.array(embeddings, dtype=np.float32)
    logger.info(f"Embeddings array generated successfully with shape {embeddings_np.shape}.")
    return embeddings_np


def ingest_and_chunk_documents(documents_dir: Optional[Path] = None) -> List[Dict[str, Any]]:
    """
    Pipeline function: Ingests all PDFs from documents_dir and converts them to chunks.

    Args:
        documents_dir (Optional[Path]): Directory containing PDF files.

    Returns:
        List[Dict[str, Any]]: Complete list of metadata-rich document chunks.
    """
    document_pages = load_all_documents(documents_dir)
    return chunk_documents(document_pages)


def create_faiss_index(
    chunks: List[Dict[str, Any]],
    embeddings: np.ndarray,
    index_path: Path = FAISS_INDEX_PATH,
    metadata_path: Path = METADATA_PATH
) -> bool:
    """
    Creates an Inner Product (IP) FAISS index from normalized vector embeddings
    and saves both the FAISS index binary and JSON metadata sidecar file.

    Args:
        chunks (List[Dict[str, Any]]): List of chunk objects.
        embeddings (np.ndarray): NumPy array of shape (num_chunks, vector_dim).
        index_path (Path): Target path for index.faiss.
        metadata_path (Path): Target path for metadata.json.

    Returns:
        bool: True if vector store created and saved successfully.
    """
    if len(chunks) == 0 or embeddings.shape[0] == 0:
        logger.warning("No chunks or embeddings available to build FAISS index.")
        return False

    if embeddings.ndim != 2 or len(chunks) != embeddings.shape[0] or not np.isfinite(embeddings).all():
        raise ValueError("Embeddings must be a finite 2D array with one row per chunk.")
    if faiss is None:
        logger.error("faiss-cpu is required to create an index.")
        return False
    num_vectors, dim = embeddings.shape
    logger.info(f"Building FAISS IndexFlatIP for {num_vectors} vectors of dimension {dim}...")

    # Create inner product (cosine similarity) index
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    # Ensure output directory exists
    index_path.parent.mkdir(parents=True, exist_ok=True)

    # Write FAISS index to file
    faiss.write_index(index, str(index_path))
    logger.info(f"Saved FAISS index to '{index_path}' ({index_path.stat().st_size} bytes).")

    # Format metadata payload mapping index i -> chunks[i]
    metadata_payload = {
        "embedding_model": EMBEDDING_MODEL,
        "vector_dimension": dim,
        "total_chunks": num_vectors,
        "chunks": chunks
    }

    metadata_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = metadata_path.with_suffix(metadata_path.suffix + ".tmp")
    with temporary_path.open("w", encoding="utf-8") as f:
        json.dump(metadata_payload, f, indent=2, ensure_ascii=False)
    temporary_path.replace(metadata_path)

    logger.info(f"Saved metadata registry to '{metadata_path}' with {num_vectors} records.")
    return True


def build_vector_store(documents_dir: Optional[Path] = None) -> bool:
    """
    Master ingestion workflow:
    1. Ingest PDFs from documents_dir
    2. Split pages into metadata-aware text chunks
    3. Generate vector embeddings
    4. Build & save FAISS vector index + metadata JSON

    Args:
        documents_dir (Optional[Path]): Directory containing PDF files.

    Returns:
        bool: True if vector store build completed successfully.
    """
    logger.info("=== STARTING AGRI-SENTINEL-X VECTOR STORE BUILD ===")
    chunks = ingest_and_chunk_documents(documents_dir)
    if not chunks:
        logger.warning("No document chunks produced. Vector store build aborted.")
        return False

    embeddings = generate_embeddings(chunks)
    success = create_faiss_index(chunks, embeddings)
    if success:
        logger.info("=== VECTOR STORE BUILD COMPLETED SUCCESSFULLY ===")
    return success


if __name__ == "__main__":
    build_vector_store()
