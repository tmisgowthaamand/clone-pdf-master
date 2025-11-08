# Gunicorn configuration for Render.com - Memory Optimized
import multiprocessing
import os

# Server socket
bind = "0.0.0.0:10000"
backlog = 512

# Worker processes - Reduced for memory optimization
workers = 1  # Single worker to minimize memory usage
worker_class = 'gthread'
threads = 2  # Reduced threads
worker_connections = 100  # Reduced connections

# Worker timeout and restart settings
timeout = 300  # 5 minutes for large file processing
graceful_timeout = 30
keepalive = 2

# Memory management - Critical for 512MB limit
max_requests = 50  # Restart worker after 50 requests to prevent memory leaks
max_requests_jitter = 10
worker_tmp_dir = '/dev/shm'  # Use RAM disk for temp files (faster, auto-cleanup)

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = 'pdf-converter'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed)
keyfile = None
certfile = None

# Preload app for faster worker spawning
preload_app = True

# Limit request line and header sizes to save memory
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190

def when_ready(server):
    """Called just after the server is started."""
    print("="*60)
    print("PDF Converter Server Ready")
    print(f"Workers: {workers}")
    print(f"Threads per worker: {threads}")
    print(f"Max requests per worker: {max_requests}")
    print("="*60)

def worker_exit(server, worker):
    """Called just after a worker has been exited."""
    print(f"Worker {worker.pid} exited - freeing memory")
