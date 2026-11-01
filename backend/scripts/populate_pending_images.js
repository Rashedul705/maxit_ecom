require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const OUTPUT_DIR = path.join(__dirname, '../output');
const CACHE_FILE = path.join(OUTPUT_DIR, 'image_cache.json');

async function populateImages() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const Product = require('../models/Product');
  const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) : {};

  const files = ['pending_images_s10.json', 'pending_images_s11.json'];
  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.join(OUTPUT_DIR, file);
    if (!fs.existsSync(filePath)) continue;

    const list = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Processing ${file}: ${list.length} products...`);

    const bulkOps = [];

    for (const item of list) {
      if (!item.badImgs || item.badImgs.length === 0) continue;

      const imgs = item.badImgs.map(raw => cache[raw] || raw);
      if (imgs.length === 0) continue;

      bulkOps.push({
        updateOne: {
          filter: { id: item.id, $or: [{ images: { $size: 0 } }, { images: { $exists: false } }] },
          update: {
            $set: {
              images: imgs,
              image: imgs[0]
            }
          }
        }
      });

      if (bulkOps.length >= 500) {
        const res = await Product.bulkWrite(bulkOps);
        updatedCount += res.modifiedCount;
        bulkOps.length = 0;
        console.log(`Updated ${updatedCount} products so far...`);
      }
    }

    if (bulkOps.length > 0) {
      const res = await Product.bulkWrite(bulkOps);
      updatedCount += res.modifiedCount;
      console.log(`Updated ${updatedCount} products after finishing ${file}.`);
    }
  }

  console.log(`=== FINISHED: Populated real images for ${updatedCount} products ===`);
  await mongoose.disconnect();
}

populateImages().catch(console.error);

