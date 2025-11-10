try {
    Write-Host "Testing PDF to Excel endpoint..." -ForegroundColor Cyan
    
    # Test OPTIONS request (preflight)
    Write-Host "`n1. Testing OPTIONS (preflight) request..." -ForegroundColor Yellow
    $optionsResponse = Invoke-WebRequest -Uri "https://pdftools-backend.onrender.com/api/convert/pdf-to-excel" `
        -Method OPTIONS `
        -Headers @{
            "Origin" = "https://pdf-tools-phi.vercel.app"
            "Access-Control-Request-Method" = "POST"
            "Access-Control-Request-Headers" = "content-type"
        } `
        -UseBasicParsing `
        -TimeoutSec 10
    
    Write-Host "OPTIONS Status Code: $($optionsResponse.StatusCode)" -ForegroundColor Green
    Write-Host "`nCORS Headers:" -ForegroundColor Yellow
    Write-Host "Access-Control-Allow-Origin: $($optionsResponse.Headers['Access-Control-Allow-Origin'])"
    Write-Host "Access-Control-Allow-Methods: $($optionsResponse.Headers['Access-Control-Allow-Methods'])"
    Write-Host "Access-Control-Allow-Headers: $($optionsResponse.Headers['Access-Control-Allow-Headers'])"
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
