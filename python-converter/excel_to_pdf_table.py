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


def convert_excel_to_pdf_table(excel_path, output_path, account_info=None):
    print(f"\n[ Custom Layout ] Generating {os.path.basename(output_path)} ...")

    # Load Excel
    df = pd.read_excel(excel_path)
    num_cols = len(df.columns)

    # PDF setup
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=10 * mm,
        leftMargin=10 * mm,
        topMargin=10 * mm,
        bottomMargin=10 * mm,
    )

    styles = getSampleStyleSheet()
    elements = []

    # Header
    elements.append(
        Paragraph("<b><font size=14>Bank of India</font></b>",
                  ParagraphStyle("Header", alignment=TA_CENTER, textColor=colors.blue))
    )
    elements.append(Paragraph("<font size=8><i>Relationship beyond banking</i></font>", styles["Normal"]))
    elements.append(Spacer(1, 5 * mm))

    # Account Info
    if not account_info:
        account_info = {
            "customer_id": "192136847",
            "account_holder_name": "HARINI AND THARSHINI TRADERS",
            "account_number": "826820110000461",
            "transaction_date_from": "02-03-2025",
            "transaction_date_to": "02-09-2025",
        }

    acc_text = (
        f"<b>Customer ID:</b> {account_info['customer_id']}<br/>"
        f"<b>Account Holder:</b> {account_info['account_holder_name']}<br/>"
        f"<b>Account Number:</b> {account_info['account_number']}<br/>"
        f"<b>Period:</b> {account_info['transaction_date_from']} to {account_info['transaction_date_to']}"
    )
    elements.append(Paragraph(acc_text, ParagraphStyle("Acc", fontSize=9, leading=13)))
    elements.append(Spacer(1, 5 * mm))

    # Transaction table
    table_data = [df.columns.tolist()] + df.astype(str).values.tolist()

    # Auto column widths
    widths = [max(50, 500 / num_cols) for _ in range(num_cols)]

    table = Table(table_data, colWidths=widths, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#cce0ff')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    elements.append(table)
    doc.build(elements)

    print(f"✓ Custom PDF Created: {output_path}")
    return output_path


# ──────────────────────────────────────────────────────────────
# Main unified function
# ──────────────────────────────────────────────────────────────


def convert_to_pdf_table(input_path, output_path, account_info=None, use_ilovepdf_api=False):
    """
    Automatically handles Excel/CSV and chooses between:
    - iLovePDF API (if use_ilovepdf_api=True)
    - Custom ReportLab layout (if False)
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

    return convert_excel_to_pdf_table(input_path, output_path, account_info)


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
