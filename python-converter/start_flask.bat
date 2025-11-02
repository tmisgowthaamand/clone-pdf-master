@echo off
echo Starting Flask API Server...
echo.
set FLASK_APP=app.py
set FLASK_ENV=development
python app.py
pause
