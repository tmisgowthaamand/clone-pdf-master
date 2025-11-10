@echo off
echo ========================================
echo DEPLOYING CORS FIX + RETRY LOGIC
echo ========================================
echo.

echo Changes:
echo 1. Fixed CORS headers in Flask backend
echo 2. Added retry logic for cold starts
echo 3. Better error handling for 502 errors
echo.

echo Step 1: Adding files...
git add python-converter/app.py
git add src/pages/PDFToExcel.tsx
git add render.yaml

echo.
echo Step 2: Committing...
git commit -m "Fix: CORS error + Add retry logic for Render cold starts"

echo.
echo Step 3: Pushing to repository...
git push origin main

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Backend will auto-deploy on Render (if enabled)
echo Frontend will auto-deploy on Vercel
echo.
echo Monitor:
echo - Render: https://dashboard.render.com
echo - Vercel: https://vercel.com/dashboard
echo.
echo Backend URL: https://pdftools-backend.onrender.com
echo Frontend URL: https://pdf-tools-phi.vercel.app
echo.
pause
