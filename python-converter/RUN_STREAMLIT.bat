@echo off
echo ========================================
echo   PPTX to PDF Converter - Streamlit App
echo ========================================
echo.
echo Starting Streamlit app...
echo Open your browser at: http://localhost:8501
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
streamlit run streamlit_app.py

pause
