# Keep Render Backend Awake - Setup Guide

## Problem
Render free tier services sleep after 15 minutes of inactivity, causing:
- 50+ second cold start delays
- 502 errors on first request
- Poor user experience

## Solution Options

### Option 1: UptimeRobot (Recommended - FREE)
**Setup Time: 2 minutes**

1. Go to https://uptimerobot.com/
2. Sign up for free account
3. Click "Add New Monitor"
4. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: PDFTools Backend
   - **URL**: `https://pdftools-backend.onrender.com/health`
   - **Monitoring Interval**: 5 minutes (free tier)
5. Click "Create Monitor"

**Result**: Your backend will be pinged every 5 minutes, staying awake 24/7

---

### Option 2: Cron-Job.org (FREE)
**Setup Time: 2 minutes**

1. Go to https://cron-job.org/
2. Sign up for free account
3. Create new cronjob:
   - **Title**: Keep PDFTools Awake
   - **URL**: `https://pdftools-backend.onrender.com/health`
   - **Schedule**: Every 10 minutes
4. Save

---

### Option 3: GitHub Actions (FREE - Already have GitHub)
**Setup Time: 3 minutes**

Add this file to your repo:

`.github/workflows/keep-alive.yml`
```yaml
name: Keep Render Backend Awake

on:
  schedule:
    # Run every 14 minutes
    - cron: '*/14 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: |
          curl -f https://pdftools-backend.onrender.com/health || exit 0
          echo "Backend pinged successfully"
```

Then enable GitHub Actions in your repo settings.

---

### Option 4: Render Cron Job (FREE)
Add to your `render.yaml`:

```yaml
services:
  # ... existing web service ...
  
  - type: cron
    name: keep-backend-awake
    env: docker
    schedule: "*/14 * * * *"  # Every 14 minutes
    dockerfilePath: ./Dockerfile.cron
    dockerContext: ./
```

Create `Dockerfile.cron`:
```dockerfile
FROM alpine:latest
RUN apk add --no-cache curl
CMD curl -f https://pdftools-backend.onrender.com/health
```

---

## Recommended: UptimeRobot

**Why?**
- ✅ Completely free
- ✅ No code changes needed
- ✅ 5-minute intervals (better than 14)
- ✅ Email alerts if backend goes down
- ✅ Status page included
- ✅ Setup in 2 minutes

**Go set it up now**: https://uptimerobot.com/

---

## Alternative: Upgrade to Render Paid Plan
- **Cost**: $7/month
- **Benefits**: No sleep, better performance, more RAM
- **Worth it if**: You have regular users

---

## Quick Test After Setup
Run this to verify keep-alive is working:
```powershell
powershell -ExecutionPolicy Bypass -File quick-test.ps1
```
