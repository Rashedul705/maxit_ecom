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

    const scriptPath = path.join(__dirname, '../../scripts/clean_single_image.py');
    const { execFile } = require('child_process');

    const filename = `clean_${Date.now()}_${Math.round(Math.random() * 1e6)}.jpg`;
    const destPath = path.join(uploadDir, filename);

    execFile('python3', [scriptPath, imageUrl, destPath], { timeout: 35000 }, async (err, stdout, stderr) => {
      if (err) {
        console.error('clean_single_image error:', err, stderr);
        return errorResponse(res, 'Failed to clean image: ' + (stderr || err.message), 500);
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
    next(err);
  }
});

// POST /api/v1/upload/crop-manual (Protected)
router.post('/crop-manual', requireAdminAuth, async (req, res, next) => {
  try {
    const { imageUrl, crop } = req.body;
    if (!imageUrl || typeof imageUrl !== 'string') {
      return errorResponse(res, 'imageUrl is required', 400);
    }
    if (!crop || typeof crop !== 'object') {
      return errorResponse(res, 'crop parameters are required', 400);
    }

    const scriptPath = path.join(__dirname, '../../scripts/crop_manual.py');
    const { execFile } = require('child_process');

    const filename = `crop_${Date.now()}_${Math.round(Math.random() * 1e6)}.jpg`;
    const destPath = path.join(uploadDir, filename);

    const payload = JSON.stringify({
      source: imageUrl,
      outputPath: destPath,
      crop: crop
    });

    execFile('python3', [scriptPath, payload], { timeout: 35000 }, async (err, stdout, stderr) => {
      if (err) {
        console.error('crop_manual error:', err, stderr);
        return errorResponse(res, 'Failed to crop image: ' + (stderr || err.message), 500);
      }

      try {
        const result = JSON.parse(stdout.trim());
        if (!result.success) {
          return errorResponse(res, result.error || 'Cropping failed', 500);
        }

        if (!fs.existsSync(destPath) || fs.statSync(destPath).size === 0) {
          return errorResponse(res, 'Cropped file was not generated', 500);
        }

        const croppedBuffer = fs.readFileSync(destPath);

        // 1. Try ImgBB if keys are configured
        const rawKeys = process.env.IMGBB_API_KEY || process.env.IMGBB_API_KEYS || '';
        const imgbbKeys = rawKeys
          .split(',')
          .map(k => k.trim())
          .filter(Boolean);

        if (imgbbKeys.length > 0) {
          const imgbbUrl = await uploadToImgBbApi(croppedBuffer, imgbbKeys);
          if (imgbbUrl) {
            syncLocalFile(filename, destPath);
            return successResponse(res, {
              url: imgbbUrl,
              provider: 'imgbb',
              croppedWidth: result.croppedWidth,
              croppedHeight: result.croppedHeight
            }, 'Image cropped and uploaded to ImgBB successfully');
          }
        }

        // 2. Save locally and sync across directories
        syncLocalFile(filename, destPath);
        const localUrl = `/uploads/${filename}`;
        return successResponse(res, {
          url: localUrl,
          provider: 'local',
          croppedWidth: result.croppedWidth,
          croppedHeight: result.croppedHeight
        }, 'Image cropped and saved successfully');

      } catch (parseErr) {
        return errorResponse(res, 'Failed to parse crop response: ' + parseErr.message, 500);
      }
    });
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

    const { spawn } = require('child_process');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const curl = spawn('curl', ['-4', '-sSL', '--connect-timeout', '6', '-m', '25', targetUrl]);
    curl.stdout.pipe(res);
    curl.on('error', (err) => {
      if (!res.headersSent) res.status(502).send(err.message);
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
