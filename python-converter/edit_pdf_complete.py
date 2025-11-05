import streamlit as st
import tempfile
import base64

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
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(uploaded_file.getvalue())
    
    with open(tmp_file.name, "rb") as f:
        base64_pdf = base64.b64encode(f.read()).decode('utf-8')

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }}
            
            /* Top Toolbar */
            #toolbar {{
                background: white;
                border-bottom: 1px solid #e0e0e0;
            }}
            .toolbar-row1 {{
                height: 50px;
                display: flex;
                align-items: center;
                padding: 0 15px;
                gap: 15px;
                border-bottom: 1px solid #f0f0f0;
            }}
            .mode-btn {{
                padding: 8px 16px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 20px;
                cursor: pointer;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 5px;
            }}
            .mode-btn.active {{ background: #333; color: white; }}
            .toolbar-row2 {{
                height: 55px;
                display: flex;
                align-items: center;
                padding: 0 15px;
                gap: 8px;
            }}
            .tool-btn {{
                width: 36px;
                height: 36px;
                border: none;
                background: transparent;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }}
            .tool-btn:hover {{ background: #f0f0f0; }}
            .tool-btn.active {{ background: #e74c3c; color: white; }}
            .divider {{ width: 1px; height: 30px; background: #e0e0e0; margin: 0 5px; }}
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
            
            /* Main Layout */
            #main {{
                display: flex;
                height: calc(100vh - 105px);
            }}
            
            /* Left Sidebar */
            #sidebar {{
                width: 120px;
                background: #fafafa;
                border-right: 1px solid #e0e0e0;
                overflow-y: auto;
                padding: 10px 5px;
            }}
            .thumb {{
                width: 110px;
                margin-bottom: 8px;
                border: 2px solid transparent;
                cursor: pointer;
                border-radius: 4px;
                overflow: hidden;
                background: white;
            }}
            .thumb.active {{ border-color: #e74c3c; }}
            .thumb canvas {{ width: 100%; display: block; }}
            .thumb-label {{ text-align: center; padding: 4px; font-size: 11px; color: #666; }}
            
            /* Center Canvas */
            #canvas-area {{
                flex: 1;
                overflow: auto;
                background: #e8e8e8;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                padding: 20px;
            }}
            #page-wrapper {{
                background: white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                position: relative;
            }}
            
            /* Right Panel */
            #right-panel {{
                width: 280px;
                background: white;
                border-left: 1px solid #e0e0e0;
                padding: 20px;
                overflow-y: auto;
            }}
            #right-panel h3 {{
                font-size: 14px;
                margin-bottom: 10px;
                color: #333;
            }}
            #right-panel p {{
                font-size: 12px;
                color: #999;
                margin-bottom: 15px;
            }}
            .text-item {{
                background: #f8f8f8;
                padding: 10px;
                margin-bottom: 8px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 13px;
            }}
            .text-item:hover {{ background: #f0f0f0; }}
            .text-item.active {{ background: #ffe5e5; }}
            .item-controls {{
                display: flex;
                gap: 8px;
                color: #666;
            }}
            .item-controls span {{ cursor: pointer; }}
            .item-controls span:hover {{ color: #e74c3c; }}
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
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }}
            #save-btn:hover {{ background: #c0392b; }}
            
            /* Bottom Controls */
            #bottom-bar {{
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.85);
                padding: 8px 20px;
                border-radius: 25px;
                display: flex;
                gap: 15px;
                align-items: center;
                color: white;
                font-size: 13px;
                z-index: 1000;
            }}
            #bottom-bar button {{
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 16px;
                padding: 5px;
            }}
            #bottom-bar button:hover {{ opacity: 0.7; }}
        </style>
    </head>
    <body>
        <div id="toolbar">
            <div class="toolbar-row1">
                <button class="mode-btn" onclick="setMode('annotate')">
                    <span>✏️</span> Annotate
                </button>
                <button class="mode-btn active" onclick="setMode('edit')">
                    <span>📝</span> Edit
                </button>
            </div>
            <div class="toolbar-row2">
                <button class="tool-btn" onclick="addText()" title="Text">T</button>
                <button class="tool-btn" onclick="addTextBox()" title="Text Box">📝</button>
                <button class="tool-btn" onclick="addImage()" title="Image">🖼️</button>
                <button class="tool-btn" onclick="setTool('draw')" title="Draw">✏️</button>
                <button class="tool-btn" onclick="addShape('rect')" title="Rectangle">▭</button>
                <button class="tool-btn" onclick="addShape('circle')" title="Circle">⭕</button>
                <div class="divider"></div>
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
                <input type="color" id="color" value="#000000" onchange="updateColor()" style="width:40px; height:36px; border:1px solid #ddd; border-radius:4px; cursor:pointer;">
                <div class="divider"></div>
                <button class="tool-btn" onclick="alignText('left')" title="Align Left">≡</button>
                <button class="tool-btn" onclick="alignText('center')" title="Align Center">≣</button>
                <button class="tool-btn" onclick="alignText('right')" title="Align Right">≡</button>
                <input type="range" id="zoom" min="25" max="200" value="100" style="width:100px;" oninput="updateZoom(this.value)">
                <span id="zoom-display">100%</span>
            </div>
        </div>
        
        <div id="main">
            <div id="sidebar"></div>
            <div id="canvas-area">
                <div id="page-wrapper"></div>
            </div>
            <div id="right-panel">
                <h3>Page 1</h3>
                <p>Reorder items to move them to the back or front.</p>
                <button onclick="clearAll()" style="width:100%; padding:8px; background:#f0f0f0; border:1px solid #ddd; border-radius:4px; cursor:pointer; margin-bottom:15px;">Remove all</button>
                <div id="text-list"></div>
                <button id="save-btn" onclick="save()">
                    <span>💾</span> Edit PDF
                </button>
            </div>
        </div>
        
        <div id="bottom-bar">
            <button onclick="prevPage()">◀</button>
            <span id="page-info">1 / 1</span>
            <button onclick="nextPage()">▶</button>
            <button onclick="zoomOut()">−</button>
            <span id="zoom-level">25%</span>
            <button onclick="zoomIn()">+</button>
            <button onclick="rotateLeft()">↺</button>
            <button onclick="rotateRight()">↻</button>
            <button onclick="fullscreen()">⛶</button>
        </div>
        
        <input type="file" id="img-input" accept="image/*" style="display:none;">

        <script>
            console.log('Initializing PDF editor...');
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            let pdfDoc, currentPage = 1, scale = 1.5, fabric, pdfCanvas;
            let texts = [], textId = 1;
            
            // Convert base64 to Uint8Array properly
            const base64str = "{base64_pdf}";
            console.log('Base64 length:', base64str.length);
            
            const binaryString = atob(base64str);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {{
                bytes[i] = binaryString.charCodeAt(i);
            }}
            console.log('PDF bytes:', bytes.length);
            
            // Load PDF
            const loadingTask = pdfjsLib.getDocument({{
                data: bytes,
                cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
                cMapPacked: true,
                standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/'
            }});
            
            console.log('Loading PDF...');
            loadingTask.promise.then(pdf => {{
                console.log('✓ PDF loaded successfully!');
                console.log('  Pages:', pdf.numPages);
                pdfDoc = pdf;
                for (let i = 1; i <= pdf.numPages; i++) {{
                    pdf.getPage(i).then(page => {{
                        const s = 0.15;
                        const vp = page.getViewport({{ scale: s }});
                        const c = document.createElement('canvas');
                        c.width = vp.width;
                        c.height = vp.height;
                        const d = document.createElement('div');
                        d.className = 'thumb' + (i === 1 ? ' active' : '');
                        d.onclick = () => renderPage(i);
                        const l = document.createElement('div');
                        l.className = 'thumb-label';
                        l.textContent = i;
                        d.appendChild(c);
                        d.appendChild(l);
                        document.getElementById('sidebar').appendChild(d);
                        page.render({{ canvasContext: c.getContext('2d'), viewport: vp }});
                    }});
                }}
                renderPage(1);
            }}).catch(err => {{
                console.error('PDF loading error:', err);
                alert('Error loading PDF: ' + err.message);
            }});
            
            function renderPage(num) {{
                console.log('Rendering page', num);
                currentPage = num;
                document.getElementById('page-info').textContent = `${{num}} / ${{pdfDoc.numPages}}`;
                document.getElementById('right-panel').querySelector('h3').textContent = `Page ${{num}}`;
                document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i + 1 === num));
                
                pdfDoc.getPage(num).then(page => {{
                    console.log('Got page', num);
                    const vp = page.getViewport({{ scale }});
                    console.log('Viewport:', vp.width, 'x', vp.height);
                    
                    const w = document.getElementById('page-wrapper');
                    w.innerHTML = '';
                    w.style.width = vp.width + 'px';
                    w.style.height = vp.height + 'px';
                    
                    // PDF canvas
                    pdfCanvas = document.createElement('canvas');
                    pdfCanvas.width = vp.width;
                    pdfCanvas.height = vp.height;
                    pdfCanvas.style.position = 'absolute';
                    pdfCanvas.style.left = '0';
                    pdfCanvas.style.top = '0';
                    
                    // Fabric canvas
                    const fc = document.createElement('canvas');
                    fc.id = 'fabric-canvas-' + num;
                    fc.width = vp.width;
                    fc.height = vp.height;
                    fc.style.position = 'absolute';
                    fc.style.left = '0';
                    fc.style.top = '0';
                    
                    w.appendChild(pdfCanvas);
                    w.appendChild(fc);
                    
                    // Render PDF
                    const renderContext = {{
                        canvasContext: pdfCanvas.getContext('2d'),
                        viewport: vp
                    }};
                    
                    page.render(renderContext).promise.then(() => {{
                        console.log('Page rendered successfully');
                        
                        // Initialize Fabric
                        if (fabric) {{
                            fabric.dispose();
                        }}
                        fabric = new window.fabric.Canvas('fabric-canvas-' + num, {{
                            selection: true,
                            backgroundColor: 'transparent'
                        }});
                        
                        texts = [];
                        updateList();
                        console.log('Fabric canvas ready');
                    }}).catch(err => {{
                        console.error('Render error:', err);
                    }});
                }}).catch(err => {{
                    console.error('Get page error:', err);
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
            
            function addTextBox() {{ addText(); }}
            
            function updateList() {{
                const list = document.getElementById('text-list');
                list.innerHTML = '';
                texts.forEach(t => {{
                    const d = document.createElement('div');
                    d.className = 'text-item';
                    d.innerHTML = `
                        <span>${{t.obj.text || 'Text'}}</span>
                        <div class="item-controls">
                            <span onclick="moveUp(${{t.id}})" title="Move up">↑</span>
                            <span onclick="moveDown(${{t.id}})" title="Move down">↓</span>
                            <span onclick="deleteText(${{t.id}})" title="Delete">✏️</span>
                            <span onclick="deleteText(${{t.id}})" title="Delete">🗑️</span>
                        </div>
                    `;
                    d.onclick = (e) => {{
                        if (!e.target.closest('.item-controls')) {{
                            fabric.setActiveObject(t.obj);
                            fabric.renderAll();
                        }}
                    }};
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
            
            function clearAll() {{
                if (confirm('Remove all annotations?')) {{
                    texts.forEach(t => fabric.remove(t.obj));
                    texts = [];
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
            
            function alignText(align) {{
                const o = fabric.getActiveObject();
                if (o && o.type === 'i-text') {{
                    o.set('textAlign', align);
                    fabric.renderAll();
                }}
            }}
            
            function updateZoom(val) {{
                document.getElementById('zoom-display').textContent = val + '%';
                scale = val / 100 * 1.5;
                renderPage(currentPage);
            }}
            
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
            
            function prevPage() {{ if (currentPage > 1) renderPage(currentPage - 1); }}
            function nextPage() {{ if (currentPage < pdfDoc.numPages) renderPage(currentPage + 1); }}
            function zoomIn() {{ updateZoom(Math.min(200, parseInt(document.getElementById('zoom').value) + 25)); document.getElementById('zoom').value = Math.min(200, parseInt(document.getElementById('zoom').value) + 25); }}
            function zoomOut() {{ updateZoom(Math.max(25, parseInt(document.getElementById('zoom').value) - 25)); document.getElementById('zoom').value = Math.max(25, parseInt(document.getElementById('zoom').value) - 25); }}
            function setMode(m) {{}}
            function setTool(t) {{}}
            function addImage() {{ document.getElementById('img-input').click(); }}
            function addShape(s) {{}}
            function moveUp(id) {{}}
            function moveDown(id) {{}}
            function rotateLeft() {{}}
            function rotateRight() {{}}
            function fullscreen() {{ document.documentElement.requestFullscreen(); }}
            
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
    st.markdown("<h2 style='text-align:center; padding:50px;'>📄 Upload PDF to Edit - iLovePDF Clone</h2>", unsafe_allow_html=True)
