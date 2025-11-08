# Deploy to Render.com - Memory Optimized

## Quick Fix (No Code Changes)

### Step 1: Update Render Settings

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your service
3. Go to **Settings**

### Step 2: Update Start Command

Change the **Start Command** to:
```bash
cd python-converter && gunicorn app:app --config gunicorn_config.py --worker-tmp-dir /dev/shm
```

### Step 3: Add Environment Variables

In **Environment** section, add:

| Key | Value |
|-----|-------|
| `PYTHONUNBUFFERED` | `1` |
| `MAX_PAGES_TO_PROCESS` | `3` |
| `MALLOC_TRIM_THRESHOLD_` | `100000` |

### Step 4: Redeploy

Click **Manual Deploy** → **Deploy latest commit**

## Expected Results

✅ Memory usage: ~200-300MB (was 500MB+)
✅ Can process 3-page PDFs reliably
✅ No more "Out of Memory" errors
✅ Faster response times

## If Still Getting OOM Errors

### Option 1: Reduce Pages Further
Set `MAX_PAGES_TO_PROCESS` to `2`

### Option 2: Upgrade Plan
- Free/Starter: 512MB RAM
- **Standard: 2GB RAM** ($25/month) ← Recommended
- Pro: 4GB RAM ($85/month)

### Option 3: Use External Service
For large PDFs, consider:
- AWS Lambda (pay per use)
- Google Cloud Functions
- Azure Functions

## Monitoring

### Check Logs
```bash
# In Render dashboard, go to Logs tab
# Look for:
Worker memory usage: XXX MB
Memory cleanup completed
```

### Health Check
```bash
curl https://your-app.onrender.com/api/health
```

Should return:
```json
{"status": "healthy"}
```

## Troubleshooting

### Error: "Worker timeout"
- Increase timeout in gunicorn_config.py (line 17)
- Current: 300 seconds (5 minutes)

### Error: "Connection reset"
- Render free tier sleeps after 15 min inactivity
- Upgrade to paid plan for always-on

### Error: Still OOM
1. Check MAX_PAGES_TO_PROCESS is set
2. Verify gunicorn_config.py is being used
3. Consider upgrading to Standard plan

## Performance Tips

### For Small PDFs (1-5 pages)
- Current settings work perfectly
- Response time: 5-10 seconds

### For Medium PDFs (6-20 pages)
- Will process first 3 pages only
- Add warning message to users
- Response time: 10-20 seconds

### For Large PDFs (20+ pages)
- Recommend upgrading to Standard plan
- Or implement chunked processing
- Or use external service

## Cost Comparison

| Plan | RAM | Price | Best For |
|------|-----|-------|----------|
| Free | 512MB | $0 | Testing, small PDFs |
| Starter | 512MB | $7/mo | Small PDFs only |
| **Standard** | **2GB** | **$25/mo** | **Production** ✅ |
| Pro | 4GB | $85/mo | Heavy usage |

## Next Steps

1. ✅ Deploy with new settings
2. ✅ Test with small PDF (1-3 pages)
3. ✅ Test with medium PDF (5-10 pages)
4. ⚠️ If processing large PDFs regularly → Upgrade to Standard
5. ✅ Monitor logs for memory usage

## Support

If issues persist:
1. Check Render logs
2. Verify environment variables are set
3. Confirm gunicorn_config.py is being used
4. Consider upgrading plan
