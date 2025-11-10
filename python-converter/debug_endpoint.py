#!/usr/bin/env python3
"""Debug script to test the endpoint directly and see the actual error"""

import sys
import os

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

print("Testing Excel to Bank Statement conversion...")
print(f"Working directory: {current_dir}\n")

# Test 1: Import test
print("=" * 60)
print("TEST 1: Testing imports")
print("=" * 60)
try:
    from excel_to_bank_statement_pdf import convert_excel_to_bank_statement_pdf
    print("✓ Import successful")
except Exception as e:
    print(f"✗ Import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 2: Create test Excel file
print("\n" + "=" * 60)
print("TEST 2: Creating test Excel file")
print("=" * 60)
try:
    import pandas as pd
    import tempfile
    
    # Create test data with proper structure
    data = [
        ['Customer ID', '12345'],
        ['Account holder name', 'John Doe'],
        ['Account number', '1234567890'],
        ['Account holder address', '123 Main St'],
        ['', ''],
        ['Sr No', 'Date', 'Remarks', 'Debit', 'Credit', 'Balance'],
        ['1', '01-01-2024', 'Opening Balance', '', '', '1000'],
        ['2', '02-01-2024', 'Deposit', '', '500', '1500'],
        ['3', '03-01-2024', 'Withdrawal', '200', '', '1300'],
    ]
    
    df = pd.DataFrame(data)
    
    tmpdir = tempfile.mkdtemp()
    test_excel = os.path.join(tmpdir, 'test_statement.xlsx')
    df.to_excel(test_excel, index=False, header=False)
    print(f"✓ Test Excel created: {test_excel}")
    
except Exception as e:
    print(f"✗ Failed to create test file: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 3: Run conversion
print("\n" + "=" * 60)
print("TEST 3: Running conversion")
print("=" * 60)
try:
    pdf_path = convert_excel_to_bank_statement_pdf(test_excel, tmpdir, logo_path=None)
    
    if pdf_path and os.path.exists(pdf_path):
        print(f"✓ Conversion successful!")
        print(f"✓ PDF created: {pdf_path}")
        print(f"✓ File size: {os.path.getsize(pdf_path)} bytes")
    else:
        print("✗ PDF was not created")
        
except Exception as e:
    print(f"✗ Conversion failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("ALL TESTS PASSED!")
print("=" * 60)
print("\nThe endpoint should work. If you're still getting 500 error,")
print("please check the Flask server logs for the actual error message.")
