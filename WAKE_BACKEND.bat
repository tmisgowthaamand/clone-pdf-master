@echo off
echo ========================================
echo   Wake Up Backend - Quick Start
echo ========================================
echo.
echo This will wake up the Render backend...
echo.
powershell -ExecutionPolicy Bypass -File wake-and-test-backend.ps1
echo.
echo ========================================
echo   Backend is ready! You can now use the app.
echo ========================================
pause
