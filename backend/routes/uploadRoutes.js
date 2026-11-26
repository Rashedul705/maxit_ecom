const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { requireAdminAuth } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');

// Ensure local uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function syncLocalFile(filename, bufferOrPath) {
  const destDirs = [
    uploadDir,
    path.join(__dirname, '../../storefront/public/uploads'),
    path.join(__dirname, '../../frontend/public/uploads'),
    path.join(__dirname, '../../api/uploads')
  ];

  for (const dir of destDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const target = path.join(dir, filename);
      if (Buffer.isBuffer(bufferOrPath)) {
        fs.writeFileSync(target, bufferOrPath);
      } else if (typeof bufferOrPath === 'string' && fs.existsSync(bufferOrPath)) {
        if (path.resolve(target) !== path.resolve(bufferOrPath)) {
          fs.copyFileSync(bufferOrPath, target);
        }
      }
    } catch (err) {
      console.warn(`[syncLocalFile] Failed to sync ${filename} to ${dir}: ${err.message}`);
    }
  }
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

/**
 * Upload buffer to ImgBB using API keys (with multi-key rotation)
 */
async function uploadToImgBbApi(buffer, keys) {
  for (const key of keys) {
    try {
      const postData = new URLSearchParams({
        image: buffer.toString('base64')
      }).toString();

      const result = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'api.imgbb.com',
          path: `/1/upload?key=${encodeURIComponent(key)}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              if (json.success && json.data && json.data.url) {
                resolve(json.data.url);
              } else {
                reject(new Error(json.error?.message || 'ImgBB upload rejected'));
              }
            } catch (e) {
              reject(e);
            }
          });
        });

        req.on('error', reject);
        req.setTimeout(12000, () => {
          req.destroy(new Error('ImgBB API timeout'));
        });
        req.write(postData);
        req.end();
      });

      if (result) return result;
    } catch (err) {
      console.warn(`[ImgBB API] Key ...${key.slice(-4)} failed: ${err.message}`);
    }
  }
  return null;
}

// POST /api/v1/upload (Protected)
router.post('/', requireAdminAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file uploaded', 400);
    }

    // 1. Gather all ImgBB API keys (supporting comma-separated list)
    const rawKeys = process.env.IMGBB_API_KEY || process.env.IMGBB_API_KEYS || '';
    const imgbbKeys = rawKeys
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    // 2. Try ImgBB upload
    if (imgbbKeys.length > 0) {
      const imgbbUrl = await uploadToImgBbApi(req.file.buffer, imgbbKeys);
      if (imgbbUrl) {
        return successResponse(res, { url: imgbbUrl, provider: 'imgbb' }, 'Image uploaded to ImgBB successfully');
      }
      console.warn('⚠️ All ImgBB API keys failed or rate-limited. Falling back to local storage.');
    }

    // 3. Fallback to local file storage
    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    syncLocalFile(filename, req.file.buffer);

    const localUrl = `/uploads/${filename}`;

    return successResponse(res, { url: localUrl, filename, provider: 'local' }, 'Image uploaded locally');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/upload/clean-banner (Protected)
router.post('/clean-banner', requireAdminAuth, async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl || typeof imageUrl !== 'string') {
      return errorResponse(res, 'imageUrl is required', 400);
    }

    const { execFile } = require('child_process');
    const sharp = require('sharp');
    const filename = `clean_${Date.now()}_${Math.round(Math.random() * 1e6)}.jpg`;
    const destPath = path.join(uploadDir, filename);

    // Candidate paths for clean_single_image.py
    const possibleScriptPaths = [
      path.resolve(__dirname, '../../scripts/clean_single_image.py'),
      path.resolve(__dirname, '../scripts/clean_single_image.py'),
      path.resolve(process.cwd(), 'scripts/clean_single_image.py'),
      path.resolve(process.cwd(), '../scripts/clean_single_image.py')
    ];
    const scriptPath = possibleScriptPaths.find(p => fs.existsSync(p));

    // Helper function for sharp-based fallback
    const runSharpFallback = async (reason = 'Fallback') => {
      let imgBuf;
      if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
        const localRel = imageUrl.replace(/^\/?uploads\//, '');
        const candidates = [
          path.join(uploadDir, localRel),
          path.join(uploadDir, path.basename(imageUrl)),
          path.resolve(__dirname, '../../storefront/public/uploads', path.basename(imageUrl)),
          path.resolve(__dirname, '../../frontend/public/uploads', path.basename(imageUrl))
        ];
        const found = candidates.find(p => fs.existsSync(p));
        if (found) {
          imgBuf = fs.readFileSync(found);
        } else {
          throw new Error('Local file not found: ' + imageUrl);
        }
      } else {
        const r = await fetch(imageUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MaxiTShopBot/1.0)' },
          signal: AbortSignal.timeout(12000)
        });
        if (!r.ok) throw new Error(`Failed to download remote image: HTTP ${r.status}`);
        imgBuf = Buffer.from(await r.arrayBuffer());
      }

      const meta = await sharp(imgBuf).metadata();
      const w = meta.width || 800;
      const h = meta.height || 800;
      const newH = Math.max(100, Math.round(h * 0.85));
      const cleanedBuffer = await sharp(imgBuf)
        .extract({ left: 0, top: 0, width: w, height: newH })
        .jpeg({ quality: 95 })
        .toBuffer();

      // Try ImgBB if configured
      const rawKeys = process.env.IMGBB_API_KEY || process.env.IMGBB_API_KEYS || '';
      const imgbbKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);
      if (imgbbKeys.length > 0) {
        const imgbbUrl = await uploadToImgBbApi(cleanedBuffer, imgbbKeys);
        if (imgbbUrl) {
          syncLocalFile(filename, cleanedBuffer);
          return successResponse(res, { url: imgbbUrl, provider: 'imgbb', alreadyClean: false, details: `Trimmed bottom banner via sharp (${reason})` }, 'Image cleaned successfully');
        }
      }

      syncLocalFile(filename, cleanedBuffer);
      const localUrl = `/uploads/${filename}`;
      return successResponse(res, { url: localUrl, provider: 'local', alreadyClean: false, details: `Trimmed bottom banner via sharp (${reason})` }, 'Image cleaned successfully');
    };

    if (!scriptPath) {
      return await runSharpFallback('Script clean_single_image.py not found');
    }

    execFile('python3', [scriptPath, imageUrl, destPath], { timeout: 12000 }, async (err, stdout, stderr) => {
      if (err) {
        try {
          return await runSharpFallback(err.message || 'Python execution failed');
        } catch (sharpErr) {
          console.error('clean_single_image & sharp fallback error:', err, sharpErr);
          return errorResponse(res, 'Failed to clean image: ' + sharpErr.message, 500);
        }
      }

      try {
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
          const cleanedBuffer = fs.readFileSync(destPath);

          // Try ImgBB if configured
          const rawKeys = process.env.IMGBB_API_KEY || process.env.IMGBB_API_KEYS || '';
          const imgbbKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);

          if (imgbbKeys.length > 0) {
            const imgbbUrl = await uploadToImgBbApi(cleanedBuffer, imgbbKeys);
            if (imgbbUrl) {
              syncLocalFile(filename, destPath);
              return successResponse(res, { url: imgbbUrl, provider: 'imgbb', alreadyClean: false, details: stdout.trim() }, 'Image cleaned and uploaded to ImgBB successfully');
            }
          }

          syncLocalFile(filename, destPath);
          const localUrl = `/uploads/${filename}`;
          return successResponse(res, { url: localUrl, provider: 'local', alreadyClean: false, details: stdout.trim() }, 'Image cleaned successfully');
        } else {
          return successResponse(res, { url: imageUrl, alreadyClean: true, details: 'Image was already clean' }, 'Image is already clean');
        }
      } catch (postErr) {
        return errorResponse(res, 'Error processing cleaned image: ' + postErr.message, 500);
      }
    });
  } catch (err) {
    return errorResponse(res, 'Clean image error: ' + err.message, 500);
  }
});

// POST /api/v1/upload/crop-manual (Protected) - Powered by Sharp (Zero Python required!)
router.post('/crop-manual', requireAdminAuth, async (req, res, next) => {
  try {
    const { imageUrl, crop } = req.body;
    if (!imageUrl || typeof imageUrl !== 'string') {
      return errorResponse(res, 'imageUrl is required', 400);
    }
    if (!crop || typeof crop !== 'object') {
      return errorResponse(res, 'crop parameters are required', 400);
    }

    // 1. Resolve image buffer (local file or remote fetch)
    let inputBuffer = null;
    const parsedSource = imageUrl.trim();

    if (parsedSource.startsWith('/uploads/') || parsedSource.startsWith('uploads/')) {
      const filename = path.basename(parsedSource);
      const candidates = [
        path.join(uploadDir, filename),
        path.join(__dirname, '../../storefront/public/uploads', filename),
        path.join(__dirname, '../../frontend/public/uploads', filename),
        path.join(__dirname, '../uploads', filename)
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          inputBuffer = fs.readFileSync(c);
          break;
        }
      }
    } else if (parsedSource.startsWith('http://localhost') || parsedSource.startsWith('http://127.0.0.1')) {
      const urlPath = new URL(parsedSource).pathname;
      const filename = path.basename(urlPath);
      const candidates = [
        path.join(uploadDir, filename),
        path.join(__dirname, '../../storefront/public/uploads', filename),
        path.join(__dirname, '../../frontend/public/uploads', filename),
        path.join(__dirname, '../uploads', filename)
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          inputBuffer = fs.readFileSync(c);
          break;
        }
      }
    }

    if (!inputBuffer) {
      // Fetch remote image
      const fetchRes = await fetch(parsedSource);
      if (!fetchRes.ok) {
        return errorResponse(res, `Failed to download remote image: HTTP ${fetchRes.status}`, 500);
      }
      const arrayBuf = await fetchRes.arrayBuffer();
      inputBuffer = Buffer.from(arrayBuf);
    }

    // 2. Crop with Sharp (native Node.js, 100% reliable on Linux/Docker/Cloud)
    const sharp = require('sharp');
    const image = sharp(inputBuffer);
    const meta = await image.metadata();

    const origW = meta.width || 800;
    const origH = meta.height || 800;

    const unit = crop.unit || 'px';
    const xVal = parseFloat(crop.x) || 0;
    const yVal = parseFloat(crop.y) || 0;
    const wVal = parseFloat(crop.width) || origW;
    const hVal = parseFloat(crop.height) || origH;

    let left, top, width, height;

    if (unit === 'percent' || (wVal <= 1.0 && hVal <= 1.0 && (wVal > 0 || hVal > 0))) {
      const factor = (wVal <= 1.0 && hVal <= 1.0) ? 1.0 : 100.0;
      left = Math.round((xVal / factor) * origW);
      top = Math.round((yVal / factor) * origH);
      width = Math.round((wVal / factor) * origW);
      height = Math.round((hVal / factor) * origH);
    } else {
      left = Math.round(xVal);
      top = Math.round(yVal);
      width = Math.round(wVal);
      height = Math.round(hVal);
    }

    left = Math.max(0, Math.min(origW - 1, left));
    top = Math.max(0, Math.min(origH - 1, top));
    width = Math.max(1, Math.min(origW - left, width));
    height = Math.max(1, Math.min(origH - top, height));

    const croppedBuffer = await sharp(inputBuffer)
      .extract({ left, top, width, height })
      .jpeg({ quality: 95 })
      .toBuffer();

    const filename = `crop_${Date.now()}_${Math.round(Math.random() * 1e6)}.jpg`;

    // 3. Try ImgBB if configured
    const rawKeys = process.env.IMGBB_API_KEY || process.env.IMGBB_API_KEYS || '';
    const imgbbKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);

    if (imgbbKeys.length > 0) {
      const imgbbUrl = await uploadToImgBbApi(croppedBuffer, imgbbKeys);
      if (imgbbUrl) {
        syncLocalFile(filename, croppedBuffer);
        return successResponse(res, {
          url: imgbbUrl,
          provider: 'imgbb',
          croppedWidth: width,
          croppedHeight: height
        }, 'Image cropped and uploaded to ImgBB successfully');
      }
    }

    // 4. Save locally and sync across directories
    syncLocalFile(filename, croppedBuffer);
    const localUrl = `/uploads/${filename}`;
    return successResponse(res, {
      url: localUrl,
      provider: 'local',
      croppedWidth: width,
      croppedHeight: height
    }, 'Image cropped and saved successfully');

  } catch (err) {
    next(err);
  }
});

// GET /api/v1/upload/proxy-image?url=...
router.get('/proxy-image', async (req, res, next) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl || typeof targetUrl !== 'string') {
      return res.status(400).send('url is required');
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const fetchRes = await fetch(targetUrl);
    if (!fetchRes.ok) {
      return res.status(fetchRes.status).send('Failed to fetch image');
    }
    const contentType = fetchRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);

    const arrayBuffer = await fetchRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    if (!res.headersSent) res.status(502).send(err.message);
  }
});

module.exports = router;
