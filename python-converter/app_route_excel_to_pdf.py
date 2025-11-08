"""
READY-TO-USE FLASK ROUTE FOR EXCEL TO PDF CONVERSION
Add this to your app.py for Render deployment
"""

from flask import Flask, request, send_file, jsonify
from excel_to_pdf_table import convert_to_pdf_table
import tempfile
import os

app = Flask(__name__)

@app.route('/api/excel-to-pdf-bank-statement', methods=['POST'])
def excel_to_pdf_bank_statement():
    """
    Convert Excel/CSV to Bank of India style PDF
    
    Form Data:
    - file: Excel or CSV file (required)
    - customer_id: Customer ID (optional)
    - account_holder_name: Account holder name (optional)
    - account_number: Account number (optional)
    - address: Full address (optional, use \n for line breaks)
    - transaction_date_from: Start date (optional)
    - transaction_date_to: End date (optional)
    - amount_from: Amount from (optional)
    - amount_to: Amount to (optional)
    - cheque_from: Cheque from (optional)
    - cheque_to: Cheque to (optional)
    - transaction_type: Transaction type (optional, default: All)
    """
    try:
        # Validate file upload
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file extension
        allowed_extensions = {'.xlsx', '.xls', '.csv'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'}), 400
        
        # Get account information from form data (with defaults)
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
        
        # Create temporary files
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
        file.save(temp_input.name)
        temp_input.close()
        
        temp_output = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_output.close()
        
        # Convert to PDF
        result = convert_to_pdf_table(
            temp_input.name,
            temp_output.name,
            account_info=account_info
        )
        
        if result and os.path.exists(result):
            # Generate filename
            filename = f'Statement_{account_info["customer_id"]}_{account_info["transaction_date_from"].replace("-", "")}.pdf'
            
            # Send PDF file
            response = send_file(
                result,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=filename
            )
            
            # Cleanup after sending
            @response.call_on_close
            def cleanup():
                try:
                    os.unlink(temp_input.name)
                    os.unlink(temp_output.name)
                except:
                    pass
            
            return response
        else:
            # Cleanup on failure
            try:
                os.unlink(temp_input.name)
                os.unlink(temp_output.name)
            except:
                pass
            return jsonify({'error': 'Failed to generate PDF'}), 500
            
    except Exception as e:
        # Cleanup on exception
        try:
            if 'temp_input' in locals():
                os.unlink(temp_input.name)
            if 'temp_output' in locals():
                os.unlink(temp_output.name)
        except:
            pass
        
        return jsonify({'error': str(e)}), 500


# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check for Render"""
    return jsonify({
        'status': 'healthy',
        'service': 'Excel to PDF Bank Statement Converter',
        'version': '1.0.0'
    })


if __name__ == '__main__':
    # For local testing
    app.run(debug=True, host='0.0.0.0', port=5000)


"""
TESTING WITH CURL:
==================

# Basic test with default account info
curl -X POST http://localhost:5000/api/excel-to-pdf-bank-statement \
  -F "file=@sample_statement.csv" \
  -o output.pdf

# Test with custom account info
curl -X POST http://localhost:5000/api/excel-to-pdf-bank-statement \
  -F "file=@sample_statement.csv" \
  -F "customer_id=123456789" \
  -F "account_holder_name=JOHN DOE" \
  -F "account_number=987654321012345" \
  -F "address=123 Main Street\nCity, State 12345" \
  -F "transaction_date_from=01-01-2025" \
  -F "transaction_date_to=31-01-2025" \
  -o custom_output.pdf

# Health check
curl http://localhost:5000/api/health


INTEGRATION INTO EXISTING app.py:
==================================

1. Copy excel_to_pdf_table.py to your project directory

2. Add this import to your app.py:
   from excel_to_pdf_table import convert_to_pdf_table

3. Copy the route function excel_to_pdf_bank_statement() to your app.py

4. Make sure requirements.txt includes:
   pandas
   reportlab
   openpyxl
   flask

5. Deploy to Render!
"""
