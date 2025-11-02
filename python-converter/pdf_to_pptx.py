#!/usr/bin/env python3
"""
PDF to PPTX Converter using LibreOffice
Professional-grade conversion
"""

import subprocess
import os
from pathlib import Path

def convert_pdf_to_pptx(pdf_path, output_dir):
    """
    Convert PDF to PPTX using LibreOffice
    
    Args:
        pdf_path: Path to input PDF file
        output_dir: Directory for output PPTX file
    
    Returns:
        Path to converted PPTX file
    """
    # Use full path to soffice.exe
    soffice_exe = r"C:\Program Files\LibreOffice\program\soffice.exe"
    
    # Kill any existing LibreOffice processes to avoid file locks
    try:
        subprocess.run(['taskkill', '/F', '/IM', 'soffice.exe', '/T'], 
                      capture_output=True, timeout=5)
        subprocess.run(['taskkill', '/F', '/IM', 'soffice.bin', '/T'], 
                      capture_output=True, timeout=5)
        import time
        time.sleep(1)
    except:
        pass
    
    # Convert PDF to PPTX using LibreOffice Impress
    cmd = [
        soffice_exe,
        '--headless',
        '--invisible',
        '--nologo',
        '--nofirststartwizard',
        '--norestore',
        '--convert-to', 'pptx',
        '--outdir', str(output_dir),
        str(pdf_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode != 0:
        raise RuntimeError(f"Conversion failed: {result.stderr}")
    
    # Find the output PPTX file
    pptx_name = Path(pdf_path).stem + '.pptx'
    pptx_path = Path(output_dir) / pptx_name
    
    if not pptx_path.exists():
        raise RuntimeError("PPTX was not created")
    
    return pptx_path

if __name__ == '__main__':
    import sys
    if len(sys.argv) != 3:
        print("Usage: python pdf_to_pptx.py <input.pdf> <output_dir>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]
    
    try:
        pptx_path = convert_pdf_to_pptx(pdf_path, output_dir)
        print(f"Success! Created: {pptx_path}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
