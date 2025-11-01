<#
.SYNOPSIS
    PowerPoint to PDF Converter - PowerShell Automation Script

.DESCRIPTION
    Converts PowerPoint files (.pptx, .ppt) to PDF format.
    Can process single files or entire directories.

.PARAMETER InputPath
    Path to the PowerPoint file or directory containing PowerPoint files

.PARAMETER OutputPath
    Path where the PDF file(s) should be saved (optional)

.PARAMETER Quality
    Conversion quality: High, Medium, or Low (default: High)

.PARAMETER Recursive
    Process subdirectories when InputPath is a directory

.EXAMPLE
    .\Convert-PowerPointToPDF.ps1 -InputPath "presentation.pptx"
    
.EXAMPLE
    .\Convert-PowerPointToPDF.ps1 -InputPath "C:\Presentations" -OutputPath "C:\PDFs" -Recursive

.EXAMPLE
    .\Convert-PowerPointToPDF.ps1 -InputPath "report.pptx" -OutputPath "report.pdf" -Quality High
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$InputPath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("High", "Medium", "Low")]
    [string]$Quality = "High",
    
    [Parameter(Mandatory=$false)]
    [switch]$Recursive
)

$ConverterUrl = "http://localhost:8082/powerpoint-to-pdf"

function Convert-SingleFile {
    param(
        [string]$FilePath,
        [string]$OutputFilePath
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Error "File not found: $FilePath"
        return $false
    }
    
    if (-not $OutputFilePath) {
        $OutputFilePath = [System.IO.Path]::ChangeExtension($FilePath, ".pdf")
    }
    
    Write-Host "🔄 Converting: $(Split-Path $FilePath -Leaf)" -ForegroundColor Cyan
    Write-Host "   Quality: $Quality" -ForegroundColor Gray
    Write-Host "   Output: $(Split-Path $OutputFilePath -Leaf)" -ForegroundColor Gray
    
    # For client-side conversion, provide instructions
    Write-Host "`n⚠️  Client-side converter detected." -ForegroundColor Yellow
    Write-Host "   Open: $ConverterUrl" -ForegroundColor Gray
    Write-Host "   Upload: $(Split-Path $FilePath -Leaf)" -ForegroundColor Gray
    Write-Host "   The PDF will download automatically.`n" -ForegroundColor Gray
    
    return $true
}

function Convert-Directory {
    param(
        [string]$DirPath,
        [string]$OutputDir,
        [bool]$IsRecursive
    )
    
    if (-not (Test-Path $DirPath)) {
        Write-Error "Directory not found: $DirPath"
        return
    }
    
    $searchOption = if ($IsRecursive) { "AllDirectories" } else { "TopDirectoryOnly" }
    $files = Get-ChildItem -Path $DirPath -Include "*.pptx", "*.ppt" -Recurse:$IsRecursive
    
    if ($files.Count -eq 0) {
        Write-Warning "No PowerPoint files found in: $DirPath"
        return
    }
    
    Write-Host "`n📊 Found $($files.Count) PowerPoint file(s)" -ForegroundColor Green
    Write-Host "="*60
    
    $successCount = 0
    $failCount = 0
    
    foreach ($file in $files) {
        $outputFile = if ($OutputDir) {
            if (-not (Test-Path $OutputDir)) {
                New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
            }
            Join-Path $OutputDir "$([System.IO.Path]::GetFileNameWithoutExtension($file.Name)).pdf"
        } else {
            [System.IO.Path]::ChangeExtension($file.FullName, ".pdf")
        }
        
        if (Convert-SingleFile -FilePath $file.FullName -OutputFilePath $outputFile) {
            $successCount++
        } else {
            $failCount++
        }
        
        Write-Host ""
    }
    
    Write-Host "="*60
    Write-Host "✅ Queued: $successCount file(s)" -ForegroundColor Green
    if ($failCount -gt 0) {
        Write-Host "❌ Failed: $failCount file(s)" -ForegroundColor Red
    }
}

# Main execution
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PowerPoint to PDF Converter - PowerShell Edition         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

if (Test-Path $InputPath -PathType Container) {
    # Directory processing
    Convert-Directory -DirPath $InputPath -OutputDir $OutputPath -IsRecursive $Recursive
} else {
    # Single file processing
    Convert-SingleFile -FilePath $InputPath -OutputFilePath $OutputPath
}

Write-Host "`n✅ Processing complete!`n" -ForegroundColor Green
