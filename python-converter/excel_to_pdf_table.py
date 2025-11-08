"""
Excel to PDF Converter - Bank Statement Style
Creates professional bank statement PDFs from Excel data
Works reliably on Render.com without LibreOffice
Uses reportlab to create professional PDFs matching Bank of India format
"""

import os
import pandas as pd
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime


def convert_excel_to_pdf_table(excel_path, output_path, account_info=None):
    """
    Convert Excel to PDF with Bank of India statement formatting
    This method works without LibreOffice and produces professional output
    Matches bank statement quality with proper layout
    
    account_info: dict with keys like 'customer_id', 'account_holder_name', 
                  'account_number', 'address', 'transaction_date_from', etc.
    """
    print(f"\n{'='*60}")
    print(f"EXCEL TO PDF - Bank Statement Quality")
    print(f"Input: {os.path.basename(excel_path)}")
    print(f"{'='*60}\n")
    
    try:
        # Read Excel file with openpyxl to preserve formatting
        print("Reading Excel file...")
        
        # Try to read with openpyxl engine first (better for .xlsx)
        try:
            from openpyxl import load_workbook
            wb = load_workbook(excel_path, data_only=True)
            ws = wb.active
            
            # Convert to pandas DataFrame
            data = ws.values
            cols = next(data)
            df = pd.DataFrame(data, columns=cols)
            
            # Also check for images/logos
            has_images = hasattr(ws, '_images') and len(ws._images) > 0
            
        except:
            # Fallback to pandas default
            df = pd.read_excel(excel_path)
            has_images = False
        
        print(f"✓ Read {len(df)} rows x {len(df.columns)} columns")
        if has_images:
            print(f"✓ Found images/logos in Excel file")
        
        # Create PDF
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=15*mm,
            leftMargin=15*mm,
            topMargin=15*mm,
            bottomMargin=15*mm
        )
        
        # Container for PDF elements
        elements = []
        styles = getSampleStyleSheet()
        
        # Default account info if not provided
        if account_info is None:
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
        
        # ===== HEADER SECTION =====
        # Bank name/logo placeholder
        bank_name = Paragraph(
            '<b><font size=14>BANK STATEMENT</font></b>',
            ParagraphStyle('BankName', fontSize=14, alignment=TA_LEFT, textColor=colors.HexColor('#333333'))
        )
        elements.append(bank_name)
        elements.append(Spacer(1, 3*mm))
        
        # Statement title with date range
        statement_title = Paragraph(
            f'<b>STATEMENT BETWEEN {account_info.get("transaction_date_from", "01/01/2025")} '
            f'AND {account_info.get("transaction_date_to", "31/12/2025")} '
            f'FOR A/C: {account_info.get("account_number", "XXXXXXXXXXXX")}</b>',
            ParagraphStyle('Title', fontSize=11, alignment=TA_CENTER, spaceAfter=0)
        )
        elements.append(statement_title)
        elements.append(Spacer(1, 5*mm))
        
        # ===== ACCOUNT DETAILS SECTION =====
        # Left column - Address details
        left_col = Paragraph(
            f'<b>( {account_info.get("customer_id", "275")} )</b><br/>'
            f'<b>{account_info.get("account_holder_name", "MS. SS STONE")}</b><br/>'
            f'{account_info.get("address", "D NO 1 NMC COMPLEX<br/>MAIN ROAD<br/><br/>CHITTOOR, ANDHRA PRADESH<br/>INDIA").replace(chr(10), "<br/>")}<br/>'
            f'<b>PIN :</b> {account_info.get("pin", "517112")}',
            ParagraphStyle('LeftCol', fontSize=9, leading=12)
        )
        
        # Right column - Account info
        right_col = Paragraph(
            f'<b>SCHEME CODE</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {account_info.get("scheme_code", "CURRENT ACCOUNT-NORMAL")}<br/>'
            f'<b>CUSTOMER ID</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {account_info.get("customer_id", "XXXXX9406")}<br/>'
            f'<b>CURRENCY CODE</b>&nbsp;&nbsp;&nbsp;: {account_info.get("currency", "INR")}<br/>'
            f'<b>LIEN AMOUNT</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {account_info.get("lien_amount", "0.00")}<br/>'
            f'<b>NOMINATION DETAILS</b>&nbsp;: {account_info.get("nomination", "NOMINATION NOT REGISTERED")}<br/>'
            f'<b>KYC Status</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {account_info.get("kyc_status", "Updated")}<br/>'
            f'<b>MICR/IFSC Code</b>&nbsp;&nbsp;&nbsp;&nbsp;: {account_info.get("ifsc", "517211102 / UTIB0000275")}<br/><br/>'
            f'<b>CKYC NO</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {account_info.get("ckyc", "NA")}',
            ParagraphStyle('RightCol', fontSize=9, leading=12)
        )
        
        # Create two-column layout
        details_data = [[left_col, right_col]]
        details_table = Table(details_data, colWidths=[250, 285])
        details_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        elements.append(details_table)
        elements.append(Spacer(1, 8*mm))
        
        # No filter section needed for this format - go straight to table
        
        # ===== TRANSACTION TABLE =====
        # Prepare table data
        # Add header row
        table_data = [df.columns.tolist()]
        
        # Add data rows
        for index, row in df.iterrows():
            row_data = []
            for value in row:
                # Convert to string and handle None/NaN
                if pd.isna(value):
                    row_data.append("")
                else:
                    row_data.append(str(value))
            table_data.append(row_data)
        
        print(f"Building PDF table with {len(table_data)} rows...")
        
        # Calculate column widths dynamically
        num_cols = len(df.columns)
        page_width = A4[0] - 30*mm  # Available width
        
        # Calculate width for each column based on content
        col_widths = []
        for col_idx in range(num_cols):
            max_length = 0
            for row in table_data:
                if col_idx < len(row):
                    max_length = max(max_length, len(str(row[col_idx])))
            
            # Convert to points (approximate)
            width = min(max_length * 6 + 10, page_width / num_cols * 1.5)
            col_widths.append(width)
        
        # Normalize widths to fit page
        total_width = sum(col_widths)
        if total_width > page_width:
            scale = page_width / total_width
            col_widths = [w * scale for w in col_widths]
        
        # Create table
        table = Table(table_data, colWidths=col_widths, repeatRows=1)
        
        # Build comprehensive table style matching Bank of India format
        table_style = TableStyle([
            # Header row styling - clean professional look
            ('BACKGROUND', (0, 0), (-1, 0), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            
            # Data rows styling
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 1), (-1, -1), 'MIDDLE'),
            
            # Borders - professional grid
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BOX', (0, 0), (-1, -1), 1.5, colors.black),
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, colors.black),  # Thicker line below header
            
            # Padding
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ])
        
        # Auto-detect numeric columns and right-align them
        for col_idx in range(num_cols):
            is_numeric = True
            for row_idx in range(1, min(len(table_data), 10)):  # Check first 10 rows
                if row_idx < len(table_data) and col_idx < len(table_data[row_idx]):
                    value = table_data[row_idx][col_idx]
                    if value and not str(value).replace('.', '').replace(',', '').replace('-', '').replace('₹', '').replace('$', '').strip().isdigit():
                        is_numeric = False
                        break
            
            if is_numeric:
                # Right-align numeric columns
                table_style.add('ALIGN', (col_idx, 1), (col_idx, -1), 'RIGHT')
        
        # Apply style to table
        table.setStyle(table_style)
        
        # Add table to elements
        elements.append(table)
        
        # Build PDF
        print("Generating PDF...")
        doc.build(elements)
        
        file_size = os.path.getsize(output_path) / 1024
        print(f"✓ PDF created: {os.path.basename(output_path)}")
        print(f"✓ File size: {file_size:.2f} KB")
        print(f"{'='*60}\n")
        
        return output_path
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def convert_csv_to_pdf_table(csv_path, output_path, account_info=None):
    """
    Convert CSV to PDF with proper table formatting
    """
    print(f"\n{'='*60}")
    print(f"CSV TO PDF - Table-Based Conversion")
    print(f"Input: {os.path.basename(csv_path)}")
    print(f"{'='*60}\n")
    
    try:
        # Read CSV file
        print("Reading CSV file...")
        df = pd.read_csv(csv_path, encoding='utf-8', on_bad_lines='skip')
        
        print(f"✓ Read {len(df)} rows x {len(df.columns)} columns")
        
        # Use the same conversion function
        # Create temporary Excel file
        import tempfile
        temp_excel = tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False)
        temp_excel.close()
        
        # Save as Excel
        df.to_excel(temp_excel.name, index=False, engine='openpyxl')
        
        # Convert Excel to PDF
        result = convert_excel_to_pdf_table(temp_excel.name, output_path, account_info=account_info)
        
        # Cleanup
        try:
            os.unlink(temp_excel.name)
        except:
            pass
        
        return result
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


# Main conversion function
def convert_to_pdf_table(input_path, output_path, account_info=None):
    """
    Main conversion function - handles both Excel and CSV
    
    account_info: Optional dict with account details for bank statement format
                  Keys: customer_id, account_holder_name, account_number, address,
                        transaction_date_from, transaction_date_to, amount_from, 
                        amount_to, cheque_from, cheque_to, transaction_type
    """
    if input_path.lower().endswith('.csv'):
        return convert_csv_to_pdf_table(input_path, output_path, account_info=account_info)
    else:
        return convert_excel_to_pdf_table(input_path, output_path, account_info=account_info)


# Test function
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python excel_to_pdf_table.py <excel_or_csv_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    if not os.path.exists(input_file):
        print(f"ERROR: File not found: {input_file}")
        sys.exit(1)
    
    # Output path
    base_name = os.path.splitext(os.path.basename(input_file))[0]
    output_dir = os.path.dirname(input_file) or '.'
    output_file = os.path.join(output_dir, f"{base_name}.pdf")
    
    result = convert_to_pdf_table(input_file, output_file)
    
    if result:
        print(f"\n✓ SUCCESS: {result}")
    else:
        print(f"\n✗ FAILED")
        sys.exit(1)
