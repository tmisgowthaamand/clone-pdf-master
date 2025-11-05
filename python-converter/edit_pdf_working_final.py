import streamlit as st
import tempfile
import os

st.set_page_config(page_title="Edit PDF - iLovePDF", page_icon="✏️", layout="wide", initial_sidebar_state="collapsed")

st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .main > div {padding: 0 !important;}
    iframe {border: none; height: 100vh !important;}
</style>
""", unsafe_allow_html=True)

uploaded_file = st.file_uploader("Upload PDF", type=["pdf"], label_visibility="collapsed")

if uploaded_file:
    # Save to a static location that can be accessed
    pdf_dir = tempfile.gettempdir()
    pdf_path = os.path.join(pdf_dir, "uploaded_pdf.pdf")
    
    with open(pdf_path, 'wb') as f:
        f.write(uploaded_file.getvalue())
    
    # Create a simple file server URL
    # Since we can't serve files directly, we'll embed the PDF as blob
    import base64
    pdf_bytes = uploaded_file.getvalue()
    pdf_base64 = base64.b64encode(pdf_bytes).decode()

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }}
            
            /* Top Toolbar - iLovePDF Style */
            #toolbar {{
                background: white;
                border-bottom: 1px solid #e0e0e0;
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
            .toolbar-bottom {{
                height: 60px;
                display: flex;
                align-items: center;
                padding: 0 20px;
                gap: 8px;
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
            .mode-btn {{
                padding: 8px 16px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 20px;
                cursor: pointer;
                font-size: 13px;
            }}
            .mode-btn.active {{ background: #333; color: white; border-color: #333; }}
            select, input[type="number"] {{
                padding: 6px 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
            }}
            .format-btn {{
                width: 32px;
                height: 32px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            }}
            .format-btn.active {{ background: #333; color: white; }}
            #save-btn-top {{
                background: #e74c3c;
                color: white;
                border: none;
                padding: 10px 30px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
            }}
            #save-btn-top:hover {{ background: #c0392b; }}
            
            /* Main Layout */
            #main {{
                display: flex;
                height: calc(100vh - 120px);
            }}
            
            /* Left Sidebar - Thumbnails */
            #sidebar {{
                width: 150px;
                background: #fafafa;
                border-right: 1px solid #e0e0e0;
                overflow-y: auto;
                padding: 10px;
            }}
            .thumb {{
                width: 130px;
                margin-bottom: 10px;
                border: 2px solid transparent;
                cursor: pointer;
                border-radius: 4px;
                overflow: hidden;
            }}
            .thumb.active {{ border-color: #e74c3c; }}
            .thumb canvas {{ width: 100%; display: block; }}
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
            #page-wrapper {{
                background: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                position: relative;
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
            #save-btn {{
                width: 100%;
                padding: 14px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 20px;
            }}
            #save-btn:hover {{ background: #c0392b; }}
            
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
        </style>
    </head>
    <body>
        <div id="toolbar">
            <div class="toolbar-top">
                <h1>✏️ Edit PDF</h1>
                <button id="save-btn-top" onclick="save()">💾 Download PDF</button>
            </div>
            <div class="toolbar-bottom">
                <div class="tool-group">
                    <button class="mode-btn" onclick="setMode('annotate')">✏️ Annotate</button>
                    <button class="mode-btn active" onclick="setMode('edit')">📝 Edit</button>
                </div>
                <div class="tool-group">
                    <button class="tool-btn" onclick="addText()" title="Text">T</button>
                    <button class="tool-btn" onclick="addImage()" title="Image">🖼️</button>
                    <button class="tool-btn" onclick="setTool('draw')" title="Draw">✏️</button>
                    <button class="tool-btn" onclick="addShape('rect')" title="Rectangle">▭</button>
                    <button class="tool-btn" onclick="addShape('circle')" title="Circle">⭕</button>
                </div>
                <select id="font" onchange="updateFont()">
                    <option>Arial</option>
                    <option>Courier New</option>
                    <option>Georgia</option>
                    <option>Times New Roman</option>
                    <option>Verdana</option>
                </select>
                <input type="number" id="size" value="36" min="8" max="100" onchange="updateSize()" style="width:60px;">
                <button class="format-btn" onclick="toggleBold()" title="Bold">B</button>
                <button class="format-btn" onclick="toggleItalic()" title="Italic">I</button>
                <button class="format-btn" onclick="toggleUnderline()" title="Underline">U</button>
                <input type="color" id="color" value="#000000" onchange="updateColor()" style="width:40px; height:36px; border:1px solid #ddd; border-radius:4px;">
                <span id="status" style="margin-left:auto; color:#666; font-size:13px;">Loading...</span>
            </div>
        </div>
        
        <!-- Bottom Controls -->
        <div id="bottom-controls">
            <button onclick="prevPage()">◀</button>
            <span id="page-info">1 / 1</span>
            <button onclick="nextPage()">▶</button>
            <button onclick="zoomOut()">−</button>
            <span id="zoom-level">100%</span>
            <button onclick="zoomIn()">+</button>
        </div>
        
        <div id="main">
            <div id="sidebar"></div>
            <div id="canvas-area">
                <div id="page-wrapper"></div>
            </div>
            <div id="right-panel">
                <h3>Page 1</h3>
                <p style="color:#999; font-size:13px; margin-bottom:20px;">Reorder items to move them to the back or front.</p>
                <button onclick="clearAll()" style="width:100%; padding:8px; background:#f0f0f0; border:1px solid #ddd; border-radius:4px; cursor:pointer; margin-bottom:15px;">Remove all</button>
                <div id="text-list"></div>
                <button id="save-btn" onclick="save()">💾 Edit PDF</button>
            </div>
        </div>
        
        <input type="file" id="img-input" accept="image/*" style="display:none;">

        <script>
            // Set worker
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            let pdfDoc, currentPage = 1, scale = 1.5, fabric, pdfCanvas;
            let texts = [], textId = 1;
            
            // Create blob URL from base64
            const base64 = '{pdf_base64}';
            const binary = atob(base64);
            const len = binary.length;
            const buffer = new ArrayBuffer(len);
            const view = new Uint8Array(buffer);
            for (let i = 0; i < len; i++) {{
                view[i] = binary.charCodeAt(i);
            }}
            const blob = new Blob([view], {{ type: 'application/pdf' }});
            const url = URL.createObjectURL(blob);
            
            // Load PDF
            pdfjsLib.getDocument(url).promise.then(pdf => {{
                document.getElementById('status').textContent = 'PDF Loaded: ' + pdf.numPages + ' pages';
                pdfDoc = pdf;
                
                // Render thumbnails
                for (let i = 1; i <= pdf.numPages; i++) {{
                    pdf.getPage(i).then(page => {{
                        const scale = 0.15;
                        const viewport = page.getViewport({{ scale }});
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        
                        const div = document.createElement('div');
                        div.className = 'thumb' + (i === 1 ? ' active' : '');
                        div.onclick = () => renderPage(i);
                        
                        const label = document.createElement('div');
                        label.className = 'thumb-label';
                        label.textContent = i;
                        
                        div.appendChild(canvas);
                        div.appendChild(label);
                        document.getElementById('sidebar').appendChild(div);
                        
                        page.render({{ canvasContext: canvas.getContext('2d'), viewport }});
                    }});
                }}
                
                renderPage(1);
            }}).catch(err => {{
                document.getElementById('status').textContent = 'Error: ' + err.message;
                console.error(err);
            }});
            
            function renderPage(num) {{
                currentPage = num;
                document.getElementById('page-info').textContent = num + ' / ' + pdfDoc.numPages;
                document.getElementById('right-panel').querySelector('h3').textContent = 'Page ' + num;
                document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i + 1 === num));
                
                pdfDoc.getPage(num).then(page => {{
                    const viewport = page.getViewport({{ scale }});
                    const wrapper = document.getElementById('page-wrapper');
                    wrapper.innerHTML = '';
                    wrapper.style.width = viewport.width + 'px';
                    wrapper.style.height = viewport.height + 'px';
                    wrapper.style.position = 'relative';
                    
                    pdfCanvas = document.createElement('canvas');
                    pdfCanvas.width = viewport.width;
                    pdfCanvas.height = viewport.height;
                    pdfCanvas.style.position = 'absolute';
                    pdfCanvas.style.left = '0';
                    pdfCanvas.style.top = '0';
                    
                    const fabricCanvas = document.createElement('canvas');
                    fabricCanvas.id = 'fabric' + num;
                    fabricCanvas.width = viewport.width;
                    fabricCanvas.height = viewport.height;
                    fabricCanvas.style.position = 'absolute';
                    fabricCanvas.style.left = '0';
                    fabricCanvas.style.top = '0';
                    
                    wrapper.appendChild(pdfCanvas);
                    wrapper.appendChild(fabricCanvas);
                    
                    page.render({{ canvasContext: pdfCanvas.getContext('2d'), viewport }}).promise.then(() => {{
                        if (fabric) fabric.dispose();
                        fabric = new window.fabric.Canvas('fabric' + num);
                        texts = [];
                        updateList();
                    }});
                }});
            }}
            
            function addText() {{
                const t = new window.fabric.IText('New Text ' + textId, {{
                    left: 100, top: 100,
                    fontSize: parseInt(document.getElementById('size').value),
                    fill: document.getElementById('color').value,
                    fontFamily: document.getElementById('font').value
                }});
                fabric.add(t);
                fabric.setActiveObject(t);
                t.enterEditing();
                texts.push({{ id: textId++, obj: t }});
                updateList();
            }}
            
            function updateList() {{
                const list = document.getElementById('text-list');
                list.innerHTML = '';
                texts.forEach(t => {{
                    const d = document.createElement('div');
                    d.className = 'text-item';
                    d.innerHTML = '<span>' + (t.obj.text || 'Text') + '</span><span onclick="deleteText(' + t.id + ')">🗑️</span>';
                    list.appendChild(d);
                }});
            }}
            
            function deleteText(id) {{
                const t = texts.find(x => x.id === id);
                if (t) {{
                    fabric.remove(t.obj);
                    texts = texts.filter(x => x.id !== id);
                    updateList();
                }}
            }}
            
            function updateFont() {{
                const o = fabric.getActiveObject();
                if (o && o.type === 'i-text') {{
                    o.set('fontFamily', document.getElementById('font').value);
                    fabric.renderAll();
                }}
            }}
            
            function updateSize() {{
                const o = fabric.getActiveObject();
                if (o && o.type === 'i-text') {{
                    o.set('fontSize', parseInt(document.getElementById('size').value));
                    fabric.renderAll();
                }}
            }}
            
            function updateColor() {{
                const o = fabric.getActiveObject();
                if (o) {{
                    o.set('fill', document.getElementById('color').value);
                    fabric.renderAll();
                }}
            }}
            
            function toggleBold() {{
                const o = fabric.getActiveObject();
                if (o && o.type === 'i-text') {{
                    o.set('fontWeight', o.fontWeight === 'bold' ? 'normal' : 'bold');
                    fabric.renderAll();
                }}
            }}
            
            function toggleItalic() {{
                const o = fabric.getActiveObject();
                if (o && o.type === 'i-text') {{
                    o.set('fontStyle', o.fontStyle === 'italic' ? 'normal' : 'italic');
                    fabric.renderAll();
                }}
            }}
            
            function toggleUnderline() {{
                const o = fabric.getActiveObject();
                if (o && o.type === 'i-text') {{
                    o.set('underline', !o.underline);
                    fabric.renderAll();
                }}
            }}
            
            function clearAll() {{
                if (confirm('Remove all annotations?')) {{
                    texts.forEach(t => fabric.remove(t.obj));
                    texts = [];
                    updateList();
                }}
            }}
            
            function prevPage() {{ if (currentPage > 1) renderPage(currentPage - 1); }}
            function nextPage() {{ if (currentPage < pdfDoc.numPages) renderPage(currentPage + 1); }}
            function zoomIn() {{ scale += 0.1; renderPage(currentPage); document.getElementById('zoom-level').textContent = Math.round(scale * 100) + '%'; }}
            function zoomOut() {{ scale = Math.max(0.5, scale - 0.1); renderPage(currentPage); document.getElementById('zoom-level').textContent = Math.round(scale * 100) + '%'; }}
            function setMode(m) {{}}
            function setTool(t) {{}}
            function addShape(s) {{}}
            
            function save() {{
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
            
            function addImage() {{ document.getElementById('img-input').click(); }}
            
            document.getElementById('img-input').onchange = function(e) {{
                const file = e.target.files[0];
                if (file) {{
                    const reader = new FileReader();
                    reader.onload = function(ev) {{
                        window.fabric.Image.fromURL(ev.target.result, function(img) {{
                            img.scaleToWidth(200);
                            fabric.add(img);
                        }});
                    }};
                    reader.readAsDataURL(file);
                }}
            }};
        </script>
    </body>
    </html>
    """

    st.components.v1.html(html, height=1000, scrolling=False)
else:
    st.markdown("<h2 style='text-align:center; padding:50px;'>📄 Upload PDF - iLovePDF Clone</h2>", unsafe_allow_html=True)
