# Testing PowerPoint to PDF Conversion

## Quick Test Guide

### Prerequisites
1. Supabase project set up
2. Edge function deployed
3. Sample PowerPoint files ready

### Test Cases

#### Test 1: Basic Text Formatting
**File**: Create a simple PPTX with:
- Slide 1: Title with bold text
- Slide 2: Bullet points with different colors
- Slide 3: Mixed formatting (bold, italic, underline)

**Expected Result**:
- ✅ All text appears in PDF
- ✅ Bold text is bold
- ✅ Colors are preserved
- ✅ Formatting matches original

#### Test 2: Background Themes
**File**: Create a PPTX with:
- Slide 1: Solid blue background
- Slide 2: Gradient background (blue to white)
- Slide 3: Custom theme color

**Expected Result**:
- ✅ Solid colors match original
- ✅ Gradients are smooth
- ✅ No white gaps or banding

#### Test 3: Images
**File**: Create a PPTX with:
- Slide 1: JPEG image
- Slide 2: PNG image with transparency
- Slide 3: Multiple images

**Expected Result**:
- ✅ Images appear in correct positions
- ✅ Image quality is maintained
- ✅ Aspect ratios preserved

#### Test 4: Text Alignment
**File**: Create a PPTX with:
- Slide 1: Left-aligned text
- Slide 2: Center-aligned text
- Slide 3: Right-aligned text

**Expected Result**:
- ✅ Text alignment matches original
- ✅ Text wraps correctly
- ✅ Positioning is accurate

#### Test 5: Complex Presentation
**File**: Use the provided `Sample-Presentation.pptx`

**Expected Result**:
- ✅ All slides convert successfully
- ✅ Layout is preserved
- ✅ Professional appearance

### Testing Steps

1. **Deploy the Function**
```bash
cd supabase
supabase functions deploy powerpoint-to-pdf
```

2. **Test via Web Interface**
- Navigate to: `http://localhost:8082/powerpoint-to-pdf`
- Upload test file
- Click "Convert to PDF"
- Download and review PDF

3. **Test via API**
```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/powerpoint-to-pdf \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -F "file=@test-presentation.pptx"
```

4. **Verify Results**
- Open generated PDF
- Compare with original PPTX
- Check all formatting elements

### Common Issues & Solutions

#### Issue: Images not appearing
**Solution**: Ensure images are JPEG or PNG format

#### Issue: Fonts look different
**Solution**: Custom fonts are mapped to standard fonts (expected behavior)

#### Issue: Gradient not smooth
**Solution**: Increase gradient steps in code (currently 50)

#### Issue: Text positioning off
**Solution**: Check EMU to points conversion (914400 EMUs = 1 inch)

### Performance Benchmarks

| Slides | File Size | Conversion Time |
|--------|-----------|-----------------|
| 1-5    | < 5MB     | 2-3 seconds     |
| 6-10   | 5-10MB    | 4-6 seconds     |
| 11-20  | 10-20MB   | 7-12 seconds    |
| 20+    | 20-50MB   | 15-30 seconds   |

### Quality Checklist

- [ ] Text is readable and properly sized
- [ ] Colors match original presentation
- [ ] Images are clear and positioned correctly
- [ ] Backgrounds render properly
- [ ] Text alignment is correct
- [ ] No missing content
- [ ] File size is reasonable
- [ ] PDF opens in all viewers

### Automated Testing (Optional)

Create a test script:

```javascript
// test-conversion.js
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testConversion(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  
  const response = await fetch('YOUR_FUNCTION_URL', {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });
  
  const result = await response.json();
  console.log('Conversion result:', result);
  
  // Download PDF
  const pdfResponse = await fetch(result.downloadUrl);
  const pdfBuffer = await pdfResponse.buffer();
  fs.writeFileSync('output.pdf', pdfBuffer);
  
  console.log('PDF saved to output.pdf');
}

testConversion('test-presentation.pptx');
```

### Debugging Tips

1. **Check Logs**
```bash
supabase functions logs powerpoint-to-pdf
```

2. **Enable Verbose Logging**
Add console.log statements in the function:
```typescript
console.log('Processing slide:', i);
console.log('Extracted shapes:', slideInfo.shapes.length);
```

3. **Test Locally**
```bash
supabase functions serve powerpoint-to-pdf
```

### Success Criteria

✅ **Pass**: All test cases produce PDFs that closely match the original PPTX
✅ **Pass**: No errors in console logs
✅ **Pass**: Conversion completes within expected time
✅ **Pass**: PDF file size is reasonable (not bloated)

### Reporting Issues

If you find issues:
1. Note the specific slide/element that fails
2. Capture screenshots of original vs converted
3. Check console logs for errors
4. Provide sample PPTX file (if possible)

---

**Happy Testing!** 🎉
