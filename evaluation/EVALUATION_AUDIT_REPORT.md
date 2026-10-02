# AgriSentinel X — Hackathon Evaluation & Audit Report

**Repository:** `sayanthkrishna321-design/agri`  
**Evaluation artifact:** `evaluation/results.json`  
**Evaluation runner:** `evaluation/run_eval.py`  
**Report date:** 2026-10-02  
**Audit basis:** AI & Agentic Systems Hackathon — Social Entrepreneurship Track brief

> **Evidence policy**
>
> This report distinguishes between (1) capabilities evidenced by repository code/artifacts, (2) measured results already recorded by the project, and (3) requirements that are not yet demonstrated. No latency, load, accuracy, deployment, or reliability number is invented.

---

## 1. Executive summary

AgriSentinel X is an agricultural assistant that combines a Django REST API, a tool-using agent, deterministic insurance rules, weather retrieval, RAG, Pydantic schemas, MySQL session persistence, Docker, and an evaluation suite.

The repository contains a **20-question evaluation suite** and a recorded run from **2026-10-01**. The measured baseline is:

| Metric | Recorded result | Evidence |
|---|---:|---|
| Evaluation questions | 20 | `evaluation/results.json` |
| Passed | 7 / 20 | `evaluation/results.json` |
| Failed | 13 / 20 | `evaluation/results.json` |
| Accuracy | **35.0%** | `evaluation/results.json` |
| P50 latency | **6.669 s** | `evaluation/results.json` |
| P95 latency | **10.829 s** | `evaluation/results.json` |
| Runtime error count | **0** | `evaluation/results.json` |
| Failure rate | **0.0%** runtime failures | `evaluation/results.json` |
| Avg total tokens/query | **1,191.2** | `evaluation/results.json` |
| Avg estimated cost/query | **$0.000079** | `evaluation/results.json` |
| Total estimated cost | **$0.001579** | `evaluation/results.json` |

### Important interpretation

The **P50/P95 values are evaluation-query latency measurements**, not a concurrent load-test result. The repository does not currently contain a load-test script/report, so the hackathon requirement "load test results" and the claim "no crashes under demo load" remain **not demonstrated**.

The evaluation also shows a major quality gap: standard factual, Hinglish, contradictory, advisory, and some citation cases frequently returned insufficient information even when the evaluator expected a successful answer. This should be presented honestly in the demo rather than hidden.

---

## 2. Requirements-to-evidence audit

The hackathon brief defines the Must Have tier as: RAG, an agent with at least two real tools, Django DRF, MySQL-backed session memory, Pydantic validation on every AI output, an eval on 20 questions, and an architecture diagram.

The competitive tier adds Docker/live deployment, structured logs with correlation IDs, fallback behavior, P50/P95 latency, and adversarial-input handling.

| Hackathon requirement | Current evidence | Status |
|---|---|---|
| RAG over domain corpus | FAISS/RAG implementation and retrieved-chunk schemas exist under `AgriSentinelX/AgriSentinelX/rag/` | **Evidenced** |
| Agent with ≥2 real tools | Open-Meteo weather tool + deterministic insurance rule engine | **Evidenced** |
| Django DRF endpoint | Django/DRF project and API endpoints documented in architecture | **Evidenced** |
| MySQL-backed session memory | `docker-compose.yml` defines MySQL; Django views persist `ChatSession` | **Evidenced** |
| Pydantic validation | `agri_agent/models.py` defines validated request/tool/output models including `AgentStructuredOutput` | **Evidenced** |
| Eval on 20 questions | `evaluation/run_eval.py` asserts exactly 20 cases; recorded results exist | **Measured** |
| README with architecture | Repository contains architecture documentation and Mermaid diagram | **Evidenced** |
| Architecture diagram | `docs/architecture.mmd` and `docs/architecture.jpg` | **Evidenced** |
| Dockerized | Root `Dockerfile`, frontend Dockerfile, and `docker-compose.yml` | **Evidenced** |
| Live URL | Repository homepage is `https://agri-rust.vercel.app`; deployment doc describes frontend deployment | **Frontend evidenced; backend not verified as live** |
| Structured logs | Architecture documents request/session IDs, latency, tokens and cost; source search finds correlation-ID/observability implementation references | **Evidenced in code/design; production log output not attached** |
| Correlation IDs | Architecture specifies `X-Request-ID` middleware | **Evidenced** |
| Fallback chain | Error handling/fallback behavior exists in project components, but a production failure-drill result is not attached | **Partially evidenced** |
| P50/P95 latency | Recorded evaluation results contain P50/P95 | **Measured** |
| Adversarial inputs | Evaluation includes prompt injection, out-of-domain, missing-info and contradiction cases; unit tests cover adversarial profiles | **Evidenced and partially measured** |
| Load test report | No load-test artifact found in repository | **Missing** |
| No crashes under demo load | No concurrent load-test evidence found | **Not demonstrated** |
| Cost per query | Recorded per-query estimated costs and averages | **Measured** |
| Source/provenance tracing | `proof_of_origin` is part of structured output; compliance test explicitly checks weather/rule provenance | **Evidenced** |

---

## 3. Architecture and fact provenance

The project follows the central hackathon principle that factual decisions should come from tools/data rather than from free-form LLM reasoning.

### Request path

1. User submits a query through the React/Vite frontend.
2. Django REST receives the request.
3. The agent classifies intent and checks required fields.
4. Weather requests use the Open-Meteo tool.
5. Insurance evaluation uses deterministic Python rules.
6. RAG retrieves evidence from the FAISS corpus.
7. Pydantic models validate structured tool/agent outputs.
8. Gemini is used for narrative explanation rather than making the deterministic insurance decision.
9. The response includes `tools_used`, `sources`, and `proof_of_origin`.
10. Session/message information is persisted through the Django/MySQL layer.

The repository's Mermaid architecture explicitly includes Pydantic validation, FAISS, MySQL, structured logs, correlation IDs, weather tooling, and deterministic insurance rules.

### "Show me an output and prove where each fact came from"

The project has a concrete provenance mechanism:

- Weather rainfall and temperature are mapped to Open-Meteo provenance.
- Insurance eligibility is mapped to the deterministic rule engine.
- Land-holding facts are mapped to the user input and named rule.
- Contradiction detection is recorded in `proof_of_origin`.
- RAG chunks have structured metadata including document title and chunk identity.

This is also tested in `tests/test_pdf_compliance.py`, which checks for `weather_total_rainfall`, `insurance_eligibility_decision`, `land_holding_fact`, and Open-Meteo/rule identifiers.

---

## 4. Evaluation methodology

### Test suite

The recorded evaluation contains exactly 20 questions across these categories:

1. Standard factual scheme questions — Q01–Q04
2. Hinglish — Q05–Q06
3. Deterministic tool integration — Q07–Q08
4. Missing information — Q09–Q10
5. Contradictory information — Q11–Q12
6. Out-of-domain — Q13–Q14
7. Prompt injection defense — Q15–Q16
8. Advisory questions — Q17–Q18
9. Citation checks — Q19–Q20

The evaluation runner compares the returned status/eligibility against an explicit expected result and records latency, token usage, estimated cost, and errors.

### Reproducibility

The repository provides:

```bash
python evaluation/run_eval.py
```

The runner can also write a JSON report:

```bash
python evaluation/run_eval.py --output docs/evaluation-report.json
```

A valid model API key is required for a fresh model-backed run.

---

## 5. Measured results

### 5.1 Overall result

**7/20 passed — 35.0% accuracy.**

The system had **0 runtime errors** across the recorded evaluation run, but many responses failed because the system returned `insufficient_information` or `clarification_required` where the test expected a successful answer.

This distinction matters:

- **Failure rate 0.0%** means no execution/runtime failure was recorded.
- **Accuracy 35.0%** means the application did not satisfy the expected semantic outcome on 13 of the 20 benchmark questions.

These are different metrics and should not be conflated in the presentation.

### 5.2 Category observations

| Category | Result | Observation |
|---|---|---|
| Factual scheme | 0/4 | All four recorded as insufficient information |
| Hinglish | 0/2 | Both recorded as insufficient information |
| Deterministic tool integration | 2/2 | Both eligibility cases passed |
| Missing information | 1/2 | One expected clarification behavior did not match the evaluator |
| Contradictory | 0/2 | Current RAG/evidence path did not satisfy expected outputs |
| Out-of-domain | 2/2 | Both correctly rejected/withheld |
| Prompt injection | 1/2 | One passed; the system-override case returned an error status |
| Advisory | 0/2 | Both recorded as insufficient information |
| Citation | 1/2 | One citation case passed |

### 5.3 Latency

Recorded latency:

- **P50: 6.669 seconds**
- **P95: 10.829 seconds**

There is also an individual case at **14.441 seconds** (Q09), which is above the recorded P95 because P95 is a percentile rather than a maximum.

### 5.4 Token and cost profile

Recorded averages:

- Input: **759.1 tokens/query**
- Output: **432.1 tokens/query**
- Total: **1,191.2 tokens/query**
- Estimated cost: **$0.000079/query**

The runner also records per-question token counts and estimated cost.

The project contains token-cap and cost-accounting logic; the Gemini provider documentation/source specifies input/output token caps and per-call cost logging.

---

## 6. Adversarial and safety evaluation

The repository contains dedicated compliance tests for the hackathon's adversarial themes.

### Tested cases

**Profile that qualifies for nothing**

A 5-hectare profile with weather inconsistent with drought is expected to fail the deterministic checks. The test verifies that the rule engine returns false and that the generated explanation does not claim eligibility.

**Hinglish**

A Hinglish farmer query is routed through agricultural intent detection and the insurance/weather tools. The unit test expects the deterministic insurance result to remain authoritative.

**Contradictory evidence**

A farmer can claim flood while the weather tool reports 0 mm rainfall. The agent is expected to mark the result as `CONTRADICTION_DETECTED` and record the contradiction in provenance.

**Prompt injection**

The evaluation includes attempts to override the system and expose an API key. The evaluation runner includes a secret-exposure check for prompt-injection cases.

### Current limitation

The recorded 20-question benchmark still has one failed prompt-injection case (Q16). That should be disclosed as an open issue rather than described as perfect prompt-injection resistance.

---

## 7. Pydantic validation and deterministic decisions

The project uses Pydantic models for:

- top-level agent requests;
- weather requests and responses;
- insurance rule inputs/results;
- individual rule evaluation details;
- the final `AgentStructuredOutput`.

The insurance engine is deterministic Python code. The LLM is not the source of the eligibility boolean.

This separation is important for the demo:

> **Tool/rule output = decision evidence.  
> LLM output = explanation of that evidence.**

The insurance response also carries `confidence="DEMO_RULE_EVALUATION"` and `verified_against_official_documents=False` by default. Therefore the demo should describe these as explicit demonstration rules, not as an official insurance adjudication system.

---

## 8. Deployment and SLA evidence

### Docker

The repository contains:

- root Python `Dockerfile`;
- frontend `Dockerfile`;
- `docker-compose.yml`;
- MySQL 8 service;
- Django backend service;
- frontend service.

The compose configuration includes a MySQL health check and makes the backend depend on database health.

### Live URL

The repository metadata identifies:

`https://agri-rust.vercel.app`

The deployment documentation explicitly describes this as a Vercel frontend deployment path and explains that the Django backend/MySQL stack requires a separate reachable backend and persistent database deployment.

**Therefore this report treats the URL as a frontend URL, not proof that the complete backend is publicly reachable.**

### SLA evidence currently available

The evaluation run provides application-query P50/P95 values.

### SLA evidence still required

Before claiming production/demo-load reliability, add:

1. a repeatable concurrent load-test script;
2. concurrency level and duration;
3. request count;
4. success/error counts;
5. P50/P95/P99 under load;
6. throughput;
7. resource usage if available;
8. a saved report in the repository.

---

## 9. Load-test plan required to close the remaining audit gap

Recommended minimal reproducible test:

```text
Target: public/staging Django API
Concurrency: 5, 10, 20 users
Duration: 60 seconds per level
Scenario:
  - normal agricultural query
  - insurance eligibility query
  - weather query
  - missing-information query
  - adversarial/prompt-injection query

Record:
  - requests
  - successful responses
  - HTTP failures
  - application errors
  - P50
  - P95
  - P99
  - requests/sec
```

Save the raw result and summary as:

```text
evaluation/load-test-results.json
evaluation/load-test-report.md
```

Do not populate those files until the test has actually been run.

---

## 10. Five-minute demonstration evidence plan

### 0:00–0:40 — Problem and named user

Use a specific user rather than saying only "farmers":

> A small farmer using the system to understand crop-insurance eligibility and weather evidence for a reported crop-loss event.

The track brief explicitly requires a specific user and task.

### 0:40–1:30 — Architecture

Show the existing architecture diagram.

Point out:

- Django API;
- agent;
- RAG;
- Open-Meteo;
- deterministic insurance rule engine;
- Pydantic validation;
- MySQL;
- provenance/logging.

### 1:30–3:00 — Main evidence demo

Ask one question that exercises both tools.

Example flow:

1. User reports crop, location, and claimed cause.
2. Weather tool returns measured weather evidence.
3. Deterministic rule engine evaluates explicit thresholds.
4. Final answer shows the decision.
5. Expand/show `proof_of_origin`.
6. Point to the exact source/tool behind each factual field.

### 3:00–4:00 — Adversarial demo

Use one of:

- contradictory flood claim + dry weather;
- missing required fields;
- Hinglish input;
- prompt-injection attempt.

The important behavior is graceful handling and explicit uncertainty.

### 4:00–5:00 — Evaluation and engineering evidence

Show:

- 20-question suite;
- **35.0% current accuracy**;
- **P50 6.669s / P95 10.829s**;
- **0 runtime errors in the recorded run**;
- average token/cost metrics;
- Docker setup;
- current deployment status;
- known limitations and next fixes.

---

## 11. Judge Q&A preparation

### Q: "Show me an output and prove where each fact came from."

**Answer structure:**

> The weather numbers come from the Open-Meteo tool, the insurance eligibility boolean comes from deterministic Python rules, and the narrative is generated only after those structured results are available. The response includes a `proof_of_origin` map that identifies the source of the individual facts.

Then show the actual JSON fields.

### Q: "Is the LLM deciding insurance eligibility?"

> No. The insurance decision is produced by the deterministic rule engine. The LLM receives the structured result and explains it. The rule response is also Pydantic validated.

### Q: "What happens if the farmer gives contradictory information?"

> We compare the claimed cause with weather evidence. For example, a flood claim with very low recorded rainfall is marked `CONTRADICTION_DETECTED`, and the contradiction is added to provenance/uncertainty information.

### Q: "Can the model hallucinate a government rule?"

> The design attempts to prevent that by separating retrieval/tool evidence from narrative generation. However, the current 20-question evaluation is only 35% accurate, so we do not claim that the system is hallucination-free. The current failure pattern shows that the evidence/retrieval coverage needs improvement.

### Q: "What is your P95?"

> In the recorded 20-question evaluation run, P95 was 10.829 seconds. That is query-evaluation latency, not concurrent-load latency. We have not yet attached a load-test result, so we do not claim a production-load SLA.

### Q: "Did you test adversarial inputs?"

> Yes. The repository includes tests for missing information, Hinglish, contradictory weather evidence, profiles that qualify for nothing, out-of-domain queries, and prompt-injection attempts. The recorded 20-question evaluation still has one failed prompt-injection case, so this is an active limitation.

### Q: "Why is accuracy only 35%?"

> The recorded failures are concentrated in factual scheme, Hinglish, contradictory, advisory, and citation coverage. Many failures are safe insufficient-information responses rather than runtime crashes. The next engineering priority is improving corpus coverage/retrieval and evaluation alignment, then rerunning the same fixed 20-question benchmark.

### Q: "Are your insurance rules official?"

> The repository labels the implemented rules as demo/sample rules and defaults `verified_against_official_documents` to false. They should not be presented as official insurance adjudication.

### Q: "Can I run it?"

> Yes. The repository includes Docker and Docker Compose configuration. For a fresh evaluation run, use the documented evaluation runner and provide the required model API key.

### Q: "Does your live URL prove the whole system is deployed?"

> The repository's live URL is the Vercel frontend. The deployment documentation states that the Django/MySQL backend needs a separate persistent deployment. We therefore distinguish frontend deployment from full-stack public availability.

---

## 12. Known limitations

1. **35.0% benchmark accuracy** is the current recorded quality baseline.
2. Factual RAG coverage is insufficient for several expected questions.
3. Hinglish benchmark cases currently fail in the recorded run despite Hinglish intent/tool support in the code.
4. One prompt-injection benchmark case returns an error status.
5. One citation benchmark case fails due to insufficient retrieved evidence.
6. P95 is measured on evaluation queries, not concurrent traffic.
7. No repository load-test report was found.
8. No evidence currently justifies claiming "no crashes under demo load."
9. The public Vercel URL is not, by itself, proof of a publicly reachable Django/MySQL backend.
10. Insurance rules are explicitly demo rules and are not represented as officially verified policy adjudication.

---

## 13. Audit conclusion

### Current evidence status

**Strongly evidenced:** core architecture, two tools, deterministic decision layer, Pydantic models, RAG components, Docker configuration, MySQL session architecture, 20-question evaluation framework, provenance fields, adversarial unit tests, token/cost instrumentation.

**Measured:** 20-query accuracy, P50/P95 evaluation latency, token usage, estimated cost, and runtime error count.

**Not yet demonstrated:** concurrent load-test performance and "no crashes under demo load"; complete public full-stack deployment.

### Recommended pre-submission priority

1. Improve the RAG corpus/retrieval path for the failed factual, Hinglish, advisory and citation cases.
2. Fix Q16 prompt-injection error handling so the system returns a safe structured response instead of an error status.
3. Add and run a real concurrent load test.
4. Attach load-test results with P50/P95/P99 and error rate.
5. Verify the complete public frontend-to-backend path.
6. Rerun the fixed 20-question evaluation and preserve the new `results.json`.
7. Update this report with the new measured results, without deleting the old baseline.

**Submission principle:** show the current evidence, including failures. A reproducible 35% baseline plus a clear remediation trail is more defensible than an undocumented or fabricated score.
