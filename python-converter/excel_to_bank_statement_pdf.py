#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Excel to Bank Statement PDF Converter
Creates professional bank statements with logo, header, and formatted tables
"""

import os
import sys
from pathlib import Path
import pandas as pd
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# Global settings
WIDTH, HEIGHT = A4
STYLES = getSampleStyleSheet()

class StatementDocTemplate(BaseDocTemplate):
    """Custom document template for bank statements to handle headers on each page."""
    def __init__(self, filename, **kwargs):
        super().__init__(filename, **kwargs)
        self.addPageTemplates([
            PageTemplate(
                id='StatementPage',
                frames=[Frame(20*mm, 20*mm, WIDTH-40*mm, HEIGHT-70*mm, id='normal')],
                onPage=self._header_footer,
            ),
        ])
        self.metadata = {}

    def _header_footer(self, canvas, doc):
        """Draw the header and footer on each page."""
        canvas.saveState()
        self._draw_header(canvas, doc)
        canvas.restoreState()

    def _draw_header(self, canvas, doc):
        """Draws the bank logo, title, and other header info."""
        logo_path = self.metadata.get('logo_path')

        # Fallback to default logo only if it exists
        if not logo_path or not os.path.exists(logo_path):
            default_logo_path = os.path.join(os.path.dirname(__file__), 'bank_of_india_logo.png')
            if os.path.exists(default_logo_path):
                logo_path = default_logo_path
            else:
                logo_path = None # Ensure logo_path is None if no logo is found

        # Draw logo and bank info in top right
        if logo_path and os.path.exists(logo_path):
            try:
                img_width, img_height = 80, 40
                logo_x = WIDTH - img_width - 20 * mm
                logo_y = HEIGHT - 30 * mm
                canvas.drawImage(logo_path, logo_x, logo_y, width=img_width, height=img_height, preserveAspectRatio=True, mask='auto')
                
                # Bank name below logo
                canvas.setFont("Helvetica-Bold", 9)
                canvas.setFillColor(HexColor("#0033A0"))
                canvas.drawString(logo_x, logo_y - 10, "Bank of India")
                
                # Tagline
                canvas.setFont("Helvetica-Oblique", 7)
                canvas.setFillColor(black)
                canvas.drawString(logo_x, logo_y - 18, "Relationship beyond banking")
            except Exception as e:
                print(f"[Warning] Could not draw logo: {e}")
        else:
            # If no logo, just draw bank name in top right
            canvas.setFont("Helvetica-Bold", 11)
            canvas.setFillColor(HexColor("#0033A0"))
            canvas.drawRightString(WIDTH - 20 * mm, HEIGHT - 25 * mm, "Bank of India")
            canvas.setFont("Helvetica-Oblique", 8)
            canvas.setFillColor(black)
            canvas.drawRightString(WIDTH - 20 * mm, HEIGHT - 32 * mm, "Relationship beyond banking")

        # Draw "Detailed Statement" title centered (larger and more prominent)
        canvas.setFont("Helvetica-Bold", 20)
        canvas.setFillColor(black)
        canvas.drawCentredString(WIDTH / 2, HEIGHT - 50 * mm, self.metadata.get('statement_title', 'Detailed Statement'))
        
        # Draw date in top right corner (below bank info)
        statement_date = self.metadata.get('statement_date')
        if statement_date:
            canvas.setFont("Helvetica", 9)
            canvas.drawRightString(WIDTH - 20 * mm, HEIGHT - 60 * mm, f"Date: {statement_date}")

def convert_excel_to_bank_statement_pdf(excel_path, output_dir, logo_path=None):
    """
    Convert Excel file to bank statement PDF with professional formatting
    
    Args:
        excel_path: Path to Excel file
        output_dir: Output directory for PDF
        logo_path: Optional path to bank logo image
    
    Returns:
        Path to generated PDF file
    """
    try:
        print(f"\n{'='*60}")
        print(f"EXCEL TO BANK STATEMENT PDF CONVERSION")
        print(f"Input: {excel_path}")
        print(f"{'='*60}\n")

        df = pd.read_excel(excel_path, sheet_name=0)
        print(f"[OK] Excel file loaded: {len(df)} rows x {len(df.columns)} columns")

        # --- Metadata Extraction ---
        metadata = extract_metadata(df)
        metadata['logo_path'] = logo_path

        # --- PDF Generation ---
        pdf_name = Path(excel_path).stem + '_statement.pdf'
        pdf_path = os.path.join(output_dir, pdf_name)

        doc = StatementDocTemplate(pdf_path, pagesize=A4)
        doc.metadata = metadata

        # --- Story Creation ---
        story = []
        story.extend(create_statement_layout(metadata))
        
        table_df = get_table_data(df)
        if not table_df.empty:
            trans_table = create_transactions_table(table_df)
            story.append(trans_table)
        else:
            print("[Warning] No transaction data found to create table.")

        doc.build(story)
        
        print(f"[OK] Bank statement PDF created: {pdf_path}")
        print(f"{'='*60}\n")
        
        return pdf_path
    
    except Exception as e:
        print(f"Error creating bank statement PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def extract_metadata(df):
    """Extracts metadata from the first few rows of the DataFrame with improved detection."""
    metadata = {
        'customer_id': '',
        'account_holder': '',
        'account_number': '',
        'account_holder_address': '',
        'statement_date': '',
        'from_date': '',
        'to_date': ''
    }
    
    # Search first 15 rows for metadata
    for idx in range(min(15, len(df))):
        row = df.iloc[idx]
        row_str = ' '.join([str(val) for val in row if pd.notna(val)])
        row_str_lower = row_str.lower()
        
        # Try to extract values from adjacent cells
        try:
            # Customer ID
            if 'customer' in row_str_lower and 'id' in row_str_lower:
                for col_idx in range(len(row)):
                    if pd.notna(row[col_idx + 1]) if col_idx + 1 < len(row) else False:
                        metadata['customer_id'] = str(row[col_idx + 1]).strip()
                        break
            
            # Account holder name
            if 'account holder name' in row_str_lower or 'holder name' in row_str_lower:
                for col_idx in range(len(row)):
                    if pd.notna(row[col_idx + 1]) if col_idx + 1 < len(row) else False:
                        metadata['account_holder'] = str(row[col_idx + 1]).strip()
                        break
            
            # Account number
            if 'account number' in row_str_lower:
                for col_idx in range(len(row)):
                    if pd.notna(row[col_idx + 1]) if col_idx + 1 < len(row) else False:
                        metadata['account_number'] = str(row[col_idx + 1]).strip()
                        break
            
            # Account holder address
            if 'account holder address' in row_str_lower or 'holder address' in row_str_lower:
                for col_idx in range(len(row)):
                    if pd.notna(row[col_idx + 1]) if col_idx + 1 < len(row) else False:
                        metadata['account_holder_address'] = str(row[col_idx + 1]).strip()
                        break
            
            # Statement date
            if 'date:' in row_str_lower:
                for col_idx in range(len(row)):
                    if pd.notna(row[col_idx + 1]) if col_idx + 1 < len(row) else False:
                        metadata['statement_date'] = str(row[col_idx + 1]).strip()
                        break
        except Exception as e:
            print(f"[Warning] Error extracting metadata from row {idx}: {e}")
            continue

    # Extract date range from table
    table_df = get_table_data(df)
    if not table_df.empty:
        # Try to find date column
        date_col = None
        for col in table_df.columns:
            if 'date' in str(col).lower():
                date_col = col
                break
        
        if date_col:
            try:
                dates = pd.to_datetime(table_df[date_col], errors='coerce').dropna()
                if not dates.empty:
                    metadata['from_date'] = dates.min().strftime('%d-%m-%Y')
                    metadata['to_date'] = dates.max().strftime('%d-%m-%Y')
                    print(f"[OK] Date range: {metadata['from_date']} to {metadata['to_date']}")
            except Exception as e:
                print(f"[Warning] Could not parse date range: {e}")
    
    # Print extracted metadata
    print(f"[OK] Extracted metadata:")
    for key, value in metadata.items():
        if value:
            print(f"  - {key}: {value}")

    return metadata

def create_statement_layout(metadata):
    """Creates the static layout elements like account info and transaction filters."""
    elements = []
    
    # Account Details Box with border
    account_details_data = [
        [f"Customer ID: {metadata.get('customer_id', '')}", f"Account holder address:\n{metadata.get('account_holder_address', '')}"],
        [f"Account holder name: {metadata.get('account_holder', '')}", ""],
        [f"Account number: {metadata.get('account_number', '')}", ""],
    ]
    
    account_table = Table(account_details_data, colWidths=[(WIDTH/2)-25*mm, (WIDTH/2)-25*mm])
    account_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOX', (0, 0), (-1, -1), 1, black),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(account_table)
    elements.append(Spacer(1, 4*mm))

    # Transaction Filters section
    from_date = metadata.get('from_date', '02-03-2025')
    to_date = metadata.get('to_date', '02-03-2025')
    filter_data = [
        [Paragraph("<b>Transaction Date</b>", STYLES['Normal']), f"from: {from_date}", f"to: {to_date}"],
        [Paragraph("<b>Amount</b>", STYLES['Normal']), "from: -", "to: -"],
        [Paragraph("<b>Cheque</b>", STYLES['Normal']), "from: -", "to: -"],
        [Paragraph("<b>Transaction type: All</b>", STYLES['Normal']), "", ""],
    ]
    filter_table = Table(filter_data, colWidths=[55*mm, 52*mm, 52*mm])
    filter_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(filter_table)
    elements.append(Spacer(1, 3*mm))

    return elements

def get_table_data(df):
    """Finds and extracts the transaction data from the Excel sheet with improved detection."""
    table_start_idx = -1
    
    # Keywords that indicate table header row
    header_keywords = ['sr no', 'sr.no', 's.no', 'sno', 'date', 'remarks', 'debit', 'credit', 'balance', 'transaction']
    
    for idx in range(len(df)):
        row = df.iloc[idx]
        row_str = ' '.join([str(val).lower() for val in row if pd.notna(val)])
        
        # Count how many header keywords are present
        keyword_count = sum(1 for keyword in header_keywords if keyword in row_str)
        
        # If we find at least 3 keywords, this is likely the header row
        if keyword_count >= 3:
            table_start_idx = idx
            print(f"[OK] Found table header at row {idx}")
            break
    
    if table_start_idx != -1:
        table_df = df.iloc[table_start_idx:].reset_index(drop=True)
        
        # Use first row as column names
        table_df.columns = table_df.iloc[0]
        table_df = table_df[1:].reset_index(drop=True)
        
        # Remove completely empty rows
        table_df = table_df.dropna(how='all')
        
        # Fill NaN with empty strings
        table_df = table_df.fillna('')
        
        print(f"[OK] Extracted table: {len(table_df)} rows x {len(table_df.columns)} columns")
        return table_df
    
    print("[Warning] Could not find table header row")
    return pd.DataFrame()

def create_transactions_table(df):
    """Creates and styles the main transactions table with improved column mapping."""
    expected_cols = ['Sr No', 'Date', 'Remarks', 'Debit', 'Credit', 'Balance']
    
    # Convert all column names to strings first to avoid AttributeError
    df.columns = [str(col).strip() for col in df.columns]
    
    # Improved column mapping with multiple variations
    col_mapping = {}
    for col in df.columns:
        col_lower = col.lower()
        if any(x in col_lower for x in ['sr', 's.no', 'sno', 'serial']):
            col_mapping[col] = 'Sr No'
        elif 'date' in col_lower:
            col_mapping[col] = 'Date'
        elif any(x in col_lower for x in ['remark', 'description', 'narration', 'particular']):
            col_mapping[col] = 'Remarks'
        elif 'debit' in col_lower or 'dr' == col_lower:
            col_mapping[col] = 'Debit'
        elif 'credit' in col_lower or 'cr' == col_lower:
            col_mapping[col] = 'Credit'
        elif 'balance' in col_lower or 'bal' in col_lower:
            col_mapping[col] = 'Balance'
    
    df = df.rename(columns=col_mapping)
    
    # Add missing columns
    for col in expected_cols:
        if col not in df.columns:
            df[col] = ''
    
    # Reorder columns
    df = df[expected_cols]
    
    # Convert all values to strings and clean them
    for col in df.columns:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace('nan', '')
        df[col] = df[col].replace('None', '')

    table_data = [df.columns.tolist()] + df.values.tolist()
    
    print(f"[OK] Created transaction table with {len(table_data)-1} data rows")

    # Style the table to match bank statement format
    table = Table(table_data, colWidths=[15*mm, 22*mm, 75*mm, 22*mm, 22*mm, 28*mm], repeatRows=1)
    table.setStyle(TableStyle([
        # Header row styling
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#E8E8E8')),
        ('TEXTCOLOR', (0, 0), (-1, 0), black),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        
        # Data rows styling
        ('FONTSIZE', (0, 1), (-1, -1), 7),
        ('TOPPADDING', (0, 1), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        
        # Grid and borders
        ('GRID', (0, 0), (-1, -1), 0.5, black),
        ('BOX', (0, 0), (-1, -1), 1, black),
        
        # Column alignments
        ('ALIGN', (0, 1), (0, -1), 'CENTER'),  # Sr No - center
        ('ALIGN', (1, 1), (1, -1), 'CENTER'),  # Date - center
        ('ALIGN', (2, 1), (2, -1), 'LEFT'),    # Remarks - left
        ('ALIGN', (3, 1), (3, -1), 'RIGHT'),   # Debit - right
        ('ALIGN', (4, 1), (4, -1), 'RIGHT'),   # Credit - right
        ('ALIGN', (5, 1), (5, -1), 'RIGHT'),   # Balance - right
        
        # Vertical alignment
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    return table

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python excel_to_bank_statement_pdf.py <excel_file> [logo_file]")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    logo_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    output_dir = os.path.dirname(excel_file) or '.'
    pdf_path = convert_excel_to_bank_statement_pdf(excel_file, output_dir, logo_file)
    print(f"PDF created: {pdf_path}")
