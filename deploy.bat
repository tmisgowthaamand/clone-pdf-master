@echo off
echo ========================================
echo Deploying Excel to PDF Fix to Render
echo ========================================
echo.

echo Step 1: Adding files to git...
git add python-converter/excel_to_pdf_table.py
git add python-converter/enhance_excel_formatting.py
git add python-converter/excel_to_pdf_fixed.py
git add python-converter/excel_to_pdf_perfect.py
git add python-converter/excel_to_pdf_render.py
git add python-converter/app.py
git add src/components/ui/select.tsx
git add src/pages/WatermarkPDF.tsx
git add src/index.css

echo.
echo Step 2: Committing changes...
git commit -m "Fix Excel to PDF conversion - table-based approach for bank statement quality"

echo.
echo Step 3: Pushing to repository...
git push origin main

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Render will automatically detect and deploy the changes.
echo This may take 2-5 minutes.
echo.
echo Check deployment status at:
echo https://dashboard.render.com
echo.
echo Test the fix at:
echo https://pdf-tools-phi.vercel.app/
echo.
pause
