# IMMEDIATE FIX FOR 502 ERROR

## The Problem
The backend is returning 502 Bad Gateway BEFORE sending CORS headers. This means:
1. The backend service is crashing or timing out
2. OR the backend is sleeping (Render free tier)
3. OR there's a memory/resource issue

## IMMEDIATE SOLUTION - Run This Now

### Step 1: Wake Up the Backend
Double-click this file:
```
WAKE_BACKEND.bat
```

OR run in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File wake-and-test-backend.ps1
```

### Step 2: Wait for Success Message
You should see:
```
✓ Backend is awake! Status: 200
✓ API Health: {"status":"healthy",...}
✓ CORS preflight successful!
```

### Step 3: Try Your Conversion Again
The backend is now awake and ready. Try uploading your PDF again.

## Why This Happens

**Render Free Tier Behavior:**
- Backend sleeps after 15 minutes of inactivity
- Takes 30-60 seconds to wake up
- First request during wake-up gets 502 error
- CORS headers aren't sent during 502 errors

## Permanent Solutions

### Option A: Keep Backend Awake (Free)
Use a ping service to keep backend awake:

1. Go to https://uptimerobot.com (free account)
2. Add new monitor:
   - Type: HTTP(s)
   - URL: `https://pdftools-backend.onrender.com/health`
   - Interval: 5 minutes
3. Backend will never sleep

### Option B: Upgrade Render Plan ($7/month)
- Paid plans don't sleep
- Better performance
- More reliable

## Testing Right Now

Run this to test if backend is ready:
```powershell
powershell -ExecutionPolicy Bypass -File test-backend-health.ps1
```

Expected output:
```
Status Code: 200
Content: {"status":"healthy","libreoffice":"..."}
```

## If Still Getting 502

1. **Check Render Dashboard:**
   - Go to https://dashboard.render.com
   - Check if backend is running
   - View logs for errors

2. **Restart Backend:**
   - In Render dashboard
   - Click "Manual Deploy" → "Clear build cache & deploy"

3. **Check Backend Logs:**
   - Look for memory errors
   - Look for timeout errors
   - Look for dependency errors

## Current Status Check

Run this command to see current backend status:
```powershell
Invoke-WebRequest -Uri "https://pdftools-backend.onrender.com/health" -UseBasicParsing
```

If you get an error, the backend is definitely sleeping or crashed.
