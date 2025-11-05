import streamlit as st
import os
import tempfile
import base64

st.set_page_config(page_title="Edit PDF", page_icon="✏️", layout="wide", initial_sidebar_state="collapsed")

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
        pdf_path = tmp_file.name

    with open(pdf_path, "rb") as f:
        base64_pdf = base64.b64encode(f.read()).decode('utf-8')

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
            body {{ font-family: Arial, sans-serif; background: #f5f5f5; }}
            
            #toolbar {{
                background: white;
                padding: 15px 20px;
                border-bottom: 1px solid #ddd;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }}
            
            .tools {{
                display: flex;
                gap: 10px;
            }}
            
            button {{
                padding: 10px 20px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }}
            
            button:hover {{ background: #f0f0f0; }}
            button.active {{ background: #e74c3c; color: white; border-color: #e74c3c; }}
            
            #save-btn {{
                background: #e74c3c;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-weight: bold;
            }}
            
            #main {{
                display: flex;
                height: calc(100vh - 70px);
            }}
            
            #sidebar {{
                width: 150px;
                background: #fafafa;
                border-right: 1px solid #ddd;
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
            .thumb-label {{ text-align: center; padding: 5px; background: white; font-size: 11px; }}
            
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
            
            #right-panel {{
                width: 280px;
                background: white;
                border-left: 1px solid #ddd;
                padding: 20px;
                overflow-y: auto;
            }}
            
            .text-item {{
                background: #f8f8f8;
                padding: 12px;
                margin-bottom: 8px;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
            }}
            
            .text-item:hover {{ background: #f0f0f0; }}
            .delete-btn {{ color: #e74c3c; cursor: pointer; }}
            
            .controls {{
                margin-bottom: 15px;
            }}
            
            .controls label {{
                display: block;
                font-size: 12px;
                margin-bottom: 5px;
                color: #666;
            }}
            
            .controls select, .controls input {{
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }}
        </style>
    </head>
    <body>
        <div id="toolbar">
            <div class="tools">
                <button onclick="addText()">📝 Add Text</button>
                <button onclick="addImage()">🖼️ Add Image</button>
                <button onclick="setTool('draw')">✏️ Draw</button>
                <select id="font" style="padding:8px;">
                    <option>Arial</option>
                    <option>Times New Roman</option>
                    <option>Courier New</option>
                </select>
                <input type="number" id="size" value="20" min="8" max="72" style="width:60px; padding:8px;">
                <input type="color" id="color" value="#000000" style="width:50px; height:38px;">
            </div>
            <button id="save-btn" onclick="save()">💾 Download PDF</button>
        </div>
        
        <div id="main">
            <div id="sidebar"></div>
            <div id="canvas-area">
                <div id="page-wrapper"></div>
            </div>
            <div id="right-panel">
                <h3 style="margin-bottom:15px;">Page 1</h3>
                <div id="text-list"></div>
            </div>
        </div>
        
        <input type="file" id="img-input" accept="image/*" style="display:none;">

        <script>
            console.log('Script starting...');
            
            const pdfData = atob("{base64_pdf}");
            const pdfArray = new Uint8Array(pdfData.length);
            for (let i = 0; i < pdfData.length; i++) {{
                pdfArray[i] = pdfData.charCodeAt(i);
            }}
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            let pdfDoc, currentPage = 1, fabric, pdfCanvas;
            let texts = [];
            let textId = 1;
            
            console.log('Loading PDF...');
            
            pdfjsLib.getDocument({{ data: pdfArray }}).promise.then(pdf => {{
                console.log('PDF loaded, pages:', pdf.numPages);
                pdfDoc = pdf;
                
                // Render thumbnails
                for (let i = 1; i <= pdf.numPages; i++) {{
                    pdf.getPage(i).then(page => {{
                        const scale = 0.2;
                        const viewport = page.getViewport({{ scale }});
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        
                        const div = document.createElement('div');
                        div.className = 'thumb' + (i === 1 ? ' active' : '');
                        div.onclick = () => renderPage(i);
                        
                        const label = document.createElement('div');
                        label.className = 'thumb-label';
                        label.textContent = 'Page ' + i;
                        
                        div.appendChild(canvas);
                        div.appendChild(label);
                        document.getElementById('sidebar').appendChild(div);
                        
                        page.render({{ canvasContext: canvas.getContext('2d'), viewport }});
                    }});
                }}
                
                renderPage(1);
            }}).catch(err => {{
                console.error('PDF load error:', err);
                alert('Error loading PDF: ' + err.message);
            }});
            
            function renderPage(num) {{
                console.log('Rendering page', num);
                currentPage = num;
                
                document.querySelectorAll('.thumb').forEach((t, i) => {{
                    t.classList.toggle('active', i + 1 === num);
                }});
                
                pdfDoc.getPage(num).then(page => {{
                    const scale = 1.5;
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
                    fabricCanvas.id = 'c';
                    fabricCanvas.width = viewport.width;
                    fabricCanvas.height = viewport.height;
                    fabricCanvas.style.position = 'absolute';
                    
                    wrapper.appendChild(pdfCanvas);
                    wrapper.appendChild(fabricCanvas);
                    
                    page.render({{ 
                        canvasContext: pdfCanvas.getContext('2d'), 
                        viewport: viewport 
                    }}).promise.then(() => {{
                        console.log('Page rendered');
                        
                        if (fabric) fabric.dispose();
                        fabric = new window.fabric.Canvas('c');
                        texts = [];
                        updateList();
                    }});
                }});
            }}
            
            function addText() {{
                const text = new window.fabric.IText('Text ' + textId, {{
                    left: 100,
                    top: 100,
                    fontSize: parseInt(document.getElementById('size').value),
                    fill: document.getElementById('color').value,
                    fontFamily: document.getElementById('font').value
                }});
                fabric.add(text);
                fabric.setActiveObject(text);
                texts.push({{ id: textId++, obj: text }});
                updateList();
            }}
            
            function updateList() {{
                const list = document.getElementById('text-list');
                list.innerHTML = '';
                texts.forEach(t => {{
                    const div = document.createElement('div');
                    div.className = 'text-item';
                    div.innerHTML = `<span>${{t.obj.text}}</span><span class="delete-btn" onclick="deleteText(${{t.id}})">🗑️</span>`;
                    div.onclick = (e) => {{
                        if (!e.target.classList.contains('delete-btn')) {{
                            fabric.setActiveObject(t.obj);
                            fabric.renderAll();
                        }}
                    }};
                    list.appendChild(div);
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
            function setTool(tool) {{}}
            
            document.getElementById('img-input').onchange = function(e) {{
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
            }};
        </script>
    </body>
    </html>
    """

    st.components.v1.html(html, height=1000, scrolling=False)
else:
    st.markdown("<h2 style='text-align:center; padding:50px;'>📄 Upload PDF to Edit</h2>", unsafe_allow_html=True)
