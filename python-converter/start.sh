#!/bin/bash
# Startup script for Render deployment
# Ensures proper initialization and health check

set -e

echo "=========================================="
echo "Starting PDFTools Backend on Render"
echo "=========================================="

# Wait for system to be ready
echo "Waiting for system initialization..."
sleep 5

# Check if LibreOffice is available
if command -v libreoffice &> /dev/null; then
    echo "✓ LibreOffice found: $(libreoffice --version)"
else
    echo "⚠ LibreOffice not found - some features may not work"
fi

# Check Python version
echo "✓ Python version: $(python --version)"

# Check if app.py exists
if [ -f "app.py" ]; then
    echo "✓ app.py found"
else
    echo "✗ app.py not found!"
    exit 1
fi

# Set environment variables
export PYTHONUNBUFFERED=1
export FLASK_ENV=production
export PORT=${PORT:-10000}

echo "=========================================="
echo "Environment Configuration:"
echo "  PORT: $PORT"
echo "  FLASK_ENV: $FLASK_ENV"
echo "  WORKERS: 1"
echo "  THREADS: 1"
echo "=========================================="

# Start gunicorn with optimized settings for Render free tier
echo "Starting Gunicorn..."
exec gunicorn app:app \
    --bind 0.0.0.0:${PORT} \
    --workers 1 \
    --threads 1 \
    --timeout 600 \
    --worker-class sync \
    --worker-tmp-dir /dev/shm \
    --max-requests 50 \
    --max-requests-jitter 5 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --graceful-timeout 120 \
    --keep-alive 2 \
    --preload
