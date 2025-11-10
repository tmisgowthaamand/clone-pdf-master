# Wake up Render backend from sleep
$backend = "https://pdftools-backend.onrender.com"

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "WAKING UP RENDER BACKEND" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "This may take 50-90 seconds on first request (cold start)..." -ForegroundColor Yellow
Write-Host ""

$startTime = Get-Date

try {
    Write-Host "Sending wake-up request..." -ForegroundColor Cyan
    
    # Use longer timeout for cold start
    $response = Invoke-RestMethod -Uri "$backend/health" -Method Get -TimeoutSec 120 -ErrorAction Stop
    
    $duration = ((Get-Date) - $startTime).TotalSeconds
    
    Write-Host ""
    Write-Host "✅ BACKEND IS AWAKE!" -ForegroundColor Green
    Write-Host "Response time: $([math]::Round($duration, 2)) seconds" -ForegroundColor Gray
    Write-Host "Status: $($response.status)" -ForegroundColor Gray
    Write-Host ""
    
    # Test API endpoint
    Write-Host "Testing API endpoint..." -ForegroundColor Cyan
    $apiResponse = Invoke-RestMethod -Uri "$backend/api/info" -Method Get -TimeoutSec 30
    Write-Host "✅ API is working!" -ForegroundColor Green
    Write-Host "Service: $($apiResponse.service)" -ForegroundColor Gray
    Write-Host "Version: $($apiResponse.version)" -ForegroundColor Gray
    Write-Host ""
    
    # Test CORS
    Write-Host "Testing CORS..." -ForegroundColor Cyan
    $headers = @{ "Origin" = "https://pdf-tools-phi.vercel.app" }
    $corsResponse = Invoke-WebRequest -Uri "$backend/api/info" -Method Get -Headers $headers -TimeoutSec 30 -UseBasicParsing
    
    $corsHeader = $corsResponse.Headers['Access-Control-Allow-Origin']
    if ($corsHeader) {
        Write-Host "✅ CORS is configured correctly!" -ForegroundColor Green
        Write-Host "Access-Control-Allow-Origin: $corsHeader" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Green
    Write-Host "🎉 BACKEND IS READY!" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now use your app at:" -ForegroundColor White
    Write-Host "  https://pdf-tools-phi.vercel.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Backend will stay awake for ~15 minutes" -ForegroundColor Yellow
    Write-Host "Set up UptimeRobot to keep it awake 24/7 (see KEEP_ALIVE_SETUP.md)" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    $duration = ((Get-Date) - $startTime).TotalSeconds
    
    Write-Host ""
    Write-Host "❌ FAILED TO WAKE BACKEND" -ForegroundColor Red
    Write-Host "Time elapsed: $([math]::Round($duration, 2)) seconds" -ForegroundColor Gray
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "  1. Backend is still deploying (check Render dashboard)" -ForegroundColor Gray
    Write-Host "  2. Deployment failed (check Render logs)" -ForegroundColor Gray
    Write-Host "  3. Service crashed (needs manual restart)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Check status at: https://dashboard.render.com" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
