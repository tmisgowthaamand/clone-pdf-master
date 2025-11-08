"""
Example: How to use the Bank Statement PDF Generator

This script shows how to convert Excel/CSV files to Bank of India style PDFs
"""

from excel_to_pdf_table import convert_to_pdf_table

# Example 1: Simple conversion (uses default account info)
print("Example 1: Simple conversion with default account info")
convert_to_pdf_table('sample_statement.csv', 'output_default.pdf')

# Example 2: Custom account information
print("\nExample 2: Custom account information")
custom_account_info = {
    'customer_id': '123456789',
    'account_holder_name': 'YOUR COMPANY NAME',
    'account_number': '123456789012345',
    'address': 'Your Address Line 1\nYour Address Line 2\nCity, State PIN',
    'transaction_date_from': '01-01-2025',
    'transaction_date_to': '31-01-2025',
    'amount_from': '0',
    'amount_to': '100000',
    'cheque_from': '-',
    'cheque_to': '-',
    'transaction_type': 'All'
}

convert_to_pdf_table('sample_statement.csv', 'output_custom.pdf', account_info=custom_account_info)

print("\n✓ Done! Check the generated PDF files.")
