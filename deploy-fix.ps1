Write-Host "================================" -ForegroundColor Cyan
Write-Host "Deploying CORS & 502 Fix to Vercel" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if vercel CLI is installed
Write-Host ""
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "ERROR: Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Deploy to production
Write-Host ""
Write-Host "Deploying to Vercel production..." -ForegroundColor Yellow
vercel --prod --yes

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Changes deployed:" -ForegroundColor Yellow
Write-Host "  - Added 'Wake Up Backend' button" -ForegroundColor Gray
Write-Host "  - Increased timeout to 3 minutes" -ForegroundColor Gray
Write-Host "  - Added retry logic for 502/503/504 errors" -ForegroundColor Gray
Write-Host "  - Better error messages" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Visit https://pdf-tools-phi.vercel.app" -ForegroundColor Gray
Write-Host "  2. Click 'Wake Up Backend' button before converting" -ForegroundColor Gray
Write-Host "  3. Wait for success message" -ForegroundColor Gray
Write-Host "  4. Upload and convert your PDF" -ForegroundColor Gray
