"""
Excel to PDF Converter – Hybrid (Custom + iLovePDF)
---------------------------------------------------
• Generates professional bank-statement PDFs (ReportLab)
• OR uses the official iLovePDF API for direct Excel→PDF conversion
• Works on Render.com (no LibreOffice needed)
"""

import os
import io
import json
import requests
import pandas as pd
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT


# ──────────────────────────────────────────────────────────────
# CONFIG: Put your iLovePDF API keys here
ILOVEPDF_PUBLIC_KEY = "YOUR_PUBLIC_KEY"
ILOVEPDF_SECRET_KEY = "YOUR_SECRET_KEY"
# ──────────────────────────────────────────────────────────────


def convert_excel_to_pdf_via_ilovepdf(excel_path, output_path):
    """
    Convert Excel → PDF using the official iLovePDF API (officepdf tool)
    Docs: https://developer.ilovepdf.com/docs/api-reference#convert-officepdf
    """
    print(f"\n[ iLovePDF API ] Uploading {os.path.basename(excel_path)} ...")

    try:
        # 1️⃣ Authenticate
        auth_url = "https://api.ilovepdf.com/v1/auth"
        auth_payload = {"public_key": ILOVEPDF_PUBLIC_KEY, "secret_key": ILOVEPDF_SECRET_KEY}
        auth_resp = requests.post(auth_url, json=auth_payload)
        auth_resp.raise_for_status()
        token = auth_resp.json()["token"]

        # 2️⃣ Create new task for Excel→PDF
        task_url = "https://api.ilovepdf.com/v1/start/officepdf"
        headers = {"Authorization": f"Bearer {token}"}
        task_resp = requests.get(task_url, headers=headers)
        task_resp.raise_for_status()
        task_data = task_resp.json()
        task_id = task_data["task"]

        # 3️⃣ Upload file
        upload_url = f"https://api.ilovepdf.com/v1/upload"
        with open(excel_path, "rb") as f:
            files = {"file": (os.path.basename(excel_path), f)}
            upload_data = {"task": task_id}
            upload_resp = requests.post(upload_url, headers=headers, files=files, data=upload_data)
        upload_resp.raise_for_status()
        file_server = upload_resp.json()["server_filename"]

        # 4️⃣ Process conversion
        process_url = f"https://api.ilovepdf.com/v1/process"
        process_data = {"task": task_id, "tool": "officepdf", "files": [{"server_filename": file_server}]}
        process_resp = requests.post(process_url, headers=headers, json=process_data)
        process_resp.raise_for_status()

        # 5️⃣ Download resulting PDF
        download_url = f"https://api.ilovepdf.com/v1/download/{task_id}"
        download_resp = requests.get(download_url, headers=headers)
        download_resp.raise_for_status()

        # Save PDF locally
        with open(output_path, "wb") as f:
            f.write(download_resp.content)

        print(f"✓ iLovePDF Conversion Done: {output_path}")
        return output_path

    except Exception as e:
        print(f"✗ iLovePDF API failed: {e}")
        return None


# ──────────────────────────────────────────────────────────────
# Your existing ReportLab "Bank Statement Style" code
# (slightly trimmed and simplified for readability)
# ──────────────────────────────────────────────────────────────


def convert_excel_to_pdf_table(excel_path, output_path, account_info=None, logo_path=None):
    """
    Convert Excel to PDF with professional bank statement formatting
    Includes: Header with logo, customer details, and formatted transaction table
    """
    print(f"\n[ Custom Layout ] Generating {os.path.basename(output_path)} ...")

    # Load Excel
    df = pd.read_excel(excel_path)
    num_cols = len(df.columns)

    # Determine page orientation based on number of columns
    from reportlab.lib.pagesizes import A4, landscape
    if num_cols > 5:
        pagesize = landscape(A4)
        print(f"Using landscape orientation for {num_cols} columns")
    else:
        pagesize = A4

    # PDF setup
    doc = SimpleDocTemplate(
        output_path,
        pagesize=pagesize,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    styles = getSampleStyleSheet()
    elements = []

    # ============ HEADER SECTION ============
    from reportlab.platypus import Image as RLImage
    from reportlab.lib.utils import ImageReader
    
    # Create header with logo and bank name
    header_data = []
    
    # If logo is provided, add it to the header
    if logo_path and os.path.exists(logo_path):
        try:
            logo = RLImage(logo_path, width=40*mm, height=15*mm)
            bank_name = Paragraph(
                "<b><font size=16 color='#003366'>Bank Statement</font></b><br/>"
                "<font size=9><i>Relationship beyond banking</i></font>",
                ParagraphStyle("BankName", alignment=TA_LEFT, leading=14)
            )
            header_table = Table([[logo, bank_name]], colWidths=[45*mm, 120*mm])
            header_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                ('ALIGN', (1, 0), (1, 0), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            elements.append(header_table)
        except Exception as e:
            print(f"Warning: Could not load logo: {e}")
            # Fallback to text-only header
            elements.append(
                Paragraph("<b><font size=16 color='#003366'>Bank Statement</font></b>",
                          ParagraphStyle("Header", alignment=TA_CENTER, textColor=colors.HexColor('#003366')))
            )
    else:
        # Text-only header
        elements.append(
            Paragraph("<b><font size=16 color='#003366'>Bank Statement</font></b>",
                      ParagraphStyle("Header", alignment=TA_CENTER, textColor=colors.HexColor('#003366')))
        )
        elements.append(
            Paragraph("<font size=9><i>Relationship beyond banking</i></font>",
                      ParagraphStyle("Tagline", alignment=TA_CENTER, fontSize=9))
        )
    
    elements.append(Spacer(1, 8 * mm))

    # ============ CUSTOMER DETAILS SECTION ============
    # Get current date for statement generation
    current_date = datetime.now().strftime("%d-%m-%Y")
    
    # Account Info
    if not account_info:
        account_info = {
            "customer_id": "192136847",
            "account_holder_name": "HARINI AND THARSHINI TRADERS",
            "account_number": "826820110000461",
            "transaction_date_from": "02-03-2025",
            "transaction_date_to": "02-09-2025",
            "statement_date": current_date,
        }
    else:
        # Ensure statement_date is present
        if "statement_date" not in account_info:
            account_info["statement_date"] = current_date

    # Create customer details section with better formatting
    customer_style = ParagraphStyle(
        "CustomerDetails",
        fontSize=9,
        leading=14,
        textColor=colors.HexColor('#333333'),
        leftIndent=5,
    )
    
    customer_details = [
        ["<b>Statement Date:</b>", account_info.get('statement_date', current_date)],
        ["<b>Customer ID:</b>", account_info.get('customer_id', 'N/A')],
        ["<b>Account Holder:</b>", account_info.get('account_holder_name', 'N/A')],
        ["<b>Account Number:</b>", account_info.get('account_number', 'N/A')],
        ["<b>Transaction Period:</b>", f"{account_info.get('transaction_date_from', 'N/A')} to {account_info.get('transaction_date_to', 'N/A')}"],
    ]
    
    # Convert to paragraphs for better rendering
    customer_table_data = []
    for label, value in customer_details:
        customer_table_data.append([
            Paragraph(label, customer_style),
            Paragraph(str(value), customer_style)
        ])
    
    customer_table = Table(customer_table_data, colWidths=[50*mm, 120*mm])
    customer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f5f5f5')),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cccccc')),
    ]))
    
    elements.append(customer_table)
    elements.append(Spacer(1, 8 * mm))

    # ============ TRANSACTION TABLE SECTION ============
    # Add section title
    elements.append(
        Paragraph("<b><font size=11 color='#003366'>Transaction Details</font></b>",
                  ParagraphStyle("SectionTitle", alignment=TA_LEFT, textColor=colors.HexColor('#003366')))
    )
    elements.append(Spacer(1, 3 * mm))

    # Prepare table data
    table_data = [df.columns.tolist()] + df.astype(str).values.tolist()

    # Calculate column widths based on content and available space
    page_width = pagesize[0] - (30 * mm)  # Account for margins
    
    # Smart column width calculation
    col_widths = []
    for col_idx, col_name in enumerate(df.columns):
        # Get max length in column
        max_len = len(str(col_name))
        for val in df.iloc[:, col_idx].astype(str):
            max_len = max(max_len, len(val))
        
        # Calculate width (with min and max constraints)
        width = min(max(max_len * 2.5, 20), 100)
        col_widths.append(width)
    
    # Normalize widths to fit page
    total_width = sum(col_widths)
    col_widths = [w * page_width / total_width for w in col_widths]

    # Create table with enhanced styling
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    # Apply professional table styling
    table_style = TableStyle([
        # Header row styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        
        # Data rows styling
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        
        # Alternating row colors for better readability
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')]),
        
        # Grid and borders
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#003366')),
        
        # Padding
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        
        # Vertical alignment
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ])
    
    # Special alignment for numeric columns (Debit, Credit, Balance)
    for col_idx, col_name in enumerate(df.columns):
        col_name_lower = str(col_name).lower()
        if any(keyword in col_name_lower for keyword in ['debit', 'credit', 'balance', 'amount', 'sr', 'no']):
            table_style.add('ALIGN', (col_idx, 1), (col_idx, -1), 'RIGHT')
    
    table.setStyle(table_style)
    elements.append(table)
    
    # Add footer with page numbers
    elements.append(Spacer(1, 5 * mm))
    footer_text = f"<font size=7 color='#666666'>Generated on {current_date} | This is a computer-generated statement</font>"
    elements.append(Paragraph(footer_text, ParagraphStyle("Footer", alignment=TA_CENTER, fontSize=7)))

    # Build PDF
    doc.build(elements)

    print(f"✓ Custom PDF Created: {output_path}")
    print(f"  - Columns: {num_cols}")
    print(f"  - Rows: {len(df)}")
    print(f"  - Orientation: {'Landscape' if num_cols > 5 else 'Portrait'}")
    return output_path


# ──────────────────────────────────────────────────────────────
# Main unified function
# ──────────────────────────────────────────────────────────────


def convert_to_pdf_table(input_path, output_path, account_info=None, logo_path=None, use_ilovepdf_api=False):
    """
    Automatically handles Excel/CSV and chooses between:
    - iLovePDF API (if use_ilovepdf_api=True)
    - Custom ReportLab layout (if False)
    
    Parameters:
    - input_path: Path to Excel or CSV file
    - output_path: Path for output PDF
    - account_info: Dictionary with customer details (optional)
    - logo_path: Path to bank logo image (optional)
    - use_ilovepdf_api: Use iLovePDF API instead of ReportLab (default: False)
    """
    if input_path.lower().endswith('.csv'):
        df = pd.read_csv(input_path)
        tmp_excel = input_path.replace(".csv", ".xlsx")
        df.to_excel(tmp_excel, index=False)
        input_path = tmp_excel

    if use_ilovepdf_api:
        result = convert_excel_to_pdf_via_ilovepdf(input_path, output_path)
        if result:
            return result
        else:
            print("⚠️ Falling back to local ReportLab rendering...")

    return convert_excel_to_pdf_table(input_path, output_path, account_info, logo_path)


# ──────────────────────────────────────────────────────────────
# Command-line execution
# ──────────────────────────────────────────────────────────────


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python excel_to_pdf.py <excel_or_csv_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    if not os.path.exists(input_file):
        print(f"ERROR: File not found → {input_file}")
        sys.exit(1)

    output_file = os.path.splitext(input_file)[0] + ".pdf"

    # Choose which mode you want:
    use_ilovepdf_api = True   # ← set False to use your ReportLab layout

    result = convert_to_pdf_table(input_file, output_file, use_ilovepdf_api=use_ilovepdf_api)
    if result:
        print(f"\n✅ SUCCESS: PDF saved at {result}")
    else:
        print(f"\n❌ FAILED to create PDF.")
