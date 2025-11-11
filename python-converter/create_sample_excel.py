"""
Create a sample Excel file with bank transaction data
This demonstrates the expected format for Excel to PDF conversion
"""

import pandas as pd
from datetime import datetime, timedelta
import random

def create_sample_transaction_excel(output_path="sample_transactions.xlsx"):
    """
    Create a sample Excel file with bank transaction data
    Format: Sr No, Date, Remarks, Debit, Credit, Balance
    """
    
    # Starting balance
    balance = 50000.00
    
    # Generate sample transactions
    transactions = []
    start_date = datetime(2025, 3, 2)
    
    transaction_types = [
        ("ATM Withdrawal", "debit", 2000, 5000),
        ("Salary Credit", "credit", 25000, 50000),
        ("Online Transfer", "debit", 1000, 10000),
        ("UPI Payment", "debit", 500, 3000),
        ("Check Deposit", "credit", 5000, 20000),
        ("Bill Payment", "debit", 1500, 5000),
        ("Interest Credit", "credit", 150, 500),
        ("POS Purchase", "debit", 800, 3000),
    ]
    
    for i in range(20):
        # Random transaction
        trans_type, direction, min_amt, max_amt = random.choice(transaction_types)
        amount = round(random.uniform(min_amt, max_amt), 2)
        
        # Update balance
        if direction == "debit":
            balance -= amount
            debit = amount
            credit = ""
        else:
            balance += amount
            debit = ""
            credit = amount
        
        # Create transaction record
        trans_date = start_date + timedelta(days=i)
        transactions.append({
            "Sr No": i + 1,
            "Date": trans_date.strftime("%d-%m-%Y"),
            "Remarks": trans_type,
            "Debit": debit if debit else "",
            "Credit": credit if credit else "",
            "Balance": round(balance, 2)
        })
    
    # Create DataFrame
    df = pd.DataFrame(transactions)
    
    # Save to Excel
    df.to_excel(output_path, index=False, sheet_name="Transactions")
    
    print(f"✓ Sample Excel created: {output_path}")
    print(f"  - Transactions: {len(transactions)}")
    print(f"  - Starting Balance: 50000.00")
    print(f"  - Ending Balance: {balance:.2f}")
    
    return output_path

if __name__ == "__main__":
    create_sample_transaction_excel()
