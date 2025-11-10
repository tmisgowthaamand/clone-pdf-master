try {
    Write-Host "Testing backend health..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "https://pdftools-backend.onrender.com/api/health" -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content: $($response.Content)"
    Write-Host "`nHeaders:" -ForegroundColor Yellow
    $response.Headers | Format-Table
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
