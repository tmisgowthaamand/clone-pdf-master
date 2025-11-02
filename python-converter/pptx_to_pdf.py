#!/usr/bin/env python3
"""
Professional PowerPoint to PDF Converter using LibreOffice
This achieves iLovePDF-quality conversion using open-source tools
"""

import subprocess
import os
import sys
from pathlib import Path
import tempfile
import shutil

def convert_pptx_to_pdf(input_file, output_file=None):
    """
    Convert PowerPoint to PDF using LibreOffice headless mode
    
    Args:
        input_file: Path to input PPTX file
        output_file: Path to output PDF file (optional)
    
    Returns:
        Path to converted PDF file
    """
    input_path = Path(input_file).resolve()
    
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_file}")
    
    # Create output path
    if output_file is None:
        output_file = input_path.with_suffix('.pdf')
    else:
        output_file = Path(output_file).resolve()
    
    # Create temporary directory for conversion
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # LibreOffice command for conversion
        # This is the same method used by professional converters
        libreoffice_cmd = [
            'soffice',  # or 'libreoffice' on some systems
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', str(temp_path),
            str(input_path)
        ]
        
        try:
            # Run LibreOffice conversion
            result = subprocess.run(
                libreoffice_cmd,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode != 0:
                raise RuntimeError(f"LibreOffice conversion failed: {result.stderr}")
            
            # Find the converted PDF
            pdf_name = input_path.stem + '.pdf'
            temp_pdf = temp_path / pdf_name
            
            if not temp_pdf.exists():
                raise RuntimeError("PDF file was not created")
            
            # Move to final destination
            shutil.move(str(temp_pdf), str(output_file))
            
            print(f"✅ Successfully converted: {output_file}")
            return str(output_file)
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("Conversion timed out after 60 seconds")
        except FileNotFoundError:
            raise RuntimeError(
                "LibreOffice not found. Please install:\n"
                "  Windows: Download from https://www.libreoffice.org/\n"
                "  Linux: sudo apt-get install libreoffice\n"
                "  Mac: brew install --cask libreoffice"
            )

def batch_convert(input_folder, output_folder=None):
    """Convert all PPTX files in a folder"""
    input_path = Path(input_folder)
    
    if output_folder is None:
        output_folder = input_path / 'converted'
    
    output_path = Path(output_folder)
    output_path.mkdir(exist_ok=True)
    
    pptx_files = list(input_path.glob('*.pptx')) + list(input_path.glob('*.ppt'))
    
    print(f"Found {len(pptx_files)} PowerPoint files")
    
    for pptx_file in pptx_files:
        try:
            output_file = output_path / f"{pptx_file.stem}.pdf"
            convert_pptx_to_pdf(pptx_file, output_file)
        except Exception as e:
            print(f"❌ Failed to convert {pptx_file.name}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python pptx_to_pdf.py <input.pptx> [output.pdf]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        convert_pptx_to_pdf(input_file, output_file)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
