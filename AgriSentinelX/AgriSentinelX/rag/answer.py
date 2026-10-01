"""
rag/answer.py

Grounded Answer Generation Module for AgriSentinelX RAG System.
LLM Provider: Groq (llama-3.3-70b-versatile by default)

Integrates:
1. Groq SDK — chat completions, OpenAI-compatible
2. Prompt injection defenses
3. Pydantic response validation (AnswerResponse)
4. Automatic source citation mapping
5. Token usage logging, latency tracking, and cost calculation
6. Multi-stage fallback chain for error resilience
"""

import time
import json
import logging
import os
from typing import Any, Dict, List, Optional

from rag.config import (
    get_groq_api_key, GROQ_MODEL,
    MAX_INPUT_TOKENS, MAX_OUTPUT_TOKENS
)
from rag.retrieve import retrieve_documents
from rag.schemas import (
    AnswerResponse, AnswerStatus, EligibilityResult,
    SourceCitation, MissingInformation, ToolResult, RetrievedChunk
)
from rag.prompts import SYSTEM_GROUNDED_PROMPT, PROMPT_TEMPLATE

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("AgriSentinelX.Answer")

# Groq pricing constants (llama-3.3-70b-versatile)
# https://groq.com/pricing/
COST_PER_1M_INPUT_TOKENS = 0.059   # $0.059 / 1M input tokens
COST_PER_1M_OUTPUT_TOKENS = 0.079  # $0.079 / 1M output tokens

_GROQ_CLIENT = None


def get_groq_client():
    """Initializes and caches the Groq client using GROQ_API_KEY."""
    global _GROQ_CLIENT
    if _GROQ_CLIENT is None:
        api_key = get_groq_api_key()
        if not api_key:
            return None
        try:
            from groq import Groq
            _GROQ_CLIENT = Groq(api_key=api_key)
        except ImportError:
            logger.error("groq package not installed. Run: pip install groq")
            return None
    return _GROQ_CLIENT


def calculate_cost(input_tokens: int, output_tokens: int) -> float:
    """Calculates estimated cost in USD based on Groq pricing."""
    return round(
        (input_tokens / 1_000_000) * COST_PER_1M_INPUT_TOKENS
        + (output_tokens / 1_000_000) * COST_PER_1M_OUTPUT_TOKENS,
        6,
    )


def format_retrieved_documents_for_prompt(chunks: List[RetrievedChunk]) -> str:
    """Formats retrieved chunks into clear, prompt-injection resistant text blocks."""
    if not chunks:
        return "NO_DOCUMENTS_FOUND"

    formatted_blocks = []
    for chunk in chunks:
        block = (
            f"--- DOCUMENT CHUNK [{chunk.chunk_id}] ---\n"
            f"Title: {chunk.document_title}\n"
            f"Page: {chunk.page if chunk.page else 'N/A'}\n"
            f"Relevance Score: {chunk.relevance_score}\n"
            f"Text:\n{chunk.text}\n"
        )
        formatted_blocks.append(block)

    return "\n".join(formatted_blocks)


def extract_deterministic_eligibility(tool_results: List[Dict[str, Any]]) -> EligibilityResult:
    """
    Extracts the authoritative eligibility result from external tool outputs.
    Ensures the LLM NEVER overrides deterministic tools.
    """
    for tool in tool_results:
        res_data = tool.get("result_data", {})
        result_str = res_data.get("result") or tool.get("eligibility_result")
        if result_str:
            val = str(result_str).lower().strip()
            if val == "eligible":
                return EligibilityResult.ELIGIBLE
            elif val == "not_eligible":
                return EligibilityResult.NOT_ELIGIBLE
            elif val == "insufficient_information":
                return EligibilityResult.INSUFFICIENT_INFORMATION

    return EligibilityResult.NOT_DETERMINED


def generate_grounded_answer(
    question: str,
    state: Optional[str] = None,
    district: Optional[str] = None,
    crop: Optional[str] = None,
    season: Optional[str] = None,
    year: Optional[int] = None,
    tool_results: Optional[List[Dict[str, Any]]] = None
) -> AnswerResponse:
    """
    Main RAG function:
    1. Retrieves relevant verified document chunks from FAISS
    2. Integrates deterministic tool outputs
    3. Prompts Groq (llama-3.3-70b-versatile) using strict grounded prompt
    4. Validates output through Pydantic (AnswerResponse)
    5. Returns grounded answer with sources, token counts, latency, and costs
    """
    start_total_time = time.time()
    tool_results = tool_results or []

    # Extract deterministic eligibility from external tools first
    deterministic_eligibility = extract_deterministic_eligibility(tool_results)

    # Step 1: Retrieval
    retrieval_start = time.time()
    retrieved_chunks = retrieve_documents(
        query=question,
        state=state,
        district=district,
        crop=crop,
        season=season,
        year=year
    )
    retrieval_latency = round(time.time() - retrieval_start, 3)

    # Fast-path fallback if no evidence and no tools
    if not retrieved_chunks and not tool_results:
        total_latency = round(time.time() - start_total_time, 3)
        return AnswerResponse(
            answer="Insufficient evidence was found in the verified knowledge base to answer this question.",
            status=AnswerStatus.INSUFFICIENT_INFORMATION,
            eligibility_result=deterministic_eligibility,
            uncertainty="No relevant verified scheme documents or tool outputs matched the query.",
            missing_information=[
                MissingInformation(
                    field="state/crop/season",
                    reason="Provide specific state, crop, or season to narrow policy guidelines."
                )
            ],
            sources=[],
            tool_results_used=[],
            token_metrics={
                "retrieval_latency_sec": retrieval_latency,
                "llm_latency_sec": 0.0,
                "total_latency_sec": total_latency,
                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0,
                "estimated_cost_usd": 0.0,
                "model": GROQ_MODEL,
            }
        )

    # Step 2: Build Grounded Prompt
    docs_text = format_retrieved_documents_for_prompt(retrieved_chunks)
    tools_text = json.dumps(tool_results, indent=2) if tool_results else "NO_TOOL_RESULTS"

    user_content = PROMPT_TEMPLATE.format(
        system_instructions="",  # system prompt sent separately
        user_question=question,
        state=state or "Not specified",
        district=district or "Not specified",
        crop=crop or "Not specified",
        season=season or "Not specified",
        year=year or "2026",
        retrieved_documents_text=docs_text,
        tool_results_text=tools_text
    )

    # Step 3: Call Groq
    llm_start = time.time()
    try:
        client = get_groq_client()
        if client is None:
            raise RuntimeError("GROQ_API_KEY is missing or groq package not installed.")

        # Token cap check (approximate: 4 chars ≈ 1 token)
        total_chars = len(SYSTEM_GROUNDED_PROMPT) + len(user_content)
        if total_chars // 4 > MAX_INPUT_TOKENS:
            max_user_chars = (MAX_INPUT_TOKENS * 4) - len(SYSTEM_GROUNDED_PROMPT)
            user_content = user_content[:max_user_chars]
            logger.warning("Prompt truncated to stay within MAX_INPUT_TOKENS=%d", MAX_INPUT_TOKENS)

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_GROUNDED_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.1,
            max_tokens=MAX_OUTPUT_TOKENS,
            response_format={"type": "json_object"},  # Request JSON output
        )

        llm_latency = round(time.time() - llm_start, 3)

        # Extract token counts
        input_tokens = response.usage.prompt_tokens if response.usage else 0
        output_tokens = response.usage.completion_tokens if response.usage else 0
        total_tokens = input_tokens + output_tokens
        cost = calculate_cost(input_tokens, output_tokens)

        logger.info(
            "Groq RAG call: input_tokens=%d output_tokens=%d cost_usd=%.6f model=%s latency=%.3fs",
            input_tokens, output_tokens, cost, GROQ_MODEL, llm_latency
        )

        raw_text = response.choices[0].message.content or "{}"

        # Step 4: Parse & Validate through Pydantic
        clean_json = raw_text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        try:
            parsed_json = json.loads(clean_json)
        except Exception:
            parsed_json = {"answer": raw_text}

        # Map sources from retrieved chunks
        sources_list: List[SourceCitation] = [
            SourceCitation(
                document_id=chunk.metadata.get("document_id", "DOC001"),
                title=chunk.document_title,
                page=chunk.page,
                url=chunk.source_url,
                chunk_id=chunk.chunk_id
            )
            for chunk in retrieved_chunks
        ]

        # Map tool results
        tool_outputs_list: List[ToolResult] = [
            ToolResult(
                tool_name=tr.get("tool_name", "external_tool"),
                status=tr.get("status", "success"),
                result_data=tr.get("result_data", {}),
                evidence_summary=tr.get("evidence_summary")
            )
            for tr in tool_results
        ]

        # Parse missing information
        missing_info_list: List[MissingInformation] = [
            MissingInformation(field=item["field"], reason=item["reason"])
            for item in parsed_json.get("missing_information", [])
            if isinstance(item, dict) and "field" in item and "reason" in item
        ]

        status_val = parsed_json.get("status", AnswerStatus.SUCCESS.value)
        total_latency = round(time.time() - start_total_time, 3)

        return AnswerResponse(
            answer=parsed_json.get("answer", "No answer body generated."),
            status=AnswerStatus(status_val) if status_val in AnswerStatus._value2member_map_ else AnswerStatus.SUCCESS,
            eligibility_result=deterministic_eligibility,   # ALWAYS enforce tool output
            uncertainty=parsed_json.get("uncertainty"),
            missing_information=missing_info_list,
            sources=sources_list,
            tool_results_used=tool_outputs_list,
            token_metrics={
                "retrieval_latency_sec": retrieval_latency,
                "llm_latency_sec": llm_latency,
                "total_latency_sec": total_latency,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": total_tokens,
                "estimated_cost_usd": cost,
                "model": GROQ_MODEL,
            }
        )

    except Exception as e:
        logger.error("Groq API or Validation Error: %s", e)
        total_latency = round(time.time() - start_total_time, 3)

        # Fallback safe response using retrieved evidence
        fallback_sources = [
            SourceCitation(
                document_id=c.metadata.get("document_id", "DOC001"),
                title=c.document_title,
                page=c.page,
                url=c.source_url,
                chunk_id=c.chunk_id
            )
            for c in retrieved_chunks
        ]

        return AnswerResponse(
            answer=(
                f"I retrieved relevant scheme evidence but experienced an issue generating a response. "
                f"Key evidence: '{retrieved_chunks[0].text[:200] if retrieved_chunks else 'N/A'}'"
            ),
            status=AnswerStatus.ERROR,
            eligibility_result=deterministic_eligibility,
            uncertainty=f"Response generated under fallback due to: {str(e)}",
            missing_information=[],
            sources=fallback_sources,
            tool_results_used=[],
            token_metrics={
                "retrieval_latency_sec": retrieval_latency,
                "llm_latency_sec": 0.0,
                "total_latency_sec": total_latency,
                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0,
                "estimated_cost_usd": 0.0,
                "model": GROQ_MODEL,
            }
        )
