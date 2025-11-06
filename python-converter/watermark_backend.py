#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Flask Backend for PDF Watermark - iLovePDF Clone
Supports text and image watermarks with full customization
"""

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor
from PIL import Image
import io
import os
import tempfile
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def add_text_watermark(pdf_bytes, text, font_size, color, opacity, rotation, position, 
                       font_family='Arial', is_bold=True, is_italic=False, is_underline=False):
    """Add text watermark to PDF with formatting options"""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    writer = PdfWriter()
    
    # Position mapping (x, y offsets from center)
    pos_map = {
        "center": (0, 0),
        "top-left": (-200, 200),
        "top-center": (0, 200),
        "top-right": (200, 200),
        "middle-left": (-200, 0),
        "middle-right": (200, 0),
        "bottom-left": (-200, -200),
        "bottom-center": (0, -200),
        "bottom-right": (200, -200),
        "tile": None  # Special case for tiling
    }
    
    dx, dy = pos_map.get(position, (0, 0)) if position != "tile" else (0, 0)
    is_tile = position == "tile"
    
    # Map font families to ReportLab fonts
    font_map = {
        'Arial': 'Helvetica',
        'Times New Roman': 'Times',
        'Courier New': 'Courier',
        'Georgia': 'Times',
        'Verdana': 'Helvetica',
        'Comic Sans MS': 'Helvetica',
        'Impact': 'Helvetica-Bold',
        'Trebuchet MS': 'Helvetica',
    }
    
    base_font = font_map.get(font_family, 'Helvetica')
    
    # Apply bold and italic
    if is_bold and is_italic:
        font_name = f"{base_font}-BoldOblique" if base_font in ['Helvetica', 'Times', 'Courier'] else f"{base_font}-Bold"
    elif is_bold:
        font_name = f"{base_font}-Bold"
    elif is_italic:
        font_name = f"{base_font}-Oblique" if base_font in ['Helvetica', 'Courier'] else f"{base_font}-Italic"
    else:
        font_name = base_font
    
    for page in reader.pages:
        packet = io.BytesIO()
        can = canvas.Canvas(packet, pagesize=(float(page.mediabox.width), float(page.mediabox.height)))
        w, h = float(page.mediabox.width), float(page.mediabox.height)
        
        # Set color and opacity
        r, g, b = hex_to_rgb(color)
        can.setFillColorRGB(r, g, b, alpha=opacity)
        
        try:
            can.setFont(font_name, font_size)
        except:
            # Fallback to Helvetica-Bold if font not found
            can.setFont("Helvetica-Bold", font_size)
        
        if is_tile:
            # Tile pattern - repeat watermark across page
            spacing_x = 250
            spacing_y = 150
            for x in range(-int(w), int(w*2), spacing_x):
                for y in range(-int(h), int(h*2), spacing_y):
                    can.saveState()
                    can.translate(w/2 + x, h/2 + y)
                    can.rotate(rotation)
                    can.drawCentredString(0, 0, text)
                    # Draw underline if enabled
                    if is_underline:
                        text_width = can.stringWidth(text, font_name, font_size)
                        can.line(-text_width/2, -font_size*0.1, text_width/2, -font_size*0.1)
                    can.restoreState()
        else:
            # Single watermark at specified position
            can.saveState()
            can.translate(w/2 + dx, h/2 + dy)
            can.rotate(rotation)
            can.drawCentredString(0, 0, text)
            # Draw underline if enabled
            if is_underline:
                text_width = can.stringWidth(text, font_name, font_size)
                can.line(-text_width/2, -font_size*0.1, text_width/2, -font_size*0.1)
            can.restoreState()
        
        can.showPage()
        can.save()
        packet.seek(0)
        
        watermark = PdfReader(packet).pages[0]
        new_page = writer.add_page(page)
        new_page.merge_page(watermark)
    
    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()

def add_image_watermark(pdf_bytes, image_bytes, opacity, rotation, position):
    """Add image watermark to PDF"""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    writer = PdfWriter()
    
    # Load and process image
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Apply opacity to image
    alpha = img.split()[3]
    alpha = alpha.point(lambda p: int(p * opacity))
    img.putalpha(alpha)
    
    # Position mapping
    pos_map = {
        "center": (0, 0),
        "top-left": (-200, 200),
        "top-center": (0, 200),
        "top-right": (200, 200),
        "middle-left": (-200, 0),
        "middle-right": (200, 0),
        "bottom-left": (-200, -200),
        "bottom-center": (0, -200),
        "bottom-right": (200, -200),
        "tile": None
    }
    
    dx, dy = pos_map.get(position, (0, 0)) if position != "tile" else (0, 0)
    is_tile = position == "tile"
    
    # Calculate image size (max 200px width/height)
    max_size = 200
    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    img_width, img_height = img.size
    
    for page in reader.pages:
        packet = io.BytesIO()
        can = canvas.Canvas(packet, pagesize=(float(page.mediabox.width), float(page.mediabox.height)))
        w, h = float(page.mediabox.width), float(page.mediabox.height)
        
        # Save image to temporary buffer
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        img_reader = ImageReader(img_buffer)
        
        if is_tile:
            # Tile pattern
            spacing_x = 300
            spacing_y = 250
            for x in range(-int(w), int(w*2), spacing_x):
                for y in range(-int(h), int(h*2), spacing_y):
                    can.saveState()
                    can.translate(w/2 + x, h/2 + y)
                    can.rotate(rotation)
                    can.drawImage(img_reader, -img_width/2, -img_height/2, 
                                width=img_width, height=img_height, mask='auto')
                    can.restoreState()
        else:
            # Single image at position
            can.saveState()
            can.translate(w/2 + dx, h/2 + dy)
            can.rotate(rotation)
            can.drawImage(img_reader, -img_width/2, -img_height/2,
                        width=img_width, height=img_height, mask='auto')
            can.restoreState()
        
        can.showPage()
        can.save()
        packet.seek(0)
        
        watermark = PdfReader(packet).pages[0]
        new_page = writer.add_page(page)
        new_page.merge_page(watermark)
    
    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()

@app.route('/api/watermark/add', methods=['POST'])
def add_watermark():
    """API endpoint to add watermark to PDF"""
    try:
        # Get PDF file
        if 'file' not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400
        
        pdf_file = request.files['file']
        pdf_bytes = pdf_file.read()
        
        # Get watermark type
        watermark_type = request.form.get('watermarkType', 'text')
        
        # Get common parameters
        opacity = float(request.form.get('opacity', 0.5))
        rotation = int(request.form.get('rotation', 0))
        position = request.form.get('position', 'center')
        
        result_bytes = None
        
        if watermark_type == 'text':
            # Text watermark parameters
            text = request.form.get('text', 'CONFIDENTIAL')
            font_size = int(request.form.get('fontSize', 40))
            color = request.form.get('color', '#000000')
            font_family = request.form.get('fontFamily', 'Arial')
            is_bold = request.form.get('isBold', 'true').lower() == 'true'
            is_italic = request.form.get('isItalic', 'false').lower() == 'true'
            is_underline = request.form.get('isUnderline', 'false').lower() == 'true'
            
            result_bytes = add_text_watermark(
                pdf_bytes, text, font_size, color, opacity, rotation, position,
                font_family, is_bold, is_italic, is_underline
            )
        
        elif watermark_type == 'image':
            # Image watermark parameters
            if 'watermarkImage' not in request.files:
                return jsonify({"error": "No watermark image provided"}), 400
            
            image_file = request.files['watermarkImage']
            image_bytes = image_file.read()
            
            result_bytes = add_image_watermark(
                pdf_bytes, image_bytes, opacity, rotation, position
            )
        
        else:
            return jsonify({"error": "Invalid watermark type"}), 400
        
        # Generate output filename
        original_name = pdf_file.filename.replace('.pdf', '')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_filename = f"{original_name}_watermarked_{timestamp}.pdf"
        
        # Return the watermarked PDF
        return send_file(
            io.BytesIO(result_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=output_filename
        )
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "message": "PDF Watermark API is running",
        "version": "1.0.0"
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        "service": "PDF Watermark API",
        "endpoints": {
            "health": "/api/health",
            "watermark": "/api/watermark/add (POST)"
        }
    })

if __name__ == '__main__':
    print("=" * 50)
    print("Starting PDF Watermark Backend Server...")
    print("=" * 50)
    print("Server running at: http://localhost:5000")
    print("API endpoint: http://localhost:5000/api/watermark/add")
    print("Health check: http://localhost:5000/api/health")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
