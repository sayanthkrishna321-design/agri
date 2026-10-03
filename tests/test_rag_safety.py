from unittest.mock import MagicMock

from rag import answer as rag_answer
from rag.schemas import AnswerStatus, EligibilityResult, RetrievedChunk


def test_retrieval_miss_returns_no_evidence_without_provider_call(monkeypatch):
    monkeypatch.setattr(rag_answer, "retrieve_documents", lambda **_: [])
    monkeypatch.setattr(rag_answer, "get_groq_client", lambda: (_ for _ in ()).throw(AssertionError("provider must not run")))

    result = rag_answer.generate_grounded_answer("Unsupported unrelated question")

    assert result.status == AnswerStatus.INSUFFICIENT_INFORMATION
    assert result.sources == []


def test_tool_eligibility_remains_authoritative_during_rag_fallback(monkeypatch):
    monkeypatch.setattr(rag_answer, "retrieve_documents", lambda **_: [])
    result = rag_answer.generate_grounded_answer(
        "Check eligibility",
        tool_results=[{"tool_name": "eligibility", "result_data": {"result": "not_eligible"}}],
    )
    assert result.eligibility_result == EligibilityResult.NOT_ELIGIBLE


def test_citations_are_mapped_to_retrieved_source_pages(monkeypatch):
    chunk = RetrievedChunk(
        chunk_id="DOC_TEST_PAGE02_CHUNK01",
        text="Test evidence from a registered publisher PDF.",
        document_title="Test official document",
        page=2,
        source_url="https://publisher.example/document.pdf",
        relevance_score=0.91,
        metadata={"document_id": "DOC_TEST"},
    )
    monkeypatch.setattr(rag_answer, "retrieve_documents", lambda **_: [chunk])
    response = MagicMock()
    response.usage = None
    response.choices = [MagicMock(message=MagicMock(content='{"answer":"Evidence summary","status":"success"}'))]
    client = MagicMock()
    client.chat.completions.create.return_value = response
    monkeypatch.setattr(rag_answer, "get_groq_client", lambda: client)

    result = rag_answer.generate_grounded_answer("Question about the registered source")

    assert result.sources[0].document_id == "DOC_TEST"
    assert result.sources[0].page == 2
    assert result.sources[0].url == "https://publisher.example/document.pdf"
