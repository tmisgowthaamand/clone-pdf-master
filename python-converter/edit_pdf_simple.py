import streamlit as st
import tempfile
import base64

st.set_page_config(page_title="Edit PDF - Debug", page_icon="✏️", layout="wide", initial_sidebar_state="collapsed")

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
        pdf_bytes = uploaded_file.getvalue()
    
    base64_pdf = base64.b64encode(pdf_bytes).decode('utf-8')
    
    # Show debug info
    st.write(f"PDF uploaded: {uploaded_file.name}")
    st.write(f"File size: {len(pdf_bytes)} bytes")
    st.write(f"Base64 length: {len(base64_pdf)}")

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
        <style>
            body {{ margin: 0; font-family: Arial; background: #f5f5f5; }}
            #toolbar {{
                background: white;
                padding: 15px;
                border-bottom: 1px solid #ddd;
                display: flex;
                gap: 10px;
                align-items: center;
            }}
            button {{
                padding: 10px 20px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 5px;
                cursor: pointer;
            }}
            button:hover {{ background: #f0f0f0; }}
            #main {{
                display: flex;
                height: calc(100vh - 60px);
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
                background: white;
            }}
            .thumb.active {{ border-color: #e74c3c; }}
            .thumb canvas {{ width: 100%; display: block; }}
            .thumb-label {{ text-align: center; padding: 5px; font-size: 11px; }}
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
            #debug {{
                position: fixed;
                top: 70px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                max-width: 300px;
                z-index: 1000;
            }}
        </style>
    </head>
    <body>
        <div id="toolbar">
            <button onclick="addText()">Add Text</button>
            <button onclick="save()">Download PDF</button>
            <span id="status">Loading...</span>
        </div>
        
        <div id="main">
            <div id="sidebar"></div>
            <div id="canvas-area">
                <div id="page-wrapper"></div>
            </div>
        </div>
        
        <div id="debug">
            <div id="debug-log"></div>
        </div>

        <script>
            const debugLog = document.getElementById('debug-log');
            function log(msg) {{
                console.log(msg);
                debugLog.innerHTML += msg + '<br>';
            }}
            
            log('Starting...');
            log('PDF.js version: ' + pdfjsLib.version);
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            
            let pdfDoc, fabric, pdfCanvas;
            
            // Get PDF data
            const base64 = "{base64_pdf}";
            log('Base64 length: ' + base64.length);
            
            if (base64.length === 0) {{
                log('ERROR: No PDF data!');
                document.getElementById('status').textContent = 'Error: No PDF data';
            }} else {{
                log('Converting base64...');
                try {{
                    const binary = atob(base64);
                    log('Binary length: ' + binary.length);
                    
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {{
                        bytes[i] = binary.charCodeAt(i);
                    }}
                    log('Bytes array created: ' + bytes.length);
                    
                    // Check PDF header
                    const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
                    log('PDF header: ' + header);
                    
                    if (header !== '%PDF-') {{
                        log('ERROR: Invalid PDF header!');
                        document.getElementById('status').textContent = 'Error: Invalid PDF';
                    }} else {{
                        log('Valid PDF header detected');
                        log('Loading PDF document...');
                        
                        const loadingTask = pdfjsLib.getDocument({{ data: bytes }});
                        
                        loadingTask.promise.then(pdf => {{
                            log('✓ PDF loaded! Pages: ' + pdf.numPages);
                            document.getElementById('status').textContent = 'PDF loaded: ' + pdf.numPages + ' pages';
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
                            log('ERROR loading PDF: ' + err.message);
                            document.getElementById('status').textContent = 'Error: ' + err.message;
                        }});
                    }}
                }} catch (err) {{
                    log('ERROR: ' + err.message);
                    document.getElementById('status').textContent = 'Error: ' + err.message;
                }}
            }}
            
            function renderPage(num) {{
                log('Rendering page ' + num);
                
                pdfDoc.getPage(num).then(page => {{
                    const scale = 1.5;
                    const viewport = page.getViewport({{ scale }});
                    log('Viewport: ' + viewport.width + 'x' + viewport.height);
                    
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
                        log('✓ Page rendered');
                        
                        if (fabric) fabric.dispose();
                        fabric = new window.fabric.Canvas('c');
                        log('✓ Fabric ready');
                    }});
                }});
            }}
            
            function addText() {{
                if (!fabric) return;
                const text = new window.fabric.IText('New Text', {{
                    left: 100,
                    top: 100,
                    fontSize: 24,
                    fill: '#000000'
                }});
                fabric.add(text);
                fabric.setActiveObject(text);
                text.enterEditing();
            }}
            
            function save() {{
                alert('Save functionality - PDF with annotations');
            }}
        </script>
    </body>
    </html>
    """

    st.components.v1.html(html, height=1000, scrolling=False)
else:
    st.markdown("<h2 style='text-align:center; padding:50px;'>📄 Upload PDF to Debug</h2>", unsafe_allow_html=True)
