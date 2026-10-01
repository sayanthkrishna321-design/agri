"""
rag/schemas.py

Pydantic data models for AgriSentinelX RAG system.
Ensures strict validation, consistent data structures for vector chunks,
source citations, tool integration, uncertainty handling, and AI responses.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AnswerStatus(str, Enum):
    """Execution status of the RAG answer generation pipeline."""
    SUCCESS = "success"
    INSUFFICIENT_INFORMATION = "insufficient_information"
    CLARIFICATION_REQUIRED = "clarification_required"
    ERROR = "error"


class EligibilityResult(str, Enum):
    """
    Deterministic eligibility status.
    IMPORTANT: Must be populated by rule tools only, NEVER by LLM generation.
    """
    ELIGIBLE = "eligible"
    NOT_ELIGIBLE = "not_eligible"
    INSUFFICIENT_INFORMATION = "insufficient_information"
    NOT_DETERMINED = "not_determined"


class ChunkMetadata(BaseModel):
    """Metadata attached to every ingested document chunk in FAISS."""
    chunk_id: str = Field(..., description="Unique chunk ID e.g. DOC001_PAGE12_CHUNK03")
    document_id: str = Field(..., description="Document identifier")
    document_title: str = Field(..., description="Official title of the document")
    page: Optional[int] = Field(None, description="Page number in original PDF")
    source_url: Optional[str] = Field(None, description="Official source URL or reference link")
    publisher: Optional[str] = Field(None, description="Publishing authority e.g. Ministry of Agriculture")
    document_type: str = Field("scheme_guideline", description="Type of document e.g. scheme_guideline, advisory")
    state: Optional[str] = Field(None, description="State scope if applicable")
    district: Optional[str] = Field(None, description="District scope if applicable")
    crop: Optional[str] = Field(None, description="Crop scope if applicable")
    season: Optional[str] = Field(None, description="Farming season e.g. Kharif, Rabi")
    year: Optional[int] = Field(None, description="Scheme year")


class RetrievedChunk(BaseModel):
    """Structured representation of a document chunk retrieved from FAISS vector search."""
    chunk_id: str
    text: str = Field(..., description="Extracted chunk body text")
    document_title: str
    page: Optional[int] = None
    source_url: Optional[str] = None
    relevance_score: float = Field(..., description="Vector similarity/distance score")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SourceCitation(BaseModel):
    """Structured source citation mapping back to exact verified document page."""
    document_id: str
    title: str
    page: Optional[int] = None
    url: Optional[str] = None
    chunk_id: str


class MissingInformation(BaseModel):
    """Identifies missing input parameters required to determine eligibility or complete the answer."""
    field: str = Field(..., description="Name of the missing field e.g. season, crop, state")
    reason: str = Field(..., description="Reason why this information is required")


class ToolResult(BaseModel):
    """Structured output received from external deterministic tools (Weather, Eligibility, Crop Data)."""
    tool_name: str = Field(..., description="Name of the executed tool e.g. deterministic_eligibility_tool")
    status: str = Field(..., description="Execution status e.g. success, error, insufficient_information")
    result_data: Dict[str, Any] = Field(default_factory=dict, description="Raw dictionary output from the tool")
    evidence_summary: Optional[str] = Field(None, description="Human-readable tool summary")


class AnswerResponse(BaseModel):
    """
    Final validated output model for AgriSentinelX AI responses.
    Guarantees every answer is grounded with source citations, deterministic eligibility,
    uncertainty markers, and token/cost metrics.
    """
    answer: str = Field(..., description="Natural language response grounded ONLY in retrieved facts and tool results")
    status: AnswerStatus = Field(default=AnswerStatus.SUCCESS, description="Response status enum")
    eligibility_result: EligibilityResult = Field(
        default=EligibilityResult.NOT_DETERMINED,
        description="Deterministic eligibility decision supplied strictly by tool, NOT hallucinated by LLM"
    )
    uncertainty: Optional[str] = Field(None, description="Explicit statement of any missing facts or boundaries")
    missing_information: List[MissingInformation] = Field(
        default_factory=list,
        description="List of fields required from the farmer to provide a complete answer"
    )
    sources: List[SourceCitation] = Field(
        default_factory=list,
        description="List of verified document source citations backing the answer"
    )
    tool_results_used: List[ToolResult] = Field(
        default_factory=list,
        description="Structured tool outputs integrated into this response"
    )
    token_metrics: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Token counts, latency, and estimated cost metrics for auditing"
    )
