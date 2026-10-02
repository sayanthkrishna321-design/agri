# AgriSentinel X evaluation report

**Evaluation date:** 2026-10-02  
**Suite:** 20 fixed questions in `evaluation/run_eval.py`  
**Source data:** Baseline [`results.json`](../evaluation/results.json); post-repair [`results-after.json`](../evaluation/results-after.json)

## Results

| Metric | Saved baseline (2026-10-01) | Post-repair run (2026-10-02) |
| --- | ---: | ---: |
| Expected-result accuracy | 35.0% (7/20) | 35.0% (7/20) |
| Evaluation cases failing expected result | 13/20 | 13/20 |
| Runtime exception rate | 0.0% (0/20) | 0.0% (0/20) |
| Median latency (P50) | 6.669 s | 0.001 s |
| P95 latency | 10.829 s | 0.001 s |
| Mean estimated cost per query | $0.000079 USD | $0.000000 USD |
| Total estimated cost | $0.001579 USD | $0.000000 USD |
| Mean tokens per query | 1,191.2 (759.1 input; 432.1 output) | 0 |

The post-repair run is recorded in [`results-after.json`](../evaluation/results-after.json); the original [`results.json`](../evaluation/results.json) remains unchanged. Accuracy did not improve. The rebuilt safety checks rejected the old one-chunk index because its metadata referenced an absolute path that could not be verified against the source registry, and no API key was loaded after removal of the local `.env`. As a result, RAG questions without tool evidence returned the safe no-evidence response without calling the provider. This explains the shorter latency and zero cost; those figures are not comparable to the provider-backed baseline. Several expected factual answers still fail because this repository has no verified source corpus. No ground-truth answers were changed.

Accuracy is the proportion of cases whose returned status or eligibility matched the expectation encoded in the evaluation suite. The case failure rate is its complement. Runtime exception rate counts thrown exceptions only; it does not count an answer that completed but failed the expected-result check. For example, several RAG questions returned `insufficient_information` and were scored as incorrect without raising an exception.

## Interpretation and limitations

The deterministic eligibility integration cases passed, while factual, Hinglish, advisory, and citation cases did not meet their expected status. The main observed failure pattern was insufficient evidence from the knowledge base. Treat 35% as a score on this small, fixed project suite, not as a general estimate of real-world answer accuracy.

Latency and cost reflect the saved run, including its configured model/provider and local environment. Cost is estimated from token usage and the evaluator's pricing assumptions; it is not a billing statement. Results can change with the model, provider pricing, network conditions, corpus, and index. Re-run the suite to produce a fresh snapshot:

```bash
python evaluation/run_eval.py --output evaluation/results-after.json
```

The evaluation uses the configured LLM provider when enabled and may incur provider charges. Keep API credentials in `.env`; do not commit them. RAG sources must be registered and hashed as documented in [`rag/documents/README.md`](../AgriSentinelX/AgriSentinelX/rag/documents/README.md).

## Related deliverables

- Architecture: [`architecture.mmd`](architecture.mmd)
- Existing rendered diagram: [`architecture.jpg`](architecture.jpg)
- Reproducible evaluation runner: [`../evaluation/run_eval.py`](../evaluation/run_eval.py)
- Local deployment: `docker compose up --build` from the repository root; frontend at `http://localhost:5173/`, API at `http://localhost:8000/api/`.
