# Deploying AgriSentinelX with Vercel

## Frontend

The React/Vite frontend can be deployed as a Vercel static site.

1. Import the GitHub repository in Vercel.
2. Set the project root directory to `frontend`.
3. Use the Vite framework preset, build command `npm run build`, and output directory `dist`.
4. Set `VITE_API_BASE_URL` to the public API base URL, ending in `/api` (for example, `https://api.example.com/api`).
5. Deploy, then check the browser console and the API health endpoint.

The `frontend/vercel.json` file provides the SPA fallback for client-side routes. The API URL is supplied at build time; the local default points to `localhost` and must not be used for a public deployment.

## Backend and persistence

The frontend alone does not host the Django API. The current backend uses Django REST Framework, MySQL, and a RAG pipeline that builds a FAISS index from the included PDF. A complete public deployment therefore needs:

- a reachable managed MySQL database and production environment variables;
- a backend deployment with a writable or prebuilt RAG index strategy;
- the public backend URL configured as `VITE_API_BASE_URL` in Vercel;
- production CORS and allowed-host settings for the Vercel domain.

Vercel has a Python runtime and supports Django deployments, but Python Functions have deployment-size and execution constraints. This project's `requirements.txt` includes PyTorch and sentence-transformers, so the full backend needs a bundle-size check and an index/model storage plan before it can be deployed there. Do not use the local Docker Compose MySQL service or SQLite as production persistence.

For a simpler split deployment, host the Django/MySQL service on a platform intended for persistent application containers and host the frontend on Vercel. The frontend can still be served from Vercel while calling that API over HTTPS.

