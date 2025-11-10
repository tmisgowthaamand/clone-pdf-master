@echo off
echo ========================================
echo   Restarting Flask Backend Server
echo ========================================
echo.

REM Kill existing Flask server
echo Stopping existing Flask server...
taskkill /F /FI "WINDOWTITLE eq *python*app.py*" 2>nul
taskkill /F /IM python.exe /FI "MEMUSAGE gt 50000" 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Flask backend on port 5000...
cd /d "%~dp0python-converter"
start "Flask Backend" cmd /k "py app.py"

echo.
echo ========================================
echo   Backend Server Started!
echo ========================================
echo.
echo Backend running on: http://localhost:5000
echo Health check: http://localhost:5000/health
echo.
echo Press any key to close this window...
pause >nul
