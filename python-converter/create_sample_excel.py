"""
Create a sample Excel file with bank transaction data (Bank of India format)
This demonstrates the expected format for Excel to PDF conversion
"""

import pandas as pd
from datetime import datetime, timedelta

def create_sample_transaction_excel(output_path="sample_bank_statement.xlsx"):
    """
    Create a sample Excel file with bank transaction data
    Format: Sr No, Date, Remarks, Debit, Credit, Balance (matching Bank of India)
    """
    
    # Sample transactions matching the screenshot
    transactions = [
        {
            "Sr No": 1,
            "Date": "02-03-2025",
            "Remarks": "UPI/100816391148/CR/SIVASUJKVBL/srksiva92/Mercha",
            "Debit": "",
            "Credit": 300.00,
            "Balance": "₹ 81,338.54"
        },
        {
            "Sr No": 2,
            "Date": "03-03-2025",
            "Remarks": "CWDR//453802/ZMD9114",
            "Debit": 9000.00,
            "Credit": "",
            "Balance": "₹ 72,338.54"
        },
        {
            "Sr No": 3,
            "Date": "03-03-2025",
            "Remarks": "CWDR//453804/ZMD9114",
            "Debit": 5000.00,
            "Credit": "",
            "Balance": "₹ 67,338.54"
        },
        {
            "Sr No": 4,
            "Date": "04-03-2025",
            "Remarks": "BY CASH-8250-MADURAI",
            "Debit": "",
            "Credit": 1715.00,
            "Balance": "₹ 69,053.54"
        },
        {
            "Sr No": 5,
            "Date": "04-03-2025",
            "Remarks": "BY CASH-8250-MADURAI",
            "Debit": "",
            "Credit": 5630.00,
            "Balance": "₹ 74,683.54"
        },
        {
            "Sr No": 6,
            "Date": "04-03-2025",
            "Remarks": "CWDR//453934/ZMD9114",
            "Debit": 20000.00,
            "Credit": "",
            "Balance": "₹ 54,683.54"
        },
    ]
    
    # Create DataFrame
    df = pd.DataFrame(transactions)
    
    # Save to Excel
    df.to_excel(output_path, index=False, sheet_name="Transactions")
    
    print(f"✓ Sample Excel created: {output_path}")
    print(f"  - Transactions: {len(transactions)}")
    print(f"  - Format: Bank of India Statement")
    
    return output_path

if __name__ == "__main__":
    create_sample_transaction_excel()
