import streamlit as st
import os
import tempfile
import zipfile
from pathlib import Path
from pdf2docx import Converter

st.set_page_config(
    page_title="PDF to Word - pdf2docx",
    page_icon="📄",
    layout="wide"
)

st.title("📄 **PDF to Word (DOCX) Converter**")
st.markdown("### _Powered by pdf2docx • Preserves Layout, Images & Tables_")

# Sidebar
with st.sidebar:
    st.header("Quick Start")
    st.markdown("""
    1. **Upload** one or more `.pdf` files
    2. **Click Convert**
    3. **Download ZIP** with editable DOCX files
    """)
    st.info("**Features**: Layout preservation, images, tables, and formatting!")

# Info banner
st.info("""
🎯 **Better than basic text extraction!**

This converter uses **pdf2docx** library which:
- ✅ Preserves layout and formatting
- ✅ Extracts images and embeds them
- ✅ Maintains tables structure
- ✅ Keeps fonts and colors (where possible)
- ⚠️ Not as advanced as Adobe/iLovePDF (no OCR for scanned PDFs)
""")

uploaded_files = st.file_uploader(
    "Upload PDF Files",
    type=["pdf"],
    accept_multiple_files=True,
    help="Multiple files • Works best with text-based PDFs"
)

if uploaded_files:
    if st.button("🚀 CONVERT TO WORD", type="primary", use_container_width=True):
        with st.spinner("Converting to editable DOCX..."):
            with tempfile.TemporaryDirectory() as tmpdir:
                pdf_paths = []
                for uploaded_file in uploaded_files:
                    pdf_path = os.path.join(tmpdir, uploaded_file.name)
                    with open(pdf_path, "wb") as f:
                        f.write(uploaded_file.getvalue())
                    pdf_paths.append(pdf_path)

                progress_bar = st.progress(0)
                status_text = st.empty()
                docx_paths = []

                for i, pdf_path in enumerate(pdf_paths):
                    try:
                        status_text.text(f"Converting: {os.path.basename(pdf_path)}")
                        
                        # Output path
                        docx_path = pdf_path.replace('.pdf', '.docx')
                        
                        # Convert using pdf2docx
                        cv = Converter(pdf_path)
                        cv.convert(docx_path, start=0, end=None)
                        cv.close()
                        
                        if os.path.exists(docx_path):
                            docx_paths.append(docx_path)
                    
                    except Exception as e:
                        st.warning(f"Failed to convert {os.path.basename(pdf_path)}: {str(e)}")
                    
                    progress_bar.progress((i + 1) / len(pdf_paths))

                status_text.text("✅ All done!")

                if docx_paths:
                    if len(docx_paths) == 1:
                        # Single file - direct download
                        with open(docx_paths[0], 'rb') as f:
                            st.download_button(
                                label=f"📥 Download {os.path.basename(docx_paths[0])}",
                                data=f.read(),
                                file_name=os.path.basename(docx_paths[0]),
                                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                use_container_width=True
                            )
                    else:
                        # Multiple files - ZIP download
                        zip_path = os.path.join(tmpdir, 'pdf_to_word.zip')
                        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                            for docx_path in docx_paths:
                                zipf.write(docx_path, os.path.basename(docx_path))

                        with open(zip_path, 'rb') as f:
                            st.download_button(
                                label=f"📥 Download {len(docx_paths)} DOCX Files (ZIP)",
                                data=f.read(),
                                file_name=f"{len(docx_paths)}_PDF_to_WORD.zip",
                                mime="application/zip",
                                use_container_width=True
                            )
                    
                    st.balloons()
                    st.success(f"🎉 Converted {len(docx_paths)} files! Open in Microsoft Word or Google Docs.")
                else:
                    st.error("❌ Conversion failed for all files.")

# Footer
st.markdown("---")
st.markdown("*Made with ❤️ • **100% Offline** • **Better Layout Preservation***")