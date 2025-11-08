@echo off
echo ========================================
echo Render Deployment Helper
echo ========================================
echo.
echo This will help you deploy to Render.
echo.
echo STEPS TO DEPLOY:
echo.
echo 1. Commit all changes:
echo    git add .
echo    git commit -m "Fix CORS and optimize for Render"
echo    git push origin main
echo.
echo 2. Go to Render Dashboard: https://dashboard.render.com
echo.
echo 3. If service exists:
echo    - Click on "pdftools-backend" service
echo    - Click "Manual Deploy" -^> "Deploy latest commit"
echo.
echo 4. If creating new service:
echo    - Click "New +" -^> "Web Service"
echo    - Connect your GitHub repository
echo    - Select the repository
echo    - Use these settings:
echo      * Name: pdftools-backend
echo      * Environment: Docker
echo      * Region: Oregon (US West)
echo      * Branch: main
echo      * Root Directory: python-converter
echo      * Plan: Free
echo.
echo 5. Monitor deployment logs for any errors
echo.
echo 6. Once deployed, test the health endpoint:
echo    https://pdftools-backend.onrender.com/health
echo.
echo ========================================
echo.
pause
