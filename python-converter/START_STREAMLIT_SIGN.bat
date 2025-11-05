@echo off
echo ========================================
echo   Streamlit Sign PDF App
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install/upgrade dependencies
echo Installing dependencies...
pip install streamlit pypdf reportlab pillow pdf2image streamlit-drawable-canvas
echo.

REM Start Streamlit app
echo Starting Streamlit Sign PDF app...
echo The app will open in your browser automatically
echo Press Ctrl+C to stop the server
echo.
streamlit run sign_pdf_streamlit.py

pause
