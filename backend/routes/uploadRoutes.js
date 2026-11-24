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
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, req.file.buffer);

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

    execFile('python3', [scriptPath, imageUrl, destPath], { timeout: 60000 }, (err, stdout, stderr) => {
      if (err) {
        console.error('clean_single_image error:', err, stderr);
        return errorResponse(res, 'Failed to clean image: ' + err.message, 500);
      }

      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
        const apiUploads = path.join(__dirname, '../../api/uploads', filename);
        const storefrontUploads = path.join(__dirname, '../../storefront/public/uploads', filename);
        const frontendUploads = path.join(__dirname, '../../frontend/public/uploads', filename);
        for (const target of [apiUploads, storefrontUploads, frontendUploads]) {
          try {
            if (fs.existsSync(path.dirname(target))) {
              fs.copyFileSync(destPath, target);
            }
          } catch (e) {}
        }

        const localUrl = `/uploads/${filename}`;
        return successResponse(res, { url: localUrl, details: stdout.trim() }, 'Image cleaned successfully');
      } else {
        return successResponse(res, { url: imageUrl, details: 'Image was already clean' }, 'Image is already clean');
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
