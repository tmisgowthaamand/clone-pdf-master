# Deploy Supabase Edge Functions and Storage
# Prerequisites:
# 1. Install Supabase CLI: npm install -g supabase
# 2. Login to Supabase: supabase login
# 3. Link your project: supabase link --project-ref prjaxfldggnpelzbdmzk

Write-Host "Deploying Supabase Edge Functions..." -ForegroundColor Green

# Deploy the pdf-to-word edge function
Write-Host "Deploying pdf-to-word function..." -ForegroundColor Yellow
supabase functions deploy pdf-to-word --project-ref prjaxfldggnpelzbdmzk

# Deploy the pdf-to-powerpoint edge function
Write-Host "Deploying pdf-to-powerpoint function..." -ForegroundColor Yellow
supabase functions deploy pdf-to-powerpoint --project-ref prjaxfldggnpelzbdmzk

# Deploy the pdf-to-excel edge function
Write-Host "Deploying pdf-to-excel function..." -ForegroundColor Yellow
supabase functions deploy pdf-to-excel --project-ref prjaxfldggnpelzbdmzk

# Deploy the word-to-pdf edge function
Write-Host "Deploying word-to-pdf function..." -ForegroundColor Yellow
supabase functions deploy word-to-pdf --project-ref prjaxfldggnpelzbdmzk

# Deploy the powerpoint-to-pdf edge function
Write-Host "Deploying powerpoint-to-pdf function..." -ForegroundColor Yellow
supabase functions deploy powerpoint-to-pdf --project-ref prjaxfldggnpelzbdmzk

# Deploy the excel-to-pdf edge function
Write-Host "Deploying excel-to-pdf function..." -ForegroundColor Yellow
supabase functions deploy excel-to-pdf --project-ref prjaxfldggnpelzbdmzk

# Deploy the pdf-to-jpg edge function
Write-Host "Deploying pdf-to-jpg function..." -ForegroundColor Yellow
supabase functions deploy pdf-to-jpg --project-ref prjaxfldggnpelzbdmzk

# Deploy the jpg-to-pdf edge function
Write-Host "Deploying jpg-to-pdf function..." -ForegroundColor Yellow
supabase functions deploy jpg-to-pdf --project-ref prjaxfldggnpelzbdmzk

# Deploy the edit-pdf edge function
Write-Host "Deploying edit-pdf function..." -ForegroundColor Yellow
supabase functions deploy edit-pdf --project-ref prjaxfldggnpelzbdmzk

# Run migrations to set up storage bucket
Write-Host "Setting up storage bucket..." -ForegroundColor Yellow
supabase db push --project-ref prjaxfldggnpelzbdmzk

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "All PDF conversion tools are now available in the cloud!" -ForegroundColor Cyan
