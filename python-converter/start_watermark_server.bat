@echo off
echo ========================================
echo PDF Watermark Backend Server
echo ========================================
echo.
echo Installing dependencies...
pip install -r requirements_watermark.txt
echo.
echo Starting Flask server on port 5000...
echo.
python watermark_backend.py
pause
