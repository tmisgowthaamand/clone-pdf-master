"""
INTEGRATION CODE FOR app.py
Copy this code to integrate Bank Statement PDF generation into your Flask/FastAPI app
"""

# ============================================================================
# ADD THIS TO YOUR app.py IMPORTS
# ============================================================================
from excel_to_pdf_table import convert_to_pdf_table

# ============================================================================
# ADD THIS ROUTE TO YOUR app.py
# ============================================================================

@app.route('/api/excel-to-bank-statement', methods=['POST'])
def excel_to_bank_statement():
    """
    Convert Excel/CSV to Bank of India style PDF statement
    
    Request body (multipart/form-data):
    - file: Excel or CSV file
    - customer_id: Customer ID (optional)
    - account_holder_name: Account holder name (optional)
    - account_number: Account number (optional)
    - address: Account holder address (optional)
    - transaction_date_from: Start date (optional)
    - transaction_date_to: End date (optional)
    - amount_from: Amount from (optional)
    - amount_to: Amount to (optional)
    - cheque_from: Cheque from (optional)
    - cheque_to: Cheque to (optional)
    - transaction_type: Transaction type (optional, default: All)
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get account information from form data
        account_info = {
            'customer_id': request.form.get('customer_id', '192136847'),
            'account_holder_name': request.form.get('account_holder_name', 'HARINI AND THARSHINI TRADERS'),
            'account_number': request.form.get('account_number', '826820110000461'),
            'address': request.form.get('address', 'W/O PRABAKARAN,7A 6TH CROSS\nSTREET THIRUVALLUVAR\nNAGAR,PALNGANATHAM 625003'),
            'transaction_date_from': request.form.get('transaction_date_from', '02-03-2025'),
            'transaction_date_to': request.form.get('transaction_date_to', '02-09-2025'),
            'amount_from': request.form.get('amount_from', '-'),
            'amount_to': request.form.get('amount_to', '-'),
            'cheque_from': request.form.get('cheque_from', '-'),
            'cheque_to': request.form.get('cheque_to', '-'),
            'transaction_type': request.form.get('transaction_type', 'All')
        }
        
        # Save uploaded file temporarily
        import tempfile
        import os
        
        temp_input = tempfile.NamedTemporaryFile(
            delete=False, 
            suffix=os.path.splitext(file.filename)[1]
        )
        file.save(temp_input.name)
        temp_input.close()
        
        # Create output file
        temp_output = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_output.close()
        
        # Convert to PDF with bank statement format
        result = convert_to_pdf_table(
            temp_input.name, 
            temp_output.name, 
            account_info=account_info
        )
        
        if result:
            # Send the PDF file
            return send_file(
                temp_output.name,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f'Bank_Statement_{account_info["customer_id"]}.pdf'
            )
        else:
            return jsonify({'error': 'Failed to generate PDF'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Cleanup temporary files
        try:
            if 'temp_input' in locals():
                os.unlink(temp_input.name)
            if 'temp_output' in locals():
                os.unlink(temp_output.name)
        except:
            pass


# ============================================================================
# SIMPLE USAGE EXAMPLE (Standalone)
# ============================================================================

if __name__ == "__main__":
    # Example 1: Simple conversion with default account info
    convert_to_pdf_table('sample_statement.csv', 'output.pdf')
    
    # Example 2: Custom account information
    custom_info = {
        'customer_id': '123456789',
        'account_holder_name': 'YOUR NAME',
        'account_number': '987654321012345',
        'address': 'Your Address\nCity, State\nPIN Code',
        'transaction_date_from': '01-01-2025',
        'transaction_date_to': '31-01-2025',
        'amount_from': '-',
        'amount_to': '-',
        'cheque_from': '-',
        'cheque_to': '-',
        'transaction_type': 'All'
    }
    
    convert_to_pdf_table('sample_statement.csv', 'custom_output.pdf', account_info=custom_info)
    print("✓ PDFs generated successfully!")


# ============================================================================
# CURL TEST COMMAND
# ============================================================================
"""
curl -X POST http://localhost:5000/api/excel-to-bank-statement \
  -F "file=@sample_statement.csv" \
  -F "customer_id=192136847" \
  -F "account_holder_name=HARINI AND THARSHINI TRADERS" \
  -F "account_number=826820110000461" \
  -F "address=W/O PRABAKARAN,7A 6TH CROSS\nSTREET THIRUVALLUVAR\nNAGAR,PALNGANATHAM 625003" \
  -F "transaction_date_from=02-03-2025" \
  -F "transaction_date_to=02-09-2025" \
  -o bank_statement.pdf
"""
