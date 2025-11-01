# Deployment Guide - PowerPoint to PDF Converter

Complete guide to deploy your PowerPoint to PDF converter to production.

## 🚀 Deployment Options

1. **Frontend**: Vercel or Netlify
2. **Backend**: Supabase Edge Functions
3. **Storage**: Supabase Storage
4. **Database**: Supabase PostgreSQL

---

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Storage buckets set up (`documents`)
- [ ] Database tables created (`conversions`)
- [ ] Edge functions deployed
- [ ] Environment variables configured
- [ ] Testing completed locally
- [ ] Domain name ready (optional)

---

## 1️⃣ Deploy to Vercel (Recommended for Frontend)

### Step 1: Prepare for Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Build the project locally to test
npm run build
```

### Step 2: Configure Environment Variables

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Step 3: Deploy

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name
# - Configure build settings

# Deploy to production
vercel --prod
```

### Step 4: Add Environment Variables in Vercel Dashboard

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Step 5: Redeploy

```bash
vercel --prod
```

---

## 2️⃣ Deploy to Netlify (Alternative)

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Build Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 3: Deploy

```bash
# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

### Step 4: Set Environment Variables

```bash
netlify env:set VITE_SUPABASE_URL "your-supabase-url"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
```

---

## 3️⃣ Deploy Supabase Edge Functions

### Using Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy powerpoint-to-pdf
```

### Verify Deployment

```bash
# Test the function
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/powerpoint-to-pdf' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -F 'file=@test.pptx'
```

---

## 4️⃣ Configure Custom Domain

### For Vercel

1. Go to **Settings** → **Domains**
2. Add your domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

### For Netlify

1. Go to **Domain settings**
2. Add custom domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

---

## 5️⃣ Production Environment Variables

### Required Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional
VITE_APP_NAME="PowerPoint to PDF Converter"
VITE_MAX_FILE_SIZE=104857600
VITE_ALLOWED_EXTENSIONS=".ppt,.pptx"
```

### Security Best Practices

1. **Never commit `.env` files**
   - Add to `.gitignore`
   - Use platform environment variables

2. **Use different keys for dev/prod**
   - Development: Use test project
   - Production: Use production project

3. **Rotate keys regularly**
   - Every 90 days minimum
   - After any security incident

---

## 6️⃣ Performance Optimization

### Frontend Optimization

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-lib': ['jspdf', 'html2canvas'],
          'vendor': ['react', 'react-dom'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### Enable Compression

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "gzip"
        }
      ]
    }
  ]
}
```

### CDN Configuration

- Enable Vercel/Netlify CDN (automatic)
- Set cache headers for static assets
- Use image optimization

---

## 7️⃣ Monitoring & Analytics

### Add Analytics

```typescript
// src/lib/analytics.ts
export const trackConversion = (data: {
  fileSize: number;
  slideCount: number;
  conversionTime: number;
}) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'conversion', data);
  }
  
  // Or Vercel Analytics
  if (window.va) {
    window.va('track', 'conversion', data);
  }
};
```

### Error Tracking

Install Sentry:

```bash
npm install @sentry/react
```

Configure:

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Supabase Monitoring

1. Go to **Logs** in Supabase dashboard
2. Monitor:
   - API requests
   - Storage usage
   - Database queries
   - Edge function invocations

---

## 8️⃣ Backup & Recovery

### Database Backups

Supabase automatically backs up your database daily.

Manual backup:

```bash
# Export database
supabase db dump -f backup.sql

# Restore
supabase db reset
psql -h db.YOUR_PROJECT_REF.supabase.co -U postgres -f backup.sql
```

### Storage Backups

Create a backup script:

```typescript
// scripts/backup-storage.ts
import { supabase } from './lib/supabase';

async function backupStorage() {
  const { data: files } = await supabase.storage
    .from('documents')
    .list('converted');
    
  for (const file of files) {
    const { data } = await supabase.storage
      .from('documents')
      .download(`converted/${file.name}`);
      
    // Save to backup location
  }
}
```

---

## 9️⃣ Scaling Considerations

### Frontend Scaling

- **Vercel/Netlify**: Automatic scaling
- **CDN**: Global edge network
- **Caching**: Aggressive caching for static assets

### Backend Scaling

- **Supabase**: Auto-scales with usage
- **Edge Functions**: Serverless, scales automatically
- **Database**: Upgrade plan as needed

### Storage Scaling

- **Free tier**: 1 GB
- **Pro tier**: 100 GB
- **Enterprise**: Unlimited

### Cost Optimization

1. **Implement file cleanup**
   - Delete files after 24 hours
   - Use lifecycle rules

2. **Optimize file sizes**
   - Compress before upload
   - Use appropriate quality settings

3. **Monitor usage**
   - Set up billing alerts
   - Track conversion metrics

---

## 🔟 Post-Deployment Tasks

### 1. Test Production Environment

```bash
# Test file upload
curl -X POST https://your-domain.com/api/upload \
  -F "file=@test.pptx"

# Test conversion
# Upload file through UI and verify PDF download
```

### 2. Set Up Monitoring

- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up error tracking (Sentry)
- [ ] Enable analytics (Google Analytics, Vercel Analytics)
- [ ] Configure log aggregation

### 3. Documentation

- [ ] Update README with production URL
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Write troubleshooting guide

### 4. Security Audit

- [ ] Review RLS policies
- [ ] Check CORS configuration
- [ ] Verify rate limiting
- [ ] Test file upload restrictions

---

## 📊 Deployment Checklist

### Pre-Launch

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] Edge functions deployed
- [ ] SSL certificate configured
- [ ] Custom domain set up (if applicable)

### Launch

- [ ] Deploy to production
- [ ] Verify all endpoints work
- [ ] Test file upload/download
- [ ] Check error handling
- [ ] Verify analytics tracking

### Post-Launch

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Set up automated backups
- [ ] Configure alerts

---

## 🐛 Troubleshooting

### Issue: Build Fails

```bash
# Clear cache
rm -rf node_modules dist .next
npm install
npm run build
```

### Issue: Environment Variables Not Working

- Verify variables are set in platform dashboard
- Redeploy after adding variables
- Check variable names match exactly

### Issue: CORS Errors

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" }
      ]
    }
  ]
}
```

### Issue: Slow Performance

1. Enable compression
2. Optimize images
3. Use code splitting
4. Enable CDN caching

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **Community**: GitHub Discussions

---

**Last Updated**: October 31, 2025
