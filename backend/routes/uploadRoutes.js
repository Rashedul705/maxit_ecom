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

// Proxy cache directory
const proxyCacheDir = path.join(uploadDir, 'proxy-cache');
if (!fs.existsSync(proxyCacheDir)) {
  fs.mkdirSync(proxyCacheDir, { recursive: true });
}

// Detect ImgBB's blue "imgbb.com service unavailable" placeholder image using sharp pixel sampling
async function isImgBbUnavailablePlaceholder(buf) {
  try {
    const sharp = require('sharp');
    const { data, info } = await sharp(buf)
      .resize(8, 8, { fit: 'fill' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (!data || data.length < 192) return false;

    // Sample top 2 rows (16 pixels) — ImgBB's unavailable banner has a uniform sky-blue background (~#2795e9)
    let blueMatches = 0;
    for (let i = 0; i < 16; i++) {
      const r = data[i * 3];
      const g = data[i * 3 + 1];
      const b = data[i * 3 + 2];
      if (r < 95 && g >= 110 && g <= 195 && b >= 185) {
        blueMatches++;
      }
    }
    return blueMatches >= 12; // >= 75% of top band is ImgBB unavailable blue
  } catch {
    return false;
  }
}

// GET /api/v1/upload/proxy-image?url=...
router.get('/proxy-image', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl || typeof targetUrl !== 'string' || !/^https?:\/\//i.test(targetUrl)) {
      return res.status(400).send('Valid http(s) url is required');
    }

    const crypto = require('crypto');
    const cacheKey = crypto.createHash('sha1').update(targetUrl).digest('hex');
    const cacheBinPath = path.join(proxyCacheDir, `${cacheKey}.bin`);
    const cacheMimePath = path.join(proxyCacheDir, `${cacheKey}.mime`);

    // 1. Serve immediately from disk cache if available
    if (fs.existsSync(cacheBinPath) && fs.existsSync(cacheMimePath)) {
      const cachedMime = fs.readFileSync(cacheMimePath, 'utf8').trim() || 'image/jpeg';
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
      res.setHeader('Content-Type', cachedMime);
      res.setHeader('X-Proxy-Cache', 'HIT');
      return res.sendFile(cacheBinPath);
    }

    const isImgBb = /^https?:\/\/([^/]+\.)?ibb\.co(\.com)?\//i.test(targetUrl);
    let origin = '';
    try {
      origin = new URL(targetUrl).origin + '/';
    } catch {}

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      ...(!isImgBb && origin ? { 'Referer': origin } : {})
    };

    let validBuffer = null;
    let validContentType = 'image/jpeg';
    let lastStatus = 502;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const fetchRes = await fetch(targetUrl, {
          headers,
          signal: AbortSignal.timeout(12000)
        });
        lastStatus = fetchRes.status;
        if (!fetchRes.ok) {
          if (attempt === 0) await new Promise(r => setTimeout(r, 350));
          continue;
        }

        const ct = fetchRes.headers.get('content-type') || 'image/jpeg';
        if (ct.includes('text/html')) {
          if (attempt === 0) await new Promise(r => setTimeout(r, 350));
          continue;
        }

        const buf = Buffer.from(await fetchRes.arrayBuffer());
        if (buf.length < 100) {
          if (attempt === 0) await new Promise(r => setTimeout(r, 350));
          continue;
        }

        if (isImgBb && await isImgBbUnavailablePlaceholder(buf)) {
          console.warn(`[proxy-image] Detected ImgBB unavailable placeholder for ${targetUrl} (attempt ${attempt + 1})`);
          if (attempt === 0) await new Promise(r => setTimeout(r, 450));
          continue;
        }

        validBuffer = buf;
        validContentType = ct;
        break;
      } catch (err) {
        if (attempt === 1) throw err;
        await new Promise(r => setTimeout(r, 350));
      }
    }

    if (!validBuffer) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(lastStatus >= 400 ? lastStatus : 502).send('Image unavailable from upstream');
    }

    // Persist validated image to disk cache asynchronously
    fs.promises.writeFile(cacheBinPath, validBuffer)
      .then(() => fs.promises.writeFile(cacheMimePath, validContentType))
      .catch(() => {});

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    res.setHeader('Content-Type', validContentType);
    res.setHeader('X-Proxy-Cache', 'MISS');
    return res.send(validBuffer);
  } catch (err) {
    if (!res.headersSent) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(502).send(err.message);
    }
  }
});

module.exports = router;
