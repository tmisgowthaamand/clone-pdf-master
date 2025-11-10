# 🚀 DEPLOY THE FIX NOW

## Quick Deploy to Vercel

### Method 1: Git Push (Recommended if connected to GitHub)
```bash
git add .
git commit -m "Fix: Add wake backend button and improve CORS/502 error handling"
git push origin main
```
Vercel will auto-deploy in 2-3 minutes.

### Method 2: Vercel CLI
```bash
# Login first (if needed)
vercel login

# Deploy to production
vercel --prod
```

### Method 3: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Find your project: `pdf-tools-phi`
3. Click "Deployments" tab
4. Click "Redeploy" on latest deployment
5. Check "Use existing Build Cache" → Uncheck it
6. Click "Redeploy"

## ✅ What Will Be Deployed

### New Features
- ✅ "Wake Up Backend" button on PDF to Excel page
- ✅ Automatic retry logic (5 attempts, 15s delay)
- ✅ 3-minute timeout for large files
- ✅ Better error messages

### Files Changed
- `src/utils/apiClient.ts` - Improved retry logic
- `src/pages/PDFToExcel.tsx` - Added wake button

## 🧪 Test After Deployment

1. Visit: https://pdf-tools-phi.vercel.app
2. Go to PDF to Excel converter
3. Click "Wake Up Backend (First Time)" button
4. Wait for success message
5. Upload a PDF and convert

## 🎯 Expected Result

**Before Fix:**
- ❌ CORS error immediately
- ❌ 502 Bad Gateway
- ❌ No retry
- ❌ Confusing error messages

**After Fix:**
- ✅ Wake backend button available
- ✅ Automatic retry on 502 errors
- ✅ Clear status messages
- ✅ Successful conversion

## 📞 If You Need Help

Run this to verify backend is working:
```powershell
powershell -ExecutionPolicy Bypass -File wake-and-test-backend.ps1
```

Expected output:
```
✓ Backend is awake! Status: 200
✓ API Health: {"status":"healthy",...}
✓ CORS preflight successful!
```

---

**Ready to deploy? Run one of the methods above!** 🚀
