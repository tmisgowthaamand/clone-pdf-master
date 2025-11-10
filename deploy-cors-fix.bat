@echo off
echo ========================================
echo Deploying CORS Fix to Render
echo ========================================
echo.

echo Step 1: Committing changes...
git add python-converter/app.py
git commit -m "Fix CORS error: Add explicit OPTIONS handlers for all routes"

echo.
echo Step 2: Pushing to repository...
git push origin main

echo.
echo ========================================
echo Deployment initiated!
echo ========================================
echo.
echo If auto-deploy is enabled on Render, your changes will be deployed automatically.
echo Otherwise, go to https://dashboard.render.com and manually deploy.
echo.
echo Monitor deployment at: https://dashboard.render.com
echo Backend URL: https://pdftools-backend.onrender.com
echo.
pause
