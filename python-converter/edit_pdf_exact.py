import streamlit as st
import os
import tempfile
import base64

st.set_page_config(
    page_title="Edit PDF - iLovePDF",
    page_icon="✏️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit elements
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .main > div {padding: 0 !important;}
    .stApp {background: #f5f5f5;}
    iframe {border: none; height: 100vh !important;}
</style>
""", unsafe_allow_html=True)

uploaded_file = st.file_uploader("Upload PDF", type=["pdf"], label_visibility="collapsed")

if uploaded_file:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(uploaded_file.getvalue())
        pdf_path = tmp_file.name

    with open(pdf_path, "rb") as f:
        base64_pdf = base64.b64encode(f.read()).decode('utf-8')

    editor_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Edit PDF - iLovePDF</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; overflow: hidden; }}
            
            /* Top Toolbar */
            #toolbar {{
                background: white;
                height: 120px;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                flex-direction: column;
            }}
            .toolbar-top {{
                height: 60px;
                display: flex;
                align-items: center;
                padding: 0 20px;
                justify-content: space-between;
                border-bottom: 1px solid #f0f0f0;
            }}
            .toolbar-top h1 {{ font-size: 18px; color: #333; }}
            #save-btn {{
                background: #e74c3c;
                color: white;
                border: none;
                padding: 10px 30px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
            }}
            .toolbar-bottom {{
                height: 60px;
                display: flex;
                align-items: center;
                padding: 0 20px;
                gap: 10px;
            }}
            .tool-group {{
                display: flex;
                gap: 5px;
                padding: 0 15px;
                border-right: 1px solid #e0e0e0;
            }}
            .tool-btn {{
                width: 40px;
                height: 40px;
                border: none;
                background: white;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                transition: all 0.2s;
            }}
            .tool-btn:hover {{ background: #f5f5f5; }}
            .tool-btn.active {{ background: #e74c3c; color: white; }}
            
            /* Layout */
            #main-container {{
                display: flex;
                height: calc(100vh - 120px);
            }}
            
            /* Left Sidebar - Thumbnails */
            #thumbnails {{
                width: 150px;
                background: #fafafa;
                border-right: 1px solid #e0e0e0;
                overflow-y: auto;
                padding: 10px;
            }}
            .thumbnail {{
                width: 130px;
                margin-bottom: 10px;
                border: 2px solid transparent;
                cursor: pointer;
                border-radius: 4px;
                overflow: hidden;
            }}
            .thumbnail.active {{ border-color: #e74c3c; }}
            .thumbnail canvas {{ width: 100%; display: block; }}
            .thumb-label {{
                text-align: center;
                font-size: 11px;
                color: #666;
                padding: 5px;
                background: white;
            }}
            
            /* Center - PDF Canvas */
            #canvas-area {{
                flex: 1;
                overflow: auto;
                background: #e8e8e8;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                padding: 30px;
            }}
            .page-container {{
                background: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                position: relative;
                display: inline-block;
            }}
            .page-container canvas {{
                display: block;
            }}
            
            /* Right Sidebar - Text Editor */
            #right-panel {{
                width: 300px;
                background: white;
                border-left: 1px solid #e0e0e0;
                padding: 20px;
                overflow-y: auto;
            }}
            #right-panel h3 {{
                font-size: 16px;
                margin-bottom: 20px;
                color: #333;
            }}
            .text-item {{
                background: #f8f8f8;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 10px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }}
            .text-item:hover {{ background: #f0f0f0; }}
            .text-item.active {{ background: #ffe5e5; border-left: 3px solid #e74c3c; }}
            .delete-text {{ color: #e74c3c; cursor: pointer; }}
            
            /* Font Controls */
            .control-group {{
                margin-bottom: 15px;
            }}
            .control-group label {{
                display: block;
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
            }}
            .control-group select, .control-group input {{
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }}
            .btn-group {{
                display: flex;
                gap: 5px;
            }}
            .btn-group button {{
                flex: 1;
                padding: 8px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 4px;
                cursor: pointer;
            }}
            .btn-group button.active {{ background: #e74c3c; color: white; border-color: #e74c3c; }}
            
            /* Bottom Controls */
            #bottom-controls {{
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                padding: 10px 20px;
                border-radius: 25px;
                display: flex;
                gap: 15px;
                align-items: center;
                color: white;
                z-index: 1000;
            }}
            #bottom-controls button {{
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 16px;
            }}
            #page-info {{ font-size: 14px; }}
        </style>
    </head>
    <body>
        <!-- Top Toolbar -->
        <div id="toolbar">
            <div class="toolbar-top">
                <h1>✏️ Edit PDF</h1>
                <button id="save-btn" onclick="downloadPDF()">💾 Edit PDF</button>
            </div>
            <div class="toolbar-bottom">
                <div class="tool-group">
                    <button class="tool-btn" onclick="setMode('annotate')" title="Annotate">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="tool-btn active" onclick="setMode('edit')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <div class="tool-group">
                    <button class="tool-btn" onclick="addText()" title="Add Text">
                        <i class="fas fa-font"></i>
                    </button>
                    <button class="tool-btn" onclick="addImage()" title="Add Image">
                        <i class="fas fa-image"></i>
                    </button>
                    <button class="tool-btn" onclick="setTool('draw')" title="Draw">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="tool-btn" onclick="setTool('shapes')" title="Shapes">
                        <i class="fas fa-shapes"></i>
                    </button>
                </div>
                <select id="font-select" style="padding:8px; border:1px solid #ddd; border-radius:4px;">
                    <option>Arial</option>
                    <option>Times New Roman</option>
                    <option>Courier New</option>
                    <option>Georgia</option>
                    <option>Verdana</option>
                </select>
                <input type="number" id="font-size" value="36" min="8" max="72" style="width:60px; padding:8px; border:1px solid #ddd; border-radius:4px;">
                <div class="btn-group" style="width:auto;">
                    <button onclick="toggleBold()"><i class="fas fa-bold"></i></button>
                    <button onclick="toggleItalic()"><i class="fas fa-italic"></i></button>
                    <button onclick="toggleUnderline()"><i class="fas fa-underline"></i></button>
                </div>
                <input type="color" id="text-color" value="#000000" style="width:40px; height:40px; border:none; cursor:pointer;">
            </div>
        </div>

        <!-- Main Container -->
        <div id="main-container">
            <!-- Left: Thumbnails -->
            <div id="thumbnails"></div>
            
            <!-- Center: Canvas -->
            <div id="canvas-area">
                <div class="page-container" id="page-container"></div>
            </div>
            
            <!-- Right: Text Editor -->
            <div id="right-panel">
                <h3>Page 1</h3>
                <p style="color:#999; font-size:13px; margin-bottom:20px;">Reorder items to move them to the back or front.</p>
                <div id="text-list"></div>
            </div>
        </div>

        <!-- Bottom Controls -->
        <div id="bottom-controls">
            <button onclick="prevPage()"><i class="fas fa-chevron-left"></i></button>
            <span id="page-info">1 / 1</span>
            <button onclick="nextPage()"><i class="fas fa-chevron-right"></i></button>
            <button onclick="zoomOut()"><i class="fas fa-search-minus"></i></button>
            <span id="zoom-level">100%</span>
            <button onclick="zoomIn()"><i class="fas fa-search-plus"></i></button>
        </div>

        <input type="file" id="image-input" accept="image/*" style="display:none;">

        <script>
            const pdfData = "data:application/pdf;base64,{base64_pdf}";
            let pdfDoc, currentPage = 1, totalPages = 0, scale = 1.5;
            let fabric, pdfCanvas;
            let textObjects = [];
            let textCounter = 1;
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            pdfjsLib.getDocument(pdfData).promise.then(pdf => {{
                pdfDoc = pdf;
                totalPages = pdf.numPages;
                renderThumbnails();
                renderPage(1);
            }});
            
            function renderThumbnails() {{
                for (let i = 1; i <= totalPages; i++) {{
                    pdfDoc.getPage(i).then(page => {{
                        const thumbScale = 0.2;
                        const viewport = page.getViewport({{ scale: thumbScale }});
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        
                        const div = document.createElement('div');
                        div.className = 'thumbnail' + (i === 1 ? ' active' : '');
                        div.onclick = () => renderPage(i);
                        
                        const label = document.createElement('div');
                        label.className = 'thumb-label';
                        label.textContent = i;
                        
                        div.appendChild(canvas);
                        div.appendChild(label);
                        document.getElementById('thumbnails').appendChild(div);
                        
                        page.render({{ canvasContext: canvas.getContext('2d'), viewport }});
                    }});
                }}
            }}
            
            function renderPage(num) {{
                currentPage = num;
                document.getElementById('page-info').textContent = `${{num}} / ${{totalPages}}`;
                document.getElementById('right-panel').querySelector('h3').textContent = `Page ${{num}}`;
                document.querySelectorAll('.thumbnail').forEach((t, i) => {{
                    t.classList.toggle('active', i + 1 === num);
                }});
                
                pdfDoc.getPage(num).then(page => {{
                    const viewport = page.getViewport({{ scale }});
                    const container = document.getElementById('page-container');
                    container.innerHTML = '';
                    
                    // Create wrapper div
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'relative';
                    wrapper.style.width = viewport.width + 'px';
                    wrapper.style.height = viewport.height + 'px';
                    
                    // PDF canvas (background)
                    pdfCanvas = document.createElement('canvas');
                    pdfCanvas.width = viewport.width;
                    pdfCanvas.height = viewport.height;
                    pdfCanvas.style.position = 'absolute';
                    pdfCanvas.style.top = '0';
                    pdfCanvas.style.left = '0';
                    
                    // Fabric canvas (overlay)
                    const fabricCanvas = document.createElement('canvas');
                    fabricCanvas.id = 'fabric-canvas';
                    fabricCanvas.width = viewport.width;
                    fabricCanvas.height = viewport.height;
                    fabricCanvas.style.position = 'absolute';
                    fabricCanvas.style.top = '0';
                    fabricCanvas.style.left = '0';
                    
                    wrapper.appendChild(pdfCanvas);
                    wrapper.appendChild(fabricCanvas);
                    container.appendChild(wrapper);
                    
                    // Render PDF
                    const ctx = pdfCanvas.getContext('2d');
                    const renderContext = {{
                        canvasContext: ctx,
                        viewport: viewport
                    }};
                    
                    page.render(renderContext).promise.then(() => {{
                        console.log('PDF page rendered');
                        // Initialize Fabric.js
                        if (fabric) {{
                            fabric.dispose();
                        }}
                        fabric = new window.fabric.Canvas('fabric-canvas', {{
                            selection: true,
                            backgroundColor: 'transparent'
                        }});
                        
                        // Restore text objects for this page
                        textObjects = [];
                        updateTextList();
                        
                        console.log('Fabric canvas initialized');
                    }}).catch(err => {{
                        console.error('PDF render error:', err);
                    }});
                }}).catch(err => {{
                    console.error('Get page error:', err);
                }});
            }}
            
            function addText() {{
                const text = new window.fabric.IText('New Text ' + textCounter, {{
                    left: 100,
                    top: 100,
                    fontSize: parseInt(document.getElementById('font-size').value),
                    fill: document.getElementById('text-color').value,
                    fontFamily: document.getElementById('font-select').value
                }});
                fabric.add(text);
                fabric.setActiveObject(text);
                textObjects.push({{ id: textCounter++, obj: text }});
                updateTextList();
            }}
            
            function updateTextList() {{
                const list = document.getElementById('text-list');
                list.innerHTML = '';
                textObjects.forEach(item => {{
                    const div = document.createElement('div');
                    div.className = 'text-item';
                    div.innerHTML = `
                        <span>${{item.obj.text}}</span>
                        <i class="fas fa-trash delete-text" onclick="deleteText(${{item.id}})"></i>
                    `;
                    div.onclick = (e) => {{
                        if (!e.target.classList.contains('delete-text')) {{
                            fabric.setActiveObject(item.obj);
                            fabric.renderAll();
                        }}
                    }};
                    list.appendChild(div);
                }});
            }}
            
            function deleteText(id) {{
                const item = textObjects.find(t => t.id === id);
                if (item) {{
                    fabric.remove(item.obj);
                    textObjects = textObjects.filter(t => t.id !== id);
                    updateTextList();
                }}
            }}
            
            function downloadPDF() {{
                const {{ jsPDF }} = window.jspdf;
                const pdf = new jsPDF({{
                    orientation: 'portrait',
                    unit: 'px',
                    format: [pdfCanvas.width, pdfCanvas.height]
                }});
                pdf.addImage(pdfCanvas.toDataURL(), 'PNG', 0, 0, pdfCanvas.width, pdfCanvas.height);
                pdf.addImage(fabric.toDataURL(), 'PNG', 0, 0, pdfCanvas.width, pdfCanvas.height);
                pdf.save('edited.pdf');
            }}
            
            function prevPage() {{ if (currentPage > 1) renderPage(currentPage - 1); }}
            function nextPage() {{ if (currentPage < totalPages) renderPage(currentPage + 1); }}
            function zoomIn() {{ scale += 0.1; renderPage(currentPage); }}
            function zoomOut() {{ scale = Math.max(0.5, scale - 0.1); renderPage(currentPage); }}
            function setMode(mode) {{}}
            function setTool(tool) {{}}
            function addImage() {{ document.getElementById('image-input').click(); }}
            function toggleBold() {{}}
            function toggleItalic() {{}}
            function toggleUnderline() {{}}
            
            document.getElementById('image-input').addEventListener('change', function(e) {{
                const file = e.target.files[0];
                if (file) {{
                    const reader = new FileReader();
                    reader.onload = function(event) {{
                        window.fabric.Image.fromURL(event.target.result, function(img) {{
                            img.scaleToWidth(200);
                            fabric.add(img);
                        }});
                    }};
                    reader.readAsDataURL(file);
                }}
            }});
        </script>
    </body>
    </html>
    """

    st.components.v1.html(editor_html, height=1000, scrolling=False)
else:
    st.markdown("<h2 style='text-align:center; padding:50px;'>📄 Upload PDF to Edit</h2>", unsafe_allow_html=True)
