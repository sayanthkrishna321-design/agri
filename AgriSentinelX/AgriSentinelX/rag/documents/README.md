# Verified RAG source ingestion

The repository's existing `sample_pmfby_scheme.pdf` is a placeholder, not a policy source; ingestion and clean packages skip it. The saved FAISS files are local generated artifacts and must be rebuilt before use. No authoritative policy PDFs were available in this repository, so no factual answers or citations are claimed from this corpus.

1. Obtain a current PDF from its publisher's official website and check that its use and redistribution terms permit local ingestion.
2. Save it in this directory. Do not include personal or confidential documents.
3. Add an entry to `sources.json` keyed by the exact PDF filename, with a descriptive title, publisher, canonical publisher URL, and SHA-256 hash of the saved bytes:

   ```json
   {
     "official_guidelines.pdf": {
       "title": "Title printed on the official document",
       "publisher": "Publishing government department",
       "source_url": "https://publisher.example/path/to/document.pdf",
       "sha256": "lowercase SHA-256 digest of the PDF"
     }
   }
   ```

4. Build the index from the repository root with `python AgriSentinelX/AgriSentinelX/rag/ingest.py` (or `python -m rag.ingest` with the nested project directory on `PYTHONPATH`). The pipeline skips placeholder PDFs, unregistered sources, and hash mismatches. It preserves PDF page numbers and records the source URL in chunk metadata.
5. Review the extracted text and generated `rag/embeddings/metadata.json` before deployment. Rebuild when the PDF or embedding model changes; never hand-edit the FAISS index. The generated index and metadata are excluded from Docker contexts and submission ZIPs.

The application returns insufficient evidence when the verified corpus or matching evidence is unavailable. Retrieval is not an official source adjudication.
