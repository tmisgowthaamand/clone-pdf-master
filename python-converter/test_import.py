#!/usr/bin/env python3
"""Test import of excel_to_bank_statement_pdf module"""

import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

print(f"Current directory: {current_dir}")
print(f"Python path: {sys.path[:3]}")

try:
    from excel_to_bank_statement_pdf import convert_excel_to_bank_statement_pdf
    print("✓ Import successful!")
    print(f"Function: {convert_excel_to_bank_statement_pdf}")
except Exception as e:
    print(f"✗ Import failed: {e}")
    import traceback
    traceback.print_exc()
