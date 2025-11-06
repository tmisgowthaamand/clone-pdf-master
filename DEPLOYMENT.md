# 🚀 Deployment Guide - PDFTools

This guide will help you deploy your PDFTools application with:
- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Python/Flask)

---

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- Git installed locally

---

## 🔧 Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `pdftools`)
   - Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/pdftools.git
git branch -M main
git push -u origin main
```

---

## 🎨 Step 2: Deploy Backend to Render

### Option A: Using Render Dashboard (Recommended)

1. **Go to Render**: https://render.com
2. **Sign in** and click **"New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: `pdftools-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or specify if backend is in subfolder)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Plan**: Free

5. **Add Environment Variables**:
   - `PYTHON_VERSION`: `3.11.0`
   - `PORT`: `5000`
   - `FLASK_ENV`: `production`
   - `ALLOWED_ORIGINS`: (leave empty for now, will update after frontend deployment)

6. **Click "Create Web Service"**
7. **Wait for deployment** (5-10 minutes)
8. **Copy your backend URL**: `https://pdftools-backend.onrender.com`

### Option B: Using render.yaml (Automatic)

1. The `render.yaml` file is already configured
2. Go to Render Dashboard → **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically detect `render.yaml` and deploy

---

## 🌐 Step 3: Deploy Frontend to Vercel

### Using Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** and click **"Add New..."** → **"Project"**
3. **Import your GitHub repository**
4. **Configure the project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or specify if frontend is in subfolder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   - Click **"Environment Variables"**
   - Add: `VITE_API_URL` = `https://pdftools-backend.onrender.com`
   - (Use your actual Render backend URL from Step 2)

6. **Click "Deploy"**
7. **Wait for deployment** (2-5 minutes)
8. **Your site is live!** Copy the URL: `https://your-app.vercel.app`

---

## 🔄 Step 4: Update CORS Settings

1. **Go back to Render Dashboard**
2. **Open your backend service**
3. **Go to "Environment"**
4. **Update `ALLOWED_ORIGINS`**:
   - Value: `https://your-app.vercel.app`
   - (Use your actual Vercel URL from Step 3)
5. **Save changes** (service will redeploy automatically)

---

## ✅ Step 5: Verify Deployment

### Test Frontend:
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Check if the site loads correctly
3. Try uploading a PDF and using a tool

### Test Backend:
1. Visit your Render URL: `https://pdftools-backend.onrender.com/health`
2. Should return: `{"status": "healthy"}`

### Test Integration:
1. On your frontend, try a PDF conversion
2. Check browser console for any CORS errors
3. Verify the conversion works end-to-end

---

## 🔧 Troubleshooting

### Frontend Issues:

**Build fails on Vercel:**
- Check `package.json` for correct scripts
- Ensure all dependencies are listed
- Check build logs for specific errors

**API calls fail:**
- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend is running on Render

### Backend Issues:

**Build fails on Render:**
- Check `requirements.txt` for correct packages
- Verify Python version compatibility
- Check build logs for missing dependencies

**CORS errors:**
- Update `ALLOWED_ORIGINS` in Render environment variables
- Include your Vercel URL (with https://)
- Restart the service after updating

**Service crashes:**
- Check Render logs for errors
- Verify `app.py` has correct port binding
- Ensure all required environment variables are set

---

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:

### Vercel (Frontend):
- Automatically deploys on every push to `main` branch
- Preview deployments for pull requests
- Instant rollback available

### Render (Backend):
- Automatically deploys on every push to `main` branch
- Can configure deploy hooks
- Manual deploy option available

---

## 📝 Environment Variables Summary

### Frontend (Vercel):
```
VITE_API_URL=https://pdftools-backend.onrender.com
```

### Backend (Render):
```
PYTHON_VERSION=3.11.0
PORT=5000
FLASK_ENV=production
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## 🎯 Custom Domain (Optional)

### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Render:
1. Go to Service Settings → Custom Domain
2. Add your custom domain
3. Update DNS records as instructed

---

## 💰 Cost Considerations

### Free Tier Limits:

**Vercel:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN

**Render:**
- ✅ 750 hours/month (enough for 1 service)
- ⚠️ Service spins down after 15 min inactivity
- ⚠️ Cold starts (10-30 seconds)
- ✅ Automatic HTTPS

**Note**: For production, consider upgrading to paid plans for better performance.

---

## 🚀 Quick Deploy Commands

### Local Development:
```bash
# Frontend
npm install
npm run dev

# Backend
pip install -r requirements.txt
python app.py
```

### Update Deployment:
```bash
# Commit and push changes
git add .
git commit -m "Update: description"
git push origin main

# Both services will auto-deploy!
```

---

## 📞 Support

If you encounter issues:
1. Check deployment logs on Vercel/Render
2. Review browser console for frontend errors
3. Test API endpoints directly
4. Check CORS configuration

---

## ✨ Success!

Your PDFTools application is now live! 🎉

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://pdftools-backend.onrender.com

Share your deployed app with the world! 🌍
