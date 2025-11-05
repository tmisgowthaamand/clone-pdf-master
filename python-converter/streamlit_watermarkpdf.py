#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Streamlit + FastAPI Backend for PDF Watermark
iLovePDF-style watermark functionality
"""

import streamlit as st
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io
import uvicorn
import threading
import os
from pathlib import Path

# FastAPI app (runs in background)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def add_watermark(pdf_bytes, text, position, transparency, rotation, is_mosaic, from_page, to_page):
    """Add watermark to PDF with iLovePDF-style options"""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    writer = PdfWriter()
    total = len(reader.pages)
    to_page = min(to_page or total, total)
    from_page = max(from_page, 1)

    # Position mapping (x, y offsets from center)
    pos_map = {
        "top-left": (50, -50), 
        "top-center": (0, -50), 
        "top-right": (-50, -50),
        "middle-left": (50, 0), 
        "center": (0, 0), 
        "middle-right": (-50, 0),
        "bottom-left": (50, 50), 
        "bottom-center": (0, 50), 
        "bottom-right": (-50, 50),
    }
    dx, dy = pos_map.get(position, (0, 0))

    for i in range(total):
        page = reader.pages[i]
        packet = io.BytesIO()
        can = canvas.Canvas(packet, pagesize=(float(page.mediabox.width), float(page.mediabox.height)))
        w, h = float(page.mediabox.width), float(page.mediabox.height)

        # Only add watermark to specified page range
        if from_page <= i + 1 <= to_page:
            opacity = (100 - transparency) / 100.0
            
            if is_mosaic:
                # Mosaic pattern - repeat watermark across page
                for x in range(-int(w), int(w*2), 200):
                    for y in range(-int(h), int(h*2), 200):
                        can.saveState()
                        can.setFillAlpha(opacity)
                        can.translate(w/2 + x + dx, h/2 + y + dy)
                        can.rotate(rotation)
                        can.setFont("Helvetica", 36)
                        can.drawCentredString(0, 0, text)
                        can.restoreState()
            else:
                # Single watermark at specified position
                can.saveState()
                can.setFillAlpha(opacity)
                can.translate(w/2 + dx, h/2 + dy)
                can.rotate(rotation)
                can.setFont("Helvetica-Bold", 48)
                can.drawCentredString(0, 0, text)
                can.restoreState()
        
        can.showPage()
        can.save()
        packet.seek(0)
        watermark = PdfReader(packet).pages[0]
        new_page = writer.add_page(page)
        new_page.merge_page(watermark)

    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()

@app.post("/watermark")
async def watermark(
    file: UploadFile = File(...),
    text: str = Form("iLovePDF"),
    position: str = Form("center"),
    transparency: int = Form(50),
    rotation: int = Form(0),
    is_mosaic: bool = Form(False),
    from_page: int = Form(1),
    to_page: int = Form(None),
):
    """API endpoint to add watermark to PDF"""
    try:
        pdf_bytes = await file.read()
        result = add_watermark(pdf_bytes, text, position, transparency, rotation, is_mosaic, from_page, to_page)
        
        # Generate output filename
        original_name = file.filename.replace('.pdf', '')
        output_filename = f"{original_name}_watermarked.pdf"
        
        return StreamingResponse(
            io.BytesIO(result), 
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={output_filename}"}
        )
    except Exception as e:
        return {"error": str(e)}, 500

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "PDF Watermark API is running"}

# Run FastAPI in background thread
def run_api():
    """Start FastAPI server in background"""
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

# Start API server
threading.Thread(target=run_api, daemon=True).start()

# Streamlit UI
st.set_page_config(page_title="iLovePDF Watermark", layout="wide")
st.markdown("<h1 style='text-align:center; color:#007BFF;'>📄 iLovePDF Watermark Clone</h1>", unsafe_allow_html=True)

# Check if frontend build exists
frontend_path = Path(__file__).parent.parent / "frontend" / "build" / "index.html"

if frontend_path.exists():
    # Embed TSX Frontend
    with open(frontend_path, "r", encoding="utf-8") as f:
        html = f.read()
    st.components.v1.html(html, height=800, scrolling=True)
else:
    # Fallback UI if frontend not built
    st.warning("⚠️ Frontend not found. Using fallback UI.")
    st.info("📍 API is running at: http://127.0.0.1:8000")
    st.info("📍 Test endpoint: http://127.0.0.1:8000/")
    
    st.markdown("---")
    st.subheader("Upload PDF to Add Watermark")
    
    uploaded_file = st.file_uploader("Choose a PDF file", type=['pdf'])
    
    col1, col2 = st.columns(2)
    with col1:
        watermark_text = st.text_input("Watermark Text", "iLovePDF")
        position = st.selectbox("Position", [
            "center", "top-left", "top-center", "top-right",
            "middle-left", "middle-right",
            "bottom-left", "bottom-center", "bottom-right"
        ])
        transparency = st.slider("Transparency (%)", 0, 100, 50)
    
    with col2:
        rotation = st.slider("Rotation (degrees)", -180, 180, 0)
        is_mosaic = st.checkbox("Mosaic Pattern")
        from_page = st.number_input("From Page", min_value=1, value=1)
        to_page = st.number_input("To Page (0 = all)", min_value=0, value=0)
    
    if uploaded_file and st.button("Add Watermark", type="primary"):
        with st.spinner("Adding watermark..."):
            try:
                pdf_bytes = uploaded_file.read()
                result = add_watermark(
                    pdf_bytes, 
                    watermark_text, 
                    position, 
                    transparency, 
                    rotation, 
                    is_mosaic, 
                    from_page, 
                    to_page or None
                )
                
                st.success("✅ Watermark added successfully!")
                st.download_button(
                    label="📥 Download Watermarked PDF",
                    data=result,
                    file_name=f"{uploaded_file.name.replace('.pdf', '')}_watermarked.pdf",
                    mime="application/pdf"
                )
            except Exception as e:
                st.error(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    st.write("🚀 Server is running...")
