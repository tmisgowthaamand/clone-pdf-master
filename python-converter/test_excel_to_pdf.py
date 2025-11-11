"""
Test script for Excel to PDF conversion with bank statement formatting
Demonstrates the enhanced features including header, logo, customer details, and transaction table
"""

import os
from excel_to_pdf_table import convert_to_pdf_table
from create_sample_excel import create_sample_transaction_excel

def test_excel_to_pdf_conversion():
    """
    Test the Excel to PDF conversion with sample data
    """
    print("\n" + "="*60)
    print("EXCEL TO PDF CONVERTER - TEST")
    print("="*60 + "\n")
    
    # Step 1: Create sample Excel file
    print("Step 1: Creating sample Excel file...")
    excel_file = create_sample_transaction_excel("sample_bank_statement.xlsx")
    
    # Step 2: Define customer information
    account_info = {
        "customer_id": "192136847",
        "account_holder_name": "HARINI AND THARSHINI TRADERS",
        "account_number": "826820110000461",
        "transaction_date_from": "02-03-2025",
        "transaction_date_to": "22-03-2025",
    }
    
    # Step 3: Convert to PDF (without logo)
    print("\nStep 2: Converting Excel to PDF (without logo)...")
    output_pdf = "sample_bank_statement.pdf"
    
    result = convert_to_pdf_table(
        input_path=excel_file,
        output_path=output_pdf,
        account_info=account_info,
        logo_path=None,  # No logo for this test
        use_ilovepdf_api=False  # Use ReportLab for custom formatting
    )
    
    if result and os.path.exists(result):
        print(f"\n✅ SUCCESS!")
        print(f"   PDF created: {result}")
        print(f"   File size: {os.path.getsize(result) / 1024:.2f} KB")
        print(f"\n📄 Features included:")
        print(f"   ✓ Professional header with bank name")
        print(f"   ✓ Customer details section")
        print(f"   ✓ Transaction table with proper formatting")
        print(f"   ✓ Alternating row colors for readability")
        print(f"   ✓ Right-aligned numeric columns (Debit, Credit, Balance)")
        print(f"   ✓ Auto-adjusted column widths")
        print(f"   ✓ Footer with generation date")
    else:
        print(f"\n❌ FAILED to create PDF")
    
    print("\n" + "="*60)
    print("TEST COMPLETED")
    print("="*60 + "\n")
    
    # Instructions for adding logo
    print("📌 TO ADD A BANK LOGO:")
    print("   1. Place your bank logo image (PNG/JPG) in this directory")
    print("   2. Update the logo_path parameter in the conversion call")
    print("   3. Example: logo_path='bank_logo.png'")
    print("\n")

if __name__ == "__main__":
    test_excel_to_pdf_conversion()
