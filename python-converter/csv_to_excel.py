"""
CSV to Excel converter
Converts CSV files to Excel format for PDF conversion
"""

import pandas as pd
import os
from pathlib import Path

def convert_csv_to_excel(csv_path, output_dir=None):
    """
    Convert CSV to Excel (.xlsx) format
    Preserves all data and formatting
    """
    try:
        if output_dir is None:
            output_dir = os.path.dirname(csv_path) or '.'
        
        print(f"\n{'='*60}")
        print(f"CSV TO EXCEL CONVERSION")
        print(f"Input: {csv_path}")
        print(f"{'='*60}\n")
        
        # Read CSV with pandas
        print("Reading CSV file...")
        
        # Try different encodings
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        df = None
        
        for encoding in encodings:
            try:
                df = pd.read_csv(csv_path, encoding=encoding)
                print(f"  ✓ Successfully read with {encoding} encoding")
                break
            except:
                continue
        
        if df is None:
            raise RuntimeError("Could not read CSV file with any encoding")
        
        print(f"  Rows: {len(df)}, Columns: {len(df.columns)}")
        print(f"  Columns: {', '.join(df.columns.tolist()[:5])}{'...' if len(df.columns) > 5 else ''}")
        
        # Create Excel file
        base_name = os.path.splitext(os.path.basename(csv_path))[0]
        excel_path = os.path.join(output_dir, f"{base_name}.xlsx")
        
        print(f"\nCreating Excel file...")
        
        # Write to Excel with formatting
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Sheet1', index=False)
            
            # Auto-adjust column widths
            worksheet = writer.sheets['Sheet1']
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = min(max_length + 2, 50)
                worksheet.column_dimensions[column_letter].width = adjusted_width
            
            # Add borders to all cells
            from openpyxl.styles import Border, Side
            thin_border = Border(
                left=Side(style='thin'),
                right=Side(style='thin'),
                top=Side(style='thin'),
                bottom=Side(style='thin')
            )
            
            for row in worksheet.iter_rows(min_row=1, max_row=len(df)+1, 
                                          min_col=1, max_col=len(df.columns)):
                for cell in row:
                    cell.border = thin_border
            
            # Bold header row
            from openpyxl.styles import Font
            for cell in worksheet[1]:
                cell.font = Font(bold=True)
        
        print(f"  ✓ Excel file created: {excel_path}")
        print(f"\n{'='*60}")
        print(f"✓ CSV to Excel conversion complete!")
        print(f"{'='*60}\n")
        
        return excel_path
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        csv_file = sys.argv[1]
        result = convert_csv_to_excel(csv_file)
        print(f"Result: {result}")
