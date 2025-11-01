# Automation Examples Index

Complete collection of automation scripts and workflows for the PowerPoint to PDF Converter.

## 📁 Available Examples

### Python Scripts

| File | Description | Usage |
|------|-------------|-------|
| `python_converter.py` | Single file converter CLI | `python python_converter.py input.pptx [output.pdf]` |
| `batch_converter.py` | Watch folder and auto-convert | `python batch_converter.py ./input ./output` |
| `requirements.txt` | Python dependencies | `pip install -r requirements.txt` |

### JavaScript/Node.js

| File | Description | Usage |
|------|-------------|-------|
| `node_converter.js` | Node.js converter script | `node node_converter.js input.pptx [output.pdf]` |

### PowerShell (Windows)

| File | Description | Usage |
|------|-------------|-------|
| `Convert-PowerPointToPDF.ps1` | PowerShell automation script | `.\Convert-PowerPointToPDF.ps1 -InputPath "file.pptx"` |

### Workflow Configurations

| File | Description | Platform |
|------|-------------|----------|
| `zapier-workflow.json` | Zapier workflow configuration | Zapier/Make.com |
| `ios-shortcut.json` | iOS Shortcuts configuration | iOS 14+ |

### Documentation

| File | Description |
|------|-------------|
| `README.md` | Quick start guide for automation |
| `../AUTOMATION_GUIDE.md` | Complete automation documentation |

---

## 🚀 Quick Start by Use Case

### 1. Convert Single File (Python)

```bash
# Install dependencies
pip install -r requirements.txt

# Convert file
python python_converter.py presentation.pptx output.pdf
```

### 2. Convert Single File (Node.js)

```bash
# No dependencies needed
node node_converter.js presentation.pptx output.pdf
```

### 3. Convert Single File (PowerShell)

```powershell
# Windows PowerShell
.\Convert-PowerPointToPDF.ps1 -InputPath "presentation.pptx" -Quality High
```

### 4. Batch Convert Directory (Python)

```bash
# Watch folder and auto-convert
python batch_converter.py ./presentations ./pdfs
```

### 5. Batch Convert Directory (PowerShell)

```powershell
# Convert all files in directory
.\Convert-PowerPointToPDF.ps1 -InputPath "C:\Presentations" -OutputPath "C:\PDFs" -Recursive
```

### 6. Zapier Automation

1. Import `zapier-workflow.json` into Zapier
2. Configure your Google Drive folder IDs
3. Set your converter API endpoint
4. Enable the workflow

### 7. iOS Shortcuts

1. Import `ios-shortcut.json` into Shortcuts app
2. Update the API URL to your domain
3. Run the shortcut from Share Sheet or Files app

---

## 📊 Feature Comparison

| Feature | Python | Node.js | PowerShell | Zapier | iOS |
|---------|--------|---------|------------|--------|-----|
| Single file conversion | ✅ | ✅ | ✅ | ✅ | ✅ |
| Batch conversion | ✅ | ❌ | ✅ | ✅ | ❌ |
| Watch folder | ✅ | ❌ | ❌ | ✅ | ❌ |
| Quality settings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Email notifications | ❌ | ❌ | ❌ | ✅ | ✅ |
| Cloud storage | ❌ | ❌ | ❌ | ✅ | ✅ |
| Cross-platform | ✅ | ✅ | ❌ | ✅ | ❌ |

---

## 🔧 Configuration

### Environment Variables

All scripts support these environment variables:

```bash
# Converter URL
export CONVERTER_URL="http://localhost:8082"

# Quality setting (high, medium, low)
export CONVERTER_QUALITY="high"

# Maximum file size in MB
export MAX_FILE_SIZE_MB="100"

# Output directory
export OUTPUT_DIR="./converted"
```

### Python Configuration

```python
from python_converter import PowerPointToPDFConverter

converter = PowerPointToPDFConverter(
    api_url="http://localhost:8082/api/convert"
)
```

### Node.js Configuration

```javascript
const PowerPointToPDFConverter = require('./node_converter');

const converter = new PowerPointToPDFConverter(
    'http://localhost:8082'
);
```

### PowerShell Configuration

```powershell
# Edit the script to change default settings
$ConverterUrl = "http://localhost:8082/powerpoint-to-pdf"
$DefaultQuality = "High"
```

---

## 📖 Advanced Examples

### Python: Convert with Progress Tracking

```python
from python_converter import PowerPointToPDFConverter
import os

converter = PowerPointToPDFConverter()

files = [f for f in os.listdir('./input') if f.endswith('.pptx')]
total = len(files)

for i, file in enumerate(files, 1):
    print(f"[{i}/{total}] Converting {file}...")
    converter.convert_file(f'./input/{file}', f'./output/{file[:-5]}.pdf')
    print(f"Progress: {i/total*100:.1f}%")
```

### Node.js: Batch Convert with Async/Await

```javascript
const converter = new PowerPointToPDFConverter();
const fs = require('fs').promises;

async function convertAll() {
    const files = await fs.readdir('./input');
    const pptFiles = files.filter(f => f.endsWith('.pptx'));
    
    const results = await converter.batchConvert(
        pptFiles.map(f => `./input/${f}`),
        './output'
    );
    
    console.log(`Converted ${results.filter(r => r.success).length}/${results.length} files`);
}

convertAll();
```

### PowerShell: Convert with Email Notification

```powershell
.\Convert-PowerPointToPDF.ps1 -InputPath "report.pptx" -OutputPath "report.pdf"

if ($?) {
    Send-MailMessage `
        -To "manager@company.com" `
        -From "automation@company.com" `
        -Subject "PDF Report Ready" `
        -Body "The PowerPoint has been converted to PDF." `
        -Attachments "report.pdf" `
        -SmtpServer "smtp.company.com"
}
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Scripts can't find the converter
```bash
# Solution: Make sure dev server is running
npm run dev

# Or update the URL in the script
export CONVERTER_URL="http://localhost:8082"
```

**Issue**: Permission denied (PowerShell)
```powershell
# Solution: Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Issue**: Module not found (Python)
```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

**Issue**: File too large
```bash
# Solution: Files must be under 100MB
# Compress your PowerPoint first or split into multiple files
```

---

## 📞 Support

- **Documentation**: See [AUTOMATION_GUIDE.md](../AUTOMATION_GUIDE.md)
- **Examples**: All examples in this directory
- **Issues**: Report issues on GitHub
- **Questions**: Check the main README.md

---

## 📝 License

MIT License - See LICENSE file for details

**Last Updated**: October 31, 2025
