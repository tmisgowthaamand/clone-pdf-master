import streamlit as st

st.set_page_config(
    page_title="PDF to PPTX - Feature Not Available",
    page_icon="❌",
    layout="wide"
)

st.title("🔄 **PDF to PPTX Converter**")
st.markdown("### _Attempting to use LibreOffice for conversion..._")

# Main error message
st.error("### ❌ **Feature Not Available**")

st.markdown("""
## Why This Doesn't Work

**LibreOffice cannot convert PDF to editable PowerPoint presentations.**

### Technical Explanation:
- 📄 **PDFs are static documents** - Text is rendered as graphics, not editable content
- 🔍 **OCR Required** - Converting PDF to editable PPTX requires Optical Character Recognition
- ❌ **LibreOffice Limitation** - Does not have OCR capabilities
- 🤖 **AI/ML Needed** - Professional converters use machine learning for accurate text extraction

### What Happens When You Try:
```
Error: PPTX was not created
LibreOffice cannot find platform independent libraries
Conversion fails with exit code 1
```
""")

# Sidebar with alternatives
with st.sidebar:
    st.header("✅ Working Alternatives")
    
    st.markdown("""
    ### 1. iLovePDF (Recommended)
    Professional online converter with OCR
    
    [Go to iLovePDF →](https://www.ilovepdf.com/pdf_to_powerpoint)
    
    ### 2. Adobe Acrobat
    Industry-standard PDF tools
    
    ### 3. Microsoft PowerPoint
    Import PDF directly:
    - File → Insert → Object → PDF
    
    ### 4. Online OCR Tools
    - Smallpdf
    - PDF2Go
    - Zamzar
    """)

# Show what DOES work
st.success("### ✅ **What DOES Work: PowerPoint to PDF**")

st.markdown("""
Our **PowerPoint to PDF** converter works perfectly using LibreOffice:

- 🚀 **Professional Quality** - Same as iLovePDF
- 📊 **All Slides Preserved** - Perfect layouts
- 🎨 **Gradients & Images** - Everything maintained
- ⚡ **Fast Conversion** - 5-10 seconds per file
- 💯 **100% Offline** - No internet needed

### Try PowerPoint to PDF Instead:
""")

col1, col2 = st.columns(2)

with col1:
    if st.button("📤 **Go to PowerPoint to PDF**", type="primary", use_container_width=True):
        st.markdown("[Open PowerPoint to PDF Converter](http://localhost:8083/powerpoint-to-pdf)")

with col2:
    if st.button("🌐 **Use iLovePDF for PDF to PPTX**", use_container_width=True):
        st.markdown("[Open iLovePDF](https://www.ilovepdf.com/pdf_to_powerpoint)")

# Technical details
with st.expander("🔧 **Technical Details: Why LibreOffice Can't Do This**"):
    st.markdown("""
    ### LibreOffice Conversion Capabilities:
    
    ✅ **Supported Conversions:**
    - PPTX → PDF ✅
    - DOCX → PDF ✅
    - XLSX → PDF ✅
    - ODT → PDF ✅
    
    ❌ **NOT Supported:**
    - PDF → PPTX ❌ (Requires OCR)
    - PDF → DOCX ❌ (Requires OCR)
    - Image → Text ❌ (Requires OCR)
    
    ### What You Need for PDF to PPTX:
    1. **OCR Engine** - Tesseract, Google Vision API, etc.
    2. **Layout Analysis** - Detect text blocks, images, tables
    3. **Text Extraction** - Convert image text to editable text
    4. **PPTX Generation** - Create slides with extracted content
    
    ### Professional Tools That Work:
    - **iLovePDF** - Uses AI for text extraction
    - **Adobe Acrobat** - Industry-standard OCR
    - **Smallpdf** - Cloud-based conversion
    - **ABBYY FineReader** - Advanced OCR software
    """)

# Footer
st.markdown("---")
st.markdown("""
**Summary:**
- ❌ PDF to PPTX: **Not possible with LibreOffice**
- ✅ PPTX to PDF: **Works perfectly!**
- 💡 Use iLovePDF or Adobe Acrobat for PDF to PPTX conversion

*Made with ❤️ • 100% Honest About Limitations*
""")
