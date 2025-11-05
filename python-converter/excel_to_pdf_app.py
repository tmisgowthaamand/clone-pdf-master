import streamlit as st
import subprocess
import os
import tempfile
import zipfile
from pathlib import Path
import sys

# Add current directory to path to import app functions
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from excel_to_pdf_professional import convert_excel_to_pdf_ilovepdf_quality
from csv_to_excel import convert_csv_to_excel

st.set_page_config(
    page_title="Excel to PDF - iLovePDF Clone",
    page_icon="📊",
    layout="wide"
)

st.title("📊 **Excel to PDF Converter**")
st.markdown("### _**EXACT iLovePDF Quality** • Pixel-Perfect • Bank Statement Ready_")

# Sidebar
with st.sidebar:
    st.header("📋 Quick Start")
    st.markdown("""
    1. **Upload** Excel (`.xlsx`, `.xls`) or CSV (`.csv`) files
    2. **Click Convert**
    3. **Download ZIP** with perfect PDFs
    """)
    st.success("✨ **Bank Statement Ready**")
    st.markdown("""
    **Supported Formats:**
    - 📊 Excel (.xlsx, .xls)
    - 📄 CSV (.csv)
    
    **Preserves:**
    - 🏦 Bank logos & images
    - 📊 Table headers (Sr No, Date, Remarks, etc.)
    - 🎨 Colors, borders & fonts
    - 📐 Exact column widths
    - 💰 Currency formatting
    """)

uploaded_files = st.file_uploader(
    "📤 **Upload Excel or CSV Files**",
    type=["xlsx", "xls", "csv"],
    accept_multiple_files=True,
    help="Supports Excel (.xlsx, .xls) and CSV (.csv) files • Multiple files • No size limit"
)

if uploaded_files:
    if st.button("🚀 **CONVERT TO PDF**", type="primary", use_container_width=True):
        with st.spinner("Converting Excel to PDF..."):
            with tempfile.TemporaryDirectory() as tmpdir:
                excel_paths = []
                for uploaded_file in uploaded_files:
                    excel_path = os.path.join(tmpdir, uploaded_file.name)
                    with open(excel_path, "wb") as f:
                        f.write(uploaded_file.getvalue())
                    excel_paths.append(excel_path)

                progress_bar = st.progress(0)
                status_text = st.empty()
                pdf_paths = []

                # LibreOffice path for Windows
                libreoffice_path = r'C:\Program Files\LibreOffice\program\soffice.exe'
                
                if not os.path.exists(libreoffice_path):
                    st.error(f"❌ LibreOffice not found at: {libreoffice_path}")
                    st.info("Please install LibreOffice from: https://www.libreoffice.org/download/download/")
                    st.stop()

                for i, excel_path in enumerate(excel_paths):
                    status_text.text(f"Converting: {os.path.basename(excel_path)}")
                    
                    try:
                        # Check if CSV file - convert to Excel first
                        if excel_path.lower().endswith('.csv'):
                            status_text.text(f"📊 Converting CSV to Excel: {os.path.basename(excel_path)}")
                            excel_path = convert_csv_to_excel(excel_path, tmpdir)
                            if not excel_path or not os.path.exists(excel_path):
                                st.warning(f"⚠️ Could not convert CSV: {os.path.basename(excel_path)}")
                                continue
                            st.info(f"✓ CSV converted to Excel: {os.path.basename(excel_path)}")
                        
                        # Use professional converter - EXACT iLovePDF quality
                        status_text.text(f"⚡ Converting with iLovePDF quality (Microsoft Excel): {os.path.basename(excel_path)}")
                        
                        # Convert with native Excel rendering (pixel-perfect)
                        pdf_path = convert_excel_to_pdf_ilovepdf_quality(excel_path, tmpdir)
                        
                        if pdf_path and os.path.exists(str(pdf_path)):
                            pdf_paths.append(str(pdf_path))
                            st.success(f"✅ Converted: {os.path.basename(excel_path)} (iLovePDF quality - pixel perfect!)")
                        else:
                            st.warning(f"⚠️ Could not convert: {os.path.basename(excel_path)}")
                            
                    except subprocess.TimeoutExpired:
                        st.warning(f"⚠️ Timeout for: {os.path.basename(excel_path)}")
                    except Exception as e:
                        st.warning(f"⚠️ Error converting {os.path.basename(excel_path)}: {str(e)}")

                    progress_bar.progress((i + 1) / len(excel_paths))

                status_text.text("✅ **All done!**")

                if pdf_paths:
                    zip_path = os.path.join(tmpdir, 'excel_to_pdf.zip')
                    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                        for pdf_path in pdf_paths:
                            zipf.write(pdf_path, os.path.basename(pdf_path))

                    with open(zip_path, 'rb') as f:
                        st.download_button(
                            label=f"📥 **Download {len(pdf_paths)} PDFs (ZIP)**",
                            data=f.read(),
                            file_name=f"{len(pdf_paths)}_Excel_to_PDF.zip",
                            mime="application/zip",
                            use_container_width=True
                        )
                    st.balloons()
                    st.success(f"🎉 **Success!** Converted {len(pdf_paths)} files! Print-ready PDFs.")
                else:
                    st.error("❌ Conversion failed. Ensure LibreOffice is installed.")

# Footer
st.markdown("---")
st.markdown("*Made with ❤️ • **Powered by LibreOffice** • **100% Offline** • **Exact iLovePDF Quality**")
