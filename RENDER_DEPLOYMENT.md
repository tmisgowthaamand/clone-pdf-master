# Render Deployment Guide

This guide explains how to deploy the PDFTools backend to Render.com.

## Prerequisites

1. A GitHub account with your code repository
2. A Render.com account (free tier available)
3. Your repository pushed to GitHub

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Connect to Render

1. Go to [Render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository: `clone-pdf-master`

### 3. Configure the Service

Render will automatically detect the `render.yaml` file. Verify these settings:

- **Name**: `pdftools-backend`
- **Environment**: `Python`
- **Region**: `Oregon (US West)` (or your preferred region)
- **Branch**: `main`
- **Root Directory**: `python-converter`
- **Build Command**: (Auto-configured from render.yaml)
- **Start Command**: (Auto-configured from render.yaml)

### 4. Environment Variables

The following environment variables are pre-configured in `render.yaml`:

- `PYTHON_VERSION`: 3.11.0
- `FLASK_ENV`: production
- `PYTHONUNBUFFERED`: 1
- `ALLOWED_ORIGINS`: * (allows all origins)
- `MAX_CONTENT_LENGTH`: 104857600 (100MB)

**Optional**: Update `ALLOWED_ORIGINS` to your frontend URL for better security:
```yaml
- key: ALLOWED_ORIGINS
  value: https://your-frontend-domain.vercel.app
```

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Install system dependencies (LibreOffice, Ghostscript, Poppler)
   - Install Python dependencies from `requirements.txt`
   - Start the Flask application with Gunicorn

### 6. Monitor Deployment

- Watch the build logs in real-time
- Build typically takes 5-10 minutes (first time)
- Once deployed, you'll get a URL like: `https://pdftools-backend.onrender.com`

## Testing Your Deployment

### Health Check
```bash
curl https://your-app-name.onrender.com/health
```

Expected response:
```json
{"status": "healthy"}
```

### API Info
```bash
curl https://your-app-name.onrender.com/api/info
```

### Test File Conversion
```bash
curl -X POST https://your-app-name.onrender.com/api/convert/pptx-to-pdf \
  -F "file=@your-presentation.pptx" \
  -o output.pdf
```

## Available Endpoints

- `GET /health` - Health check
- `GET /api/info` - API information
- `POST /api/convert/pptx-to-pdf` - Convert PowerPoint to PDF
- `POST /api/convert/pdf-to-pptx` - Convert PDF to PowerPoint
- `POST /api/convert/docx-to-pdf` - Convert Word to PDF
- `POST /api/convert/pdf-to-docx` - Convert PDF to Word
- `POST /api/convert/pdf-to-excel` - Convert PDF to Excel
- `POST /api/convert/excel-to-pdf` - Convert Excel to PDF

## Configuration Details

### System Dependencies Installed

The `render.yaml` configures installation of:
- **LibreOffice**: For document conversion (PPTX, DOCX, etc.)
- **Ghostscript**: For PDF processing
- **Poppler**: For PDF to image conversion
- **Fonts**: Liberation and DejaVu fonts for proper rendering

### Gunicorn Configuration

```bash
gunicorn app:app \
  --bind 0.0.0.0:$PORT \
  --workers 2 \
  --timeout 300 \
  --worker-class sync \
  --max-requests 1000 \
  --max-requests-jitter 50
```

- **Workers**: 2 (suitable for free tier)
- **Timeout**: 300 seconds (for large file conversions)
- **Max Requests**: 1000 per worker (prevents memory leaks)

## Free Tier Limitations

Render's free tier includes:
- ✅ 750 hours/month of runtime
- ✅ Automatic SSL certificates
- ✅ Custom domains
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ Cold starts take 30-60 seconds
- ⚠️ 512 MB RAM limit

## Troubleshooting

### Build Fails

**Issue**: `apt-get: command not found`
- **Solution**: Render uses Ubuntu. The build command should work as-is.

**Issue**: Python dependencies fail to install
- **Solution**: Check `requirements.txt` for incompatible versions

### Runtime Errors

**Issue**: `LibreOffice not found`
- **Solution**: Verify build logs show LibreOffice installation
- Check if `soffice` is in PATH

**Issue**: `Memory limit exceeded`
- **Solution**: Reduce worker count or upgrade to paid plan
- Optimize file processing to use less memory

**Issue**: `Timeout errors`
- **Solution**: Increase timeout in `render.yaml` (already set to 300s)

### Cold Starts

**Issue**: First request after inactivity is slow
- **Solution**: This is expected on free tier
- Consider upgrading to paid plan for always-on service
- Or implement a keep-alive ping from your frontend

## Updating Your Deployment

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. Render will automatically redeploy (if `autoDeploy: true`)

## Manual Redeploy

1. Go to your Render dashboard
2. Select your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

## Logs and Monitoring

- **View Logs**: Dashboard → Your Service → Logs
- **Metrics**: Dashboard → Your Service → Metrics
- **Events**: Dashboard → Your Service → Events

## Connecting Frontend

Update your frontend to use the Render URL:

```javascript
const API_URL = 'https://your-app-name.onrender.com';

// Example: Convert PPTX to PDF
const formData = new FormData();
formData.append('file', file);

const response = await fetch(`${API_URL}/api/convert/pptx-to-pdf`, {
  method: 'POST',
  body: formData,
});

const blob = await response.blob();
```

## Security Recommendations

1. **CORS**: Update `ALLOWED_ORIGINS` to your specific frontend domain
2. **Rate Limiting**: Consider adding rate limiting middleware
3. **File Size**: Current limit is 100MB (configurable in `app.py`)
4. **API Keys**: Add authentication for production use

## Cost Optimization

**Free Tier**:
- Perfect for development and testing
- Handles moderate traffic with cold starts

**Paid Plans** ($7+/month):
- No cold starts
- More RAM and CPU
- Better for production use

## Support

- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Status**: https://status.render.com

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Test all endpoints
3. ✅ Deploy frontend to Vercel/Netlify
4. ✅ Update frontend API URL
5. ✅ Test end-to-end functionality
6. ✅ Monitor logs and performance

---

**Your backend is now ready to deploy! 🚀**
