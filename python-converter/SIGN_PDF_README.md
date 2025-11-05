# PDF Signing - Complete Implementation

## 🎯 Overview
Complete PDF signing solution matching iLovePDF functionality with both **Streamlit standalone app** and **Flask API + React frontend**.

## 📦 Installation

### 1. Install Python Dependencies
```bash
cd python-converter
pip install -r requirements_sign.txt
```

### 2. Install Poppler (Required for pdf2image)

**Windows:**
```bash
# Download from: https://github.com/oschwartz10612/poppler-windows/releases
# Extract and add bin folder to PATH
```

**Mac:**
```bash
brew install poppler
```

**Linux:**
```bash
sudo apt-get install poppler-utils
```

## 🚀 Usage

### Option 1: Streamlit Standalone App

```bash
cd python-converter
streamlit run sign_pdf_app.py
```

**Features:**
- ✍️ Draw signatures with mouse
- ⌨️ Type signatures (converted to cursive)
- 📷 Upload signature images
- 📄 Multi-page PDF support
- 🎯 Precise positioning (X, Y, Width, Height)
- 📥 Download signed PDF

### Option 2: Flask API + React Frontend

**Start Flask Backend:**
```bash
cd python-converter
python app.py
```

**Start React Frontend:**
```bash
npm run dev
```

**Navigate to:**
```
http://localhost:8081/sign-pdf
```

## 🔧 API Endpoint

### POST `/api/sign-pdf`

**Request:**
```javascript
FormData {
  file: PDF file
  signatures: JSON string [
    {
      page: 0,
      x: 100,
      y: 100,
      width: 150,
      height: 50,
      data: "base64_image_data"
    }
  ]
}
```

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="signed_document.pdf"
```

## 📝 How It Works

### Frontend (React)
1. Upload PDF → Load with PDF.js
2. Create signature (Draw/Type/Image)
3. Click on PDF to place signature
4. Track signature positions
5. Send to backend for processing

### Backend (Python)
1. Receive PDF + signatures
2. Use **PyPDF2** to read PDF
3. Use **ReportLab** to create signature overlays
4. Merge signatures with original pages
5. Return signed PDF

### Streamlit App
1. Upload PDF → Convert pages to images
2. Create signature using sidebar tools
3. Set position and size
4. Add to page
5. Generate and download signed PDF

## 🎨 Signature Methods

### 1. Draw Signature
- Canvas-based drawing
- Mouse/touch support
- Save as PNG image

### 2. Type Signature
- Enter name
- Convert to cursive font
- Render as image

### 3. Upload Image
- PNG, JPG, JPEG supported
- Transparent backgrounds work
- Auto-scaling

## 📐 Coordinate System

**Frontend (Screen):** Top-left origin (0,0)
**PDF:** Bottom-left origin (0,0)

**Conversion:**
```python
pdf_y = page_height - screen_y - signature_height
```

## 🔒 Security

- ✅ Local processing (no cloud upload)
- ✅ Temporary files cleaned up
- ✅ No data retention
- ✅ Secure file handling

## 📊 Technical Stack

### Frontend
- React + TypeScript
- PDF.js (PDF rendering)
- HTML5 Canvas (signature drawing)
- TailwindCSS (styling)

### Backend
- Flask (API server)
- PyPDF2 (PDF manipulation)
- ReportLab (PDF generation)
- Pillow (image processing)

### Streamlit
- Streamlit (UI framework)
- streamlit-drawable-canvas (drawing)
- pdf2image (PDF to image conversion)

## 🐛 Troubleshooting

### Issue: pdf2image not working
**Solution:** Install poppler-utils (see installation section)

### Issue: Signatures not appearing
**Solution:** Check coordinate conversion and page dimensions

### Issue: Low quality signatures
**Solution:** Increase signature width/height or use higher resolution images

## 📚 Examples

### Example 1: Simple Signature
```python
signature = {
    'page': 0,
    'x': 100,
    'y': 700,
    'width': 200,
    'height': 60,
    'data': base64_signature_image
}
```

### Example 2: Multiple Signatures
```python
signatures = [
    {'page': 0, 'x': 100, 'y': 700, 'width': 200, 'height': 60, 'data': sig1},
    {'page': 0, 'x': 400, 'y': 700, 'width': 200, 'height': 60, 'data': sig2},
    {'page': 1, 'x': 100, 'y': 100, 'width': 150, 'height': 50, 'data': sig3}
]
```

## 🎯 Features Matching iLovePDF

✅ Draw signatures
✅ Type signatures  
✅ Upload signature images
✅ Multi-page support
✅ Precise positioning
✅ Multiple signatures per page
✅ Download signed PDF
✅ Clean UI/UX
✅ Fast processing

## 📄 License

MIT License - Feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Please test thoroughly before submitting PRs.

## 📞 Support

For issues or questions, please create a GitHub issue.
