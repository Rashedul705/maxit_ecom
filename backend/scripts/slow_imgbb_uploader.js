require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const OUTPUT_DIR = path.join(__dirname, '../output');
const CACHE_FILE = path.join(OUTPUT_DIR, 'image_cache.json');
const ENV_FILE = path.join(__dirname, '../.env');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function getApiKeys() {
  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('IMGBB_API_KEY=') || trimmed.startsWith('IMGBB_API_KEYS=')) {
        const val = trimmed.split('=')[1]?.trim() || '';
        const keys = val.split(',').map(k => k.trim()).filter(Boolean);
        if (keys.length > 0) return keys;
      }
    }
  }
  return [process.env.IMGBB_API_KEY || '4526cd8fc23e7f4b679b8b413e1920a1'];
}

async function runSlowUploader() {
  console.log('=== MULTI-QUEUE SLOW IMGBB UPLOADER STARTED ===');
  require('dotenv').config({ path: ENV_FILE });
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  let keyIndex = 0;

  while (true) {
    const apiKeys = getApiKeys();
    const pendingFiles = fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.startsWith('pending_images_') && f.endsWith('.json'))
      .map(f => path.join(OUTPUT_DIR, f));

    let totalPending = 0;
    let anyProcessed = false;
    let allKeysRateLimited = false;

    for (const pendingFile of pendingFiles) {
      if (allKeysRateLimited) break;

      const pendingList = JSON.parse(fs.readFileSync(pendingFile, 'utf-8'));
      if (pendingList.length === 0) continue;

      totalPending += pendingList.length;
      anyProcessed = true;
      const fileName = path.basename(pendingFile);
      console.log(`[Status] Queue ${fileName}: ${pendingList.length} products with pending images.`);

      const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) : {};
      let uploadedCount = 0;

      for (let i = 0; i < pendingList.length; i++) {
        const item = pendingList[i];
        const remainingBad = [];

        for (const rawUrl of item.badImgs) {
          let ibbUrl = cache[rawUrl];

          if (!ibbUrl) {
            let uploadSuccess = false;
            let attempts = 0;
            const currentKeys = getApiKeys();

            while (!uploadSuccess && attempts < currentKeys.length) {
              const activeKey = currentKeys[keyIndex % currentKeys.length];
              try {
                const res = await fetch(rawUrl, { headers: { 'User-Agent': USER_AGENT } });
                if (!res.ok) {
                  console.warn(`Download failed HTTP ${res.status} for ${rawUrl}`);
                  break;
                }
                const buffer = Buffer.from(await res.arrayBuffer());
                const base64 = buffer.toString('base64');

                const formData = new URLSearchParams();
                formData.append('image', base64);
                formData.append('name', 'maxit_' + Math.random().toString(36).substring(2, 8));

                const upRes = await fetch(`https://api.imgbb.com/1/upload?key=${activeKey}`, {
                  method: 'POST',
                  body: formData
                });
                const json = await upRes.json();

                if (json.success && json.data && json.data.url) {
                  ibbUrl = json.data.url;
                  cache[rawUrl] = ibbUrl;
                  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
                  uploadedCount++;
                  uploadSuccess = true;
                  console.log(`[Success] Uploaded (${uploadedCount}) using key ...${activeKey.slice(-4)}: ${rawUrl} -> ${ibbUrl}`);
                  await sleep(45000); // polite pause between uploads
                } else {
                  console.warn(`[ImgBB notice] (key ...${activeKey.slice(-4)}): ${json.error?.message || 'Upload failed'}`);
                  if (json.error?.message?.includes('Rate limit')) {
                    keyIndex = (keyIndex + 1) % currentKeys.length;
                    attempts++;
                    if (attempts >= currentKeys.length) {
                      allKeysRateLimited = true;
                      break;
                    }
                  } else {
                    break;
                  }
                }
              } catch (err) {
                console.warn(`Error on ${rawUrl}:`, err.message);
                break;
              }
            }

            if (!uploadSuccess && !ibbUrl) {
              remainingBad.push(rawUrl);
            }
          }

          if (ibbUrl) {
            const prod = await Product.findOne({ id: item.id });
            if (prod) {
              if (!prod.images) prod.images = [];
              prod.images = prod.images.map(img => (img === rawUrl ? ibbUrl : img));
              if (!prod.images.includes(ibbUrl)) {
                prod.images.push(ibbUrl);
              }
              if (prod.image === rawUrl || !prod.image) {
                prod.image = ibbUrl;
              }
              await prod.save();
            }
          }

          if (allKeysRateLimited) break;
        }

        item.badImgs = remainingBad;
        if (allKeysRateLimited) break;
      }

      const updatedPendingList = pendingList.filter(it => it.badImgs.length > 0);
      fs.writeFileSync(pendingFile, JSON.stringify(updatedPendingList, null, 2), 'utf-8');

      if (allKeysRateLimited) {
        console.log(`All available ImgBB keys (${getApiKeys().length}) are rate limited. Sleeping 15 minutes before retrying...`);
        await sleep(900000);
        break;
      } else {
        console.log(`Queue ${fileName} finished pass with ${uploadedCount} uploads.`);
      }
    }

    if (!anyProcessed) {
      console.log('All pending images across all queues have been uploaded to ImgBB! Sleeping 10 minutes...');
      await sleep(600000);
    } else if (!allKeysRateLimited) {
      console.log(`Cycle completed across all queues. Sleeping 30s before next pass...`);
      await sleep(30000);
    }
  }

  await mongoose.disconnect();
}

if (require.main === module) {
  runSlowUploader().catch(console.error);
}

module.exports = runSlowUploader;
