@echo off
color 0A
echo.
echo ========================================
echo   CORS ^& 502 ERROR - COMPLETE SOLUTION
echo ========================================
echo.
echo This script will:
echo   1. Show you what was fixed
echo   2. Test the backend
echo   3. Guide you through deployment
echo.
pause
cls

echo.
echo ========================================
echo   STEP 1: WHAT WAS FIXED
echo ========================================
echo.
type FIX_SUMMARY.txt
echo.
pause
cls

echo.
echo ========================================
echo   STEP 2: TESTING BACKEND
echo ========================================
echo.
echo Testing if backend is awake and working...
echo.
powershell -ExecutionPolicy Bypass -File wake-and-test-backend.ps1
echo.
pause
cls

echo.
echo ========================================
echo   STEP 3: DEPLOYMENT OPTIONS
echo ========================================
echo.
echo Choose how to deploy:
echo.
echo   1. Git Push (if connected to GitHub)
echo      - Run: git add .
echo      - Run: git commit -m "Fix CORS and 502 errors"
echo      - Run: git push origin main
echo.
echo   2. Vercel CLI
echo      - Run: vercel login
echo      - Run: vercel --prod
echo.
echo   3. Vercel Dashboard
echo      - Go to https://vercel.com/dashboard
echo      - Find your project
echo      - Click "Redeploy"
echo.
echo ========================================
echo.
echo Would you like to deploy now using Git? (Y/N)
set /p deploy="Enter choice: "

if /i "%deploy%"=="Y" (
    echo.
    echo Deploying via Git...
    git add .
    git commit -m "Fix: Add wake backend button and improve CORS/502 error handling"
    git push origin main
    echo.
    echo Deployment initiated! Check Vercel dashboard for progress.
) else (
    echo.
    echo Skipping deployment. You can deploy manually later.
)

echo.
echo ========================================
echo   NEXT STEPS
echo ========================================
echo.
echo 1. Wait for Vercel deployment to complete (2-3 minutes)
echo 2. Visit: https://pdf-tools-phi.vercel.app
echo 3. Go to PDF to Excel converter
echo 4. Click "Wake Up Backend" button
echo 5. Upload and convert your PDF
echo.
echo For permanent solution (keep backend awake):
echo   - Setup UptimeRobot: https://uptimerobot.com
echo   - Monitor URL: https://pdftools-backend.onrender.com/health
echo   - Interval: 5 minutes
echo.
echo ========================================
echo   ALL DONE! ^_^
echo ========================================
echo.
pause
