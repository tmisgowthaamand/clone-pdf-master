# CORS & 502 Error Troubleshooting Guide

## Error Summary

You're experiencing:
1. **502 Bad Gateway** - Backend server is not responding
2. **CORS Policy Error** - Appears as a consequence of the 502 error

## Root Cause Analysis

### Primary Issue: 502 Bad Gateway
The backend at `https://pdftools-backend.onrender.com` is returning 502, which means:

- ✗ **Server is down or crashed**
- ✗ **Render free tier service has spun down** (happens after 15 min inactivity)
- ✗ **Cold start taking too long** (50+ seconds on free tier)
- ✗ **Application failed to start** (missing dependencies, errors in code)
- ✗ **Health check failing** (service marked as unhealthy)

### Secondary Issue: CORS Error
The CORS error is **misleading** - it appears because:
- When a 502 occurs, the error response doesn't include CORS headers
- Browser blocks the response, showing CORS error instead of 502
- **Once 502 is fixed, CORS error will disappear**

## Immediate Actions

### 1. Check Backend Health

Visit these URLs in your browser:
```
https://pdftools-backend.onrender.com/health
https://pdftools-backend.onrender.com/api/health
```

**Expected Response (if working):**
```json
{
  "status": "healthy",
  "libreoffice": "LibreOffice 7.x.x.x"
}
```

### 2. Check Render Dashboard

1. Go to https://dashboard.render.com
2. Find your `pdftools-backend` service
3. Check:
   - **Status**: Should be "Live" (green)
   - **Logs**: Look for errors or crashes
   - **Events**: Check recent deployments
   - **Metrics**: CPU/Memory usage

### 3. Wake Up the Service (If Spun Down)

Render free tier services sleep after 15 minutes of inactivity:
- First request after sleep takes **50-90 seconds**
- Subsequent requests are fast
- **Solution**: Upgrade to paid tier or use a ping service

### 4. Check Deployment Logs

Look for these common errors in Render logs:
```
❌ ModuleNotFoundError: No module named 'X'
❌ LibreOffice not found
❌ Port already in use
❌ Permission denied
❌ Out of memory
```

## Configuration Fixes Applied

### ✅ Fixed CORS Configuration

Updated `python-converter/render.yaml`:
```yaml
- key: ALLOWED_ORIGINS
  value: "https://pdf-tools-phi.vercel.app,http://localhost:5173,http://localhost:3000"
```

**What this does:**
- Explicitly allows your Vercel frontend domain
- Includes localhost for development
- More secure than wildcard `*`

### Backend CORS Implementation

The Flask backend (`app.py`) already has comprehensive CORS handling:
```python
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '*').split(',')
CORS(app, resources={...})

@app.after_request
def after_request(response):
    # Adds CORS headers to all responses
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE, HEAD'
    # ... more headers
```

## Deployment Steps

### 1. Redeploy Backend to Render

After updating `render.yaml`:

```bash
cd python-converter
git add render.yaml
git commit -m "Fix CORS configuration for Vercel frontend"
git push
```

Render will automatically redeploy (if auto-deploy is enabled).

**OR** manually redeploy:
1. Go to Render Dashboard
2. Select `pdftools-backend` service
3. Click "Manual Deploy" → "Deploy latest commit"

### 2. Wait for Deployment

- Initial deployment: **5-10 minutes**
- Health check must pass before service is live
- Monitor logs for errors

### 3. Test the Backend

```bash
# Test health endpoint
curl https://pdftools-backend.onrender.com/health

# Test with CORS headers
curl -H "Origin: https://pdf-tools-phi.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://pdftools-backend.onrender.com/api/convert/pdf-to-excel
```

## Frontend Configuration

Your frontend is correctly configured:

```typescript
// config/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

```env
// .env
VITE_API_URL=https://pdftools-backend.onrender.com
```

## Common Solutions

### Solution 1: Backend Not Starting

**Check requirements.txt** - Ensure all dependencies are listed:
```txt
Flask==3.0.0
flask-cors==4.0.0
gunicorn==21.2.0
camelot-py[cv]==0.11.0
pandas==2.1.3
Pillow==10.1.0
reportlab==4.0.7
PyPDF2==3.0.1
```

### Solution 2: Cold Start Timeout

**Increase timeout in Dockerfile:**
```dockerfile
CMD gunicorn app:app \
    --bind 0.0.0.0:${PORT} \
    --timeout 300 \  # Increased from 120
    --workers 2
```

### Solution 3: Memory Issues

Render free tier has **512MB RAM**. If exceeded:
- Reduce workers: `--workers 1`
- Optimize file processing
- Upgrade to paid tier

### Solution 4: LibreOffice Not Found

Ensure Dockerfile installs LibreOffice:
```dockerfile
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    libreoffice-impress \
    libreoffice-calc
```

## Testing Checklist

After redeployment:

- [ ] Backend health endpoint returns 200
- [ ] CORS preflight (OPTIONS) request succeeds
- [ ] POST request to `/api/convert/pdf-to-excel` works
- [ ] File upload completes without errors
- [ ] Converted file downloads successfully
- [ ] No CORS errors in browser console
- [ ] No 502 errors

## Monitoring & Prevention

### 1. Keep Service Warm (Free Tier)

Use a cron job or service like UptimeRobot:
```
Ping: https://pdftools-backend.onrender.com/health
Interval: Every 10 minutes
```

### 2. Add Error Handling in Frontend

```typescript
const convertFile = async (file: File) => {
  try {
    const response = await fetch(API_ENDPOINTS.PDF_TO_EXCEL, {
      method: 'POST',
      body: formData,
    });
    
    if (response.status === 502) {
      throw new Error('Backend service is starting up. Please wait 60 seconds and try again.');
    }
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    return await response.blob();
  } catch (error) {
    if (error.message.includes('CORS')) {
      console.error('CORS error - backend may be down');
    }
    throw error;
  }
};
```

### 3. Upgrade to Paid Tier

Render paid tier benefits:
- No cold starts
- More memory (1GB+)
- Better performance
- Custom domains
- **Cost**: $7/month

## Quick Reference

| Issue | Cause | Solution |
|-------|-------|----------|
| 502 Bad Gateway | Service down/crashed | Check Render logs, redeploy |
| CORS Error | 502 causes missing headers | Fix 502 first |
| Cold Start | Free tier sleep | Wait 60s or upgrade |
| Timeout | Long processing | Increase gunicorn timeout |
| Memory Error | 512MB exceeded | Reduce workers or upgrade |

## Need More Help?

1. **Check Render Status**: https://status.render.com
2. **Render Docs**: https://render.com/docs
3. **View Logs**: Render Dashboard → Service → Logs
4. **Test Locally**: Run backend locally to isolate issues

## Next Steps

1. ✅ CORS configuration updated in `render.yaml`
2. ⏳ **Redeploy backend to Render**
3. ⏳ Wait for deployment to complete (5-10 min)
4. ⏳ Test health endpoint
5. ⏳ Test file conversion from frontend
6. ⏳ Verify no CORS/502 errors

---

**Status**: Configuration fixed. Awaiting backend redeployment.
