# PDF Tools Backend API

Flask-based REST API for PDF conversion and manipulation.

## Features

- PDF to PowerPoint conversion
- PowerPoint to PDF conversion
- PDF to Word/Excel conversion
- PDF editing and watermarking
- Image to PDF conversion
- PDF table extraction

## Tech Stack

- **Framework**: Flask 3.0
- **Server**: Gunicorn
- **Dependencies**: LibreOffice, Ghostscript, Poppler

## Deployment

Configured for Render.com using Docker.

### Environment Variables

- `PORT`: 10000
- `FLASK_ENV`: production
- `PYTHONUNBUFFERED`: 1
- `ALLOWED_ORIGINS`: *
- `MAX_CONTENT_LENGTH`: 104857600

## API Endpoints

- `GET /health` - Health check
- `POST /convert/pptx-to-pdf` - Convert PowerPoint to PDF
- `POST /convert/pdf-to-pptx` - Convert PDF to PowerPoint
- `POST /convert/pdf-to-word` - Convert PDF to Word
- `POST /convert/pdf-to-excel` - Convert PDF to Excel

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

## Docker

```bash
# Build
docker build -t pdftools-backend .

# Run
docker run -p 10000:10000 pdftools-backend
```
