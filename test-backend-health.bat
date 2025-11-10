@echo off
echo Testing Render Backend Health...
echo.
echo Testing /health endpoint:
curl -i https://pdftools-backend.onrender.com/health
echo.
echo.
echo Testing /api/health endpoint:
curl -i https://pdftools-backend.onrender.com/api/health
echo.
echo.
echo Testing root endpoint:
curl -i https://pdftools-backend.onrender.com/
echo.
pause
