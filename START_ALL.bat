@echo off
echo ========================================
echo   Starting PPTX to PDF Converter
echo ========================================
echo.
echo Starting services...
echo.

REM Start React Frontend
start "React Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo ✅ React Frontend starting on http://localhost:8082
echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo 🌐 Open your browser:
echo    http://localhost:8082
echo.
echo Navigate to "PowerPoint to PDF" page
echo.
echo Press any key to stop all services...
pause > nul

echo.
echo Stopping services...
taskkill /FI "WINDOWTITLE eq React Frontend*" /T /F > nul 2>&1

echo.
echo ✅ All services stopped
pause
