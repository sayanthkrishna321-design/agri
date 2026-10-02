FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY agri_agent ./agri_agent
COPY agrisentinel ./agrisentinel
COPY AgriSentinelX/AgriSentinelX/rag ./AgriSentinelX/AgriSentinelX/rag

EXPOSE 8000

CMD ["gunicorn", "--chdir", "agrisentinel/agrisentinel", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
