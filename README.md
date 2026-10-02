# 🌾 AgriSentinel X

## AI-Powered Agricultural Decision Support, Crop Insurance & Farmer–Retailer Intelligence Platform

AgriSentinel X is an AI-powered agricultural decision-support platform designed to help farmers make informed decisions related to **weather risk, crop insurance, agricultural documentation, claim preparation, and farmer–retailer opportunities**.

The system combines **Retrieval-Augmented Generation (RAG), AI agents, external tools, deterministic decision logic, structured output validation, session memory, and a web interface** to provide grounded and actionable agricultural assistance.

---

## 🚜 Problem Statement

Farmers often need to make important decisions using information distributed across:

- Weather forecasts
- Government agricultural schemes
- Crop insurance documents
- Eligibility rules
- Claim procedures
- Crop and farm information
- Market and retailer requirements

This information can be difficult to understand and may require checking multiple sources.

AgriSentinel X provides a unified AI-assisted platform where a farmer can ask questions such as:

> "There is heavy rain expected for my location. What should I check regarding my crop insurance and what information do I need for a possible claim?"

The system retrieves relevant domain information, uses tools for real-world data, applies deterministic decision logic where required, and generates a structured response.

---

# 🎯 Target User

### Primary User

**Small and medium-scale farmers**

### Example User

A farmer who:

- Has an active crop
- Depends on weather-sensitive agricultural production
- May have crop insurance
- Needs help understanding eligibility or claim requirements
- May want to connect with retailers for selling produce

### Primary Tasks

The platform supports:

1. Checking weather conditions
2. Understanding weather-related agricultural risk
3. Checking crop-insurance-related information
4. Understanding eligibility conditions
5. Identifying missing information
6. Preparing information for a potential claim
7. Listing agricultural produce
8. Connecting farmers with retailers
9. Comparing retailer offers
10. Asking agricultural questions using natural language

---

# 💡 Proposed Solution

AgriSentinel X combines:

- Large Language Model (LLM)
- Retrieval-Augmented Generation (RAG)
- Domain document corpus
- Vector search
- AI agent
- External tools
- Deterministic insurance rules
- Pydantic output validation
- Session memory
- Django REST API
- Database
- Farmer–retailer workflow
- Evaluation framework
- Logging and observability
- Docker deployment

The core design principle is:

> **LLM handles language and explanation; tools and deterministic logic handle facts, calculations, and decisions.**

---

# ✨ Key Features

## 🤖 AI Agricultural Assistant

Users can interact with the system using natural language.

The assistant can:

- Understand farmer queries
- Retrieve relevant domain documents
- Use available tools
- Explain results
- Ask for missing information
- Provide structured responses

---

## 📚 Retrieval-Augmented Generation (RAG)

The RAG system grounds AI responses using relevant agricultural and insurance documents.

### RAG Flow

```text
User Question
      |
      v
Question Processing
      |
      v
Embedding Generation
      |
      v
Vector Search
      |
      v
Relevant Domain Documents
      |
      v
Context Construction
      |
      v
LLM
      |
      v
Pydantic Validation
      |
      v
Structured Response

```

###System Architecture


```text
┌───────────────────────────────────────────────┐
│                  FARMER / USER                │
└─────────────────────────┬─────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────┐
│                 FRONTEND / UI                 │
└─────────────────────────┬─────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────┐
│              DJANGO REST FRAMEWORK            │
│                     API                       │
└─────────────────────────┬─────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────┐
│                   AI AGENT                    │
│                                               │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │    RAG     │ │   TOOLS    │ │  RULES   │ │
│  └─────┬──────┘ └─────┬──────┘ └────┬─────┘ │
│        │              │              │       │
└────────┼──────────────┼──────────────┼───────┘
         │              │              │
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Domain       │ │ Weather /    │ │ Deterministic│
│ Knowledge    │ │ External     │ │ Decision     │
│ Corpus       │ │ APIs         │ │ Engine       │
└──────────────┘ └──────────────┘ └──────────────┘
         │              │              │
         └──────────────┼──────────────┘
                        ▼
                ┌───────────────┐
                │      LLM      │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │    Pydantic   │
                │   Validation  │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │    Response   │
                └───────────────┘


```
###RAG Pipeline


```text

Domain Documents
       │
       ▼
Document Processing
       │
       ▼
Text Chunking
       │
       ▼
Embedding Generation
       │
       ▼
Vector Store
       │
       ▼
User Query
       │
       ▼
Query Embedding
       │
       ▼
Similarity Search
       │
       ▼
Relevant Context
       │
       ▼
LLM
       │
       ▼
Pydantic Validation
       │
       ▼
Final Response


```
