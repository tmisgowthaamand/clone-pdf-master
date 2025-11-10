@echo off
echo ========================================
echo Deploying CORS Fix to Render
echo ========================================
echo.

echo Step 1: Committing changes...
git add src/utils/apiClient.ts
git add src/pages/PDFToExcel.tsx
git add test-cors.ps1
git commit -m "Fix CORS: Add retry logic and explicit CORS mode for Render cold starts"

echo.
echo Step 2: Pushing to repository...
git push origin main

echo.
echo Step 3: Deploying to Vercel...
vercel --prod

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
