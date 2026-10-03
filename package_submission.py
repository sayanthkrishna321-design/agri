"""Create a source-only ZIP for hackathon submission."""
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "AgriSentinelX-submission.zip"
EXCLUDED_DIRS = {
    ".git", ".pytest_cache", "__pycache__", "node_modules", ".npm-cache", "venv", ".venv",
    "env", "ENV", "dist", "build", "staticfiles", ".mypy_cache", ".ruff_cache",
    ".tox", ".nox", "htmlcov", ".aws", ".ssh",
}
EXCLUDED_FILES = {
    ".env", ".env.local", "db.sqlite3", "AgriSentinelX-submission.zip",
    "credentials", "id_rsa", "id_ed25519", "service-account.json",
}
SECRET_PATTERNS = [
    re.compile(r"(?im)^\s*(?:GROQ_API_KEY|OPENAI_API_KEY|GEMINI_API_KEY|SECRET_KEY|DB_PASSWORD)\s*=\s*(['\"])(?!your[_-]|change-me|placeholder|django-insecure)[^'\"]{20,}\1"),
    re.compile(r"(?im)^\s*(?:GROQ_API_KEY|OPENAI_API_KEY|GEMINI_API_KEY|SECRET_KEY|DB_PASSWORD)\s*=\s*(?!os\.|getenv|_raw|your[_-]|change-me|placeholder|django-insecure)[A-Za-z0-9/_+=.-]{24,}(?:\s|$|#)"),
    re.compile(r"gsk_[A-Za-z0-9]{30,}"),
    re.compile(r"sk-[A-Za-z0-9]{30,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
]


def include(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    if any(part in EXCLUDED_DIRS for part in rel.parts):
        return False
    if path.name in EXCLUDED_FILES or path.suffix.lower() in {
        ".pyc", ".pyo", ".sqlite", ".sqlite3", ".db", ".log", ".pem", ".key",
        ".crt", ".p12", ".pfx", ".sql", ".dump", ".bak", ".coverage",
    }:
        return False
    if path.name.startswith(".env.") and path.name != ".env.example":
        return False
    if "rag" in rel.parts and "documents" in rel.parts and path.name.lower().startswith("sample_"):
        return False
    if rel.parts[0] == "AgriSentinelX" and "rag" in rel.parts and "embeddings" in rel.parts:
        if path.suffix.lower() in {".faiss", ".index", ".json", ".npy", ".npz"}:
            return False
    return True


def assert_no_secret(path: Path) -> None:
    if path.suffix.lower() not in {".pyc", ".pyo", ".jpg", ".jpeg", ".png", ".pdf", ".faiss"}:
        body = path.read_text(encoding="utf-8", errors="ignore")
        if any(pattern.search(body) for pattern in SECRET_PATTERNS):
            raise RuntimeError(f"Potential credential pattern found in {path.relative_to(ROOT)}")


def main() -> None:
    with zipfile.ZipFile(OUTPUT, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=8) as archive:
        for path in sorted(ROOT.rglob("*")):
            if path.is_file() and include(path):
                assert_no_secret(path)
                archive.write(path, path.relative_to(ROOT).as_posix())
    with zipfile.ZipFile(OUTPUT) as archive:
        for member in archive.namelist():
            parts = Path(member).parts
            if any(part in EXCLUDED_DIRS for part in parts):
                raise RuntimeError(f"Excluded artifact found in submission: {member}")
            if Path(member).name.startswith(".env") and Path(member).name != ".env.example":
                raise RuntimeError("An environment file was included in the submission.")
    print(f"Created {OUTPUT.name} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
