@echo off
echo ========================================
echo   PDF WATERMARK - Streamlit + FastAPI
echo ========================================
echo.
echo Installing dependencies...
pip install -r requirements_watermark.txt
echo.
echo Starting Streamlit app...
echo API will run on: http://127.0.0.1:8000
echo Streamlit UI: http://localhost:8501
echo.
streamlit run streamlit_watermarkpdf.py
pause
