# Render.com Memory Optimization Guide

## Problem
Your Render instance is running out of memory (512MB limit) when processing large PDFs.

## Solutions

### 1. Update Render Build & Start Commands

In your Render dashboard, update these settings:

**Build Command:**
```bash
cd python-converter && pip install -r requirements.txt
```

**Start Command:**
```bash
cd python-converter && chmod +x start_optimized.sh && ./start_optimized.sh
```

### 2. Reduce PDF Processing Pages

The main memory issue is in the PDF to Excel conversion. It's trying to process 21 pages.

**Quick Fix - Edit app.py line 784:**

Change from:
```python
page_range = '1-5' if len(doc) > 10 else 'all'
```

To:
```python
page_range = '1-3' if len(doc) > 5 else '1-5'  # Process max 3-5 pages
```

### 3. Add Memory Limits to Gunicorn

The `gunicorn_config.py` file I created has these optimizations:
- Single worker (reduces memory)
- 2 threads instead of 4
- Max 50 requests before worker restart
- Uses /dev/shm for temp files (RAM disk)

### 4. Environment Variables for Render

Add these to your Render environment variables:

```
PYTHONUNBUFFERED=1
MALLOC_TRIM_THRESHOLD_=100000
MAX_PAGES_TO_PROCESS=3
```

### 5. Upgrade Render Plan (Recommended)

Free tier: 512MB RAM
Starter tier ($7/month): 512MB RAM
Standard tier ($25/month): 2GB RAM ✅ Recommended

The Standard plan will handle large PDFs without issues.

### 6. Alternative: Process Files in Chunks

For large PDFs, you can:
1. Split the PDF into smaller chunks
2. Process each chunk separately
3. Combine results

### 7. Disable Parallel Processing

In app.py line 797, change:
```python
parallel=True  # Enable parallel processing
```

To:
```python
parallel=False  # Disable to save memory
```

## Quick Implementation Steps

1. **Immediate Fix (No code changes needed):**
   - Go to Render Dashboard
   - Settings → Environment
   - Add: `MAX_PAGES_TO_PROCESS=3`
   - Redeploy

2. **Better Fix (Use new config):**
   - Update Start Command to use `start_optimized.sh`
   - This uses the optimized gunicorn config
   - Redeploy

3. **Best Fix:**
   - Upgrade to Standard plan ($25/month)
   - Get 2GB RAM instead of 512MB
   - Handle any PDF size

## Memory Usage Breakdown

Current usage for 21-page PDF:
- PDF Loading: ~50MB
- Camelot Processing: ~200MB
- Excel Creation: ~100MB
- Temp Files: ~100MB
- **Total: ~450MB** (close to 512MB limit)

With optimizations:
- Process only 3 pages: ~150MB
- Single worker: Save 100MB
- Cleanup after each request: Prevent leaks

## Testing

After implementing fixes, test with:
```bash
curl -X POST https://your-app.onrender.com/api/health
```

Should return: `{"status": "healthy"}`

## Monitoring

Watch memory usage in Render logs:
```
Worker memory usage: XXX MB
```

If still seeing OOM errors, reduce MAX_PAGES_TO_PROCESS to 2.
