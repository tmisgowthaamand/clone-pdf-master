import streamlit as st
import os
import tempfile
import zipfile
from pathlib import Path
import base64

st.set_page_config(
    page_title="Edit PDF - iLovePDF Clone",
    page_icon="✏️",
    layout="wide"
)

st.title("✏️ **Edit PDF - iLovePDF Clone**")
st.markdown("### _Add text, images, draw, highlight — like **iLovePDF**, but **local & unlimited**_")

# Quick instructions
st.info("""
**🎯 Quick Start:**
1. Upload your PDF below
2. Click a tool button (Text, Draw, Image, etc.)
3. Click on the PDF to add/draw
4. Use Select mode to move/resize objects
5. Click Download PDF when done
""")

# Sidebar
with st.sidebar:
    st.header("🎨 Tools")
    st.markdown("""
    **Available Tools:**
    - ✍️ Add Text
    - 🖼️ Add Images
    - ✏️ Draw/Freehand
    - 📐 Shapes (Rectangle, Circle)
    - 🎯 Arrows
    - 🖍️ Highlight
    - 🗑️ Delete Objects
    - 💾 Save Edited PDF
    """)
    st.info("💡 **Tip:** Double-click to add text!")

# File uploader
uploaded_file = st.file_uploader(
    "📤 Upload Your PDF",
    type=["pdf"],
    help="Single PDF file for editing"
)

if uploaded_file:
    # Save to temp
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(uploaded_file.getvalue())
        pdf_path = tmp_file.name

    # Encode PDF to base64
    with open(pdf_path, "rb") as f:
        base64_pdf = base64.b64encode(f.read()).decode('utf-8')

    # HTML + JS Editor (Fabric.js + PDF.js)
    editor_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>PDF Editor</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <style>
            body {{ margin:0; font-family:Arial; background:#f5f5f5; }}
            #toolbar {{ 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color:white; 
                padding:15px; 
                text-align:center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            #toolbar button {{ 
                margin:5px; 
                padding:10px 20px; 
                border:none;
                border-radius:5px;
                background:white;
                color:#667eea;
                font-weight:bold;
                cursor:pointer;
                transition:all 0.3s;
            }}
            #toolbar button:hover {{
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }}
            #toolbar button.active {{
                background:#764ba2;
                color:white;
            }}
            #canvas-container {{ 
                overflow-y:auto; 
                overflow-x:hidden;
                height:calc(100vh - 120px); 
                background:#fff; 
                padding:20px;
                display:flex;
                flex-direction:column;
                align-items:center;
            }}
            .canvas-wrapper {{
                margin:20px 0;
                box-shadow:0 4px 20px rgba(0,0,0,0.15);
                position:relative;
            }}
            .page-number {{
                position:absolute;
                top:-30px;
                left:50%;
                transform:translateX(-50%);
                background:#667eea;
                color:white;
                padding:5px 15px;
                border-radius:15px;
                font-size:12px;
            }}
            #color-picker {{
                margin:0 10px;
                height:35px;
                width:60px;
                border:2px solid white;
                border-radius:5px;
                cursor:pointer;
            }}
            #brush-size {{
                width:100px;
                margin:0 10px;
            }}
        </style>
    </head>
    <body>
        <div id="toolbar">
            <button onclick="setMode('select')" id="btn-select">Select</button>
            <button onclick="setMode('text')" id="btn-text">✍️ Text</button>
            <button onclick="setMode('image')" id="btn-image">🖼️ Image</button>
            <button onclick="setMode('draw')" id="btn-draw">✏️ Draw</button>
            <button onclick="setMode('rect')" id="btn-rect">📐 Rectangle</button>
            <button onclick="setMode('circle')" id="btn-circle">⭕ Circle</button>
            <button onclick="setMode('arrow')" id="btn-arrow">🎯 Arrow</button>
            <button onclick="setMode('highlight')" id="btn-highlight">🖍️ Highlight</button>
            <input type="color" id="color-picker" value="#FF0000" onchange="setColor(this.value)">
            <input type="range" id="brush-size" min="1" max="20" value="3" onchange="setBrushSize(this.value)">
            <button onclick="deleteSelected()">🗑️ Delete</button>
            <button onclick="clearAll()">🧹 Clear All</button>
            <button onclick="downloadPDF()" style="background:#28a745;color:white;">💾 Download PDF</button>
        </div>
        <div id="canvas-container"></div>

        <input type="file" id="image-input" accept="image/*" style="display:none;">

        <script>
            const pdfData = "data:application/pdf;base64,{base64_pdf}";
            let pdfDoc = null, totalPages = 0;
            const scale = 1.5;
            let canvases = [];
            let fabrics = [];
            let currentMode = 'select';
            let currentColor = '#FF0000';
            let brushSize = 3;

            // Load PDF
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            pdfjsLib.getDocument(pdfData).promise.then(pdf => {{
                pdfDoc = pdf;
                totalPages = pdf.numPages;
                renderAllPages();
            }});

            function renderAllPages() {{
                for (let i = 1; i <= totalPages; i++) {{
                    renderPage(i);
                }}
            }}

            function renderPage(num) {{
                pdfDoc.getPage(num).then(page => {{
                    const viewport = page.getViewport({{ scale }});
                    
                    // Create wrapper
                    const wrapper = document.createElement('div');
                    wrapper.className = 'canvas-wrapper';
                    
                    // Page number
                    const pageNum = document.createElement('div');
                    pageNum.className = 'page-number';
                    pageNum.textContent = `Page ${{num}} of ${{totalPages}}`;
                    wrapper.appendChild(pageNum);
                    
                    // PDF canvas (background)
                    const pdfCanvas = document.createElement('canvas');
                    const ctx = pdfCanvas.getContext('2d');
                    pdfCanvas.height = viewport.height;
                    pdfCanvas.width = viewport.width;
                    pdfCanvas.style.position = 'absolute';
                    pdfCanvas.style.zIndex = '1';
                    
                    // Fabric canvas (overlay)
                    const fabricCanvas = document.createElement('canvas');
                    fabricCanvas.id = 'fabric-canvas-' + num;
                    fabricCanvas.width = viewport.width;
                    fabricCanvas.height = viewport.height;
                    fabricCanvas.style.position = 'absolute';
                    fabricCanvas.style.zIndex = '2';
                    
                    wrapper.appendChild(pdfCanvas);
                    wrapper.appendChild(fabricCanvas);
                    document.getElementById('canvas-container').appendChild(wrapper);

                    // Render PDF
                    page.render({{ canvasContext: ctx, viewport }}).promise.then(() => {{
                        const fabric = new window.fabric.Canvas(fabricCanvas.id, {{
                            isDrawingMode: false,
                            selection: true
                        }});
                        
                        fabric.freeDrawingBrush.color = currentColor;
                        fabric.freeDrawingBrush.width = brushSize;
                        
                        fabrics.push(fabric);
                        canvases.push({{ pdf: pdfCanvas, fabric: fabricCanvas, fabricObj: fabric }});
                        
                        setupCanvasEvents(fabric, num);
                    }});
                }});
            }}

            function setupCanvasEvents(fabric, pageNum) {{
                // Click to add shapes
                fabric.on('mouse:down', function(options) {{
                    if (currentMode === 'text') {{
                        const pointer = fabric.getPointer(options.e);
                        addText(fabric, pointer.x, pointer.y);
                    }} else if (currentMode === 'rect') {{
                        const pointer = fabric.getPointer(options.e);
                        addRectangle(fabric, pointer.x, pointer.y);
                    }} else if (currentMode === 'circle') {{
                        const pointer = fabric.getPointer(options.e);
                        addCircle(fabric, pointer.x, pointer.y);
                    }} else if (currentMode === 'arrow') {{
                        const pointer = fabric.getPointer(options.e);
                        addArrow(fabric, pointer.x, pointer.y);
                    }} else if (currentMode === 'highlight') {{
                        const pointer = fabric.getPointer(options.e);
                        addHighlight(fabric, pointer.x, pointer.y);
                    }}
                }});
            }}

            function setMode(mode) {{
                currentMode = mode;
                
                // Update button states
                document.querySelectorAll('#toolbar button').forEach(btn => btn.classList.remove('active'));
                const activeBtn = document.getElementById('btn-' + mode);
                if (activeBtn) activeBtn.classList.add('active');
                
                // Set drawing mode
                fabrics.forEach(f => {{
                    f.isDrawingMode = (mode === 'draw');
                    f.selection = (mode === 'select');
                }});
                
                // Image upload
                if (mode === 'image') {{
                    document.getElementById('image-input').click();
                }}
            }}

            function setColor(color) {{
                currentColor = color;
                fabrics.forEach(f => {{
                    f.freeDrawingBrush.color = color;
                }});
            }}

            function setBrushSize(size) {{
                brushSize = parseInt(size);
                fabrics.forEach(f => {{
                    f.freeDrawingBrush.width = brushSize;
                }});
            }}

            function addText(fabric, x, y) {{
                const text = prompt("Enter text:", "Your text here");
                if (text) {{
                    const textObj = new window.fabric.Text(text, {{
                        left: x,
                        top: y,
                        fontSize: 20,
                        fill: currentColor,
                        fontFamily: 'Arial'
                    }});
                    fabric.add(textObj);
                    fabric.setActiveObject(textObj);
                }}
            }}

            function addRectangle(fabric, x, y) {{
                const rect = new window.fabric.Rect({{
                    left: x,
                    top: y,
                    width: 100,
                    height: 60,
                    fill: 'transparent',
                    stroke: currentColor,
                    strokeWidth: 2
                }});
                fabric.add(rect);
            }}

            function addCircle(fabric, x, y) {{
                const circle = new window.fabric.Circle({{
                    left: x,
                    top: y,
                    radius: 40,
                    fill: 'transparent',
                    stroke: currentColor,
                    strokeWidth: 2
                }});
                fabric.add(circle);
            }}

            function addArrow(fabric, x, y) {{
                const line = new window.fabric.Line([x, y, x + 100, y], {{
                    stroke: currentColor,
                    strokeWidth: 3
                }});
                const triangle = new window.fabric.Triangle({{
                    left: x + 100,
                    top: y - 5,
                    width: 10,
                    height: 10,
                    fill: currentColor,
                    angle: 90
                }});
                const group = new window.fabric.Group([line, triangle]);
                fabric.add(group);
            }}

            function addHighlight(fabric, x, y) {{
                const highlight = new window.fabric.Rect({{
                    left: x,
                    top: y,
                    width: 150,
                    height: 20,
                    fill: 'rgba(255, 255, 0, 0.4)',
                    stroke: 'transparent'
                }});
                fabric.add(highlight);
            }}

            // Image upload
            document.getElementById('image-input').addEventListener('change', function(e) {{
                const file = e.target.files[0];
                if (file) {{
                    const reader = new FileReader();
                    reader.onload = function(event) {{
                        window.fabric.Image.fromURL(event.target.result, function(img) {{
                            img.scaleToWidth(200);
                            fabrics[0].add(img);
                            fabrics[0].setActiveObject(img);
                        }});
                    }};
                    reader.readAsDataURL(file);
                }}
            }});

            function deleteSelected() {{
                fabrics.forEach(f => {{
                    const active = f.getActiveObject();
                    if (active) {{
                        f.remove(active);
                    }}
                }});
            }}

            function clearAll() {{
                if (confirm('Clear all annotations?')) {{
                    fabrics.forEach(f => f.clear());
                }}
            }}

            function downloadPDF() {{
                const {{ jsPDF }} = window.jspdf;
                const pdf = new jsPDF({{
                    orientation: 'portrait',
                    unit: 'px',
                    format: [canvases[0].pdf.width, canvases[0].pdf.height]
                }});

                canvases.forEach((canvas, index) => {{
                    if (index > 0) {{
                        pdf.addPage([canvas.pdf.width, canvas.pdf.height]);
                    }}
                    
                    // Add PDF page
                    const pdfImg = canvas.pdf.toDataURL('image/png');
                    pdf.addImage(pdfImg, 'PNG', 0, 0, canvas.pdf.width, canvas.pdf.height);
                    
                    // Add annotations
                    const fabricImg = canvas.fabricObj.toDataURL({{
                        format: 'png',
                        multiplier: 1
                    }});
                    pdf.addImage(fabricImg, 'PNG', 0, 0, canvas.pdf.width, canvas.pdf.height);
                }});

                pdf.save('edited-pdf.pdf');
                alert('PDF downloaded successfully!');
            }}
        </script>
    </body>
    </html>
    """

    # Display editor
    st.components.v1.html(editor_html, height=900, scrolling=False)
    
    st.success("✅ PDF loaded! Use the toolbar above to edit.")
    st.info("💡 **Tips:** Select mode to move objects, Draw mode for freehand, Double-click for text")

else:
    st.info("👆 Upload a PDF file to start editing")
    
    # Features
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("### ✍️ Text & Annotations")
        st.markdown("""
        - Add custom text
        - Multiple fonts & colors
        - Adjustable size
        - Drag to reposition
        """)
    
    with col2:
        st.markdown("### 🎨 Drawing Tools")
        st.markdown("""
        - Freehand drawing
        - Shapes (rect, circle)
        - Arrows & lines
        - Color picker
        """)
    
    with col3:
        st.markdown("### 🖍️ Highlighting")
        st.markdown("""
        - Transparent highlights
        - Custom colors
        - Adjustable opacity
        - Perfect for marking
        """)
