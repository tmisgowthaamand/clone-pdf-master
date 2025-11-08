#!/bin/bash
# Optimized startup script for Render.com with memory limits

# Set memory-efficient Python settings
export PYTHONUNBUFFERED=1
export PYTHONHASHSEED=0
export MALLOC_TRIM_THRESHOLD_=100000
export MALLOC_MMAP_THRESHOLD_=100000

# Limit Python memory usage
export PYTHONMALLOC=malloc

# Clean up any temp files
rm -rf /tmp/tmp* 2>/dev/null || true
rm -rf /dev/shm/tmp* 2>/dev/null || true

# Start gunicorn with optimized config
exec gunicorn app:app \
    --config gunicorn_config.py \
    --worker-tmp-dir /dev/shm \
    --log-file - \
    --access-logfile - \
    --error-logfile - \
    --log-level info
