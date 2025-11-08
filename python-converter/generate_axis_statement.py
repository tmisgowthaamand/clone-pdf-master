"""
Generate Axis Bank Style Statement PDF
Matches the professional bank statement format
"""

from excel_to_pdf_table import convert_to_pdf_table

# Axis Bank Account Information
axis_account_info = {
    'customer_id': '275',
    'account_holder_name': 'MS. SS STONE',
    'account_number': 'XXXXXXXXXXXX5374',
    'address': 'D NO 1 NMC COMPLEX\nMAIN ROAD\n\nCHITTOOR, ANDHRA PRADESH\nINDIA',
    'pin': '517112',
    'scheme_code': 'CURRENT ACCOUNT-NORMAL',
    'currency': 'INR',
    'lien_amount': '0.00',
    'nomination': 'NOMINATION NOT REGISTERED',
    'kyc_status': 'Updated',
    'ifsc': '517211102 / UTIB0000275',
    'ckyc': 'NA',
    'transaction_date_from': '01/07/2025',
    'transaction_date_to': '31/07/2025'
}

# Input file
input_file = 'sample_axis_statement.csv'

# Output PDF file
output_file = 'Axis_Bank_Statement.pdf'

print("="*70)
print("GENERATING AXIS BANK STYLE STATEMENT PDF")
print("="*70)
print(f"\nInput File: {input_file}")
print(f"Output File: {output_file}")
print(f"\nAccount Details:")
print(f"  Account Holder: {axis_account_info['account_holder_name']}")
print(f"  Account Number: {axis_account_info['account_number']}")
print(f"  Period: {axis_account_info['transaction_date_from']} to {axis_account_info['transaction_date_to']}")
print("\nGenerating PDF...\n")

# Convert to PDF
result = convert_to_pdf_table(input_file, output_file, account_info=axis_account_info)

if result:
    import os
    file_size = os.path.getsize(result) / 1024
    print("\n" + "="*70)
    print("✓ SUCCESS!")
    print("="*70)
    print(f"PDF File: {result}")
    print(f"File Size: {file_size:.2f} KB")
    print("\nThe PDF includes:")
    print("  ✓ Professional bank statement header")
    print("  ✓ Account details (left: address, right: account info)")
    print("  ✓ Transaction table with all columns")
    print("  ✓ Clean professional formatting")
    print("  ✓ Ready for Render deployment")
    print("="*70)
else:
    print("\n✗ FAILED to generate PDF")
