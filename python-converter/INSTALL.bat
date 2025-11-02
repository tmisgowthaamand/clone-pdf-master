@echo off
echo ========================================
echo Professional PPTX to PDF Converter Setup
echo ========================================
echo.

echo Step 1: Checking LibreOffice...
where soffice >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] LibreOffice NOT installed
    echo.
    echo Please install LibreOffice:
    echo 1. Download from: https://www.libreoffice.org/download/download/
    echo 2. Run the installer
    echo 3. Add to PATH: C:\Program Files\LibreOffice\program\
    echo 4. Restart this script
    pause
    exit /b 1
) else (
    echo [OK] LibreOffice is installed
    soffice --version
)

echo.
echo Step 2: Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Step 3: Testing conversion...
python pptx_to_pdf.py ../Sample-Presentation.pptx test-output.pdf

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the API server:
echo   python app.py
echo.
echo To convert a file:
echo   python pptx_to_pdf.py input.pptx output.pdf
echo.
pause
