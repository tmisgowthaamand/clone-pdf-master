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

# Install Python dependencies (suppress root user warning in Docker)
RUN pip install --no-cache-dir --upgrade pip --root-user-action=ignore && \
    pip install --no-cache-dir --root-user-action=ignore -r requirements.txt

# Copy application code
COPY python-converter/ ./python-converter/

# Set working directory to python-converter
WORKDIR /app/python-converter

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 10000

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV PORT=10000

# Health check - increased timeouts for Render
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:${PORT:-10000}/health || exit 1

# Run the application using startup script
# Optimized for Render free tier (512MB RAM limit)
CMD ["./start.sh"]
