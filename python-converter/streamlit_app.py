import streamlit as st
import subprocess
import os
import tempfile
import zipfile
from pathlib import Path

# Add LibreOffice to PATH automatically
libreoffice_path = r"C:\Program Files\LibreOffice\program"
if libreoffice_path not in os.environ.get('PATH', ''):
    os.environ['PATH'] = libreoffice_path + os.pathsep + os.environ.get('PATH', '')

st.set_page_config(
    page_title="PPTX to PDF - iLovePDF Clone",
    page_icon="🔄",
    layout="wide"
)

st.title("🔄 **PPTX to PDF Converter**")
st.markdown("### _Powered by LibreOffice • Like **iLovePDF** but **Local & Unlimited**_ ✨")

# Sidebar for instructions
with st.sidebar:
    st.header("📋 Quick Start")
    st.markdown("""
    1. **Upload** one or more `.pptx` files
    2. **Click Convert**
    3. **Download ZIP** with all PDFs
    """)
    st.info("**Pro Tip**: LibreOffice ensures **exact** layouts, fonts & images!")

uploaded_files = st.file_uploader(
    "📤 **Upload PPTX Files**",
    type=["pptx"],
    accept_multiple_files=True,
    help="Supports multiple files • Max size per file: Unlimited!"
)

if uploaded_files:
    if st.button("🚀 **CONVERT TO PDF**", type="primary", use_container_width=True):
        with st.spinner("Converting... This takes ~5-30s per file"):
            with tempfile.TemporaryDirectory() as tmpdir:
                # Save uploaded files
                pptx_paths = []
                for uploaded_file in uploaded_files:
                    pptx_path = os.path.join(tmpdir, uploaded_file.name)
                    with open(pptx_path, "wb") as f:
                        f.write(uploaded_file.getvalue())
                    pptx_paths.append(pptx_path)

                # Conversion progress
                progress_bar = st.progress(0)
                status_text = st.empty()

                # Convert each PPTX to PDF
                pdf_paths = []
                for i, pptx_path in enumerate(pptx_paths):
                    status_text.text(f"Converting: {os.path.basename(pptx_path)}")
                    
                    # Use full path to soffice.exe
                    soffice_exe = r"C:\Program Files\LibreOffice\program\soffice.exe"
                    
                    cmd = [
                        soffice_exe,
                        '--headless',
                        '--invisible',
                        '--nodefault',
                        '--nofirststartwizard',
                        '--convert-to', 'pdf',
                        pptx_path,
                        '--outdir', tmpdir
                    ]
                    
                    try:
                        # Check if LibreOffice exists
                        if not os.path.exists(soffice_exe):
                            st.error(f"❌ LibreOffice not found at: {soffice_exe}")
                            st.markdown("""
                            **Please install LibreOffice:**
                            1. Download: https://www.libreoffice.org/download/download/
                            2. Install to default location
                            3. Restart this app
                            """)
                            break
                        
                        # Run conversion
                        result = subprocess.run(
                            cmd,
                            capture_output=True,
                            text=True,
                            timeout=120  # 2 min timeout per file
                        )
                        
                        # Check for PDF output
                        pdf_path = pptx_path.replace('.pptx', '.pdf')
                        
                        if result.returncode == 0 and os.path.exists(pdf_path):
                            pdf_paths.append(pdf_path)
                            st.success(f"✅ Converted: {os.path.basename(pptx_path)} → {os.path.getsize(pdf_path) // 1024}KB")
                        else:
                            st.error(f"❌ Failed: {os.path.basename(pptx_path)}")
                            if result.stderr:
                                with st.expander("Show error details"):
                                    st.code(result.stderr)
                            if result.stdout:
                                with st.expander("Show output"):
                                    st.code(result.stdout)
                                    
                    except subprocess.TimeoutExpired:
                        st.error(f"⏱️ Timeout: {os.path.basename(pptx_path)} (took > 2 minutes)")
                    except Exception as e:
                        st.error(f"❌ Error: {str(e)}")
                        break
                    
                    progress_bar.progress((i + 1) / len(pptx_paths))

                status_text.text("✅ **All done!**")

                if pdf_paths:
                    # Create ZIP
                    zip_path = os.path.join(tmpdir, 'pptx_to_pdfs.zip')
                    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                        for pdf_path in pdf_paths:
                            zipf.write(pdf_path, os.path.basename(pdf_path))

                    # Download button
                    with open(zip_path, 'rb') as f:
                        st.download_button(
                            label=f"📥 **Download {len(pdf_paths)} PDFs (ZIP)**",
                            data=f.read(),
                            file_name=f"{len(pdf_paths)}_pptx_to_pdfs.zip",
                            mime="application/zip",
                            use_container_width=True
                        )
                    
                    st.balloons()
                    st.success(f"🎉 **Success!** Converted {len(pdf_paths)} files perfectly.")
                else:
                    st.error("❌ Conversion failed. Ensure LibreOffice is installed & in PATH.")

# Footer
st.markdown("---")
st.markdown("*Made with ❤️ • **100% Offline** • **Exact iLovePDF Quality***")
