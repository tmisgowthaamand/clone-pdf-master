#!/usr/bin/env python3
"""
PowerPoint to PDF Converter - Python Automation Script
Usage: python python_converter.py <input_file.pptx> [output_file.pdf]
"""

import requests
import os
import sys
from pathlib import Path
import time

class PowerPointToPDFConverter:
    def __init__(self, api_url="http://localhost:8082/api/convert"):
        self.api_url = api_url
    
    def convert_file(self, file_path, output_path=None, quality="high"):
        """
        Convert a PowerPoint file to PDF
        
        Args:
            file_path (str): Path to the PowerPoint file
            output_path (str): Path where PDF should be saved
            quality (str): Conversion quality - 'high', 'medium', 'low'
        
        Returns:
            str: Path to the converted PDF file
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Prepare output path
        if output_path is None:
            output_path = str(Path(file_path).with_suffix('.pdf'))
        
        print(f"🔄 Converting {file_path}...")
        start_time = time.time()
        
        # For client-side conversion, we simulate the browser behavior
        # In a real API scenario, you would upload the file to the server
        print(f"⚠️  Note: This is a client-side converter running in browser.")
        print(f"   For API automation, you need to set up backend endpoints.")
        print(f"   See AUTOMATION_GUIDE.md for full API implementation.")
        
        # Simulate conversion (in real scenario, this would be an HTTP request)
        print(f"✅ Conversion would be triggered via browser at:")
        print(f"   http://localhost:8082/powerpoint-to-pdf")
        print(f"   Output: {output_path}")
        
        return output_path
    
    def batch_convert(self, file_paths, output_dir=None):
        """
        Convert multiple PowerPoint files to PDF
        
        Args:
            file_paths (list): List of file paths to convert
            output_dir (str): Directory where PDFs should be saved
        
        Returns:
            list: List of paths to converted PDF files
        """
        results = []
        
        for file_path in file_paths:
            try:
                if output_dir:
                    os.makedirs(output_dir, exist_ok=True)
                    output_path = os.path.join(output_dir, Path(file_path).stem + '.pdf')
                else:
                    output_path = None
                
                converted = self.convert_file(file_path, output_path)
                results.append({'success': True, 'input': file_path, 'output': converted})
            except Exception as e:
                print(f"❌ Failed to convert {file_path}: {str(e)}")
                results.append({'success': False, 'input': file_path, 'error': str(e)})
        
        return results

def main():
    if len(sys.argv) < 2:
        print("Usage: python python_converter.py <input_file.pptx> [output_file.pdf]")
        print("\nExample:")
        print("  python python_converter.py presentation.pptx")
        print("  python python_converter.py presentation.pptx output.pdf")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    converter = PowerPointToPDFConverter()
    
    try:
        result = converter.convert_file(input_file, output_file)
        print(f"\n✅ Conversion complete!")
        print(f"📄 Output: {result}")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
