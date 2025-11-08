@echo off
echo ========================================
echo Starting PDF Tools Backend Locally
echo ========================================
echo.

REM Set environment variables for local development
set FLASK_ENV=development
set PORT=5000
set ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://pdf-tools-phi.vercel.app
set PYTHONUNBUFFERED=1

echo Installing Python dependencies...
py -m pip install -r requirements.txt

echo.
echo ========================================
echo Backend starting on http://localhost:5000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Run Flask app directly (faster than gunicorn on Windows)
py app.py
