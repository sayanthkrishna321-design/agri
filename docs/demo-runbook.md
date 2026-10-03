# Five-minute judge demo

Use a named person and a concrete job: a small farmer in Maharashtra checking
what evidence may be relevant to a reported crop-loss event and where to confirm
official scheme details. The application is a screening aid; it does not decide
official eligibility, approve claims, or guarantee payout.

## Timing

| Time | Show | Evidence to call out |
|---|---|---|
| 0:00–0:40 | Farmer and task | Explain the current task and what decision the farmer needs to make. |
| 0:40–1:20 | Existing architecture diagram | Point to Django, the agent, weather lookup, deterministic demo rules, and RAG. |
| 1:20–2:40 | A complete query with location, crop, dates, and reported cause | Separate measured weather values, user-provided facts, and demo-rule output. Show source/page citations when retrieved. |
| 2:40–3:35 | Missing input or weather outage | Show the clarification/error response. Do not fill missing facts with sample telemetry. |
| 3:35–4:20 | Contradictory claim and prompt injection | Show uncertainty and safe handling. Do not describe the system as hallucination-proof. |
| 4:20–5:00 | Fixed evaluation and known limitations | Report 7/20 (35%) from the current 20-question benchmark and distinguish that result from runtime failures. Disclose corpus and load-test limitations. |

## Claims to avoid

- Do not call the deterministic demo rules official PMFBY eligibility rules.
- Do not say weather data by itself proves crop damage or insurance eligibility.
- Do not imply a cited policy passage exists when retrieval returned no source.
- Do not describe local development-server latency as a production SLA.
- Do not claim 100% accuracy, a successful claim, or a measured load result that was not run.

## Reproducible checks

Run the unchanged 20-question benchmark with `python evaluation/run_eval.py`.
For an HTTP performance sample, start the API using the deployment configuration
being evaluated, then run `python evaluation/load_test.py --url https://YOUR_API_HOST/api/health/ --requests 200 --concurrency 20 --deployment-label "<server; database; date>" --output evaluation/load-test-results.json`. Record the exact deployment, server, date, request path, concurrency, and failures with the results. A health endpoint run is a smoke/load check, not a workload benchmark for RAG or provider calls.

The RAG corpus must be populated only with current documents obtained from their
publisher, registered with URL and SHA-256 in `rag/documents/sources.json`, and
reviewed after extraction. Until that is done, the system should abstain when
retrieval has no verified evidence.
