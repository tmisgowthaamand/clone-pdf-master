@echo off
REM Render Deployment Script for PDFTools Backend
REM This script helps prepare and deploy to Render

echo ============================================
echo PDFTools Backend - Render Deployment
echo ============================================
echo.

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding all changes...
git add .
echo.

echo Step 3: Committing changes...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg="Update backend for Render deployment - Fix CORS and 502 errors"
git commit -m "%commit_msg%"
echo.

echo Step 4: Pushing to repository...
git push origin main
echo.

echo ============================================
echo Deployment Complete!
echo ============================================
echo.
echo Next Steps:
echo 1. Go to your Render dashboard: https://dashboard.render.com
echo 2. Your service should auto-deploy (if autoDeploy is enabled)
echo 3. Or manually trigger a deploy from the dashboard
echo 4. Monitor the build logs for any errors
echo 5. Test the health endpoint: https://pdftools-backend.onrender.com/health
echo 6. Test the API: https://pdftools-backend.onrender.com/api/info
echo.
echo Frontend URL: https://pdf-tools-phi.vercel.app
echo Backend URL: https://pdftools-backend.onrender.com
echo.
pause
