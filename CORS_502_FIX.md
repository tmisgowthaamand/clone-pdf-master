# CORS & 502 Error Fix Guide

## Problem
You're seeing these errors:
1. **CORS Error**: `Access to fetch at 'https://pdftools-backend.onrender.com/api/convert/pdf-to-excel' from origin 'https://pdf-tools-phi.vercel.app' has been blocked by CORS policy`
2. **502 Bad Gateway**: Backend returns 502 error

## Root Cause
The backend is correctly configured with CORS headers, but **Render's free tier puts the service to sleep after 15 minutes of inactivity**. When the service is sleeping:
- First request gets a 502 Bad Gateway error
- It takes 30-60 seconds for the service to wake up
- CORS headers may not be sent during the wake-up phase

## Solution

### ✅ CORS is Already Fixed
The backend (`app.py`) has proper CORS configuration:
- Allows all origins with `*`
- Includes all necessary headers
- Handles OPTIONS preflight requests

### ✅ Frontend Has Retry Logic
The frontend (`apiClient.ts`) already includes:
- Automatic retry on 502/504 errors (5 attempts)
- 15-second delay between retries
- 3-minute timeout for large files

### 🔧 What You Need to Do

#### Option 1: Wake Up Backend Before Use (Recommended for Free Tier)
Run this script before using the app:
```powershell
powershell -ExecutionPolicy Bypass -File wake-and-test-backend.ps1
```

This will:
1. Wake up the sleeping backend (takes 30-60 seconds)
2. Verify CORS is working
3. Confirm the backend is ready

#### Option 2: Keep Backend Awake (Requires External Service)
Use a service like **UptimeRobot** or **Cron-job.org** to ping your backend every 10 minutes:
- URL to ping: `https://pdftools-backend.onrender.com/health`
- Interval: Every 10 minutes
- This keeps the backend awake 24/7

#### Option 3: Upgrade to Render Paid Plan
- Paid plans don't sleep
- Better performance and reliability
- Cost: $7/month for starter plan

## Testing

### 1. Test Backend Health
```powershell
powershell -ExecutionPolicy Bypass -File test-backend-health.ps1
```

### 2. Test CORS
```powershell
powershell -ExecutionPolicy Bypass -File test-pdf-excel-endpoint.ps1
```

### 3. Wake Up and Test Everything
```powershell
powershell -ExecutionPolicy Bypass -File wake-and-test-backend.ps1
```

## Expected Behavior

### First Request (Backend Sleeping)
1. Frontend sends request
2. Gets 502 error
3. Shows "Backend is waking up... Attempt 1/5"
4. Retries after 15 seconds
5. Backend wakes up
6. Request succeeds

### Subsequent Requests (Backend Awake)
1. Frontend sends request
2. Backend responds immediately
3. Conversion completes successfully

## Verification

After running `wake-and-test-backend.ps1`, you should see:
```
✓ Backend is awake! Status: 200
✓ API Health: {"status":"healthy","libreoffice":"..."}
✓ CORS preflight successful!
  Access-Control-Allow-Origin: https://pdf-tools-phi.vercel.app
  Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, HEAD
```

## Troubleshooting

### If 502 Error Persists
1. Wait 60 seconds and try again (backend may still be starting)
2. Check Render dashboard for backend logs
3. Verify backend is deployed and running

### If CORS Error Persists
1. Clear browser cache
2. Try in incognito/private mode
3. Check browser console for actual error details

### If Conversion Fails
1. Check file size (max 100MB)
2. Verify PDF is not corrupted
3. Check backend logs on Render dashboard

## Files Modified
- ✅ `src/utils/apiClient.ts` - Increased timeout to 3 minutes, added 503 handling
- ✅ `python-converter/app.py` - Already has proper CORS configuration
- ✅ `wake-and-test-backend.ps1` - New script to wake up backend
- ✅ `test-backend-health.ps1` - Test backend health
- ✅ `test-pdf-excel-endpoint.ps1` - Test CORS configuration

## Summary
The CORS and 502 errors are caused by Render's free tier sleep behavior, not a configuration issue. The frontend already has retry logic to handle this. Just wake up the backend before use, or set up automated pings to keep it awake.
