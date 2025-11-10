# Dockerfile for PDFTools Backend - Optimized for Render
# Production-ready with all dependencies

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (optimized for Render free tier)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-writer \
    libreoffice-impress \
    libreoffice-calc \
    ghostscript \
    poppler-utils \
    libpoppler-cpp-dev \
    python3-tk \
    fonts-liberation \
    fonts-dejavu-core \
    fontconfig \
    curl \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* /var/tmp/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY python-converter/ ./python-converter/

# Set working directory to python-converter
WORKDIR /app/python-converter

# Expose port
EXPOSE 10000

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV PORT=10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:10000/health || exit 1

# Run the application
# Optimized for Render free tier (512MB RAM limit)
# Use gunicorn with optimized settings for stability and memory efficiency
CMD gunicorn app:app \
    --bind 0.0.0.0:${PORT:-10000} \
    --workers 1 \
    --threads 2 \
    --timeout 300 \
    --worker-class sync \
    --worker-tmp-dir /dev/shm \
    --max-requests 100 \
    --max-requests-jitter 10 \
    --access-logfile - \
    --error-logfile - \
    --log-level debug \
    --graceful-timeout 120 \
    --keep-alive 5
