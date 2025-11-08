"""
Generate Bank of India Style Statement PDF
Matches the exact format shown in the reference screenshot
"""

from excel_to_pdf_table import convert_to_pdf_table

# Bank of India Account Information (matching screenshot 3)
bank_account_info = {
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

# Input file (CSV or Excel)
input_file = 'sample_statement.csv'

# Output PDF file
output_file = 'Bank_Statement_Professional.pdf'

print("="*70)
print("GENERATING BANK OF INDIA STYLE STATEMENT PDF")
print("="*70)
print(f"\nInput File: {input_file}")
print(f"Output File: {output_file}")
print(f"\nAccount Details:")
print(f"  Customer ID: {bank_account_info['customer_id']}")
print(f"  Account Holder: {bank_account_info['account_holder_name']}")
print(f"  Account Number: {bank_account_info['account_number']}")
print(f"  Period: {bank_account_info['transaction_date_from']} to {bank_account_info['transaction_date_to']}")
print("\nGenerating PDF...\n")

# Convert to PDF
result = convert_to_pdf_table(input_file, output_file, account_info=bank_account_info)

if result:
    import os
    file_size = os.path.getsize(result) / 1024
    print("\n" + "="*70)
    print("✓ SUCCESS!")
    print("="*70)
    print(f"PDF File: {result}")
    print(f"File Size: {file_size:.2f} KB")
    print("\nThe PDF now includes:")
    print("  ✓ Detailed Statement header")
    print("  ✓ Account details box (Customer ID, Name, Number, Address)")
    print("  ✓ Transaction filters (Date, Amount, Cheque, Type)")
    print("  ✓ Professional transaction table")
    print("  ✓ Bank of India style formatting")
    print("="*70)
else:
    print("\n✗ FAILED to generate PDF")
