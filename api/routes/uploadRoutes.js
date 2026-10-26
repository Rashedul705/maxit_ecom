const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { successResponse, errorResponse } = require('../utils/response');

// Ensure local uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/v1/upload
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file uploaded', 400);
    }

    const imgbbKey = process.env.IMGBB_API_KEY;

    // If IMGBB_API_KEY is configured, upload to ImgBB
    if (imgbbKey && imgbbKey.trim() !== '') {
      try {
        const formData = new URLSearchParams();
        formData.append('image', req.file.buffer.toString('base64'));

        const postData = formData.toString();
        const options = {
          hostname: 'api.imgbb.com',
          path: `/1/upload?key=${encodeURIComponent(imgbbKey)}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const imgbbUrl = await new Promise((resolve, reject) => {
          const apiReq = https.request(options, (apiRes) => {
            let body = '';
            apiRes.on('data', chunk => body += chunk);
            apiRes.on('end', () => {
              try {
                const json = JSON.parse(body);
                if (json.success && json.data && json.data.url) {
                  resolve(json.data.url);
                } else {
                  reject(new Error(json.error ? json.error.message : 'ImgBB upload failed'));
                }
              } catch (e) {
                reject(e);
              }
            });
          });
          apiReq.on('error', reject);
          apiReq.write(postData);
          apiReq.end();
        });

        return successResponse(res, { url: imgbbUrl, provider: 'imgbb' }, 'Image uploaded to ImgBB successfully');
      } catch (imgbbErr) {
        console.warn('⚠️ ImgBB upload error, falling back to local file storage:', imgbbErr.message);
      }
    }

    // Local file fallback
    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, req.file.buffer);

    const protocol = req.protocol;
    const host = req.get('host');
    const localUrl = `${protocol}://${host}/uploads/${filename}`;

    return successResponse(res, { url: localUrl, provider: 'local' }, 'Image uploaded locally');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
