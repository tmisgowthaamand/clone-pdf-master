# Supabase Setup Guide for PowerPoint to PDF Converter

This guide will help you set up Supabase for the PowerPoint to PDF converter with storage buckets, database tables, and edge functions.

## 📋 Prerequisites

- Supabase account (https://supabase.com)
- Project created in Supabase
- Supabase CLI installed (optional, for local development)

---

## 1️⃣ Create Storage Buckets

### Step 1: Create `documents` Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `documents`
   - **Public**: ✅ Enable (for easy file access)
   - **File size limit**: 100 MB
   - **Allowed MIME types**: Leave empty or add:
     - `application/vnd.openxmlformats-officedocument.presentationml.presentation`
     - `application/vnd.ms-powerpoint`
     - `application/pdf`

### Step 2: Create Folder Structure

The converter uses this folder structure:
```
documents/
├── source/          # Original PowerPoint files
└── converted/       # Generated PDF files
```

Folders are created automatically when files are uploaded.

### Step 3: Set Storage Policies

Go to **Storage** → **Policies** → **documents** bucket

**Policy 1: Allow Public Read**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );
```

**Policy 2: Allow Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);
```

**Policy 3: Allow Users to Delete Own Files**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND (auth.uid() = owner OR auth.role() = 'service_role')
);
```

---

## 2️⃣ Create Database Tables

### Run the Migration

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Copy and paste the contents of `supabase/migrations/20251031_powerpoint_converter.sql`
4. Click **"Run"**

This creates:
- ✅ `conversions` table for tracking conversion jobs
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Automatic cleanup function

### Verify Tables

Run this query to verify:
```sql
SELECT * FROM conversions LIMIT 1;
```

---

## 3️⃣ Deploy Edge Functions

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy powerpoint-to-pdf
```

### Option B: Manual Deployment

1. Go to **Edge Functions** in Supabase dashboard
2. Click **"Create a new function"**
3. Name it: `powerpoint-to-pdf`
4. Copy code from `supabase/functions/powerpoint-to-pdf/index.ts`
5. Click **"Deploy"**

### Test the Edge Function

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/powerpoint-to-pdf' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -F 'file=@test.pptx'
```

---

## 4️⃣ Configure Environment Variables

### Frontend (.env.local)

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Get Your Keys

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Update Supabase Client

The file `src/lib/supabase.ts` should look like this:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
```

---

## 5️⃣ Set Up Automatic Cleanup

### Create a Cron Job (Optional)

To automatically delete expired conversions:

1. Go to **Database** → **Functions**
2. Create a new function or use existing `cleanup_expired_conversions`
3. Set up a cron job using **pg_cron** extension:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup to run daily at 2 AM
SELECT cron.schedule(
  'cleanup-expired-conversions',
  '0 2 * * *',
  $$SELECT cleanup_expired_conversions()$$
);
```

### Manual Cleanup

Run this query to manually clean up expired files:

```sql
SELECT cleanup_expired_conversions();
```

---

## 6️⃣ Configure Storage Lifecycle

### Auto-delete Old Files

1. Go to **Storage** → **documents** bucket
2. Click **Settings** (gear icon)
3. Enable **"Lifecycle rules"**
4. Add rule:
   - **Path prefix**: `converted/`
   - **Delete after**: 24 hours
   - **Apply to**: All files

---

## 7️⃣ Test the Setup

### Test 1: Upload File

```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .upload('source/test.pptx', file);

console.log('Upload result:', data, error);
```

### Test 2: Create Conversion Record

```typescript
const { data, error } = await supabase
  .from('conversions')
  .insert({
    original_filename: 'test.pptx',
    file_size: 12345,
    source_path: 'source/test.pptx',
    status: 'pending'
  });

console.log('Insert result:', data, error);
```

### Test 3: Query Conversions

```typescript
const { data, error } = await supabase
  .from('conversions')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);

console.log('Conversions:', data);
```

---

## 8️⃣ Security Best Practices

### Enable RLS on All Tables

```sql
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
```

### Limit File Sizes

In storage bucket settings:
- Max file size: 100 MB
- Max upload size: 100 MB

### Rate Limiting

Add rate limiting to Edge Functions:

```typescript
// In edge function
const rateLimitKey = req.headers.get('x-forwarded-for') || 'unknown';
// Implement rate limiting logic
```

### API Key Rotation

Rotate your API keys regularly:
1. Go to **Project Settings** → **API**
2. Click **"Rotate"** next to the key
3. Update `.env.local` with new key

---

## 9️⃣ Monitoring & Logs

### View Edge Function Logs

```bash
supabase functions logs powerpoint-to-pdf
```

### Monitor Storage Usage

1. Go to **Storage** → **Usage**
2. Check:
   - Total storage used
   - Number of files
   - Bandwidth usage

### Query Conversion Stats

```sql
SELECT 
  status,
  COUNT(*) as count,
  AVG(file_size) as avg_file_size,
  SUM(download_count) as total_downloads
FROM conversions
GROUP BY status;
```

---

## 🔧 Troubleshooting

### Issue: "Bucket not found"

**Solution**: Create the `documents` bucket in Storage

### Issue: "Permission denied"

**Solution**: Check RLS policies and ensure they allow your operation

### Issue: "File upload fails"

**Solutions**:
- Check file size limit (max 100MB)
- Verify MIME type is allowed
- Check storage quota

### Issue: "Edge function timeout"

**Solutions**:
- Optimize conversion logic
- Increase function timeout (max 60s)
- Use client-side conversion for large files

### Issue: "Database connection error"

**Solution**: Check if database is paused (free tier auto-pauses after inactivity)

---

## 📊 Database Schema Reference

### `conversions` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who created conversion (nullable) |
| original_filename | TEXT | Original PowerPoint filename |
| file_size | BIGINT | File size in bytes |
| source_path | TEXT | Path in storage bucket |
| converted_path | TEXT | Path to converted PDF |
| status | TEXT | pending, processing, completed, failed |
| error_message | TEXT | Error details if failed |
| conversion_started_at | TIMESTAMPTZ | When conversion started |
| conversion_completed_at | TIMESTAMPTZ | When conversion finished |
| created_at | TIMESTAMPTZ | Record creation time |
| updated_at | TIMESTAMPTZ | Last update time |
| expires_at | TIMESTAMPTZ | When files will be deleted |
| download_count | INTEGER | Number of downloads |
| metadata | JSONB | Additional data (slides, images, etc.) |

---

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs
- **Storage Guide**: https://supabase.com/docs/guides/storage
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **Community**: https://github.com/supabase/supabase/discussions

---

**Last Updated**: October 31, 2025
