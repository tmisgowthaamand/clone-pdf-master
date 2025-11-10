@echo off
REM Test Backend API Endpoints

echo ============================================
echo Testing PDFTools Backend API
echo ============================================
echo.

set BACKEND_URL=https://pdftools-backend.onrender.com

echo Testing Health Endpoint...
curl -X GET "%BACKEND_URL%/health"
echo.
echo.

echo Testing API Info Endpoint...
curl -X GET "%BACKEND_URL%/api/info"
echo.
echo.

echo Testing CORS with OPTIONS...
curl -X OPTIONS "%BACKEND_URL%/api/convert/pdf-to-excel" -H "Origin: https://pdf-tools-phi.vercel.app" -H "Access-Control-Request-Method: POST" -v
echo.
echo.

echo ============================================
echo Test Complete!
echo ============================================
echo.
echo If you see CORS headers in the response, CORS is working correctly.
echo Look for: Access-Control-Allow-Origin: *
echo.
pause
