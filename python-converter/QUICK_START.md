# PPTX to PDF Converter - Quick Start Guide

## 🚀 Two Options Available:

### Option 1: Web-Based Converter (NO INSTALLATION NEEDED) ✅
**Already working in your React app!**

1. Start the dev server:
   ```bash
   cd ..
   npm run dev
   ```

2. Open browser: http://localhost:8081

3. Navigate to "PowerPoint to PDF"

4. Upload PPTX and convert!

**Advantages:**
- ✅ No LibreOffice needed
- ✅ Works in browser
- ✅ Client-side conversion
- ✅ Already implemented!

---

### Option 2: LibreOffice-Based (Professional Quality) ⭐

**Requires LibreOffice installation**

#### Step 1: Install LibreOffice
1. Download: https://www.libreoffice.org/download/download/
2. Run installer (takes 2-3 minutes)
3. Complete installation

#### Step 2: Add to PATH
1. Press `Win + X` → Select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Find "Path" under "System variables"
5. Click "Edit" → "New"
6. Add: `C:\Program Files\LibreOffice\program`
7. Click OK on all windows
8. **RESTART your terminal/IDE**

#### Step 3: Verify Installation
```bash
soffice --version
```

Should show: `LibreOffice 24.8.3.2 ...`

#### Step 4: Run Streamlit App
```bash
cd python-converter
streamlit run streamlit_app.py
```

Or double-click: `RUN_STREAMLIT.bat`

---

## 📊 Comparison:

| Feature | Web Converter | LibreOffice |
|---------|--------------|-------------|
| Installation | ✅ None | ❌ Required |
| Quality | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Perfect |
| Speed | Fast | Very Fast |
| Complex Slides | Good | Excellent |
| Tables/Charts | Good | Perfect |
| Animations | No | Preserved |

---

## 🎯 Recommendation:

**For Quick Testing:**
→ Use the web converter (already working!)

**For Production/Perfect Quality:**
→ Install LibreOffice (5 minutes setup)

---

## 🆘 Need Help?

**LibreOffice not found?**
- Run: `INSTALL_LIBREOFFICE.bat`
- Follow the step-by-step guide

**Web converter issues?**
- Check browser console (F12)
- Make sure dev server is running
- Try with Sample-Presentation.pptx first

---

Made with ❤️ • 100% Free • Open Source
