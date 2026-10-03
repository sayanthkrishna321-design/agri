# AgriSentinelX — Member 1: AI / RAG Engineer Module

**AgriSentinelX** is an AI-powered agricultural intelligence system designed to empower small Indian farmers by providing verified, grounded information on government agriculture schemes, crop insurance policies, eligibility criteria, required documents, and application procedures.

---

## 🎯 Target User & Example Scenario

- **Target User**: Small Indian farmer needing accessible guidance on agricultural subsidies, schemes, and insurance eligibility.
- **Example Scenario**:
  > *"I grow cotton in Vidarbha, Maharashtra. What government insurance or agriculture scheme information applies to me, what information do I need to provide, and what documents are required?"*

> [!IMPORTANT]
> **Core System Principle**: The LLM (Groq (default model: openai/gpt-oss-120b)) handles natural language processing and factual explanations, while **deterministic tools** handle eligibility rules and factual calculations. The LLM is **never allowed** to calculate or alter deterministic eligibility decisions.

---

## 🏗️ Member 1 RAG Architecture Diagram

```mermaid
flowchart TD
    U[Small Farmer] --> API[Django REST API]
    API --> AGENT[Agent / LangGraph]

    AGENT --> RAG[RAG Retriever - rag/retrieve.py]
    
    RAG --> EMB[SentenceTransformer - intfloat/multilingual-e5-base]
    EMB --> FAISS[FAISS Vector Index - index.faiss]
    FAISS --> DOCS[Verified PDF Documents - rag/documents]

    AGENT --> CROP[Crop Data Tool]
    AGENT --> WEATHER[Weather Tool]
    AGENT --> ELIG[Deterministic Eligibility Tool]

    RAG --> CONTEXT[Retrieved Page Evidence]
    CROP --> CONTEXT
    WEATHER --> CONTEXT
    ELIG --> CONTEXT

    CONTEXT --> Groq[Groq (default model: openai/gpt-oss-120b)]
    Groq --> PYD[Pydantic Validation - AnswerResponse]
    PYD --> RESP[Grounded Answer + Sources + Token Metrics]
    API --> MYSQL[MySQL Session Memory]
```

---

## 📁 Repository Structure (Member 1 Module)

```text
AgriSentinelX/
│
├── rag/
│   ├── documents/
│   │   ├── README.md
│   │   └── sample_pmfby_scheme.pdf
│   ├── embeddings/
│   │   ├── index.faiss
│   │   └── metadata.json
│   ├── config.py         # Configuration settings & environment variables
│   ├── schemas.py        # Pydantic validation models (AnswerResponse, Citations, etc.)
│   ├── ingest.py         # PDF ingestion, cleaning, chunking, embeddings & FAISS builder
│   ├── retrieve.py       # FAISS vector similarity search & metadata filtering
│   ├── answer.py         # Groq client wrapper, grounded prompt defense, Pydantic validator
│   ├── prompts.py        # System prompts & prompt injection defenses
│   └── __init__.py       # Package initializer exposing clean public API functions
│
├── tests/
│   └── rag/
│       └── test_eval.py  # 20-Question Hackathon Evaluation Suite
│
├── .env.example          # Environment variable template
├── .gitignore            # Git exclusion rules (excluding secrets & vector files)
├── README.md             # Architecture & system documentation
└── requirements.txt      # Dependencies baseline
```

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Edit `.env` to insert your Groq API key from https://console.groq.com/keys:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
EMBEDDING_MODEL=intfloat/multilingual-e5-base
```

---

## 🚀 Running Ingestion & Building Vector Store

Obtain a current policy PDF from its publisher, register its publisher URL and SHA-256 digest in `rag/documents/sources.json`, then review the full [verified source ingestion workflow](rag/documents/README.md). The repository's existing sample PDF is skipped because it is only a placeholder and is omitted from clean packages. Run:

```bash
python rag/ingest.py
```

**Output Generated**:
- Vector Index: `rag/embeddings/index.faiss`
- Metadata Registry: `rag/embeddings/metadata.json`

---

## 🔍 Testing Retrieval & Grounded Answer Generation

### Vector Document Retrieval Test:
```bash
python -c "from rag.retrieve import retrieve_documents; res = retrieve_documents('cotton crop insurance Maharashtra'); print(res)"
```

### End-to-End Grounded Answer Generation Test:
```bash
python -c "from rag.answer import generate_grounded_answer; ans = generate_grounded_answer('What crop insurance guidelines apply to cotton in Vidarbha?'); print(ans.model_dump_json(indent=2))"
```

---

## 🧪 Running the 20-Question Evaluation Suite

```bash
python tests/rag/test_eval.py
```

The evaluation suite tests:
1. Normal factual scheme questions
2. Insurance claim questions
3. Hinglish questions (*"Mere cotton crop ka insurance kaise milega?"*)
4. Missing information / clarification questions
5. Contradictory information safety
6. Out-of-domain questions
7. Prompt-injection defense tests
8. Deterministic tool result preservation
9. Citation accuracy and page boundary checks

---

## 📊 Public Data Sources & Licenses

| Source Name | Publisher | URL / Access | Description | License / Terms |
| :--- | :--- | :--- | :--- | :--- |
| **myScheme** | Govt of India / MeitY | [myscheme.gov.in](https://www.myscheme.gov.in) | Scheme eligibility guidelines | Public Open Data |
| **PMFBY Portal** | Ministry of Agriculture | [pmfby.gov.in](https://pmfby.gov.in) | Pradhan Mantri Fasal Bima Yojana PDF Guidelines | Government Open License |
| **Kisan Call Centre** | DAC&FW / data.gov.in | [data.gov.in](https://data.gov.in) | Expert Q&A corpus for farmer queries | Open Government Data License (OGDL) |

---

## 🔒 Security & Guardrails

- **API Keys**: Stored strictly in `.env` and excluded via `.gitignore`.
- **Prompt Injection Defense**: Retrieved PDF text is isolated inside `<untrusted reference material>` prompt boundaries.
- **Sanitization**: All user inputs sanitized before querying vector store.
- **Audit Logging**: Every query records `input_tokens`, `output_tokens`, `total_tokens`, `latency`, and `estimated_cost_usd`.
