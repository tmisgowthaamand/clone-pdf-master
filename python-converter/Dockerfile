# Backend Dockerfile for PDF Tools API
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create temp directory for file processing
RUN mkdir -p /app/tmp && chmod 777 /app/tmp

# Expose port
EXPOSE 10000

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV PORT=10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:10000/health || exit 1

# Run the application with optimized settings for Render free tier
CMD gunicorn app:app \
    --bind 0.0.0.0:${PORT} \
    --workers 1 \
    --threads 2 \
    --timeout 300 \
    --worker-class gthread \
    --worker-tmp-dir /dev/shm \
    --max-requests 100 \
    --max-requests-jitter 10 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --preload
