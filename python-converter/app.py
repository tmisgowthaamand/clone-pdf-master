#!/usr/bin/env python3
"""
Flask API for PowerPoint to PDF Conversion
Professional-grade conversion using LibreOffice
"""

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
import tempfile
from pathlib import Path
import subprocess
import shutil
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Add LibreOffice to PATH
libreoffice_path = r"C:\Program Files\LibreOffice\program"
if libreoffice_path not in os.environ.get('PATH', ''):
    os.environ['PATH'] = libreoffice_path + os.pathsep + os.environ.get('PATH', '')

ALLOWED_EXTENSIONS = {'ppt', 'pptx', 'pdf', 'doc', 'docx'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

def allowed_file(filename, allowed_types=None):
    if allowed_types is None:
        allowed_types = ALLOWED_EXTENSIONS
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_types

def convert_with_libreoffice(input_path, output_dir):
    """Convert using LibreOffice - same quality as iLovePDF"""
    # Use full path to soffice.exe
    soffice_exe = r"C:\Program Files\LibreOffice\program\soffice.exe"
    
    # Kill any existing LibreOffice processes to avoid file locks
    try:
        subprocess.run(['taskkill', '/F', '/IM', 'soffice.exe', '/T'], 
                      capture_output=True, timeout=5)
        subprocess.run(['taskkill', '/F', '/IM', 'soffice.bin', '/T'], 
                      capture_output=True, timeout=5)
        import time
        time.sleep(1)  # Wait for processes to fully terminate
    except:
        pass
    
    cmd = [
        soffice_exe,
        '--headless',
        '--invisible',
        '--nologo',
        '--nofirststartwizard',
        '--norestore',
        '--convert-to', 'pdf',
        '--outdir', str(output_dir),
        str(input_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode != 0:
        raise RuntimeError(f"Conversion failed: {result.stderr}")
    
    pdf_name = Path(input_path).stem + '.pdf'
    pdf_path = Path(output_dir) / pdf_name
    
    if not pdf_path.exists():
        raise RuntimeError("PDF was not created")
    
    return pdf_path

def convert_pdf_to_pptx(input_path, output_dir):
    """
    Convert PDF to PPTX by converting pages to images
    Uses pdf2image and python-pptx
    """
    try:
        from pdf2image import convert_from_path
        from pptx import Presentation
        from pptx.util import Inches
        import tempfile as tmp
        
        # Try to find Poppler
        poppler_paths = [
            r"C:\poppler\poppler-24.08.0\Library\bin",
            r"C:\Program Files\Poppler\Library\bin",
            r"C:\Program Files (x86)\Poppler\Library\bin",
            r"C:\poppler\Library\bin",
            None  # Try system PATH as fallback
        ]
        
        images = None
        last_error = None
        
        for poppler_path in poppler_paths:
            try:
                # Convert PDF pages to images
                images = convert_from_path(
                    str(input_path),
                    dpi=300,
                    fmt='png',
                    poppler_path=poppler_path
                )
                break
            except Exception as e:
                last_error = e
                continue
        
        if images is None:
            raise last_error or RuntimeError("Failed to convert PDF")
        
        # Create PowerPoint presentation
        prs = Presentation()
        prs.slide_width = Inches(10)
        prs.slide_height = Inches(7.5)
        
        # Add each image as a slide with FULL BACKGROUND
        for image in images:
            # Save image temporarily
            with tmp.NamedTemporaryFile(suffix='.png', delete=False) as tmp_img:
                image.save(tmp_img.name, 'PNG')
                tmp_img_path = tmp_img.name
            
            # Add blank slide
            blank_slide_layout = prs.slide_layouts[6]
            slide = prs.slides.add_slide(blank_slide_layout)
            
            # FULL BACKGROUND: Fill entire slide with image
            # Position at 0,0 and use full slide dimensions
            slide.shapes.add_picture(
                tmp_img_path,
                0,  # left = 0 (no margin)
                0,  # top = 0 (no margin)
                width=prs.slide_width,   # Full width
                height=prs.slide_height  # Full height
            )
            
            # Clean up
            try:
                os.unlink(tmp_img_path)
            except:
                pass
        
        # Save PPTX
        pptx_name = Path(input_path).stem + '.pptx'
        pptx_path = Path(output_dir) / pptx_name
        prs.save(str(pptx_path))
        
        return pptx_path
        
    except ImportError as e:
        raise RuntimeError(
            f"Missing required libraries. Install with: pip install pdf2image python-pptx Pillow. Error: {str(e)}"
        )
    except Exception as e:
        error_msg = str(e)
        if "poppler" in error_msg.lower() or "pdftoppm" in error_msg.lower():
            raise RuntimeError(
                "Poppler not found. PDF to PPTX requires Poppler. "
                "Download from: https://github.com/oschwartz10612/poppler-windows/releases/ "
                "Extract to C:\\Program Files\\poppler and add C:\\Program Files\\poppler\\Library\\bin to PATH"
            )
        raise RuntimeError(f"PDF to PPTX conversion failed: {error_msg}")

def convert_pdf_to_docx(input_path, output_dir):
    """
    Convert PDF to DOCX - renders each page as high-quality image
    This ensures charts, graphs, and complex layouts are preserved perfectly
    """
    try:
        import fitz  # PyMuPDF
        from docx import Document
        from docx.shared import Inches
        from PIL import Image
        import io
        
        # Output path
        docx_name = Path(input_path).stem + '.docx'
        docx_path = Path(output_dir) / docx_name
        
        doc = Document()
        pdf_doc = fitz.open(str(input_path))
        
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]
            
            # Add page break except for first page
            if page_num > 0:
                doc.add_page_break()
            
            # Render page as image at high DPI (300 for quality)
            mat = fitz.Matrix(300/72, 300/72)  # 300 DPI
            pix = page.get_pixmap(matrix=mat, alpha=False)
            
            # Convert to PNG bytes
            img_bytes = pix.tobytes("png")
            
            # Save temporarily
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_img:
                tmp_img.write(img_bytes)
                tmp_img_path = tmp_img.name
            
            # Add image to Word document
            # Resize to fit page width (6.5 inches for standard margins)
            doc.add_picture(tmp_img_path, width=Inches(6.5))
            
            # Clean up temp file
            try:
                os.unlink(tmp_img_path)
            except:
                pass
        
        pdf_doc.close()
        doc.save(str(docx_path))
        
        if not docx_path.exists():
            raise RuntimeError("DOCX file was not created")
        
        return docx_path
        
    except ImportError as e:
        raise RuntimeError(
            f"Missing required library. Install with: pip install PyMuPDF python-docx Pillow. Error: {str(e)}"
        )
    except Exception as e:
        raise RuntimeError(f"PDF to DOCX conversion failed: {str(e)}")

@app.route('/api/convert/pptx-to-pdf', methods=['POST'])
def convert_pptx_to_pdf():
    """Convert PowerPoint to PDF endpoint"""
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only .ppt and .pptx allowed'}), 400
    
    tmpdir = None
    try:
        # Create temporary directory with unique name
        import uuid
        tmpdir = tempfile.mkdtemp(prefix=f'pptx_convert_{uuid.uuid4().hex[:8]}_')
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        input_path = Path(tmpdir) / filename
        file.save(str(input_path))
        
        # Convert to PDF
        pdf_path = convert_with_libreoffice(input_path, tmpdir)
        
        # Read PDF into memory before cleanup
        with open(pdf_path, 'rb') as f:
            pdf_data = f.read()
        
        # Clean up temp directory
        try:
            shutil.rmtree(tmpdir, ignore_errors=True)
        except:
            pass
        
        # Send PDF from memory
        from io import BytesIO
        return send_file(
            BytesIO(pdf_data),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename.rsplit('.', 1)[0] + '.pdf'
        )
            
    except Exception as e:
        # Clean up on error
        if tmpdir and os.path.exists(tmpdir):
            try:
                shutil.rmtree(tmpdir, ignore_errors=True)
            except:
                pass
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert/pdf-to-pptx', methods=['POST'])
def convert_pdf_to_pptx_endpoint():
    """Convert PDF to PowerPoint endpoint"""
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename, {'pdf'}):
        return jsonify({'error': 'Invalid file type. Only .pdf allowed'}), 400
    
    tmpdir = None
    try:
        # Create temporary directory with unique name
        import uuid
        tmpdir = tempfile.mkdtemp(prefix=f'pdf_convert_{uuid.uuid4().hex[:8]}_')
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        input_path = Path(tmpdir) / filename
        file.save(str(input_path))
        
        # Convert to PPTX
        pptx_path = convert_pdf_to_pptx(input_path, tmpdir)
        
        # Read PPTX into memory before cleanup
        with open(pptx_path, 'rb') as f:
            pptx_data = f.read()
        
        # Clean up temp directory
        try:
            shutil.rmtree(tmpdir, ignore_errors=True)
        except:
            pass
        
        # Send PPTX from memory
        from io import BytesIO
        return send_file(
            BytesIO(pptx_data),
            mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation',
            as_attachment=True,
            download_name=filename.rsplit('.', 1)[0] + '.pptx'
        )
            
    except Exception as e:
        # Clean up on error
        if tmpdir and os.path.exists(tmpdir):
            try:
                shutil.rmtree(tmpdir, ignore_errors=True)
            except:
                pass
        return jsonify({'error': str(e)}), 500

@app.route('/api/convert/pdf-to-docx', methods=['POST'])
def convert_pdf_to_docx_endpoint():
    """Convert PDF to Word endpoint"""
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename, {'pdf'}):
        return jsonify({'error': 'Invalid file type. Only .pdf allowed'}), 400
    
    tmpdir = None
    try:
        # Create temporary directory with unique name
        import uuid
        tmpdir = tempfile.mkdtemp(prefix=f'pdf_word_{uuid.uuid4().hex[:8]}_')
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        input_path = Path(tmpdir) / filename
        file.save(str(input_path))
        
        # Convert to DOCX
        docx_path = convert_pdf_to_docx(input_path, tmpdir)
        
        # Read DOCX into memory before cleanup
        with open(docx_path, 'rb') as f:
            docx_data = f.read()
        
        # Clean up temp directory
        try:
            shutil.rmtree(tmpdir, ignore_errors=True)
        except:
            pass
        
        # Send DOCX from memory
        from io import BytesIO
        return send_file(
            BytesIO(docx_data),
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=filename.rsplit('.', 1)[0] + '.docx'
        )
            
    except Exception as e:
        # Clean up on error
        if tmpdir and os.path.exists(tmpdir):
            try:
                shutil.rmtree(tmpdir, ignore_errors=True)
            except:
                pass
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if LibreOffice is available"""
    try:
        result = subprocess.run(
            ['soffice', '--version'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            return jsonify({
                'status': 'healthy',
                'libreoffice': result.stdout.strip()
            })
        else:
            return jsonify({
                'status': 'unhealthy',
                'error': 'LibreOffice not responding'
            }), 500
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'service': 'PowerPoint to PDF Converter',
        'version': '1.0.0',
        'endpoints': {
            'convert': '/api/convert/pptx-to-pdf (POST)',
            'health': '/api/health (GET)'
        }
    })

if __name__ == '__main__':
    print("Starting PowerPoint to PDF Converter API")
    print("Server: http://localhost:5000")
    print("API: http://localhost:5000/api/convert/pptx-to-pdf")
    print("\nMake sure LibreOffice is installed!")
    app.run(host='0.0.0.0', port=5000, debug=True)
