# CORS Fix Test Script
# Tests CORS configuration for PDF to Excel endpoint

param(
    [string]$BackendUrl = "https://pdftools-backend.onrender.com",
    [string]$FrontendOrigin = "https://pdf-tools-phi.vercel.app"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CORS Configuration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend URL: $BackendUrl" -ForegroundColor Yellow
Write-Host "Frontend Origin: $FrontendOrigin" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Cyan
try {
    $healthResponse = Invoke-WebRequest -Uri "$BackendUrl/health" -Method GET -UseBasicParsing
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✓ Backend is healthy (Status: $($healthResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "✗ Backend returned status: $($healthResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Backend is not responding" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Backend may be sleeping (cold start on Render free tier)" -ForegroundColor Yellow
    Write-Host "  Waiting 30 seconds for backend to wake up..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}
Write-Host ""

# Test 2: CORS Preflight (OPTIONS) Request
Write-Host "Test 2: CORS Preflight Request" -ForegroundColor Cyan
Write-Host "-------------------------------" -ForegroundColor Cyan
Write-Host "Testing OPTIONS request to /api/convert/pdf-to-excel..." -ForegroundColor White
Write-Host ""

$endpoint = "$BackendUrl/api/convert/pdf-to-excel"

try {
    # Using curl for better control over OPTIONS request
    if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
        Write-Host "Using curl.exe for OPTIONS request..." -ForegroundColor Gray
        $curlOutput = curl.exe -X OPTIONS $endpoint `
            -H "Origin: $FrontendOrigin" `
            -H "Access-Control-Request-Method: POST" `
            -H "Access-Control-Request-Headers: Content-Type" `
            -i -s 2>&1
        
        Write-Host "Response Headers:" -ForegroundColor Yellow
        $curlOutput | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
        Write-Host ""
        
        # Check for required CORS headers
        $hasAllowOrigin = $curlOutput -match "Access-Control-Allow-Origin"
        $hasAllowMethods = $curlOutput -match "Access-Control-Allow-Methods"
        $hasAllowHeaders = $curlOutput -match "Access-Control-Allow-Headers"
        $hasMaxAge = $curlOutput -match "Access-Control-Max-Age"
        
        Write-Host "CORS Headers Check:" -ForegroundColor Yellow
        if ($hasAllowOrigin) {
            Write-Host "  ✓ Access-Control-Allow-Origin present" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Access-Control-Allow-Origin MISSING" -ForegroundColor Red
        }
        
        if ($hasAllowMethods) {
            Write-Host "  ✓ Access-Control-Allow-Methods present" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Access-Control-Allow-Methods MISSING" -ForegroundColor Red
        }
        
        if ($hasAllowHeaders) {
            Write-Host "  ✓ Access-Control-Allow-Headers present" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Access-Control-Allow-Headers MISSING" -ForegroundColor Red
        }
        
        if ($hasMaxAge) {
            Write-Host "  ✓ Access-Control-Max-Age present" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Access-Control-Max-Age MISSING" -ForegroundColor Red
        }
        
        Write-Host ""
        
        if ($hasAllowOrigin -and $hasAllowMethods -and $hasAllowHeaders) {
            Write-Host "✓ CORS preflight configuration is correct!" -ForegroundColor Green
        } else {
            Write-Host "✗ CORS preflight configuration has issues" -ForegroundColor Red
        }
    } else {
        Write-Host "curl.exe not found, using Invoke-WebRequest..." -ForegroundColor Gray
        
        # Fallback to Invoke-WebRequest
        $headers = @{
            "Origin" = $FrontendOrigin
            "Access-Control-Request-Method" = "POST"
            "Access-Control-Request-Headers" = "Content-Type"
        }
        
        $response = Invoke-WebRequest -Uri $endpoint -Method OPTIONS -Headers $headers -UseBasicParsing
        
        Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Response Headers:" -ForegroundColor Yellow
        $response.Headers.GetEnumerator() | Where-Object { $_.Key -like "*Access-Control*" } | ForEach-Object {
            Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray
        }
        Write-Host ""
        
        if ($response.Headers["Access-Control-Allow-Origin"]) {
            Write-Host "✓ CORS headers present in response" -ForegroundColor Green
        } else {
            Write-Host "✗ CORS headers missing in response" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "✗ OPTIONS request failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Check API Health with CORS
Write-Host "Test 3: API Health Check with CORS" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan
try {
    $headers = @{
        "Origin" = $FrontendOrigin
    }
    
    $apiHealthResponse = Invoke-WebRequest -Uri "$BackendUrl/api/health" -Method GET -Headers $headers -UseBasicParsing
    
    Write-Host "Status: $($apiHealthResponse.StatusCode)" -ForegroundColor Yellow
    
    if ($apiHealthResponse.Headers["Access-Control-Allow-Origin"]) {
        $allowOrigin = $apiHealthResponse.Headers["Access-Control-Allow-Origin"]
        Write-Host "✓ Access-Control-Allow-Origin: $allowOrigin" -ForegroundColor Green
    } else {
        Write-Host "✗ Access-Control-Allow-Origin header missing" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Response Body:" -ForegroundColor Yellow
    Write-Host $apiHealthResponse.Content -ForegroundColor Gray
} catch {
    Write-Host "✗ API health check failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If all tests passed:" -ForegroundColor White
Write-Host "   - Open https://pdf-tools-phi.vercel.app" -ForegroundColor Gray
Write-Host "   - Try PDF to Excel conversion" -ForegroundColor Gray
Write-Host "   - Check browser console for errors" -ForegroundColor Gray
Write-Host ""
Write-Host "2. If tests failed:" -ForegroundColor White
Write-Host "   - Check Render deployment status" -ForegroundColor Gray
Write-Host "   - Verify environment variables on Render" -ForegroundColor Gray
Write-Host "   - Check Render logs for errors" -ForegroundColor Gray
Write-Host "   - Redeploy backend if needed" -ForegroundColor Gray
Write-Host ""
Write-Host "3. If backend is sleeping:" -ForegroundColor White
Write-Host "   - Wait 30-60 seconds for cold start" -ForegroundColor Gray
Write-Host "   - Run this test script again" -ForegroundColor Gray
Write-Host "   - Frontend has automatic retry logic" -ForegroundColor Gray
Write-Host ""

Write-Host "For detailed troubleshooting: See CORS_FIX_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
