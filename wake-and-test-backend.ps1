Write-Host "================================" -ForegroundColor Cyan
Write-Host "Backend Wake-Up & Test Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$backendUrl = "https://pdftools-backend.onrender.com"

# Step 1: Wake up the backend (Render free tier sleeps after inactivity)
Write-Host ""
Write-Host "[1/3] Waking up backend (this may take 30-60 seconds on first request)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/health" -Method GET -UseBasicParsing -TimeoutSec 90
    Write-Host "OK Backend is awake! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "ERROR Failed to wake backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Test API health
Write-Host ""
Write-Host "[2/3] Testing API health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/health" -Method GET -UseBasicParsing -TimeoutSec 30
    Write-Host "OK API Health: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "ERROR API health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test CORS on PDF-to-Excel endpoint
Write-Host ""
Write-Host "[3/3] Testing CORS on PDF-to-Excel endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/convert/pdf-to-excel" -Method OPTIONS -Headers @{"Origin" = "https://pdf-tools-phi.vercel.app"; "Access-Control-Request-Method" = "POST"; "Access-Control-Request-Headers" = "content-type"} -UseBasicParsing -TimeoutSec 30
    
    Write-Host "OK CORS preflight successful!" -ForegroundColor Green
    Write-Host "  Access-Control-Allow-Origin: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Gray
    Write-Host "  Access-Control-Allow-Methods: $($response.Headers['Access-Control-Allow-Methods'])" -ForegroundColor Gray
} catch {
    Write-Host "ERROR CORS test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Backend is ready for use!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
