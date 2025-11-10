# Test CORS configuration for the backend
Write-Host "Testing CORS Configuration..." -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://pdftools-backend.onrender.com"
$testEndpoint = "$backendUrl/api/convert/pdf-to-excel"

# Test 1: Health check
Write-Host "1. Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$backendUrl/health" -Method GET -UseBasicParsing
    Write-Host "   Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($healthResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: OPTIONS preflight request
Write-Host "2. Testing OPTIONS preflight request..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "https://pdf-tools-phi.vercel.app"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    
    $optionsResponse = Invoke-WebRequest -Uri $testEndpoint -Method OPTIONS -Headers $headers -UseBasicParsing
    Write-Host "   Status: $($optionsResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   CORS Headers:" -ForegroundColor Cyan
    
    $corsHeaders = @(
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Headers",
        "Access-Control-Max-Age"
    )
    
    foreach ($header in $corsHeaders) {
        if ($optionsResponse.Headers[$header]) {
            Write-Host "     $header : $($optionsResponse.Headers[$header])" -ForegroundColor Green
        } else {
            Write-Host "     $header : MISSING" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Check if service is sleeping (Render free tier)
Write-Host "3. Checking service status..." -ForegroundColor Yellow
try {
    $apiInfoResponse = Invoke-WebRequest -Uri "$backendUrl/api/info" -Method GET -UseBasicParsing
    Write-Host "   Service is AWAKE and responding" -ForegroundColor Green
    Write-Host "   Response: $($apiInfoResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "   Service might be sleeping (Render free tier)" -ForegroundColor Yellow
    Write-Host "   Waiting 30 seconds for service to wake up..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    try {
        $retryResponse = Invoke-WebRequest -Uri "$backendUrl/api/info" -Method GET -UseBasicParsing
        Write-Host "   Service is NOW AWAKE" -ForegroundColor Green
    } catch {
        Write-Host "   ERROR: Service still not responding" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "Testing complete!" -ForegroundColor Cyan
