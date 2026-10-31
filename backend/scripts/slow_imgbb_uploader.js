require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const PENDING_FILE = path.join(__dirname, '../output/pending_images_s9.json');
const CACHE_FILE = path.join(__dirname, '../output/image_cache.json');
const S9_FILE = path.join(__dirname, '../output/source_9_server_networking.json');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '4526cd8fc23e7f4b679b8b413e1920a1';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runSlowUploader() {
  console.log('=== SLOW IMGBB UPLOADER (via pending_images_s9.json) STARTED ===');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');

  while (true) {
    if (!fs.existsSync(PENDING_FILE)) {
      console.log('No pending images file found. Exiting.');
      break;
    }

    const pendingList = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf-8'));
    if (pendingList.length === 0) {
      console.log('All pending images have been uploaded to ImgBB! Exiting.');
      break;
    }

    const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) : {};
    console.log(`[Status] ${pendingList.length} products still have pending images to upload.`);

    let rateLimited = false;
    let uploadedCount = 0;

    for (let i = 0; i < pendingList.length; i++) {
      const item = pendingList[i];
      const remainingBad = [];

      for (const rawUrl of item.badImgs) {
        let ibbUrl = cache[rawUrl];

        if (!ibbUrl) {
          try {
            const res = await fetch(rawUrl, { headers: { 'User-Agent': USER_AGENT } });
            if (!res.ok) {
              console.warn(`Download failed HTTP ${res.status} for ${rawUrl}`);
              remainingBad.push(rawUrl);
              continue;
            }
            const buffer = Buffer.from(await res.arrayBuffer());
            const base64 = buffer.toString('base64');

            const formData = new URLSearchParams();
            formData.append('image', base64);
            formData.append('name', 'server_net_' + Math.random().toString(36).substring(2, 8));

            const upRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
              method: 'POST',
              body: formData
            });
            const json = await upRes.json();

            if (json.success && json.data && json.data.url) {
              ibbUrl = json.data.url;
              cache[rawUrl] = ibbUrl;
              fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
              uploadedCount++;
              console.log(`[Success] Uploaded: ${rawUrl} -> ${ibbUrl}`);
              await sleep(3000);
            } else {
              console.warn(`[ImgBB notice] ${json.error?.message || 'Upload failed'}`);
              remainingBad.push(rawUrl);
              if (json.error?.message?.includes('Rate limit')) {
                rateLimited = true;
                break;
              }
            }
          } catch (err) {
            console.warn(`Error on ${rawUrl}:`, err.message);
            remainingBad.push(rawUrl);
          }
        }

        if (ibbUrl) {
          // Immediately update product in MongoDB
          const prod = await Product.findOne({ id: item.id });
          if (prod) {
            if (!prod.images) prod.images = [];
            if (!prod.images.includes(ibbUrl)) {
              prod.images.push(ibbUrl);
            }
            if (!prod.image) {
              prod.image = ibbUrl;
            }
            await prod.save();
          }
        }
      }

      item.badImgs = remainingBad;

      if (rateLimited) {
        break;
      }
    }

    // Save cleaned pending list
    const updatedPendingList = pendingList.filter(it => it.badImgs.length > 0);
    fs.writeFileSync(PENDING_FILE, JSON.stringify(updatedPendingList, null, 2), 'utf-8');

    if (rateLimited) {
      console.log('Rate limit active. Sleeping 5 minutes before checking again...');
      await sleep(300000); // 5 minutes
    } else {
      console.log(`Cycle finished. Uploaded ${uploadedCount} images. Sleeping 60s...`);
      await sleep(60000);
    }
  }

  await mongoose.disconnect();
}

if (require.main === module) {
  runSlowUploader().catch(console.error);
}

module.exports = runSlowUploader;
