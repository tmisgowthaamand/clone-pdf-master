import streamlit as st
import tempfile
import base64
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
    # Save PDF to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf", mode='wb') as tmp_file:
        tmp_file.write(uploaded_file.getvalue())
        pdf_path = tmp_file.name
    
    # Read as base64
    with open(pdf_path, 'rb') as f:
        pdf_data = f.read()
        base64_pdf = base64.b64encode(pdf_data).decode('utf-8')

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
            body {{ font-family: Arial; background: #f5f5f5; overflow: hidden; }}
            
            #toolbar {{
                background: white;
                height: 110px;
                border-bottom: 1px solid #ddd;
            }}
            .toolbar-row {{
                height: 55px;
                display: flex;
                align-items: center;
                padding: 0 15px;
                gap: 10px;
            }}
            .toolbar-row:first-child {{ border-bottom: 1px solid #f0f0f0; }}
            
            button {{
                padding: 8px 16px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 5px;
                cursor: pointer;
                font-size: 13px;
            }}
            button:hover {{ background: #f0f0f0; }}
            button.active {{ background: #e74c3c; color: white; border-color: #e74c3c; }}
            
            select, input[type="number"] {{
                padding: 6px 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }}
            
            #main {{
                display: flex;
                height: calc(100vh - 110px);
            }}
            
            #sidebar {{
                width: 120px;
                background: #fafafa;
                border-right: 1px solid #ddd;
                overflow-y: auto;
                padding: 10px 5px;
            }}
            
            .thumb {{
                width: 110px;
                margin-bottom: 8px;
                border: 2px solid transparent;
                cursor: pointer;
                border-radius: 4px;
                background: white;
            }}
            .thumb.active {{ border-color: #e74c3c; }}
            .thumb canvas {{ width: 100%; display: block; }}
            .thumb-label {{ text-align: center; padding: 4px; font-size: 11px; }}
            
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
            
            #right-panel {{
                width: 280px;
                background: white;
                border-left: 1px solid #ddd;
                padding: 20px;
                overflow-y: auto;
            }}
            
            .text-item {{
                background: #f8f8f8;
                padding: 10px;
                margin-bottom: 8px;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                font-size: 13px;
            }}
            .text-item:hover {{ background: #f0f0f0; }}
            
            #save-btn {{
                width: 100%;
                padding: 14px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                margin-top: 20px;
            }}
            #save-btn:hover {{ background: #c0392b; }}
        </style>
    </head>
    <body>
        <div id="toolbar">
            <div class="toolbar-row">
                <button class="active">Edit</button>
            </div>
            <div class="toolbar-row">
                <button onclick="addText()">T</button>
                <button onclick="addImage()">🖼️</button>
                <select id="font">
                    <option>Arial</option>
                    <option>Times New Roman</option>
                    <option>Courier New</option>
                </select>
                <input type="number" id="size" value="36" min="8" max="100" style="width:60px;">
                <button onclick="toggleBold()">B</button>
                <button onclick="toggleItalic()">I</button>
                <button onclick="toggleUnderline()">U</button>
                <input type="color" id="color" value="#000000" style="width:40px; height:36px;">
            </div>
        </div>
        
        <div id="main">
            <div id="sidebar"></div>
            <div id="canvas-area">
                <div id="page-wrapper"></div>
            </div>
            <div id="right-panel">
                <h3 style="margin-bottom:10px;">Page 1</h3>
                <button onclick="clearAll()" style="width:100%; padding:8px; background:#f0f0f0; border:1px solid #ddd; border-radius:4px; margin-bottom:15px;">Remove all</button>
                <div id="text-list"></div>
                <button id="save-btn" onclick="save()">💾 Edit PDF</button>
            </div>
        </div>
        
        <input type="file" id="img-input" accept="image/*" style="display:none;">

        <script>
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            let pdfDoc, currentPage = 1, scale = 1.5, fabric, pdfCanvas;
            let texts = [], textId = 1;
            
            // Load PDF
            const pdfDataUrl = 'data:application/pdf;base64,{base64_pdf}';
            
            fetch(pdfDataUrl)
                .then(res => res.arrayBuffer())
                .then(buffer => {{
                    return pdfjsLib.getDocument({{ data: buffer }}).promise;
                }})
                .then(pdf => {{
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
                }})
                .catch(err => {{
                    console.error('Error:', err);
                    alert('Error loading PDF: ' + err.message);
                }});
            
            function renderPage(num) {{
                currentPage = num;
                document.getElementById('right-panel').querySelector('h3').textContent = 'Page ' + num;
                document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i + 1 === num));
                
                pdfDoc.getPage(num).then(page => {{
                    const viewport = page.getViewport({{ scale }});
                    const wrapper = document.getElementById('page-wrapper');
                    wrapper.innerHTML = '';
                    wrapper.style.width = viewport.width + 'px';
                    wrapper.style.height = viewport.height + 'px';
                    
                    pdfCanvas = document.createElement('canvas');
                    pdfCanvas.width = viewport.width;
                    pdfCanvas.height = viewport.height;
                    pdfCanvas.style.position = 'absolute';
                    
                    const fabricCanvas = document.createElement('canvas');
                    fabricCanvas.id = 'c' + num;
                    fabricCanvas.width = viewport.width;
                    fabricCanvas.height = viewport.height;
                    fabricCanvas.style.position = 'absolute';
                    
                    wrapper.appendChild(pdfCanvas);
                    wrapper.appendChild(fabricCanvas);
                    
                    page.render({{ canvasContext: pdfCanvas.getContext('2d'), viewport }}).promise.then(() => {{
                        if (fabric) fabric.dispose();
                        fabric = new window.fabric.Canvas('c' + num);
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
                    d.innerHTML = '<span>' + (t.obj.text || 'Text') + '</span><span onclick="deleteText(' + t.id + ')" style="cursor:pointer;">🗑️</span>';
                    d.onclick = (e) => {{
                        if (e.target.tagName !== 'SPAN' || !e.target.textContent.includes('🗑️')) {{
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
                if (confirm('Remove all?')) {{
                    texts.forEach(t => fabric.remove(t.obj));
                    texts = [];
                    updateList();
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
    st.markdown("<h2 style='text-align:center; padding:50px;'>📄 Upload PDF to Edit - iLovePDF Clone</h2>", unsafe_allow_html=True)
