# 🚀 Render Deployment - Quick Start

Deploy your PDFTools backend to Render.com in 5 minutes!

## 📋 What You Need

- GitHub account
- Render.com account (free)
- This repository pushed to GitHub

## 🎯 Quick Deploy (3 Steps)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Create Render Service

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml` ✅

### Step 3: Deploy!

Click **"Create Web Service"** and wait 5-10 minutes.

That's it! 🎉

## 🔗 Your API URL

After deployment, you'll get a URL like:
```
https://pdftools-backend.onrender.com
```

## ✅ Test Your Deployment

### Health Check
```bash
curl https://YOUR-APP-NAME.onrender.com/health
```

### API Info
```bash
curl https://YOUR-APP-NAME.onrender.com/api/info
```

## 📡 Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/info` | GET | API information |
| `/api/convert/pptx-to-pdf` | POST | PowerPoint → PDF |
| `/api/convert/pdf-to-pptx` | POST | PDF → PowerPoint |
| `/api/convert/docx-to-pdf` | POST | Word → PDF |
| `/api/convert/pdf-to-docx` | POST | PDF → Word |
| `/api/convert/pdf-to-excel` | POST | PDF → Excel |
| `/api/convert/excel-to-pdf` | POST | Excel → PDF |

## 🔧 Configuration Files

### Main Configuration: `render.yaml`

This file contains all deployment settings:
- System dependencies (LibreOffice, Ghostscript, Poppler)
- Python dependencies
- Server configuration
- Environment variables

### Alternative: `render-alternative.yaml`

If `render.yaml` fails, rename this file to `render.yaml`:
```bash
mv render-alternative.yaml render.yaml
git add render.yaml
git commit -m "Use alternative config"
git push
```

### Docker Option: `Dockerfile`

For Docker-based deployment:
1. In Render dashboard, select **"Docker"** as environment
2. Render will automatically use the `Dockerfile`

## 🌐 Connect Your Frontend

Update your frontend API URL:

```javascript
// .env or config file
VITE_API_URL=https://YOUR-APP-NAME.onrender.com

// In your code
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/convert/pptx-to-pdf`, {
  method: 'POST',
  body: formData,
});
```

## ⚙️ Environment Variables

Pre-configured in `render.yaml`:

| Variable | Value | Description |
|----------|-------|-------------|
| `PYTHON_VERSION` | 3.11.0 | Python version |
| `FLASK_ENV` | production | Flask environment |
| `PYTHONUNBUFFERED` | 1 | Unbuffered output |
| `ALLOWED_ORIGINS` | * | CORS origins |
| `MAX_CONTENT_LENGTH` | 104857600 | Max file size (100MB) |

### 🔒 Security: Update CORS

For production, restrict CORS to your domain:

1. Go to Render dashboard → Your Service → Environment
2. Edit `ALLOWED_ORIGINS`
3. Set to: `https://your-frontend-domain.com`

## 💰 Free Tier Details

✅ **Included:**
- 750 hours/month runtime
- Automatic SSL
- Custom domains
- Auto-deploy from GitHub

⚠️ **Limitations:**
- Spins down after 15 min inactivity
- Cold start: 30-60 seconds
- 512 MB RAM

## 🐛 Troubleshooting

### Build Fails

**Error:** `Permission denied` or `apt-get not found`

**Solution:** Use alternative config:
```bash
cp render-alternative.yaml render.yaml
git add render.yaml
git commit -m "Use alternative config"
git push
```

### LibreOffice Not Found

**Check build logs:**
1. Dashboard → Your Service → Logs
2. Look for "Installing libreoffice"
3. If missing, try Docker deployment

### Memory Issues

**Solution:** Reduce workers in `render.yaml`:
```yaml
startCommand: "gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 300"
```

### Timeout Errors

**Already configured:** 300 seconds timeout
**If still timing out:** File might be too large or complex

## 🔄 Updates & Redeployment

### Automatic (Recommended)
```bash
git add .
git commit -m "Update backend"
git push
```
Render auto-deploys when `autoDeploy: true` ✅

### Manual
1. Dashboard → Your Service
2. **Manual Deploy** → **Deploy latest commit**

## 📊 Monitoring

**View Logs:**
```
Dashboard → Your Service → Logs
```

**Check Metrics:**
```
Dashboard → Your Service → Metrics
```

**Health Status:**
```
Dashboard → Your Service → Events
```

## 🎓 What Gets Installed

### System Packages
- LibreOffice (document conversion)
- Ghostscript (PDF processing)
- Poppler (PDF utilities)
- Fonts (Liberation, DejaVu)

### Python Packages
See `requirements.txt`:
- Flask (web framework)
- Gunicorn (WSGI server)
- pdf2docx (PDF to Word)
- python-pptx (PowerPoint handling)
- camelot-py (PDF table extraction)
- And more...

## 🚀 Performance Tips

1. **Reduce Cold Starts:**
   - Upgrade to paid plan ($7/month)
   - Or implement keep-alive ping

2. **Optimize Memory:**
   - Use 1 worker for free tier
   - Process files in chunks

3. **Speed Up Builds:**
   - Dependencies are cached after first build
   - Rebuilds take ~2-3 minutes

## 📚 Additional Resources

- [Full Deployment Guide](./RENDER_DEPLOYMENT.md)
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)

## ✨ Success Checklist

- [ ] Repository pushed to GitHub
- [ ] Render service created
- [ ] Build completed successfully
- [ ] Health check returns `{"status": "healthy"}`
- [ ] API info endpoint works
- [ ] Test file conversion works
- [ ] Frontend connected to backend URL
- [ ] CORS configured for production

## 🎉 You're Done!

Your backend is now live and ready to handle file conversions!

**Next Steps:**
1. Deploy your frontend (Vercel/Netlify)
2. Update frontend API URL
3. Test end-to-end functionality
4. Monitor logs and performance

---

**Need Help?**
- Check [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed guide
- Review [Render Docs](https://render.com/docs)
- Open an issue on GitHub

**Happy Deploying! 🚀**
