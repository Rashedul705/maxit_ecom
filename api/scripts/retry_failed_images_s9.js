require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../output/source_9_server_networking.json');
const CACHE_FILE = path.join(__dirname, '../output/image_cache.json');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '4526cd8fc23e7f4b679b8b413e1920a1';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function retryUploads() {
  const data = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) : {};

  // Find all remaining startech images
  const pendingUrls = new Set();
  data.products.forEach(p => {
    if (p.image && p.image.includes('startech.com.bd')) pendingUrls.add(p.image);
    (p.images || []).forEach(img => {
      if (img && img.includes('startech.com.bd')) pendingUrls.add(img);
    });
  });

  console.log(`Unique images needing ImgBB upload: ${pendingUrls.size}`);
  if (pendingUrls.size === 0) {
    console.log('All images are already on ImgBB!');
    return;
  }

  // Test API first
  const testRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: new URLSearchParams({
      image: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    })
  });
  const testJson = await testRes.json();
  if (!testJson.success && testJson.error && testJson.error.message.includes('Rate limit')) {
    console.log(`[STATUS] ImgBB Rate limit is still active: "${testJson.error.message}". Need to wait for hourly window reset or provide secondary key.`);
    return { status: 'RATE_LIMITED', remaining: pendingUrls.size };
  }

  console.log('ImgBB API is available! Uploading remaining images...');
  let uploaded = 0;
  for (const rawUrl of pendingUrls) {
    if (cache[rawUrl]) continue;
    try {
      const res = await fetch(rawUrl, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) continue;
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
        cache[rawUrl] = json.data.url;
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
        uploaded++;
        console.log(`[${uploaded}/${pendingUrls.size}] Uploaded: ${json.data.url}`);
        await sleep(1000);
      } else {
        console.warn(`Failed for ${rawUrl}:`, json.error?.message);
        if (json.error?.message?.includes('Rate limit')) break;
      }
    } catch (e) {
      console.warn(`Error on ${rawUrl}:`, e.message);
    }
  }

  // Update product documents with newly cached URLs
  let updatedProducts = 0;
  data.products.forEach(p => {
    let changed = false;
    if (p.image && cache[p.image]) {
      p.image = cache[p.image];
      changed = true;
    }
    if (p.images) {
      p.images = p.images.map(img => {
        if (cache[img]) {
          changed = true;
          return cache[img];
        }
        return img;
      });
    }
    if (changed) updatedProducts++;
  });

  // Re-check how many still have startech URLs
  let remainingBad = 0;
  data.products.forEach(p => {
    if (p.image && p.image.includes('startech.com.bd')) remainingBad++;
    else if ((p.images || []).some(img => img.includes('startech.com.bd'))) remainingBad++;
  });

  data.imageUploadFailures = remainingBad;
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Updated ${updatedProducts} products. Remaining products with startech URLs: ${remainingBad}`);

  return { status: 'SUCCESS', uploaded, remaining: remainingBad };
}

if (require.main === module) {
  retryUploads().catch(console.error);
}

module.exports = retryUploads;

