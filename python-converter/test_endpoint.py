#!/usr/bin/env python3
"""Test the excel-to-bank-statement endpoint"""

import requests
import os

# Create a simple test Excel file
test_file = "test_data.xlsx"

# Check if test file exists
if not os.path.exists(test_file):
    print(f"Creating test Excel file: {test_file}")
    import pandas as pd
    df = pd.DataFrame({
        'Sr No': [1, 2, 3],
        'Date': ['01-01-2024', '02-01-2024', '03-01-2024'],
        'Remarks': ['Test 1', 'Test 2', 'Test 3'],
        'Debit': [100, 200, 0],
        'Credit': [0, 0, 300],
        'Balance': [900, 700, 1000]
    })
    df.to_excel(test_file, index=False)

# Test the endpoint
url = 'http://localhost:5000/api/convert/excel-to-bank-statement'
print(f"Testing endpoint: {url}")

with open(test_file, 'rb') as f:
    files = {'file': (test_file, f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
    
    try:
        response = requests.post(url, files=files)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✓ Success! PDF generated")
            with open('output_test.pdf', 'wb') as out:
                out.write(response.content)
            print("Saved to: output_test.pdf")
        else:
            print(f"✗ Error: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Request failed: {e}")
        import traceback
        traceback.print_exc()
