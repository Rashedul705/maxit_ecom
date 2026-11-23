require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function migrateImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for Product Images migration...');

  const cursor = Product.find().cursor();
  let updatedCount = 0;
  let totalCount = 0;

  for await (const prod of cursor) {
    totalCount++;
    let needsUpdate = false;
    let mainImg = prod.image;
    let gallery = Array.isArray(prod.images) ? [...prod.images] : [];

    // Normalize localhost URLs
    if (typeof mainImg === 'string' && mainImg.includes('localhost:5002')) {
      mainImg = mainImg.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:5002)?\/uploads\//i, '/uploads/');
      needsUpdate = true;
    }

    const normGallery = gallery.map(img => {
      if (typeof img === 'string' && img.includes('localhost:5002')) {
        needsUpdate = true;
        return img.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:5002)?\/uploads\//i, '/uploads/');
      }
      return img;
    }).filter(Boolean);

    // If main image is missing or empty, take first from gallery
    if (!mainImg || typeof mainImg !== 'string' || mainImg.trim() === '') {
      if (normGallery.length > 0) {
        mainImg = normGallery[0];
        needsUpdate = true;
      }
    }

    // Ensure gallery has at least mainImg if mainImg exists
    if (mainImg && normGallery.length === 0) {
      normGallery.push(mainImg);
      needsUpdate = true;
    }

    if (needsUpdate) {
      prod.image = mainImg || '';
      prod.images = normGallery;
      await prod.save();
      updatedCount++;
    }
  }

  console.log(`Migration completed. Inspected ${totalCount} products. Successfully updated ${updatedCount} products.`);
  await mongoose.disconnect();
}

migrateImages().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
