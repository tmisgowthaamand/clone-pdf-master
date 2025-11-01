/* Express backend for PowerPoint -> PDF conversion using LibreOffice
 * Buckets required in Supabase:
 *  - source_files (private)
 *  - converted_files (private)
 * Env required:
 *  SUPABASE_URL
 *  SUPABASE_SERVICE_ROLE_KEY
 *  PORT (optional, default 8787)
 *  ALLOWED_ORIGIN (optional - CORS)
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const { spawn } = require('child_process');

// Load env if .env present
try { require('dotenv').config(); } catch (_) {}

const PORT = process.env.PORT || 8787;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SOURCE_BUCKET = process.env.SOURCE_BUCKET || 'source_files';
const CONVERTED_BUCKET = process.env.CONVERTED_BUCKET || 'converted_files';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const app = express();
app.disable('x-powered-by');

// Simple CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Multer memory storage + validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Only .ppt and .pptx are allowed'));
    cb(null, true);
  }
});

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sofficeCmd() {
  if (process.env.SOFFICE_PATH && fs.existsSync(process.env.SOFFICE_PATH)) {
    return process.env.SOFFICE_PATH;
  }
  return process.platform === 'win32' ? 'soffice.exe' : 'soffice';
}

function sofficeExists() {
  return new Promise((resolve) => {
    const cmd = sofficeCmd();
    const proc = spawn(cmd, ['--version']);
    let ok = false;
    proc.on('error', () => resolve(false));
    proc.stdout.on('data', () => (ok = true));
    proc.on('close', () => resolve(ok));
  });
}

async function convertWithLibreOffice(inputPath, outDir, timeoutMs = 120000) {
  const cmd = sofficeCmd();
  return new Promise((resolve, reject) => {
    const args = ['--headless', '--nologo', '--nofirststartwizard', '--convert-to', 'pdf', '--outdir', outDir, inputPath];
    const proc = spawn(cmd, args);

    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch (_) {}
      reject(new Error('Conversion timeout'));
    }, timeoutMs);

    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        const pdfName = path.basename(inputPath, path.extname(inputPath)) + '.pdf';
        const pdfPath = path.join(outDir, pdfName);
        if (fs.existsSync(pdfPath)) return resolve(pdfPath);
        return reject(new Error('PDF not found after conversion'));
      }
      reject(new Error(`LibreOffice exited with code ${code}: ${stderr}`));
    });
  });
}

app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    // Check soffice availability
    const hasSoffice = await sofficeExists();
    if (!hasSoffice) {
      return res.status(503).json({ error: 'Conversion engine not available on this host. Deploy on Linux with LibreOffice.' });
    }

    const tmpDir = path.join(os.tmpdir(), 'pptx2pdf');
    ensureDirSync(tmpDir);

    const id = uuidv4();
    const originalName = req.file.originalname.replace(/[^\w.\- ]/g, '_');
    const ext = path.extname(originalName).toLowerCase();
    const base = path.basename(originalName, ext);

    const inputPath = path.join(tmpDir, `${id}_${base}${ext}`);
    const outputDir = tmpDir;
    fs.writeFileSync(inputPath, req.file.buffer);

    // Upload original to Supabase
    const sourceKey = `source/${id}-${originalName}`;
    const up1 = await supabase.storage.from(SOURCE_BUCKET).upload(sourceKey, req.file.buffer, {
      contentType: req.file.mimetype || 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      upsert: false
    });
    if (up1.error) throw up1.error;

    // Convert to PDF
    const pdfPath = await convertWithLibreOffice(inputPath, outputDir);
    const pdfBuf = fs.readFileSync(pdfPath);

    // Upload converted PDF
    const pdfKey = `converted/${id}-${base}.pdf`;
    const up2 = await supabase.storage.from(CONVERTED_BUCKET).upload(pdfKey, pdfBuf, {
      contentType: 'application/pdf',
      upsert: false
    });
    if (up2.error) throw up2.error;

    // Signed URL for 24h
    const signed = await supabase.storage.from(CONVERTED_BUCKET).createSignedUrl(pdfKey, 60 * 60 * 24);
    if (signed.error) throw signed.error;

    // Insert conversions row (best-effort)
    try {
      // Try new schema first
      const insertNew = await supabase.from('conversions').insert({
        original_filename: originalName,
        file_size: req.file.size,
        source_path: sourceKey,
        converted_path: pdfKey,
        status: 'completed',
        metadata: { engine: 'libreoffice' }
      });
      if (insertNew.error) {
        // Fallback to legacy schema
        await supabase.from('conversions').insert({
          file_name: originalName,
          ppt_url: `${SOURCE_BUCKET}/${sourceKey}`,
          pdf_url: `${CONVERTED_BUCKET}/${pdfKey}`,
          status: 'completed'
        });
      }
    } catch (_) {}

    // Cleanup
    try { fs.unlinkSync(inputPath); } catch (_) {}
    try { fs.unlinkSync(pdfPath); } catch (_) {}

    return res.json({
      success: true,
      fileName: `${base}.pdf`,
      downloadUrl: signed.data?.signedUrl,
      storage: { source: sourceKey, pdf: pdfKey }
    });
  } catch (err) {
    console.error('Convert error:', err);
    return res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Converter backend listening on :${PORT}`);
});
