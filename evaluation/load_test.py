"""Small, repeatable HTTP load check for the deployed or local API.

This tool measures only the URL and request path supplied to it. A local
development-server run must not be presented as a production SLA result.
"""

import argparse
import concurrent.futures
import json
import threading
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit, urlunsplit
from urllib.request import Request, urlopen


def percentile(samples: list[float], fraction: float) -> float:
    ordered = sorted(samples)
    if not ordered:
        return 0.0
    index = max(0, min(len(ordered) - 1, int((len(ordered) - 1) * fraction)))
    return round(ordered[index], 4)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:8000/api/health/")
    parser.add_argument("--requests", type=int, default=100)
    parser.add_argument("--concurrency", type=int, default=10)
    parser.add_argument("--timeout", type=float, default=10.0)
    parser.add_argument("--deployment-label", default="unspecified; pass --deployment-label")
    parser.add_argument("--output", help="Optional JSON output path")
    args = parser.parse_args()
    if args.requests < 1 or args.concurrency < 1 or args.timeout <= 0:
        parser.error("requests, concurrency, and timeout must be positive")

    samples: list[float] = []
    errors: list[str] = []
    status_codes: list[int] = []
    lock = threading.Lock()

    def request_once(_: int) -> None:
        started = time.perf_counter()
        code = None
        error = None
        try:
            request = Request(args.url, headers={"Accept": "application/json"})
            with urlopen(request, timeout=args.timeout) as response:
                code = response.status
                response.read()
        except HTTPError as exc:
            code = exc.code
            error = f"HTTP {exc.code}"
        except (URLError, TimeoutError, OSError) as exc:
            error = type(exc).__name__
        elapsed = time.perf_counter() - started
        with lock:
            samples.append(elapsed)
            if code is not None:
                status_codes.append(code)
            if error:
                errors.append(error)
            elif code is None or code >= 500:
                errors.append(f"HTTP {code or 'unknown'}")

    started = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        list(pool.map(request_once, range(args.requests)))
    duration = time.perf_counter() - started
    successes = args.requests - len(errors)
    parsed_url = urlsplit(args.url)
    safe_url = urlunsplit((parsed_url.scheme, parsed_url.netloc, parsed_url.path, "", ""))
    summary = {
        "target_url": safe_url,
        "deployment_label": args.deployment_label,
        "requests": args.requests,
        "concurrency": args.concurrency,
        "successes": successes,
        "errors": len(errors),
        "error_types": {kind: errors.count(kind) for kind in sorted(set(errors))},
        "status_codes": {str(code): status_codes.count(code) for code in sorted(set(status_codes))},
        "elapsed_seconds": round(duration, 4),
        "requests_per_second": round(args.requests / duration, 3) if duration else 0.0,
        "latency_p50_seconds": percentile(samples, 0.50),
        "latency_p95_seconds": percentile(samples, 0.95),
        "measurement_scope": "single HTTP path; interpret using the deployment and server configuration tested",
    }
    rendered = json.dumps(summary, indent=2)
    print(rendered)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as stream:
            stream.write(rendered + "\n")
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
