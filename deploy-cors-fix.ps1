# CORS Fix Deployment Script
# This script helps deploy the CORS fixes to Render and Vercel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CORS Fix Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "ERROR: Not in a git repository" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Changes detected:" -ForegroundColor Green
    git status --short
    Write-Host ""
    
    $commit = Read-Host "Do you want to commit these changes? (y/n)"
    if ($commit -eq "y" -or $commit -eq "Y") {
        Write-Host ""
        Write-Host "Step 2: Committing changes..." -ForegroundColor Yellow
        git add .
        git commit -m "Fix CORS configuration for Vercel frontend and Render backend"
        Write-Host "✓ Changes committed" -ForegroundColor Green
        Write-Host ""
        
        $push = Read-Host "Do you want to push to GitHub? (y/n)"
        if ($push -eq "y" -or $push -eq "Y") {
            Write-Host ""
            Write-Host "Step 3: Pushing to GitHub..." -ForegroundColor Yellow
            git push origin main
            Write-Host "✓ Pushed to GitHub" -ForegroundColor Green
            Write-Host ""
        }
    }
} else {
    Write-Host "No changes to commit" -ForegroundColor Green
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "BACKEND (Render):" -ForegroundColor Yellow
Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Select your 'pdftools-backend' service" -ForegroundColor White
Write-Host "3. Click 'Manual Deploy' → 'Deploy latest commit'" -ForegroundColor White
Write-Host "4. Wait for deployment to complete (~5-10 minutes)" -ForegroundColor White
Write-Host "5. Check logs for: 'CORS Allowed Origins: [...]'" -ForegroundColor White
Write-Host ""

Write-Host "FRONTEND (Vercel):" -ForegroundColor Yellow
Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Select your 'pdf-tools' project" -ForegroundColor White
Write-Host "3. Vercel will auto-deploy from GitHub push" -ForegroundColor White
Write-Host "4. Or click 'Redeploy' to trigger manual deployment" -ForegroundColor White
Write-Host "5. Wait for deployment to complete (~2-3 minutes)" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verification Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "After deployment, test the fix:" -ForegroundColor Yellow
Write-Host "1. Open https://pdf-tools-phi.vercel.app" -ForegroundColor White
Write-Host "2. Open Browser DevTools (F12) → Network tab" -ForegroundColor White
Write-Host "3. Go to 'PDF to Excel' page" -ForegroundColor White
Write-Host "4. Upload a PDF file and click 'Convert'" -ForegroundColor White
Write-Host "5. Check Network tab for:" -ForegroundColor White
Write-Host "   - OPTIONS request → 200 OK" -ForegroundColor Green
Write-Host "   - POST request → 200 OK" -ForegroundColor Green
Write-Host "   - No CORS errors in console" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Quick CORS Test (Optional)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$test = Read-Host "Do you want to test CORS with curl? (y/n)"
if ($test -eq "y" -or $test -eq "Y") {
    Write-Host ""
    Write-Host "Testing CORS preflight request..." -ForegroundColor Yellow
    Write-Host ""
    
    $url = "https://pdftools-backend.onrender.com/api/convert/pdf-to-excel"
    $origin = "https://pdf-tools-phi.vercel.app"
    
    Write-Host "URL: $url" -ForegroundColor Cyan
    Write-Host "Origin: $origin" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        $response = curl.exe -X OPTIONS $url `
            -H "Origin: $origin" `
            -H "Access-Control-Request-Method: POST" `
            -H "Access-Control-Request-Headers: Content-Type" `
            -i -s
        
        Write-Host "Response:" -ForegroundColor Green
        Write-Host $response
        Write-Host ""
        
        if ($response -match "Access-Control-Allow-Origin") {
            Write-Host "✓ CORS headers present!" -ForegroundColor Green
        } else {
            Write-Host "✗ CORS headers missing - backend may still be deploying" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Could not connect to backend" -ForegroundColor Red
        Write-Host "Backend may be sleeping (cold start) or still deploying" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed troubleshooting, see: CORS_FIX_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
