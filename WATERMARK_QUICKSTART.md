# 🚀 Watermark PDF - Quick Start Guide

Complete iLovePDF-style watermark system with React frontend and FastAPI backend.

## ✅ What's Included

### Backend (Python)
- **File:** `python-converter/streamlit_watermarkpdf.py`
- **FastAPI server** on port 8000
- **Streamlit UI** on port 8501 (optional fallback)
- Full watermark features: text, position, transparency, rotation, mosaic, page range

### Frontend (React/TypeScript)
- **File:** `src/pages/WatermarkPDF.tsx`
- Modern UI with shadcn/ui components
- PDF preview with pdfjs
- Real-time watermark configuration
- Integrated with FastAPI backend

## 🎯 Quick Start (2 Steps)

### Step 1: Start Backend

```bash
cd python-converter
START_STREAMLIT_WATERMARK.bat
```

This will:
- Install dependencies automatically
- Start FastAPI on http://127.0.0.1:8000
- Start Streamlit UI on http://localhost:8501

### Step 2: Start Frontend

```bash
# In project root
npm run dev
```

Then navigate to: **http://localhost:8080/watermark-pdf**

## 📋 Features

| Feature | Status |
|---------|--------|
| Text Watermark | ✅ Working |
| 9 Position Options | ✅ Working |
| Transparency Control | ✅ Working |
| Rotation (-180° to 180°) | ✅ Working |
| Mosaic Pattern | ✅ Working |
| Page Range Selection | ✅ Working |
| PDF Preview | ✅ Working |
| Image Watermark | 🔄 Coming Soon |

## 🎨 How to Use

1. **Upload PDF** - Click or drag & drop your PDF file
2. **Configure Watermark:**
   - Enter text (e.g., "CONFIDENTIAL", "DRAFT")
   - Choose position (9 options with emoji indicators)
   - Adjust transparency (0-100%)
   - Set rotation angle
   - Enable mosaic for repeated pattern
   - Select page range (or apply to all)
3. **Preview** - See first page preview
4. **Download** - Click "Add Watermark & Download"

## 🔧 API Endpoints

### Health Check
```bash
GET http://127.0.0.1:8000/
```

### Add Watermark
```bash
POST http://127.0.0.1:8000/watermark
```

**Form Data:**
- `file` - PDF file
- `text` - Watermark text
- `position` - Position (center, top-left, etc.)
- `transparency` - 0-100
- `rotation` - Degrees
- `is_mosaic` - true/false
- `from_page` - Start page number
- `to_page` - End page number (0 = all)

## 🐛 Troubleshooting

### Backend not starting?
```bash
# Install dependencies manually
pip install streamlit fastapi uvicorn pypdf reportlab python-multipart

# Run directly
python streamlit_watermarkpdf.py
```

### Port 8000 already in use?
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Frontend can't connect to backend?
- Make sure backend is running on http://127.0.0.1:8000
- Check browser console for CORS errors
- Verify API endpoint in WatermarkPDF.tsx (line 97)

## 📁 File Structure

```
clone-pdf-master/
├── python-converter/
│   ├── streamlit_watermarkpdf.py          # Backend server
│   ├── requirements_watermark.txt         # Python dependencies
│   ├── START_STREAMLIT_WATERMARK.bat      # Windows launcher
│   └── WATERMARK_README.md                # Detailed docs
├── src/
│   └── pages/
│       └── WatermarkPDF.tsx               # React frontend
└── WATERMARK_QUICKSTART.md                # This file
```

## 🎯 Example Usage

### Using the UI
1. Start backend: `START_STREAMLIT_WATERMARK.bat`
2. Start frontend: `npm run dev`
3. Open: http://localhost:8080/watermark-pdf
4. Upload PDF and configure options
5. Download watermarked PDF

### Using cURL
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

### Using Python
```python
import requests

with open('document.pdf', 'rb') as f:
    response = requests.post(
        'http://127.0.0.1:8000/watermark',
        files={'file': f},
        data={
            'text': 'CONFIDENTIAL',
            'position': 'center',
            'transparency': 30,
            'rotation': 45,
            'is_mosaic': True
        }
    )
    
with open('watermarked.pdf', 'wb') as out:
    out.write(response.content)
```

## 🎉 You're All Set!

The watermark system is now fully functional. Enjoy adding professional watermarks to your PDFs!

For detailed API documentation, see: `python-converter/WATERMARK_README.md`
