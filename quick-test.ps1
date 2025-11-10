# Quick test for Render backend
Write-Host "Testing Render Backend..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://pdftools-backend.onrender.com/health" -Method Get -TimeoutSec 15
    Write-Host "✅ Backend is HEALTHY!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is DOWN or UNREACHABLE!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "`nPossible causes:" -ForegroundColor Yellow
    Write-Host "  1. Service is in cold start (wait 60s and retry)" -ForegroundColor Gray
    Write-Host "  2. Service crashed (check Render logs)" -ForegroundColor Gray
    Write-Host "  3. Deployment failed (redeploy from Render dashboard)" -ForegroundColor Gray
}

Write-Host "`nPress any key to test CORS..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

try {
    $headers = @{
        "Origin" = "https://pdf-tools-phi.vercel.app"
    }
    $response = Invoke-WebRequest -Uri "https://pdftools-backend.onrender.com/api/info" -Method Get -Headers $headers -TimeoutSec 15
    
    Write-Host "`n✅ CORS is WORKING!" -ForegroundColor Green
    Write-Host "CORS Headers:" -ForegroundColor Gray
    $response.Headers.GetEnumerator() | Where-Object { $_.Key -like "*Access-Control*" } | ForEach-Object {
        Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray
    }
} catch {
    Write-Host "`n❌ CORS test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
