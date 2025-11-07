"""
Gunicorn configuration for optimized Excel/CSV to PDF conversion
Optimized for Render and cloud deployments
"""

import multiprocessing
import os

# Server socket
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"
backlog = 2048

# Worker processes - Optimized for Render
workers = int(os.getenv('GUNICORN_WORKERS', '4'))  # Increased for better concurrency
worker_class = 'gthread'  # Use threaded workers for better I/O performance
worker_connections = 2000  # Increased for more concurrent connections
threads = int(os.getenv('GUNICORN_THREADS', '8'))  # More threads per worker
max_requests = 2000  # Increased before worker restart
max_requests_jitter = 100  # Increased jitter

# Timeouts - Optimized
timeout = 45  # Reduced for faster failure detection
graceful_timeout = 20  # Faster graceful shutdown
keepalive = 2  # Reduced keepalive for faster connection cycling

# Process naming
proc_name = 'pdf-converter'

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

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

# Worker lifecycle hooks
def on_starting(server):
    """Called just before the master process is initialized."""
    print("Starting Gunicorn server...")

def on_reload(server):
    """Called to recycle workers during a reload via SIGHUP."""
    print("Reloading workers...")

def when_ready(server):
    """Called just after the server is started."""
    print(f"Server is ready. Listening on {bind}")

def pre_fork(server, worker):
    """Called just before a worker is forked."""
    pass

def post_fork(server, worker):
    """Called just after a worker has been forked."""
    print(f"Worker spawned (pid: {worker.pid})")

def worker_exit(server, worker):
    """Called just after a worker has been exited."""
    print(f"Worker exited (pid: {worker.pid})")
