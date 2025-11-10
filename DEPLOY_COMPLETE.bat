@echo off
echo ========================================
echo   DEPLOY TO RENDER + VERCEL
echo ========================================
echo.

echo [1/4] Adding all changes...
git add .
echo.

echo [2/4] Committing changes...
git commit -m "Fix CORS and optimize for Render deployment - Ready for production"
echo.

echo [3/4] Pushing to GitHub...
git push origin main
echo.

echo [4/4] Deployment initiated!
echo.
echo ========================================
echo   NEXT STEPS
echo ========================================
echo.
echo BACKEND (Render):
echo 1. Go to: https://dashboard.render.com
echo 2. Your service will auto-deploy in 5-10 minutes
echo 3. Check logs for any errors
echo 4. Test: curl https://pdftools-backend.onrender.com/health
echo.
echo FRONTEND (Vercel):
echo 1. Go to: https://vercel.com/dashboard
echo 2. Select your project: pdf-tools-phi
echo 3. Check if VITE_API_URL is set to:
echo    https://pdftools-backend.onrender.com
echo 4. Redeploy if needed
echo.
echo ========================================
pause
