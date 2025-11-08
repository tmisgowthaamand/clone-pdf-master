"""
Test script to generate Bank of India style PDF statement
"""
import os
from excel_to_pdf_table import convert_to_pdf_table

# Account information matching the screenshot
account_info = {
    'customer_id': '192136847',
    'account_holder_name': 'HARINI AND THARSHINI TRADERS',
    'account_number': '826820110000461',
    'address': 'W/O PRABAKARAN,7A 6TH CROSS\nSTREET THIRUVALLUVAR\nNAGAR,PALNGANATHAM 625003',
    'transaction_date_from': '02-03-2025',
    'transaction_date_to': '02-09-2025',
    'amount_from': '-',
    'amount_to': '-',
    'cheque_from': '-',
    'cheque_to': '-',
    'transaction_type': 'All'
}

# Input and output paths
input_file = 'sample_statement.csv'
output_file = 'Statement-Bank-Style.pdf'

print("Generating Bank of India style statement PDF...")
print(f"Input: {input_file}")
print(f"Output: {output_file}")

# Convert
from excel_to_pdf_table import convert_excel_to_pdf_table
import pandas as pd
import tempfile

# Read CSV and convert to Excel temporarily
df = pd.read_csv(input_file)
temp_excel = tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False)
temp_excel.close()
df.to_excel(temp_excel.name, index=False, engine='openpyxl')

# Convert to PDF with account info
result = convert_excel_to_pdf_table(temp_excel.name, output_file, account_info=account_info)

# Cleanup
try:
    os.unlink(temp_excel.name)
except:
    pass

if result:
    print(f"\n✓ SUCCESS: PDF created at {result}")
    print(f"✓ File size: {os.path.getsize(result) / 1024:.2f} KB")
else:
    print("\n✗ FAILED to create PDF")
