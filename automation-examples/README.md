# PowerPoint to PDF Automation Examples

This directory contains automation scripts and examples for the PowerPoint to PDF converter.

## 📁 Files

- **`python_converter.py`** - Simple command-line converter script
- **`batch_converter.py`** - Watch folder and auto-convert new files
- **`requirements.txt`** - Python dependencies

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Single File Conversion

```bash
python python_converter.py input.pptx output.pdf
```

### 3. Batch Conversion (Watch Folder)

```bash
python batch_converter.py ./input_folder ./output_folder
```

This will watch the `input_folder` and automatically convert any new PowerPoint files to PDF in the `output_folder`.

## 📖 Full Documentation

See **[AUTOMATION_GUIDE.md](../AUTOMATION_GUIDE.md)** in the root directory for:

- ✅ Zapier/Make.com workflows
- ✅ Email automation (Power Automate, Node.js)
- ✅ Mobile app integration (iOS Shortcuts, Android Tasker)
- ✅ Cloud storage integration (Google Drive, Dropbox)
- ✅ Quality check automation
- ✅ API endpoint documentation
- ✅ Advanced Python examples

## 💡 Use Cases

### 1. Automated Email Processing

Convert PowerPoint attachments from emails automatically:

```python
from python_converter import PowerPointToPDFConverter

converter = PowerPointToPDFConverter()
converter.convert_file('email_attachment.pptx', 'converted.pdf')
```

### 2. Bulk Conversion

Convert multiple files at once:

```python
from python_converter import PowerPointToPDFConverter

converter = PowerPointToPDFConverter()
files = ['file1.pptx', 'file2.pptx', 'file3.pptx']
results = converter.batch_convert(files, output_dir='./converted')

# Print summary
successful = sum(1 for r in results if r['success'])
print(f"Converted {successful}/{len(results)} files")
```

### 3. Integration with Cloud Storage

```python
import os
from python_converter import PowerPointToPDFConverter

# Watch Google Drive sync folder
converter = PowerPointToPDFConverter()
watch_folder = os.path.expanduser('~/Google Drive/Presentations')

for file in os.listdir(watch_folder):
    if file.endswith('.pptx'):
        converter.convert_file(
            os.path.join(watch_folder, file),
            os.path.join(watch_folder, 'PDFs', file.replace('.pptx', '.pdf'))
        )
```

## 🔧 Configuration

### Environment Variables

```bash
export CONVERTER_URL="http://localhost:8082"
export CONVERTER_QUALITY="high"  # high, medium, low
export MAX_FILE_SIZE_MB="100"
```

### Quality Settings

- **high**: 3x resolution (best quality, larger file size)
- **medium**: 2x resolution (balanced)
- **low**: 1x resolution (smallest file size)

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Module not found"
```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

**Issue**: "Connection refused"
```bash
# Solution: Make sure the dev server is running
npm run dev
```

**Issue**: "File too large"
```bash
# Solution: Files must be under 100MB
# Compress your PowerPoint file first
```

## 📞 Support

For more help, see:
- Main documentation: [AUTOMATION_GUIDE.md](../AUTOMATION_GUIDE.md)
- Issues: Open an issue on GitHub
- Examples: Check the automation examples in this folder

## 📝 License

MIT License - See LICENSE file for details
