@echo off
echo ========================================
echo DEPLOYING EXCEL TO PDF FIX TO RENDER
echo ========================================
echo.

echo Step 1: Adding all changes...
git add .

echo Step 2: Committing changes...
git commit -m "Fix Excel to PDF - Use LibreOffice for exact layout preservation like iLovePDF"

echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Render will auto-deploy from GitHub.
echo.
echo Monitor deployment at:
echo https://dashboard.render.com
echo.
echo Test your API at:
echo https://pdftools-backend.onrender.com/api/convert/excel-to-pdf
echo.
echo Or check health:
echo https://pdftools-backend.onrender.com/health
echo.
pause
