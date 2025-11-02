@echo off
echo ========================================
echo   LibreOffice Installation Guide
echo ========================================
echo.
echo LibreOffice is REQUIRED for PPTX to PDF conversion.
echo It's the same technology used by professional converters.
echo.
echo STEP 1: Download LibreOffice
echo ========================================
echo Opening download page in your browser...
start https://www.libreoffice.org/download/download/
echo.
echo Please download and install LibreOffice
echo Choose: "LibreOffice 24.8.3" (or latest version)
echo.
pause
echo.
echo STEP 2: Add to PATH
echo ========================================
echo After installation, add LibreOffice to your PATH:
echo.
echo 1. Press Win + X, select "System"
echo 2. Click "Advanced system settings"
echo 3. Click "Environment Variables"
echo 4. Under "System variables", find "Path"
echo 5. Click "Edit"
echo 6. Click "New"
echo 7. Add: C:\Program Files\LibreOffice\program
echo 8. Click OK on all windows
echo 9. RESTART your terminal/IDE
echo.
pause
echo.
echo STEP 3: Verify Installation
echo ========================================
echo Checking if LibreOffice is installed...
echo.
where soffice
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SUCCESS! LibreOffice is installed and in PATH
    echo.
    soffice --version
    echo.
    echo You can now run the converter!
    echo   streamlit run streamlit_app.py
) else (
    echo.
    echo ❌ LibreOffice not found in PATH
    echo.
    echo Please:
    echo 1. Make sure LibreOffice is installed
    echo 2. Add to PATH as described above
    echo 3. RESTART your terminal
    echo 4. Run this script again
)
echo.
pause
