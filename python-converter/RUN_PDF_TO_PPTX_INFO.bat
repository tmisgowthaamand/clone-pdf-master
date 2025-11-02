@echo off
echo ========================================
echo   PDF to PPTX Info Page (Streamlit)
echo ========================================
echo.
echo Starting information page...
echo This explains why PDF to PPTX doesn't work
echo.
echo Open your browser at: http://localhost:8505
echo.

cd /d "%~dp0"
streamlit run streamlit_pdf_to_pptx.py --server.port 8505

pause
