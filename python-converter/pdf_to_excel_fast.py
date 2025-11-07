"""
Fast PDF to Excel converter optimized for cloud deployments (Render, Vercel)
Uses PyMuPDF (fitz) + tabula-py for faster table extraction
Optimized for speed over complex formatting
"""

import os
import sys
from pathlib import Path
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.utils import get_column_letter


def pdf_to_excel_fast(pdf_path, output_dir=None):
    """
    Fast PDF to Excel conversion using tabula-py
    Optimized for cloud deployments - faster than camelot
    """
    if output_dir is None:
        output_dir = os.path.dirname(pdf_path) or '.'
    
    print(f"\n{'='*60}")
    print(f"FAST PDF TO EXCEL CONVERSION (Cloud-Optimized)")
    print(f"Input: {pdf_path}")
    print(f"{'='*60}\n")
    
    try:
        import tabula
    except ImportError:
        print("Installing tabula-py for faster conversion...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "tabula-py"])
        import tabula
    
    # Extract tables from PDF using tabula (faster than camelot)
    print("Extracting tables with tabula-py (optimized for speed)...")
    
    try:
        # Try lattice mode first (for bordered tables)
        dfs = tabula.read_pdf(
            pdf_path,
            pages='all',
            lattice=True,
            multiple_tables=True,
            pandas_options={'header': None}
        )
        
        if not dfs or len(dfs) == 0:
            # Fallback to stream mode (for borderless tables)
            print("Trying stream mode...")
            dfs = tabula.read_pdf(
                pdf_path,
                pages='all',
                stream=True,
                multiple_tables=True,
                pandas_options={'header': None}
            )
    except Exception as e:
        print(f"Tabula extraction failed: {e}")
        # Fallback to basic text extraction
        dfs = []
    
    if not dfs or len(dfs) == 0:
        print("No tables found, using basic text extraction...")
        # Fallback: Extract text and create simple table
        import fitz
        doc = fitz.open(pdf_path)
        
        all_text = []
        for page in doc:
            text = page.get_text()
            all_text.append(text)
        
        doc.close()
        
        # Create a simple DataFrame from text
        df = pd.DataFrame({'Content': all_text})
        dfs = [df]
    
    print(f"Found {len(dfs)} table(s)")
    
    # Create Excel workbook
    excel_name = Path(pdf_path).stem + '.xlsx'
    excel_path = Path(output_dir) / excel_name
    
    wb = Workbook()
    ws = wb.active
    ws.title = 'Extracted Data'
    
    current_row = 1
    
    # Process each table
    for idx, df in enumerate(dfs):
        if df.empty:
            continue
        
        # Clean the dataframe
        df = df.dropna(how='all', axis=0).dropna(how='all', axis=1)
        
        if len(df) == 0:
            continue
        
        print(f"Table {idx + 1}: {len(df)} rows × {len(df.columns)} columns")
        
        # Add table separator if not first table
        if current_row > 1:
            current_row += 2  # Add spacing between tables
        
        # Write headers (first row as header)
        if len(df) > 0:
            headers = df.iloc[0].astype(str).tolist()
            for col_idx, header in enumerate(headers, start=1):
                cell = ws.cell(row=current_row, column=col_idx, value=header)
                cell.font = Font(bold=True, size=11)
                cell.fill = PatternFill(start_color='4472C4', end_color='4472C4', fill_type='solid')
                cell.font = Font(bold=True, size=11, color='FFFFFF')
                cell.alignment = Alignment(horizontal='center', vertical='center')
            
            current_row += 1
            
            # Write data rows (skip first row as it's the header)
            for row_idx in range(1, len(df)):
                row_data = df.iloc[row_idx].astype(str).tolist()
                for col_idx, value in enumerate(row_data, start=1):
                    cell = ws.cell(row=current_row, column=col_idx, value=value)
                    cell.alignment = Alignment(horizontal='left', vertical='center')
                    
                    # Alternate row colors
                    if row_idx % 2 == 0:
                        cell.fill = PatternFill(start_color='F2F2F2', end_color='F2F2F2', fill_type='solid')
                
                current_row += 1
    
    # Auto-adjust column widths
    for column in ws.columns:
        max_length = 0
        column_letter = get_column_letter(column[0].column)
        
        for cell in column:
            try:
                if cell.value:
                    max_length = max(max_length, len(str(cell.value)))
            except:
                pass
        
        # Set width with min/max constraints
        adjusted_width = min(max(max_length + 2, 10), 50)
        ws.column_dimensions[column_letter].width = adjusted_width
    
    # Save workbook
    wb.save(str(excel_path))
    
    print(f"\n[OK] Excel file created: {excel_path}")
    print(f"Size: {os.path.getsize(excel_path) / 1024:.1f} KB")
    print(f"{'='*60}\n")
    
    return str(excel_path)


def pdf_to_excel_pymupdf_fallback(pdf_path, output_dir=None):
    """
    Ultra-fast fallback using only PyMuPDF text extraction
    No table detection - just extracts all text
    """
    if output_dir is None:
        output_dir = os.path.dirname(pdf_path) or '.'
    
    print("Using ultra-fast PyMuPDF text extraction...")
    
    import fitz
    doc = fitz.open(pdf_path)
    
    # Create Excel workbook
    excel_name = Path(pdf_path).stem + '.xlsx'
    excel_path = Path(output_dir) / excel_name
    
    wb = Workbook()
    ws = wb.active
    ws.title = 'Extracted Text'
    
    # Add header
    ws['A1'] = 'Page'
    ws['B1'] = 'Content'
    ws['A1'].font = Font(bold=True)
    ws['B1'].font = Font(bold=True)
    
    current_row = 2
    
    # Extract text from each page
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text()
        
        if text.strip():
            ws.cell(row=current_row, column=1, value=page_num)
            ws.cell(row=current_row, column=2, value=text.strip())
            current_row += 1
    
    doc.close()
    
    # Auto-adjust columns
    ws.column_dimensions['A'].width = 10
    ws.column_dimensions['B'].width = 100
    
    wb.save(str(excel_path))
    
    print(f"[OK] Text extracted to Excel: {excel_path}")
    return str(excel_path)


def convert_pdf_to_excel_optimized(pdf_path, output_dir=None):
    """
    Main conversion function with intelligent fallback
    Fast → Ultra-fast fallback
    """
    try:
        # Try fast tabula-based conversion first
        return pdf_to_excel_fast(pdf_path, output_dir)
    except Exception as e:
        print(f"Fast converter failed: {e}")
        print("Falling back to ultra-fast text extraction...")
        
        try:
            # Fallback to simple text extraction
            return pdf_to_excel_pymupdf_fallback(pdf_path, output_dir)
        except Exception as e2:
            print(f"All converters failed: {e2}")
            raise


if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        output_dir = sys.argv[2] if len(sys.argv) > 2 else None
        result = convert_pdf_to_excel_optimized(input_file, output_dir)
        print(f"Result: {result}")
    else:
        print("Usage: python pdf_to_excel_fast.py <input.pdf> [output_dir]")
