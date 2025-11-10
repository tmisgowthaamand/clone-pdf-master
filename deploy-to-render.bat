@echo off
echo ========================================
echo   Deploy to Render - PDFTools Backend
echo ========================================
echo.

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding all changes...
git add .
echo.

echo Step 3: Committing changes...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Fix CORS and optimize for Render deployment

git commit -m "%commit_msg%"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo   Deployment Initiated!
echo ========================================
echo.
echo Render will automatically detect the push and start building.
echo.
echo Next steps:
echo 1. Go to https://dashboard.render.com
echo 2. Check your service logs
echo 3. Wait for build to complete (5-10 minutes)
echo 4. Test: curl https://pdftools-backend.onrender.com/health
echo.
echo ========================================
pause
