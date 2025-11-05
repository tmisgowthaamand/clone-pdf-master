import streamlit as st
import os
import tempfile
import zipfile
from pathlib import Path
import pandas as pd

st.set_page_config(
    page_title="PDF to Excel - iLovePDF Clone",
    page_icon="📊",
    layout="wide"
)

st.title("📊 **PDF to Excel (XLSX) Converter**")
st.markdown("### _Powered by Camelot • iLovePDF-like Quality ✨")

# Sidebar for instructions
with st.sidebar:
    st.header("📋 Quick Start")
    st.markdown("""
    1. **Upload** one or more `.pdf` files
    2. **Click Convert**
    3. **Download ZIP** with all XLSX files
    """)
    st.info("**Pro Tip**: Tables become editable Excel sheets • Data & formatting preserved!")

uploaded_files = st.file_uploader(
    "📤 **Upload PDF Files**",
    type=["pdf"],
    accept_multiple_files=True,
    help="Supports multiple files • Max size per file: Unlimited!"
)

if uploaded_files:
    if st.button("🚀 **CONVERT TO EXCEL**", type="primary", use_container_width=True):
        with st.spinner("Extracting tables... This takes ~5-30s per file"):
            with tempfile.TemporaryDirectory() as tmpdir:
                # Save uploaded files
                pdf_paths = []
                for uploaded_file in uploaded_files:
                    pdf_path = os.path.join(tmpdir, uploaded_file.name)
                    with open(pdf_path, "wb") as f:
                        f.write(uploaded_file.getvalue())
                    pdf_paths.append(pdf_path)

                # Conversion progress
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                # Extract tables from each PDF using pdfplumber
                xlsx_paths = []
                for i, pdf_path in enumerate(pdf_paths):
                    status_text.text(f"Extracting tables from: {os.path.basename(pdf_path)}")
                    
                    try:
                        import camelot
                        
                        all_tables = []
                        
                        st.text("Using Camelot (iLovePDF-like quality)...")
                        
                        # Try lattice mode first (for tables with borders)
                        try:
                            st.text("  Strategy 1: Lattice mode (bordered tables)...")
                            tables = camelot.read_pdf(str(pdf_path), pages='all', flavor='lattice')
                            if tables and len(tables) > 0:
                                for idx, table in enumerate(tables):
                                    df = table.df
                                    if not df.empty and len(df) > 1:
                                        # Use first row as header
                                        df.columns = df.iloc[0]
                                        df = df[1:]
                                        df = df.reset_index(drop=True)
                                        all_tables.append(df)
                                        st.text(f"    ✓ Table {idx + 1}: {len(df)} rows × {len(df.columns)} columns (accuracy: {table.accuracy:.1f}%)")
                        except Exception as e:
                            st.text(f"    Lattice mode failed: {str(e)[:80]}")
                        
                        # Try stream mode (for tables without borders)
                        if not all_tables:
                            try:
                                st.text("  Strategy 2: Stream mode (borderless tables)...")
                                tables = camelot.read_pdf(str(pdf_path), pages='all', flavor='stream', edge_tol=50)
                                if tables and len(tables) > 0:
                                    for idx, table in enumerate(tables):
                                        df = table.df
                                        if not df.empty and len(df) > 1:
                                            # Use first row as header
                                            df.columns = df.iloc[0]
                                            df = df[1:]
                                            df = df.reset_index(drop=True)
                                            all_tables.append(df)
                                            st.text(f"    ✓ Table {idx + 1}: {len(df)} rows × {len(df.columns)} columns")
                            except Exception as e:
                                st.text(f"    Stream mode failed: {str(e)[:80]}")
                        
                        if all_tables and len(all_tables) > 0:
                            # Create Excel file with all tables combined in single sheet
                            base_name = os.path.splitext(os.path.basename(pdf_path))[0]
                            xlsx_path = os.path.join(tmpdir, f"{base_name}.xlsx")
                            
                            # Combine all tables into one DataFrame
                            if len(all_tables) == 1:
                                combined_df = all_tables[0]
                            else:
                                # Standardize column names across all tables
                                max_cols = max(len(df.columns) for df in all_tables)
                                standard_columns = [f"Column_{i+1}" for i in range(max_cols)]
                                
                                # Normalize all tables to have same columns
                                normalized_tables = []
                                for idx, table_df in enumerate(all_tables):
                                    # Reset columns to standard names
                                    table_df = table_df.copy()
                                    current_cols = len(table_df.columns)
                                    table_df.columns = standard_columns[:current_cols]
                                    
                                    # Add missing columns if needed
                                    for i in range(current_cols, max_cols):
                                        table_df[standard_columns[i]] = ''
                                    
                                    normalized_tables.append(table_df)
                                    
                                    # Add empty row between tables
                                    if idx < len(all_tables) - 1:
                                        empty_row = pd.DataFrame([[''] * max_cols], columns=standard_columns)
                                        normalized_tables.append(empty_row)
                                
                                combined_df = pd.concat(normalized_tables, ignore_index=True)
                            
                            # Write to Excel with formatting
                            with pd.ExcelWriter(xlsx_path, engine='openpyxl') as writer:
                                combined_df.to_excel(writer, sheet_name='Sheet1', index=False)
                                
                                # Get worksheet and apply formatting
                                worksheet = writer.sheets['Sheet1']
                                
                                # Auto-adjust column widths
                                for column in worksheet.columns:
                                    max_length = 0
                                    column_letter = column[0].column_letter
                                    for cell in column:
                                        try:
                                            if len(str(cell.value)) > max_length:
                                                max_length = len(str(cell.value))
                                        except:
                                            pass
                                    adjusted_width = min(max_length + 2, 50)
                                    worksheet.column_dimensions[column_letter].width = adjusted_width
                            
                            xlsx_paths.append(xlsx_path)
                            st.success(f"✅ Extracted {len(all_tables)} table(s) from: {os.path.basename(pdf_path)}")
                            
                            # Show preview of extracted data
                            with st.expander(f"📊 Preview: {os.path.basename(pdf_path)}"):
                                for idx, table_df in enumerate(all_tables[:3]):  # Show first 3 tables
                                    st.write(f"**Table {idx + 1}** ({len(table_df)} rows × {len(table_df.columns)} columns)")
                                    st.dataframe(table_df.head(5))
                        else:
                            st.warning(f"⚠️ No tables found in: {os.path.basename(pdf_path)}")
                            st.info("💡 This PDF may not contain structured tables. Try a different PDF or check if it's a scanned document.")
                    
                    except ImportError:
                        st.error("❌ Please install required libraries: `pip install camelot-py[cv] ghostscript openpyxl pandas`")
                        st.stop()
                    except Exception as e:
                        st.warning(f"⚠️ Error processing {os.path.basename(pdf_path)}: {str(e)}")
                    
                    progress_bar.progress((i + 1) / len(pdf_paths))

                status_text.text("✅ **All done!**")

                if xlsx_paths:
                    # Create ZIP
                    zip_path = os.path.join(tmpdir, 'pdf_to_excel.zip')
                    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                        for xlsx_path in xlsx_paths:
                            zipf.write(xlsx_path, os.path.basename(xlsx_path))

                    # Download button
                    with open(zip_path, 'rb') as f:
                        st.download_button(
                            label=f"📥 **Download {len(xlsx_paths)} Excel Files (ZIP)**",
                            data=f.read(),
                            file_name=f"{len(xlsx_paths)}_pdf_to_excel.zip",
                            mime="application/zip",
                            use_container_width=True
                        )
                    
                    st.balloons()
                    st.success(f"🎉 **Success!** Extracted tables from {len(xlsx_paths)} PDF(s). Open in Excel for editing.")
                    st.info("💡 **All tables combined in a single sheet** with proper formatting and spacing.")
                else:
                    st.error("❌ No tables were extracted from any PDFs.")
                    st.info("""
                    **Possible reasons:**
                    - PDF contains images of tables (scanned documents)
                    - PDF has no structured tables
                    - Tables are too complex to detect
                    
                    **Try:**
                    - Use a PDF with text-based tables (not scanned)
                    - Ensure the PDF has visible table borders or clear column structure
                    """)

# Footer
st.markdown("---")
st.markdown("*Made with ❤️ • **Powered by Camelot** • **iLovePDF-like Quality** • **Extract Tables from PDF to Excel**")
