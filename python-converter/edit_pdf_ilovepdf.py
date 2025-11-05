import streamlit as st
import os
import tempfile
import base64

st.set_page_config(
    page_title="Edit PDF - iLovePDF Clone",
    page_icon="✏️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for iLovePDF-like interface
st.markdown("""
<style>
    .main > div {
        padding: 0 !important;
    }
    .stApp {
        background: #f5f5f5;
    }
    iframe {
        border: none;
    }
</style>
""", unsafe_allow_html=True)

# File uploader
uploaded_file = st.file_uploader(
    "📤 Upload PDF to Edit",
    type=["pdf"],
    help="Upload a PDF file to start editing",
    label_visibility="collapsed"
)

if uploaded_file:
    # Save to temp
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(uploaded_file.getvalue())
        pdf_path = tmp_file.name

    # Encode PDF to base64
    with open(pdf_path, "rb") as f:
        base64_pdf = base64.b64encode(f.read()).decode('utf-8')

    # iLovePDF-style editor HTML
    editor_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Edit PDF - iLovePDF Clone</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: #f5f5f5;
                overflow: hidden;
            }}
            
            /* Top Toolbar - iLovePDF Style */
            #toolbar {{
                background: white;
                border-bottom: 1px solid #ddd;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 55px;
                z-index: 1000;
                display: flex;
                align-items: center;
                padding: 0 20px;
                gap: 12px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }}
            
            /* Toolbar separator */
            .toolbar-separator {{
                width: 1px;
                height: 28px;
                background: #e0e0e0;
                margin: 0 8px;
            }}
            
            /* Toolbar separator */
            .toolbar-separator {{
                width: 1px;
                height: 28px;
                background: #e0e0e0;
                margin: 0 8px;
            }}
            
            /* Toolbar buttons - Word style */
            .toolbar-btn {{
                height: 32px;
                min-width: 32px;
                padding: 0 10px;
                border: 1px solid transparent;
                background: transparent;
                border-radius: 3px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                gap: 5px;
                white-space: nowrap;
                transition: all 0.15s;
                color: #333;
            }}
            .toolbar-btn:hover {{
                background: #e5e5e5;
                border-color: #adadad;
            }}
            .toolbar-btn.active {{
                background: #cce4f7;
                border-color: #0078d4;
                color: #0078d4;
            }}
            
            /* Format controls */
            select, input[type="number"] {{
                padding: 6px 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
            }}
            .format-btn {{
                width: 36px;
                height: 36px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                font-size: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }}
            .format-btn:hover {{
                background: #f5f5f5;
                border-color: #bbb;
            }}
            .format-btn.active {{
                background: #333;
                color: white;
                border-color: #333;
            }}
            #download-btn {{
                background: #28a745;
                color: white;
                border: none;
                padding: 10px 24px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                margin-left: auto;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }}
            #download-btn:hover {{
                background: #218838;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(40,167,69,0.3);
            }}
            
            /* Left Panel - Page Thumbnails */
            #page-thumbnails {{
                position: fixed;
                left: 70px;
                top: 55px;
                width: 200px;
                height: calc(100vh - 55px);
                background: white;
                border-right: 1px solid #e0e0e0;
                overflow-y: auto;
                padding: 15px 10px;
                z-index: 40;
            }}
            .page-thumb {{
                margin-bottom: 15px;
                cursor: pointer;
                border-left: 4px solid transparent;
                border-radius: 4px;
                overflow: hidden;
                background: white;
                transition: all 0.2s;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            .page-thumb:hover {{
                box-shadow: 0 3px 8px rgba(0,0,0,0.15);
                transform: translateX(2px);
            }}
            .page-thumb.active {{
                border-left-color: #e74c3c;
                background: #fff5f5;
                box-shadow: 0 3px 8px rgba(231,76,60,0.3);
            }}
            .page-thumb canvas {{
                width: 100%;
                display: block;
            }}
            .page-thumb-label {{
                text-align: center;
                padding: 10px;
                font-size: 13px;
                font-weight: 500;
                color: #333;
                background: #f9f9f9;
            }}
            
            /* Sidebar - iLovePDF style */
            #sidebar {{
                position: fixed;
                left: 0;
                top: 55px;
                width: 70px;
                height: calc(100vh - 55px);
                background: white;
                box-shadow: 2px 0 4px rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
                padding-top: 10px;
                z-index: 50;
                border-right: 1px solid #e0e0e0;
            }}
            .sidebar-tool {{
                width: 100%;
                padding: 14px 0;
                border: none;
                background: transparent;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 3px;
                color: #666;
                font-size: 10px;
                transition: all 0.2s;
                position: relative;
                border-left: 3px solid transparent;
                min-height: 65px;
            }}
            .sidebar-tool:hover {{
                background: #f8f9fa;
            }}
            .sidebar-tool.active {{
                color: #e74c3c;
                border-left-color: #e74c3c;
                background: #fff5f5;
            }}
            .sidebar-tool .icon {{
                font-size: 32px;
                line-height: 1;
                margin-bottom: 3px;
            }}
            .sidebar-tool .label {{
                font-size: 10px;
                font-weight: 500;
                text-align: center;
                line-height: 1.2;
            }}
            
            /* Canvas container */
            #canvas-container {{
                position: fixed;
                left: 220px;
                top: 55px;
                right: 0;
                bottom: 0;
                overflow-y: auto;
                background: #f5f5f5;
                padding: 30px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }}
            
            .page-wrapper {{
                background: white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                position: relative;
                margin-bottom: 20px;
            }}
            
            .page-number {{
                position: absolute;
                top: -25px;
                left: 0;
                font-size: 12px;
                color: #999;
                font-weight: 500;
            }}
            
            canvas {{
                display: block;
                cursor: crosshair;
            }}
            
            /* Text editing cursor */
            .canvas-container.text-mode canvas {{
                cursor: text !important;
            }}
            
            /* Instructions overlay */
            #instructions {{
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 13px;
                z-index: 1000;
                display: none;
            }}
            #instructions.show {{
                display: block;
            }}
            
            /* Color picker panel */
            #color-panel {{
                position: fixed;
                left: 80px;
                top: 60px;
                width: 250px;
                background: white;
                box-shadow: 2px 0 8px rgba(0,0,0,0.1);
                padding: 20px;
                display: none;
                z-index: 50;
            }}
            #color-panel.show {{
                display: block;
            }}
            .color-option {{
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: inline-block;
                margin: 5px;
                cursor: pointer;
                border: 3px solid transparent;
                transition: all 0.2s;
            }}
            .color-option:hover {{
                transform: scale(1.1);
            }}
            .color-option.selected {{
                border-color: #333;
            }}
            
            /* Font size slider */
            .slider-container {{
                margin: 15px 0;
            }}
            .slider-container label {{
                display: block;
                margin-bottom: 8px;
                color: #666;
                font-size: 13px;
            }}
            input[type="range"] {{
                width: 100%;
            }}
        </style>
    </head>
    <body>
        <!-- Page Thumbnails Panel -->
        <div id="page-thumbnails"></div>
        
        <!-- Top Toolbar -->
        <div id="toolbar">
            <button class="toolbar-btn" onclick="undo()" title="Undo" id="undo-btn">↶</button>
            <button class="toolbar-btn" onclick="redo()" title="Redo" id="redo-btn">↷</button>
            <div class="toolbar-separator"></div>
            <button class="toolbar-btn" onclick="setTool('text')" title="Add Text">T</button>
            <select id="font-select" style="height:36px; padding:0 12px; border:1px solid #ddd; border-radius:5px; font-size:14px; min-width:140px;">
                <option>Arial</option>
                <option>Courier New</option>
                <option>Georgia</option>
                <option>Times New Roman</option>
                <option>Verdana</option>
            </select>
            <button class="toolbar-btn" onclick="increaseFontSize()" title="Increase Font Size">T↑</button>
            <input type="number" id="font-size" value="17" min="8" max="100" style="width:55px; height:36px; padding:0 10px; border:1px solid #ddd; border-radius:5px; font-size:14px; text-align:center;">
            <div class="toolbar-separator"></div>
            <button class="format-btn" onclick="toggleBold()" title="Bold">B</button>
            <button class="format-btn" onclick="toggleItalic()" title="Italic">I</button>
            <button class="format-btn" onclick="toggleUnderline()" title="Underline">U</button>
            <div class="toolbar-separator"></div>
            <button class="toolbar-btn" onclick="setTool('color')" title="Text Color">A▼</button>
            <button class="toolbar-btn" onclick="setTool('highlight')" title="Highlight">🖍️</button>
            <div class="toolbar-separator"></div>
            <button class="toolbar-btn" onclick="setTool('align')" title="Text Align">≡</button>
            <div class="toolbar-separator"></div>
            <input type="range" id="zoom-slider" min="25" max="200" value="100" style="width:120px; height:6px;" oninput="updateZoom(this.value)">
            <span id="zoom-display" style="font-size:14px; color:#666; min-width:50px; font-weight:500;">100%</span>
            <button id="download-btn" onclick="downloadPDF()"><span>💾</span> Download PDF</button>
        </div>
        
        <!-- Sidebar Tools -->
        <div id="sidebar">
            <button class="sidebar-tool active" onclick="setTool('select')" id="tool-select">
                <div class="icon">👆</div>
                <div class="label">Select</div>
            </button>
            <button class="sidebar-tool" onclick="setTool('text')" id="tool-text">
                <div class="icon">📝</div>
                <div class="label">Text</div>
            </button>
            <button class="sidebar-tool" onclick="setTool('image')" id="tool-image">
                <div class="icon">🖼️</div>
                <div class="label">Image</div>
            </button>
            <button class="sidebar-tool" onclick="setTool('draw')" id="tool-draw">
                <div class="icon">✏️</div>
                <div class="label">Draw</div>
            </button>
            <button class="sidebar-tool" onclick="setTool('shapes')" id="tool-shapes">
                <div class="icon">▭</div>
                <div class="label">Shapes</div>
            </button>
            <button class="sidebar-tool" onclick="setTool('circle')" id="tool-circle">
                <div class="icon">⭕</div>
                <div class="label">Circle</div>
            </button>
            <button class="sidebar-tool" onclick="setTool('line')" id="tool-line">
                <div class="icon">📏</div>
                <div class="label">Line</div>
            </button>
            <button class="sidebar-tool" onclick="setTool('highlight')" id="tool-highlight">
                <div class="icon">🖍️</div>
                <div class="label">Highlight</div>
            </button>
            <button class="sidebar-tool" onclick="deleteSelected()">
                <div class="icon">🗑️</div>
                <div class="label">Delete</div>
            </button>
        </div>
        
        <!-- Color Panel -->
        <div id="color-panel">
            <h3 style="margin-bottom:15px;font-size:14px;color:#333;">Choose Color</h3>
            <div>
                <div class="color-option selected" style="background:#000000" onclick="selectColor('#000000')"></div>
                <div class="color-option" style="background:#e74c3c" onclick="selectColor('#e74c3c')"></div>
                <div class="color-option" style="background:#3498db" onclick="selectColor('#3498db')"></div>
                <div class="color-option" style="background:#2ecc71" onclick="selectColor('#2ecc71')"></div>
                <div class="color-option" style="background:#f39c12" onclick="selectColor('#f39c12')"></div>
                <div class="color-option" style="background:#9b59b6" onclick="selectColor('#9b59b6')"></div>
                <div class="color-option" style="background:#ffff00" onclick="selectColor('#ffff00')"></div>
                <div class="color-option" style="background:#ffffff;border:1px solid #ddd" onclick="selectColor('#ffffff')"></div>
            </div>
            <div class="slider-container">
                <label>Font Size / Brush Width</label>
                <input type="range" id="size-slider" min="1" max="50" value="20" oninput="updateSize(this.value)">
                <span id="size-value">20</span>
            </div>
        </div>
        
        <!-- Canvas Container -->
        <div id="canvas-container"></div>
        
        <!-- Instructions -->
        <div id="instructions"></div>
        
        <input type="file" id="image-input" accept="image/*" style="display:none;">

        <script>
            const pdfData = "data:application/pdf;base64,{base64_pdf}";
            let pdfDoc = null;
            let fabrics = [];
            let currentTool = 'select';
            let currentColor = '#000000';
            let currentSize = 20;
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            // Load PDF
            pdfjsLib.getDocument(pdfData).promise.then(pdf => {{
                pdfDoc = pdf;
                
                // Render page thumbnails
                for (let i = 1; i <= pdf.numPages; i++) {{
                    pdf.getPage(i).then(page => {{
                        const scale = 0.25;
                        const viewport = page.getViewport({{ scale }});
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        
                        const thumbDiv = document.createElement('div');
                        thumbDiv.className = 'page-thumb' + (i === 1 ? ' active' : '');
                        thumbDiv.setAttribute('data-page', i - 1);
                        thumbDiv.onclick = function() {{ scrollToPage(this.getAttribute('data-page')); }};
                        
                        const label = document.createElement('div');
                        label.className = 'page-thumb-label';
                        label.textContent = i;
                        
                        thumbDiv.appendChild(canvas);
                        thumbDiv.appendChild(label);
                        document.getElementById('page-thumbnails').appendChild(thumbDiv);
                        
                        page.render({{ canvasContext: canvas.getContext('2d'), viewport }});
                    }});
                }}
                
                // Render full pages
                for (let i = 1; i <= pdf.numPages; i++) {{
                    renderPage(i);
                }}
            }});
            
            function renderPage(pageNum) {{
                pdfDoc.getPage(pageNum).then(page => {{
                    const scale = 1.5;
                    const viewport = page.getViewport({{ scale }});
                    
                    const wrapper = document.createElement('div');
                    wrapper.className = 'page-wrapper';
                    wrapper.style.width = viewport.width + 'px';
                    wrapper.style.height = viewport.height + 'px';
                    
                    const pageLabel = document.createElement('div');
                    pageLabel.className = 'page-number';
                    pageLabel.textContent = `Page ${{pageNum}} of ${{pdfDoc.numPages}}`;
                    wrapper.appendChild(pageLabel);
                    
                    const pdfCanvas = document.createElement('canvas');
                    pdfCanvas.width = viewport.width;
                    pdfCanvas.height = viewport.height;
                    pdfCanvas.style.position = 'absolute';
                    
                    const fabricCanvas = document.createElement('canvas');
                    fabricCanvas.id = 'fabric-' + pageNum;
                    fabricCanvas.width = viewport.width;
                    fabricCanvas.height = viewport.height;
                    fabricCanvas.style.position = 'absolute';
                    
                    wrapper.appendChild(pdfCanvas);
                    wrapper.appendChild(fabricCanvas);
                    document.getElementById('canvas-container').appendChild(wrapper);
                    
                    page.render({{ canvasContext: pdfCanvas.getContext('2d'), viewport }}).promise.then(() => {{
                        const fabric = new window.fabric.Canvas(fabricCanvas.id);
                        fabric.freeDrawingBrush.color = currentColor;
                        fabric.freeDrawingBrush.width = 3;
                        fabrics.push({{ canvas: fabric, pdfCanvas: pdfCanvas }});
                        
                        fabric.on('mouse:down', function(e) {{
                            handleCanvasClick(fabric, e);
                        }});
                        
                        // Enable double-click to edit text
                        fabric.on('mouse:dblclick', function(e) {{
                            if (e.target && e.target.type === 'i-text') {{
                                e.target.enterEditing();
                                e.target.selectAll();
                            }}
                        }});
                    }});
                }});
            }}
            
            function setTool(tool) {{
                currentTool = tool;
                
                // Update sidebar button states
                document.querySelectorAll('.sidebar-tool').forEach(btn => btn.classList.remove('active'));
                const activeBtn = document.getElementById('tool-' + tool);
                if (activeBtn) activeBtn.classList.add('active');
                document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
                document.getElementById('tool-' + tool).classList.add('active');
                
                const container = document.getElementById('canvas-container');
                const instructions = document.getElementById('instructions');
                
                // Update cursor and instructions
                container.className = tool === 'text' ? 'text-mode' : '';
                
                const instructionTexts = {{
                    'select': '👆 Click objects to select, drag to move, resize with corners',
                    'text': '📝 Click anywhere to add text, then type directly',
                    'image': '🖼️ Select an image to upload',
                    'draw': '✏️ Click and drag to draw freehand',
                    'rectangle': '▭ Click to add a rectangle',
                    'circle': '⭕ Click to add a circle',
                    'arrow': '➡️ Click to add an arrow',
                    'highlight': '🖍️ Click to add a highlight'
                }};
                
                if (instructionTexts[tool]) {{
                    instructions.textContent = instructionTexts[tool];
                    instructions.classList.add('show');
                    setTimeout(() => instructions.classList.remove('show'), 3000);
                }}
                
                fabrics.forEach(f => {{
                    f.canvas.isDrawingMode = (tool === 'draw');
                    f.canvas.selection = (tool === 'select');
                }});
                
                if (tool === 'text' || tool === 'draw') {{
                    document.getElementById('color-panel').classList.add('show');
                }} else {{
                    document.getElementById('color-panel').classList.remove('show');
                }}
                
                if (tool === 'image') {{
                    document.getElementById('image-input').click();
                }}
            }}
            
            function selectColor(color) {{
                currentColor = color;
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                event.target.classList.add('selected');
                fabrics.forEach(f => {{
                    f.canvas.freeDrawingBrush.color = color;
                }});
            }}
            
            function updateSize(value) {{
                currentSize = parseInt(value);
                document.getElementById('size-value').textContent = value;
                fabrics.forEach(f => {{
                    f.canvas.freeDrawingBrush.width = Math.max(1, value / 10);
                }});
            }}
            
            function handleCanvasClick(fabric, e) {{
                const pointer = fabric.getPointer(e.e);
                
                if (currentTool === 'text') {{
                    // Create editable text directly on canvas
                    const textObj = new window.fabric.IText('Click to edit', {{
                        left: pointer.x,
                        top: pointer.y,
                        fontSize: currentSize,
                        fill: currentColor,
                        fontFamily: 'Arial',
                        editable: true
                    }});
                    fabric.add(textObj);
                    fabric.setActiveObject(textObj);
                    textObj.enterEditing();
                    textObj.selectAll();
                }} else if (currentTool === 'rectangle') {{
                    const rect = new window.fabric.Rect({{
                        left: pointer.x,
                        top: pointer.y,
                        width: 100,
                        height: 60,
                        fill: 'transparent',
                        stroke: currentColor,
                        strokeWidth: 2
                    }});
                    fabric.add(rect);
                }} else if (currentTool === 'circle') {{
                    const circle = new window.fabric.Circle({{
                        left: pointer.x,
                        top: pointer.y,
                        radius: 40,
                        fill: 'transparent',
                        stroke: currentColor,
                        strokeWidth: 2
                    }});
                    fabric.add(circle);
                }} else if (currentTool === 'arrow') {{
                    const line = new window.fabric.Line([pointer.x, pointer.y, pointer.x + 100, pointer.y], {{
                        stroke: currentColor,
                        strokeWidth: 3
                    }});
                    const triangle = new window.fabric.Triangle({{
                        left: pointer.x + 100,
                        top: pointer.y - 5,
                        width: 10,
                        height: 10,
                        fill: currentColor,
                        angle: 90
                    }});
                    const group = new window.fabric.Group([line, triangle]);
                    fabric.add(group);
                }} else if (currentTool === 'highlight') {{
                    const highlight = new window.fabric.Rect({{
                        left: pointer.x,
                        top: pointer.y,
                        width: 150,
                        height: 20,
                        fill: 'rgba(255, 255, 0, 0.4)'
                    }});
                    fabric.add(highlight);
                }}
            }}
            
            document.getElementById('image-input').addEventListener('change', function(e) {{
                const file = e.target.files[0];
                if (file) {{
                    const reader = new FileReader();
                    reader.onload = function(event) {{
                        window.fabric.Image.fromURL(event.target.result, function(img) {{
                            img.scaleToWidth(200);
                            fabrics[0].canvas.add(img);
                        }});
                    }};
                    reader.readAsDataURL(file);
                }}
            }});
            
            function deleteSelected() {{
                fabrics.forEach(f => {{
                    const active = f.canvas.getActiveObject();
                    if (active) f.canvas.remove(active);
                }});
            }}
            
            // Toolbar Functions
            function toggleBold() {{
                fabrics.forEach(f => {{
                    const active = f.canvas.getActiveObject();
                    if (active && active.type === 'i-text') {{
                        active.set('fontWeight', active.fontWeight === 'bold' ? 'normal' : 'bold');
                        f.canvas.renderAll();
                    }}
                }});
            }}
            
            function toggleItalic() {{
                fabrics.forEach(f => {{
                    const active = f.canvas.getActiveObject();
                    if (active && active.type === 'i-text') {{
                        active.set('fontStyle', active.fontStyle === 'italic' ? 'normal' : 'italic');
                        f.canvas.renderAll();
                    }}
                }});
            }}
            
            function toggleUnderline() {{
                fabrics.forEach(f => {{
                    const active = f.canvas.getActiveObject();
                    if (active && active.type === 'i-text') {{
                        active.set('underline', !active.underline);
                        f.canvas.renderAll();
                    }}
                }});
            }}
            
            function increaseFontSize() {{
                const sizeInput = document.getElementById('font-size');
                const currentSize = parseInt(sizeInput.value);
                sizeInput.value = currentSize + 2;
                updateFontSize();
            }}
            
            function updateFontSize() {{
                const size = parseInt(document.getElementById('font-size').value);
                fabrics.forEach(f => {{
                    const active = f.canvas.getActiveObject();
                    if (active && active.type === 'i-text') {{
                        active.set('fontSize', size);
                        f.canvas.renderAll();
                    }}
                }});
            }}
            
            function updateFont() {{
                const font = document.getElementById('font-select').value;
                fabrics.forEach(f => {{
                    const active = f.canvas.getActiveObject();
                    if (active && active.type === 'i-text') {{
                        active.set('fontFamily', font);
                        f.canvas.renderAll();
                    }}
                }});
            }}
            
            function updateZoom(value) {{
                document.getElementById('zoom-display').textContent = value + '%';
                // Zoom functionality can be implemented by scaling the canvas
                const scale = value / 100;
                fabrics.forEach(f => {{
                    f.canvas.setZoom(scale);
                    f.canvas.renderAll();
                }});
            }}
            
            function setMode(mode) {{
                // Mode switching functionality
                console.log('Mode:', mode);
            }}
            
            // Add event listener for font select
            document.getElementById('font-select').addEventListener('change', updateFont);
            document.getElementById('font-size').addEventListener('change', updateFontSize);
            
            // Undo/Redo functionality
            function undo() {{
                fabrics.forEach(f => {{
                    if (f.canvas._objects.length > 0) {{
                        const lastObj = f.canvas._objects[f.canvas._objects.length - 1];
                        f.canvas.remove(lastObj);
                        f.canvas.renderAll();
                    }}
                }});
            }}
            
            function redo() {{
                // Redo functionality - would need to store removed objects
                console.log('Redo functionality');
            }}
            
            function scrollToPage(pageIndex) {{
                const idx = parseInt(pageIndex);
                const pageElements = document.querySelectorAll('.page-wrapper');
                
                if (pageElements[idx]) {{
                    // Scroll to the page
                    pageElements[idx].scrollIntoView({{ behavior: 'smooth', block: 'start' }});
                    
                    // Update active thumbnail
                    document.querySelectorAll('.page-thumb').forEach((thumb, i) => {{
                        thumb.classList.toggle('active', i === idx);
                    }});
                }}
            }}
            
            function downloadPDF() {{
                const {{ jsPDF }} = window.jspdf;
                const pdf = new jsPDF({{
                    orientation: 'portrait',
                    unit: 'px',
                    format: [fabrics[0].pdfCanvas.width, fabrics[0].pdfCanvas.height]
                }});
                
                fabrics.forEach((item, index) => {{
                    if (index > 0) pdf.addPage([item.pdfCanvas.width, item.pdfCanvas.height]);
                    pdf.addImage(item.pdfCanvas.toDataURL(), 'PNG', 0, 0, item.pdfCanvas.width, item.pdfCanvas.height);
                    pdf.addImage(item.canvas.toDataURL(), 'PNG', 0, 0, item.pdfCanvas.width, item.pdfCanvas.height);
                }});
                
                pdf.save('edited-document.pdf');
            }}
        </script>
    </body>
    </html>
    """

    # Display editor
    st.components.v1.html(editor_html, height=900, scrolling=False)

else:
    st.markdown("""
    <div style="text-align:center; padding:50px;">
        <h2>📄 Edit PDF - iLovePDF Clone</h2>
        <p style="color:#666; margin:20px 0;">Upload a PDF file to start editing</p>
    </div>
    """, unsafe_allow_html=True)
