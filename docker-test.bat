@echo off
echo ========================================
echo PDFTools Backend - Docker Test
echo ========================================
echo.

echo Building Docker image...
docker build -t pdftools-backend .

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Docker build failed!
    pause
    exit /b 1
)

echo.
echo Starting container on port 10000...
docker run -p 10000:10000 --name pdftools-test pdftools-backend

echo.
echo Container stopped. Cleaning up...
docker rm pdftools-test

pause
