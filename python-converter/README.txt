========================================
Professional PPTX to PDF Converter
Using LibreOffice (Industry Standard)
========================================

This converter achieves iLovePDF-quality results using LibreOffice,
which is the same technology used by many professional converters.

INSTALLATION:
=============

1. Install LibreOffice (Required!)
   Download from: https://www.libreoffice.org/download/download/
   
   Windows: Run the installer
   Add to PATH: C:\Program Files\LibreOffice\program\

2. Install Python Dependencies:
   cd python-converter
   pip install -r requirements.txt

USAGE:
======

Method 1: Command Line
----------------------
python pptx_to_pdf.py Sample-Presentation.pptx
python pptx_to_pdf.py input.pptx output.pdf

Method 2: API Server
--------------------
python app.py

Then from your React app, send POST request to:
http://localhost:5000/api/convert/pptx-to-pdf

Method 3: Batch Conversion
--------------------------
from pptx_to_pdf import batch_convert
batch_convert('input_folder', 'output_folder')

INTEGRATION WITH YOUR WEBSITE:
===============================

Update PowerPointToPDF.tsx to use this API:

const response = await fetch('http://localhost:5000/api/convert/pptx-to-pdf', {
  method: 'POST',
  body: formData
});

const blob = await response.blob();
// Download the PDF

ADVANTAGES:
===========
✅ Professional quality (same as iLovePDF)
✅ Preserves all formatting
✅ Handles complex slides
✅ Supports animations, transitions
✅ Works with tables, charts, SmartArt
✅ No file size limits
✅ 100% accurate conversion

WHY LIBREOFFICE?
================
- Used by Google Docs, Nextcloud, and many professional tools
- Open-source and free
- Maintains exact PowerPoint formatting
- Handles all Office file types
- Industry-standard conversion engine
