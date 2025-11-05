import streamlit as st
from PIL import Image
import os
import tempfile
import io

st.set_page_config(
    page_title="JPG to PDF - iLovePDF Clone (No ZIP)",
    page_icon="📄",
    layout="wide"
)

st.title("📄 JPG to PDF Converter")
st.markdown("### _Like **iLovePDF** – **No ZIP, Direct PDF Download**_")

# Sidebar
with st.sidebar:
    st.header("Quick Start")
    st.markdown("""
    1. **Upload** one or more `.jpg` / `.jpeg` files
    2. **Click Convert**
    3. **Download each PDF directly**
    """)
    st.info("**No ZIP** – Click any **Download PDF** button!")

uploaded_files = st.file_uploader(
    "Upload JPG/JPEG Files",
    type=["jpg", "jpeg"],
    accept_multiple_files=True,
    help="Multiple images → Multiple direct PDFs"
)

if uploaded_files:
    if st.button("CONVERT TO PDF", type="primary", use_container_width=True):
        with st.spinner("Converting JPGs to PDF..."):
            pdf_data_list = []
            progress_bar = st.progress(0)

            for i, uploaded_file in enumerate(uploaded_files):
                # Open and convert image
                img = Image.open(uploaded_file)
                if img.mode != 'RGB':
                    img = img.convert('RGB')

                # Save to in-memory bytes
                pdf_bytes = io.BytesIO()
                img.save(pdf_bytes, format="PDF", resolution=300.0)
                pdf_bytes.seek(0)

                # Store for display
                pdf_name = os.path.splitext(uploaded_file.name)[0] + ".pdf"
                pdf_data_list.append((pdf_name, pdf_bytes.getvalue()))

                progress_bar.progress((i + 1) / len(uploaded_files))

            st.success(f"✅ Converted {len(pdf_data_list)} images!")
            st.balloons()

            # Display individual download buttons
            st.markdown("### **Your PDFs – Click to Download**")
            cols = st.columns(3)  # 3 per row – clean layout
            for idx, (pdf_name, pdf_bytes) in enumerate(pdf_data_list):
                with cols[idx % 3]:
                    st.download_button(
                        label=f"📥 Download {pdf_name}",
                        data=pdf_bytes,
                        file_name=pdf_name,
                        mime="application/pdf",
                        use_container_width=True
                    )

# Footer
st.markdown("---")
st.markdown("*Made with Love • **100% Offline** • **No ZIP Files**")
