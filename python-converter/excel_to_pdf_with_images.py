"""
Enhanced Excel to PDF converter that preserves images and logos
Extracts images from Excel and adds them to LibreOffice-generated PDF
"""

import os
import tempfile
import subprocess
from pathlib import Path
from openpyxl import load_workbook
from openpyxl.drawing.image import Image as OpenpyxlImage
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image as PILImage
import io

def extract_images_from_excel(excel_path):
    """Extract all images from Excel file with their positions"""
    try:
        wb = load_workbook(excel_path)
        ws = wb.active
        
        images = []
        if hasattr(ws, '_images') and ws._images:
            for idx, img in enumerate(ws._images):
                try:
                    # Get image data
                    img_data = img._data()
                    
                    # Get position
                    anchor = img.anchor
                    if hasattr(anchor, '_from'):
                        col = anchor._from.col
                        row = anchor._from.row
                        
                        # Save to temp file
                        img_ext = 'png'
                        if img_data[:4] == b'\xff\xd8\xff\xe0':
                            img_ext = 'jpg'
                        elif img_data[:4] == b'\x89PNG':
                            img_ext = 'png'
                        
                        images.append({
                            'data': img_data,
                            'row': row,
                            'col': col,
                            'ext': img_ext,
                            'index': idx
                        })
                        print(f"  ✓ Found image {idx + 1} at row {row}, col {col}")
                except Exception as e:
                    print(f"  Warning: Could not extract image {idx}: {str(e)}")
        
        return images
    except Exception as e:
        print(f"Error extracting images: {str(e)}")
        return []

def add_images_to_pdf(pdf_path, images, excel_path):
    """Add extracted images to the PDF"""
    if not images:
        return pdf_path
    
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        from PyPDF2 import PdfReader, PdfWriter
        
        # Read original PDF
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        
        # Get first page
        first_page = reader.pages[0]
        page_width = float(first_page.mediabox.width)
        page_height = float(first_page.mediabox.height)
        
        # Create overlay with images
        overlay_path = pdf_path.replace('.pdf', '_overlay.pdf')
        c = canvas.Canvas(overlay_path, pagesize=(page_width, page_height))
        
        # Add images to overlay
        for img_info in images:
            try:
                # Load image
                pil_img = PILImage.open(io.BytesIO(img_info['data']))
                
                # Position: Bank logo is typically centered at top
                # Adjust these values based on your Excel layout
                if img_info['row'] <= 5 and img_info['col'] >= 5:  # Top center area
                    # Center the logo at top
                    img_width = 150  # Adjust size as needed
                    img_height = 60
                    x = (page_width - img_width) / 2
                    y = page_height - 100  # Near top
                else:
                    # Default positioning
                    x = 50 + (img_info['col'] * 50)
                    y = page_height - 100 - (img_info['row'] * 20)
                    img_width = 100
                    img_height = 50
                
                # Draw image
                img_reader = ImageReader(io.BytesIO(img_info['data']))
                c.drawImage(img_reader, x, y, width=img_width, height=img_height, 
                           preserveAspectRatio=True, mask='auto')
                print(f"  ✓ Added image {img_info['index'] + 1} to PDF at ({x:.1f}, {y:.1f})")
            except Exception as e:
                print(f"  Warning: Could not add image {img_info['index']}: {str(e)}")
        
        c.save()
        
        # Merge overlay with original PDF
        overlay_reader = PdfReader(overlay_path)
        overlay_page = overlay_reader.pages[0]
        
        # Merge first page with overlay
        first_page.merge_page(overlay_page)
        writer.add_page(first_page)
        
        # Add remaining pages
        for page_num in range(1, len(reader.pages)):
            writer.add_page(reader.pages[page_num])
        
        # Write final PDF
        final_path = pdf_path.replace('.pdf', '_with_images.pdf')
        with open(final_path, 'wb') as f:
            writer.write(f)
        
        # Clean up
        try:
            os.remove(overlay_path)
        except:
            pass
        
        print(f"  ✓ Created PDF with images: {final_path}")
        return final_path
        
    except Exception as e:
        print(f"Error adding images to PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        return pdf_path

def convert_excel_to_pdf_with_images(excel_path, output_dir):
    """Convert Excel to PDF preserving images"""
    print(f"\n{'='*60}")
    print(f"EXCEL TO PDF WITH IMAGES")
    print(f"Input: {excel_path}")
    print(f"{'='*60}\n")
    
    # Step 1: Extract images from Excel
    print("Step 1: Extracting images from Excel...")
    images = extract_images_from_excel(excel_path)
    print(f"Found {len(images)} images\n")
    
    # Step 2: Convert Excel to PDF using LibreOffice
    print("Step 2: Converting Excel to PDF with LibreOffice...")
    soffice_exe = r"C:\Program Files\LibreOffice\program\soffice.exe"
    
    # Kill existing processes
    try:
        subprocess.run(['taskkill', '/F', '/IM', 'soffice.exe', '/T'], 
                      capture_output=True, timeout=5)
        subprocess.run(['taskkill', '/F', '/IM', 'soffice.bin', '/T'], 
                      capture_output=True, timeout=5)
        import time
        time.sleep(1)
    except:
        pass
    
    cmd = [
        soffice_exe,
        '--headless',
        '--invisible',
        '--nodefault',
        '--nofirststartwizard',
        '--nolockcheck',
        '--nologo',
        '--norestore',
        '--convert-to', 'pdf:calc_pdf_Export',
        '--outdir', output_dir,
        excel_path
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode != 0:
        raise RuntimeError(f"LibreOffice conversion failed: {result.stderr}")
    
    # Find PDF
    base_name = os.path.splitext(os.path.basename(excel_path))[0]
    pdf_path = os.path.join(output_dir, f"{base_name}.pdf")
    
    if not os.path.exists(pdf_path):
        raise RuntimeError("PDF was not created")
    
    print(f"  ✓ Base PDF created\n")
    
    # Step 3: Add images to PDF
    if images:
        print("Step 3: Adding images to PDF...")
        final_pdf = add_images_to_pdf(pdf_path, images, excel_path)
        print(f"\n{'='*60}")
        print(f"✓ COMPLETE: PDF with {len(images)} images")
        print(f"{'='*60}\n")
        return final_pdf
    else:
        print("No images found, returning base PDF")
        return pdf_path

if __name__ == "__main__":
    # Test
    import sys
    if len(sys.argv) > 1:
        excel_file = sys.argv[1]
        output_dir = os.path.dirname(excel_file) or '.'
        result = convert_excel_to_pdf_with_images(excel_file, output_dir)
        print(f"Result: {result}")
