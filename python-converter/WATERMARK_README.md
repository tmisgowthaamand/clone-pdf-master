# PDF Watermark - iLovePDF Clone

Add watermarks to PDF files with professional options like iLovePDF.

## Features

- ✅ **Custom Text Watermark** - Add any text as watermark
- ✅ **9 Position Options** - Top/Middle/Bottom × Left/Center/Right
- ✅ **Transparency Control** - 0-100% opacity
- ✅ **Rotation** - Rotate watermark -180° to +180°
- ✅ **Mosaic Pattern** - Repeat watermark across entire page
- ✅ **Page Range** - Apply to specific pages or all pages
- ✅ **FastAPI Backend** - RESTful API for integration
- ✅ **Streamlit UI** - User-friendly web interface

## Installation

```bash
# Install dependencies
pip install -r requirements_watermark.txt
```

## Usage

### Option 1: Run Streamlit App (Recommended)

```bash
# Windows
START_STREAMLIT_WATERMARK.bat

# Linux/Mac
streamlit run streamlit_watermarkpdf.py
```

Then open: http://localhost:8501

### Option 2: Use FastAPI Directly

The FastAPI server runs automatically on port 8000.

**API Endpoint:** `POST http://127.0.0.1:8000/watermark`

**Parameters:**
- `file` (file) - PDF file to watermark
- `text` (string) - Watermark text (default: "iLovePDF")
- `position` (string) - Position: center, top-left, top-center, top-right, middle-left, middle-right, bottom-left, bottom-center, bottom-right
- `transparency` (int) - Transparency 0-100 (default: 50)
- `rotation` (int) - Rotation in degrees (default: 0)
- `is_mosaic` (bool) - Enable mosaic pattern (default: false)
- `from_page` (int) - Start page (default: 1)
- `to_page` (int) - End page (default: None = all pages)

**Example with cURL:**

```bash
curl -X POST "http://127.0.0.1:8000/watermark" \
  -F "file=@document.pdf" \
  -F "text=CONFIDENTIAL" \
  -F "position=center" \
  -F "transparency=30" \
  -F "rotation=45" \
  -F "is_mosaic=true" \
  --output watermarked.pdf
```

**Example with Python:**

```python
import requests

with open('document.pdf', 'rb') as f:
    files = {'file': f}
    data = {
        'text': 'CONFIDENTIAL',
        'position': 'center',
        'transparency': 30,
        'rotation': 45,
        'is_mosaic': True,
        'from_page': 1,
        'to_page': 0  # 0 = all pages
    }
    response = requests.post('http://127.0.0.1:8000/watermark', files=files, data=data)
    
    with open('watermarked.pdf', 'wb') as out:
        out.write(response.content)
```

## Position Options

```
top-left        top-center        top-right
middle-left     center            middle-right
bottom-left     bottom-center     bottom-right
```

## Features Comparison

| Feature | iLovePDF | This Clone |
|---------|----------|------------|
| Text Watermark | ✅ | ✅ |
| Position Control | ✅ | ✅ |
| Transparency | ✅ | ✅ |
| Rotation | ✅ | ✅ |
| Mosaic Pattern | ✅ | ✅ |
| Page Range | ✅ | ✅ |
| Image Watermark | ✅ | 🔄 Coming Soon |
| Font Selection | ✅ | 🔄 Coming Soon |

## Technical Details

- **Backend:** FastAPI (async, high-performance)
- **PDF Processing:** pypdf (formerly PyPDF2)
- **Watermark Generation:** ReportLab
- **UI:** Streamlit (optional)
- **Threading:** Background API server with Streamlit UI

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Dependencies not installed:**
```bash
pip install --upgrade -r requirements_watermark.txt
```

## License

MIT License - Free to use and modify
