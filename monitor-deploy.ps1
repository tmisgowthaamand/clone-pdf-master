# Monitor Render deployment status
$backend = "https://pdftools-backend.onrender.com"

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "MONITORING RENDER DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

$attempt = 1
$maxAttempts = 20
$waitSeconds = 15

while ($attempt -le $maxAttempts) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] Attempt $attempt/$maxAttempts" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$backend/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
        
        Write-Host "✅ BACKEND IS LIVE!" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
        Write-Host ""
        
        # Test API endpoint
        Write-Host "Testing API endpoint..." -ForegroundColor Cyan
        try {
            $apiResponse = Invoke-RestMethod -Uri "$backend/api/info" -Method Get -TimeoutSec 10 -ErrorAction Stop
            Write-Host "✅ API ENDPOINT WORKING!" -ForegroundColor Green
            Write-Host "Service: $($apiResponse.service)" -ForegroundColor Gray
            Write-Host "Version: $($apiResponse.version)" -ForegroundColor Gray
            Write-Host ""
            
            # Test CORS
            Write-Host "Testing CORS..." -ForegroundColor Cyan
            $headers = @{ "Origin" = "https://pdf-tools-phi.vercel.app" }
            $corsResponse = Invoke-WebRequest -Uri "$backend/api/info" -Method Get -Headers $headers -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            
            $corsHeader = $corsResponse.Headers['Access-Control-Allow-Origin']
            if ($corsHeader) {
                Write-Host "✅ CORS CONFIGURED!" -ForegroundColor Green
                Write-Host "Access-Control-Allow-Origin: $corsHeader" -ForegroundColor Gray
            } else {
                Write-Host "⚠️  CORS header not found" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "=" * 60 -ForegroundColor Green
            Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
            Write-Host "=" * 60 -ForegroundColor Green
            Write-Host ""
            Write-Host "Your backend is ready at:" -ForegroundColor White
            Write-Host "  $backend" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "You can now use your frontend at:" -ForegroundColor White
            Write-Host "  https://pdf-tools-phi.vercel.app" -ForegroundColor Cyan
            Write-Host ""
            
            break
            
        } catch {
            Write-Host "⚠️  API endpoint returned error: $($_.Exception.Message)" -ForegroundColor Yellow
            Write-Host "   Backend is alive but API may still be initializing..." -ForegroundColor Gray
        }
        
    } catch {
        $errorMsg = $_.Exception.Message
        
        if ($errorMsg -like "*502*") {
            Write-Host "⏳ Service is deploying (502 Bad Gateway)..." -ForegroundColor Yellow
        } elseif ($errorMsg -like "*timed out*") {
            Write-Host "⏳ Service is starting (timeout)..." -ForegroundColor Yellow
        } elseif ($errorMsg -like "*404*") {
            Write-Host "⏳ Service not found (may be building)..." -ForegroundColor Yellow
        } else {
            Write-Host "⏳ Waiting for deployment..." -ForegroundColor Yellow
            Write-Host "   Error: $errorMsg" -ForegroundColor Gray
        }
    }
    
    if ($attempt -lt $maxAttempts) {
        Write-Host "   Waiting $waitSeconds seconds before retry..." -ForegroundColor Gray
        Write-Host ""
        Start-Sleep -Seconds $waitSeconds
    }
    
    $attempt++
}

if ($attempt -gt $maxAttempts) {
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Red
    Write-Host "⏰ TIMEOUT - Deployment taking longer than expected" -ForegroundColor Red
    Write-Host "=" * 60 -ForegroundColor Red
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Check Render dashboard: https://dashboard.render.com" -ForegroundColor White
    Write-Host "  2. View deployment logs for errors" -ForegroundColor White
    Write-Host "  3. Verify build completed successfully" -ForegroundColor White
    Write-Host "  4. Check if service is 'Live' or 'Deploy failed'" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
