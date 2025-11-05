import streamlit as st
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image, ImageDraw, ImageFont
import io
import tempfile
import os
from datetime import datetime
import base64
from pdf2image import convert_from_bytes
import streamlit.components.v1 as components
try:
    from streamlit_drawable_canvas import st_canvas
    CANVAS_AVAILABLE = True
except ImportError:
    CANVAS_AVAILABLE = False

st.set_page_config(
    page_title="Sign PDF | eSign Your PDFs Online",
    page_icon="✍️",
    layout="wide"
)

# Initialize session state
if 'pdf_bytes' not in st.session_state:
    st.session_state.pdf_bytes = None
if 'num_pages' not in st.session_state:
    st.session_state.num_pages = 0
if 'signature_image' not in st.session_state:
    st.session_state.signature_image = None
if 'typed_signature' not in st.session_state:
    st.session_state.typed_signature = ""
if 'placements' not in st.session_state:
    st.session_state.placements = []
if 'drag_position' not in st.session_state:
    st.session_state.drag_position = None
if 'placement_version' not in st.session_state:
    st.session_state.placement_version = 2  # Version 2 = correct coordinate system
    st.session_state.placements = []  # Clear old placements on version upgrade
if 'company_stamp' not in st.session_state:
    st.session_state.company_stamp = None

# Custom CSS
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(135deg, #00C4B4, #009688);
        color: white;
        padding: 40px 20px;
        text-align: center;
        border-radius: 10px;
        margin-bottom: 30px;
    }
    .step-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin: 10px 0;
    }
    .stButton>button {
        background: #00C4B4;
        color: white;
        border-radius: 5px;
        padding: 10px 20px;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown("""
<div class="main-header">
    <h1>📝 PDF Signature Tool</h1>
    <p>Sign your PDFs like iLovePDF/SmallPDF - Upload, Sign, Download!</p>
</div>
""", unsafe_allow_html=True)

st.info("✨ **Works exactly like iLovePDF!** Place signatures anywhere with pixel-perfect positioning.")

# Main Layout
col1, col2, col3 = st.columns([1, 1, 1])

# Column 1: Upload PDF
with col1:
    st.markdown('<div class="step-card">', unsafe_allow_html=True)
    st.subheader("1️⃣ Upload PDF")
    
    uploaded_file = st.file_uploader(
        "Choose a PDF file",
        type=['pdf'],
        help="Upload your PDF document to sign"
    )
    
    if uploaded_file:
        st.session_state.pdf_bytes = uploaded_file.read()
        pdf_reader = PdfReader(io.BytesIO(st.session_state.pdf_bytes))
        st.session_state.num_pages = len(pdf_reader.pages)
        st.success(f"✅ Loaded {st.session_state.num_pages} page(s)")
        st.info(f"📄 **{uploaded_file.name}**")
    
    st.markdown('</div>', unsafe_allow_html=True)

# Column 2: Create Signature
with col2:
    st.markdown('<div class="step-card">', unsafe_allow_html=True)
    st.subheader("2️⃣ Create Signature")
    
    sig_method = st.radio(
        "How to sign?",
        ["Type", "Upload", "Draw"],
        horizontal=True
    )
    
    if sig_method == "Type":
        typed_text = st.text_input(
            "Type your name",
            placeholder="John Doe",
            key="sig_text"
        )
        
        if typed_text:
            # Create signature image from text
            img = Image.new('RGBA', (400, 100), (255, 255, 255, 0))
            draw = ImageDraw.Draw(img)
            try:
                font = ImageFont.truetype("arial.ttf", 40)
            except:
                font = ImageFont.load_default()
            draw.text((20, 20), typed_text, fill=(0, 0, 0, 255), font=font)
            st.session_state.signature_image = img
            st.session_state.typed_signature = typed_text
            st.image(img, caption="Your Signature", width=200)
    
    elif sig_method == "Upload":
        sig_file = st.file_uploader(
            "Upload signature image",
            type=['png', 'jpg', 'jpeg'],
            key="sig_upload"
        )
        
        if sig_file:
            st.session_state.signature_image = Image.open(sig_file).convert("RGBA")
            st.image(st.session_state.signature_image, caption="Your Signature", width=200)
    
    else:  # Draw
        if not CANVAS_AVAILABLE:
            st.warning("⚠️ Drawing feature requires `streamlit-drawable-canvas`")
            st.code("pip install streamlit-drawable-canvas", language="bash")
            st.info("📝 For now, use Type or Upload method")
        else:
            st.write("✍️ **Draw your signature below:**")
            
            # Drawing canvas
            canvas_result = st_canvas(
                fill_color="rgba(255, 255, 255, 0)",
                stroke_width=3,
                stroke_color="#000000",
                background_color="#FFFFFF",
                height=150,
                width=400,
                drawing_mode="freedraw",
                key="signature_canvas",
            )
            
            # Convert canvas to signature image
            if canvas_result.image_data is not None:
                # Check if anything is drawn
                if canvas_result.image_data.sum() > 0:
                    # Convert to PIL Image
                    sig_img = Image.fromarray(canvas_result.image_data.astype('uint8'), 'RGBA')
                    
                    # Crop to content
                    bbox = sig_img.getbbox()
                    if bbox:
                        sig_img = sig_img.crop(bbox)
                        st.session_state.signature_image = sig_img
                        st.success("✅ Signature captured!")
                        st.image(sig_img, caption="Your Signature", width=200)
            
            if st.button("🗑️ Clear Canvas"):
                st.rerun()
    
    st.markdown('</div>', unsafe_allow_html=True)

# Company Stamp Section (below signature)
st.markdown("---")
st.markdown('<div class="step-card">', unsafe_allow_html=True)
st.subheader("🏢 Company Stamp")

col_stamp_upload, col_stamp_preview = st.columns([1, 1])

with col_stamp_upload:
    stamp_file = st.file_uploader(
        "Upload company stamp/logo",
        type=['png', 'jpg', 'jpeg'],
        key="stamp_upload",
        help="Upload your company stamp or logo"
    )
    
    if stamp_file:
        st.session_state.company_stamp = Image.open(stamp_file).convert("RGBA")
        st.success("✅ Company stamp uploaded!")

with col_stamp_preview:
    if st.session_state.company_stamp:
        st.image(st.session_state.company_stamp, caption="Company Stamp", width=120)
        
        # Quick placement buttons
        st.write("**Quick Add to PDF:**")
        btn_cols = st.columns(3)
        
        with btn_cols[0]:
            if st.button("📍 Bottom Right", key="stamp_br", use_container_width=True):
                if st.session_state.pdf_bytes:
                    st.session_state.placements.append({
                        'page': 0, 'x': 0.75, 'y': 0.88, 'width': 0.15,
                        'version': 2, 'is_stamp': True
                    })
                    st.success("✅ Added!")
                    st.rerun()
        
        with btn_cols[1]:
            if st.button("📍 Bottom Center", key="stamp_bc", use_container_width=True):
                if st.session_state.pdf_bytes:
                    st.session_state.placements.append({
                        'page': 0, 'x': 0.50, 'y': 0.88, 'width': 0.15,
                        'version': 2, 'is_stamp': True
                    })
                    st.success("✅ Added!")
                    st.rerun()
        
        with btn_cols[2]:
            if st.button("📍 Top Center", key="stamp_tc", use_container_width=True):
                if st.session_state.pdf_bytes:
                    st.session_state.placements.append({
                        'page': 0, 'x': 0.50, 'y': 0.05, 'width': 0.15,
                        'version': 2, 'is_stamp': True
                    })
                    st.success("✅ Added!")
                    st.rerun()

st.markdown('</div>', unsafe_allow_html=True)

# Column 3: Place & Settings
with col3:
    st.markdown('<div class="step-card">', unsafe_allow_html=True)
    st.subheader("3️⃣ Place Signature")
    
    if st.session_state.pdf_bytes and st.session_state.signature_image:
        page_num = st.number_input(
            "Page Number",
            min_value=1,
            max_value=st.session_state.num_pages,
            value=1
        )
        
        # Quick presets like iLovePDF
        st.write("**Quick Positions (like iLovePDF):**")
        preset_cols = st.columns(4)
        with preset_cols[0]:
            if st.button("📍 Bottom Right", use_container_width=True):
                st.session_state.preset_x = 75
                st.session_state.preset_y = 88
        with preset_cols[1]:
            if st.button("📍 Bottom Left", use_container_width=True):
                st.session_state.preset_x = 10
                st.session_state.preset_y = 88
        with preset_cols[2]:
            if st.button("📍 Top Right", use_container_width=True):
                st.session_state.preset_x = 75
                st.session_state.preset_y = 5
        with preset_cols[3]:
            if st.button("📍 Top Left", use_container_width=True):
                st.session_state.preset_x = 10
                st.session_state.preset_y = 5
        
        col_x, col_y = st.columns(2)
        with col_x:
            x_pos = st.slider("Horizontal Position (%)", 0, 100, 
                            st.session_state.get('preset_x', 50))
        with col_y:
            y_pos = st.slider("Vertical Position (%)", 0, 100, 
                            st.session_state.get('preset_y', 80))
        
        width_percent = st.slider("Signature Width (%)", 10, 50, 20)
        
        if st.button("➕ Add Signature to PDF", type="primary", use_container_width=True):
            # Y slider: 0% = top of page, 100% = bottom of page
            # Store as-is (we'll handle PDF coordinate conversion during rendering)
            new_placement = {
                'page': page_num - 1,
                'x': x_pos / 100,
                'y': y_pos / 100,  # Store UI position directly
                'width': width_percent / 100,
                'version': 2  # Mark as new coordinate system
            }
            st.session_state.placements.append(new_placement)
            st.success(f"✅ Signature added to page {page_num} (SmallPDF style)")
            st.info(f"📍 Position: X={x_pos}% from left, Y={y_pos}% from top")
            st.code(f"x={new_placement['x']:.3f}, y={new_placement['y']:.3f}, w={new_placement['width']:.3f}, v2", language="python")
    
    else:
        st.warning("⚠️ Upload PDF and create signature first")
    
    st.markdown('</div>', unsafe_allow_html=True)

# PDF Preview Section with Drag & Drop - FULL DOCUMENT
if st.session_state.pdf_bytes and (st.session_state.signature_image or st.session_state.company_stamp):
    st.markdown("---")
    st.subheader("📄 Full PDF Preview - Drag & Drop Signature/Stamp on Any Page")
    
    # Convert ALL PDF pages to images for preview
    try:
        st.info(f"📖 Loading all {st.session_state.num_pages} pages... Please wait.")
        
        # Convert all pages
        all_images = convert_from_bytes(st.session_state.pdf_bytes, dpi=150)
        
        # Create HTML for all pages
        pages_html = ""
        for idx, page_img in enumerate(all_images):
            # Convert to base64
            buffered = io.BytesIO()
            page_img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            pages_html += f"""
            <div class="pdf-page" data-page="{idx}" style="margin-bottom: 30px; page-break-after: always;">
                <div style="background: #333; color: white; padding: 10px; text-align: center; font-weight: bold; border-radius: 5px 5px 0 0;">
                    Page {idx + 1} of {st.session_state.num_pages}
                </div>
                <div style="position: relative; background: white; padding: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                    <img class="pdf-page-img" src="data:image/png;base64,{img_str}" 
                         style="display: block; width: 100%; height: auto; border: 1px solid #ddd;">
                </div>
            </div>
            """
        
        # Get signature and stamp as base64
        draggable_items_html = ""
        
        if st.session_state.signature_image:
            sig_buffered = io.BytesIO()
            st.session_state.signature_image.save(sig_buffered, format="PNG")
            sig_str = base64.b64encode(sig_buffered.getvalue()).decode()
            draggable_items_html += f"""
                <div id="signatureWrapper" class="draggable-item" style="position: fixed; top: 200px; left: 45%; transform: translateX(-50%); z-index: 1000;">
                    <img id="signature" src="data:image/png;base64,{sig_str}" 
                         style="width: 150px; cursor: move; border: 2px dashed #00C4B4; border-radius: 5px; 
                                background: rgba(255,255,255,0.95); box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: block;"
                         draggable="false">
                    <div class="resizeHandle" style="position: absolute; bottom: -5px; right: -5px; width: 20px; height: 20px; 
                                                   background: #00C4B4; border: 2px solid white; border-radius: 50%; 
                                                   cursor: nwse-resize; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
                    <div style="position: absolute; top: -25px; left: 0; background: #00C4B4; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">✍️ Signature</div>
                </div>
            """
        
        if st.session_state.company_stamp:
            stamp_buffered = io.BytesIO()
            st.session_state.company_stamp.save(stamp_buffered, format="PNG")
            stamp_str = base64.b64encode(stamp_buffered.getvalue()).decode()
            draggable_items_html += f"""
                <div id="stampWrapper" class="draggable-item" style="position: fixed; top: 200px; left: 55%; transform: translateX(-50%); z-index: 1000;">
                    <img id="stamp" src="data:image/png;base64,{stamp_str}" 
                         style="width: 150px; cursor: move; border: 2px dashed #FF6B35; border-radius: 5px; 
                                background: rgba(255,255,255,0.95); box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: block;"
                         draggable="false">
                    <div class="resizeHandle" style="position: absolute; bottom: -5px; right: -5px; width: 20px; height: 20px; 
                                                   background: #FF6B35; border: 2px solid white; border-radius: 50%; 
                                                   cursor: nwse-resize; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
                    <div style="position: absolute; top: -25px; left: 0; background: #FF6B35; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">🏢 Stamp</div>
                </div>
            """
        
        # Interactive drag-and-drop HTML/JS for FULL PDF
        drag_drop_html = f"""
        <div style="width: 100%; background: #f5f5f5; padding: 20px; border-radius: 10px;">
            <div id="pdfContainer" style="max-width: 800px; margin: 0 auto; max-height: 800px; overflow-y: auto; background: #e0e0e0; padding: 20px; border-radius: 10px;">
                {pages_html}
                {draggable_items_html}
            </div>
            <div id="coords" style="margin-top: 15px; padding: 15px; background: white; border-radius: 5px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <strong>📍 Position:</strong> 
                <span style="color: #00C4B4; font-weight: bold;">X: <span id="posX">0</span>px, Y: <span id="posY">0</span>px</span>
                <br>
                <strong>📄 Current Page:</strong> 
                <span style="color: #009688; font-weight: bold;"><span id="currentPage">1</span> of {st.session_state.num_pages}</span>
                <br>
                <strong>📏 Size:</strong> 
                <span style="color: #FF6B35; font-weight: bold;"><span id="itemWidth">150</span>px</span>
                <br>
                <strong>📐 PDF Position:</strong> 
                <span style="color: #9C27B0; font-weight: bold;">X: <span id="pdfPercX">0</span>%, Y: <span id="pdfPercY">0</span>%</span>
            </div>
        </div>
        
        <script>
        // Get all draggable items
        const draggableItems = document.querySelectorAll('.draggable-item');
        const pdfContainer = document.getElementById('pdfContainer');
        const posX = document.getElementById('posX');
        const posY = document.getElementById('posY');
        const currentPage = document.getElementById('currentPage');
        const itemWidth = document.getElementById('itemWidth');
        const pdfPercX = document.getElementById('pdfPercX');
        const pdfPercY = document.getElementById('pdfPercY');
        const pdfPages = document.querySelectorAll('.pdf-page');
        const pdfPageImages = document.querySelectorAll('.pdf-page-img');
        
        let activeItem = null;
        let isDragging = false;
        let isResizing = false;
        let offsetX, offsetY;
        let startWidth, startX, startY;
        
        // Setup drag and resize for each item
        draggableItems.forEach(wrapper => {{
            const img = wrapper.querySelector('img');
            const resizeHandle = wrapper.querySelector('.resizeHandle');
            
            // Drag functionality
            img.addEventListener('mousedown', (e) => {{
                if (e.target.classList.contains('resizeHandle')) return;
                isDragging = true;
                activeItem = {{ wrapper, img }};
                const rect = wrapper.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                img.style.cursor = 'grabbing';
            }});
            
            // Resize functionality
            if (resizeHandle) {{
                resizeHandle.addEventListener('mousedown', (e) => {{
                    e.stopPropagation();
                    isResizing = true;
                    activeItem = {{ wrapper, img }};
                    startWidth = img.offsetWidth;
                    startX = e.clientX;
                    startY = e.clientY;
                }});
            }}
            
            // Mouse wheel resize
            img.addEventListener('wheel', (e) => {{
                e.preventDefault();
                const currentWidth = img.offsetWidth;
                const newWidth = currentWidth + (e.deltaY > 0 ? -10 : 10);
                const finalWidth = Math.max(50, Math.min(500, newWidth));
                img.style.width = finalWidth + 'px';
                itemWidth.textContent = Math.round(finalWidth);
            }});
        }});
        
        document.addEventListener('mousemove', (e) => {{
            if (isDragging && activeItem) {{
                const newLeft = e.clientX - offsetX;
                const newTop = e.clientY - offsetY;
                
                activeItem.wrapper.style.left = newLeft + 'px';
                activeItem.wrapper.style.top = newTop + 'px';
                activeItem.wrapper.style.transform = 'none';
                
                // Update coordinates
                posX.textContent = Math.round(newLeft);
                posY.textContent = Math.round(newTop);
                
                // Detect which page item is over and calculate PDF position
                pdfPages.forEach((page, idx) => {{
                    const pageRect = page.getBoundingClientRect();
                    const itemRect = activeItem.wrapper.getBoundingClientRect();
                    if (itemRect.top >= pageRect.top && itemRect.top <= pageRect.bottom) {{
                        currentPage.textContent = idx + 1;
                        
                        // Calculate position relative to this page
                        const pageImg = pdfPageImages[idx];
                        if (pageImg) {{
                            const imgRect = pageImg.getBoundingClientRect();
                            const relX = itemRect.left - imgRect.left;
                            const relY = itemRect.top - imgRect.top;
                            const percX = (relX / imgRect.width) * 100;
                            const percY = (relY / imgRect.height) * 100;
                            pdfPercX.textContent = Math.round(percX);
                            pdfPercY.textContent = Math.round(percY);
                        }}
                    }}
                }});
            }}
            
            if (isResizing && activeItem) {{
                const deltaX = e.clientX - startX;
                const newWidth = Math.max(50, Math.min(500, startWidth + deltaX));
                activeItem.img.style.width = newWidth + 'px';
                itemWidth.textContent = Math.round(newWidth);
            }}
        }});
        
        document.addEventListener('mouseup', () => {{
            if (activeItem) {{
                activeItem.img.style.cursor = 'move';
            }}
            isDragging = false;
            isResizing = false;
            activeItem = null;
        }});
        </script>
        """
        
        components.html(drag_drop_html, height=1000)
        
        # Add button to capture position from preview
        col_add, col_info = st.columns([1, 2])
        with col_add:
            if st.button("✅ Add Signature at Current Position", type="primary", use_container_width=True):
                st.warning("⚠️ Use the sliders in '3️⃣ Place Signature' section above to add signature with exact position")
        
        with col_info:
            st.info("💡 **Tip:** Drag signature (blue) or stamp (orange) on PDF. Resize with corner handle or mouse wheel. Use sliders above to add with exact position.")
            
    except Exception as e:
        st.error(f"Could not generate preview: {e}")
        st.info("Install pdf2image: `pip install pdf2image poppler-utils`")

# Show added signatures
if st.session_state.placements:
    st.markdown("---")
    
    # Filter out old version placements
    valid_placements = [p for p in st.session_state.placements if p.get('version', 1) == 2]
    if len(valid_placements) < len(st.session_state.placements):
        st.warning(f"⚠️ Found {len(st.session_state.placements) - len(valid_placements)} old placements. Click 'Clear All' to remove them.")
    
    st.subheader(f"📋 Added Items ({len(valid_placements)} valid)")
    
    for idx, placement in enumerate(st.session_state.placements):
        version = placement.get('version', 1)
        is_stamp = placement.get('is_stamp', False)
        col_info, col_remove = st.columns([4, 1])
        with col_info:
            version_badge = "✅ v2" if version == 2 else "⚠️ OLD"
            item_icon = "🏢" if is_stamp else "✍️"
            item_type = "Stamp" if is_stamp else "Signature"
            st.write(f"{item_icon} **{item_type} {idx + 1}** {version_badge} - Page {placement['page'] + 1}, X: {placement['x']*100:.0f}%, Y: {placement['y']*100:.0f}% from top, Width: {placement['width']*100:.0f}%")
        with col_remove:
            if st.button("🗑️", key=f"remove_{idx}"):
                st.session_state.placements.pop(idx)
                st.rerun()
    
    # Add clear all button
    if st.button("🗑️ Clear All Signatures", type="secondary"):
        st.session_state.placements = []
        st.rerun()

# Download Section
st.markdown("---")
if st.session_state.pdf_bytes and st.session_state.placements:
    col_download, col_clear = st.columns([3, 1])
    
    with col_download:
        if st.button("📥 **Download Signed PDF**", type="primary", use_container_width=True):
            with st.spinner("Applying signatures..."):
                # Process PDF
                pdf_reader = PdfReader(io.BytesIO(st.session_state.pdf_bytes))
                pdf_writer = PdfWriter()
                
                # Group placements by page
                placements_by_page = {}
                for p in st.session_state.placements:
                    page_idx = p['page']
                    if page_idx not in placements_by_page:
                        placements_by_page[page_idx] = []
                    placements_by_page[page_idx].append(p)
                
                # Process each page
                for i, page in enumerate(pdf_reader.pages):
                    page_w = float(page.mediabox.width)
                    page_h = float(page.mediabox.height)
                    
                    if i in placements_by_page:
                        # Create overlay
                        overlay_stream = io.BytesIO()
                        c = canvas.Canvas(overlay_stream, pagesize=(page_w, page_h))
                        
                        for placement in placements_by_page[i]:
                            # Determine which image to use (signature or stamp)
                            is_stamp = placement.get('is_stamp', False)
                            image_to_use = st.session_state.company_stamp if is_stamp else st.session_state.signature_image
                            
                            if image_to_use is None:
                                continue  # Skip if image not available
                            
                            # Save image to temp file
                            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
                                image_to_use.save(tmp.name, 'PNG')
                                tmp_path = tmp.name
                            
                            try:
                                sig_img = Image.open(tmp_path)
                                sig_w, sig_h = sig_img.size
                                
                                # Calculate size
                                target_w = page_w * placement['width']
                                scale_factor = target_w / sig_w
                                target_h = sig_h * scale_factor
                                
                                # Calculate position (bottom-left origin)
                                # placement['x'] and placement['y'] are in 0-1 range from UI
                                # UI: 0 = top, 1 = bottom (Y increases downward)
                                # PDF: 0 = bottom, page_h = top (Y increases upward)
                                
                                abs_x = placement['x'] * page_w
                                
                                # Convert Y: UI measures from top, PDF measures from bottom
                                # SmallPDF behavior: Y slider position = where TOP of signature appears
                                # UI: y=0.9 (90% from top) = signature near bottom
                                # PDF: drawImage uses BOTTOM-LEFT corner, origin at page bottom
                                # 
                                # Calculation:
                                # 1. UI y position (0-1) represents distance from top as fraction
                                # 2. In PDF coords: top_edge_from_bottom = page_h * (1 - ui_y)
                                # 3. Since drawImage uses bottom-left: bottom_edge = top_edge - height
                                abs_y = page_h * (1.0 - placement['y']) - target_h
                                
                                # Debug: Print actual values
                                item_type = "STAMP" if is_stamp else "SIGNATURE"
                                print(f"DEBUG: Page {i+1} - {item_type}")
                                print(f"  - UI position: x={placement['x']:.3f}, y={placement['y']:.3f}")
                                print(f"  - Page size: w={page_w:.1f}, h={page_h:.1f}")
                                print(f"  - Image size: w={target_w:.1f}, h={target_h:.1f}")
                                print(f"  - PDF position: x={abs_x:.1f}, y={abs_y:.1f}")
                                print(f"  - Y calculation: (1-{placement['y']:.3f})*{page_h:.1f}-{target_h:.1f} = {abs_y:.1f}")
                                
                                # Draw signature
                                c.drawImage(
                                    ImageReader(tmp_path),
                                    abs_x,
                                    abs_y,
                                    width=target_w,
                                    height=target_h,
                                    mask='auto'
                                )
                            finally:
                                try:
                                    os.unlink(tmp_path)
                                except:
                                    pass
                        
                        c.save()
                        overlay_stream.seek(0)
                        
                        # Merge overlay
                        overlay_pdf = PdfReader(overlay_stream)
                        overlay_page = overlay_pdf.pages[0]
                        page.merge_page(overlay_page)
                        pdf_writer.add_page(page)
                    else:
                        pdf_writer.add_page(page)
                
                # Save to bytes
                output_stream = io.BytesIO()
                pdf_writer.write(output_stream)
                output_stream.seek(0)
                
                # Download button
                st.download_button(
                    label="💾 Download Signed PDF",
                    data=output_stream.getvalue(),
                    file_name="signed_document.pdf",
                    mime="application/pdf",
                    type="primary",
                    use_container_width=True
                )
                
                st.balloons()
                st.success("✅ Signed PDF ready for download!")
    
    with col_clear:
        if st.button("🔄 Clear All", use_container_width=True):
            st.session_state.placements = []
            st.session_state.pdf_bytes = None
            st.session_state.signature_image = None
            st.session_state.num_pages = 0
            st.rerun()

# Instructions
with st.expander("📖 How to Use"):
    st.markdown("""
    ### Step-by-Step Guide:
    
    1. **Upload PDF**: Click "Choose a PDF file" to upload your document
    2. **Create Signature**: 
       - **Type**: Enter your name to generate a signature
       - **Upload**: Upload a signature image (PNG/JPG)
       - **Draw**: Use the typing method for now
    3. **Place Signature**:
       - Select the page number
       - Adjust position using sliders
       - Set signature width
       - Click "Add Signature to PDF"
    4. **Repeat**: Add more signatures if needed (multiple pages supported)
    5. **Download**: Click "Download Signed PDF" to get your signed document
    
    ### Tips:
    - Use PNG images with transparent backgrounds for best results
    - You can add multiple signatures to different pages
    - Adjust the width slider to make signatures larger or smaller
    - Click the trash icon to remove signatures before downloading
    """)

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align:center; padding:20px; background:#f8f9fa; border-radius:10px;">
    <p>🔒 <strong>Secure & Private</strong> - Files are processed locally and never stored</p>
    <p style="color:#666;">✍️ PDF Signature Tool | Built with Streamlit</p>
</div>
""", unsafe_allow_html=True)
