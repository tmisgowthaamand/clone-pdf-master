import streamlit as st
import fitz  # PyMuPDF
import os
import tempfile
import zipfile
from PIL import Image
import io

st.set_page_config(
    page_title="PDF to JPG - iLovePDF Clone",
    page_icon="🖼️",
    layout="wide"
)

st.title("🖼️ **PDF to JPG Converter**")
st.markdown("### _Powered by PyMuPDF • Like **iLovePDF** but **Local & Unlimited**_")

# Sidebar
with st.sidebar:
    st.header("Quick Start")
    st.markdown("""
    1. **Upload** one or more `.pdf` files
    2. **Click Convert**
    3. **Download ZIP** with high-quality JPGs
    """)
    st.info("**Pro Tip**: Each page → separate JPG (300 DPI, full color)!")

uploaded_files = st.file_uploader(
    "Upload PDF Files",
    type=["pdf"],
    accept_multiple_files=True,
    help="Multiple files • No size limit"
)

if uploaded_files:
    if st.button("CONVERT TO JPG", type="primary", use_container_width=True):
        with st.spinner("Converting pages to JPG..."):
            with tempfile.TemporaryDirectory() as tmpdir:
                all_jpg_paths = []
                progress_bar = st.progress(0)
                status_text = st.empty()
                total_pages = sum(len(fitz.open(file)) for file in uploaded_files)
                processed = 0

                for idx, uploaded_file in enumerate(uploaded_files):
                    pdf_path = os.path.join(tmpdir, uploaded_file.name)
                    with open(pdf_path, "wb") as f:
                        f.write(uploaded_file.getvalue())

                    doc = fitz.open(pdf_path)
                    for page_num in range(len(doc)):
                        page = doc.load_page(page_num)
                        pix = page.get_pixmap(dpi=300)  # 300 DPI
                        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

                        jpg_filename = f"{os.path.splitext(uploaded_file.name)[0]}_page_{page_num+1}.jpg"
                        jpg_path = os.path.join(tmpdir, jpg_filename)
                        img.save(jpg_path, "JPEG", quality=95)
                        all_jpg_paths.append(jpg_path)

                        processed += 1
                        progress_bar.progress(processed / total_pages)
                        status_text.text(f"Converting: {jpg_filename}")

                status_text.text("All done!")

                if all_jpg_paths:
                    zip_path = os.path.join(tmpdir, 'pdf_to_jpg.zip')
                    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                        for jpg_path in all_jpg_paths:
                            zipf.write(jpg_path, os.path.basename(jpg_path))

                    with open(zip_path, 'rb') as f:
                        st.download_button(
                            label=f"Download {len(all_jpg_paths)} JPGs (ZIP)",
                            data=f.read(),
                            file_name=f"{len(all_jpg_paths)}_PDF_to_JPG.zip",
                            mime="application/zip",
                            use_container_width=True
                        )
                    st.balloons()
                    st.success(f"Converted {len(all_jpg_paths)} pages to high-quality JPGs!")
                else:
                    st.error("Conversion failed.")

# Footer
st.markdown("---")
st.markdown("*Made with Love by Grok • **100% Offline** • **Exact iLovePDF Quality**")
