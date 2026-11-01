require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const S11_IDS_FILE = path.join(__dirname, '../output/source-11-inserted-ids.json');
const BASELINE_FILE = path.join(__dirname, '../output/baseline.json');

async function rollbackSource11() {
  console.log('=== ROLLBACK SOURCE #11 (Security Camera) ===');

  if (!fs.existsSync(S11_IDS_FILE)) {
    console.log('No source-11-inserted-ids.json found. Nothing to rollback.');
    return;
  }

  const s11Ids = JSON.parse(fs.readFileSync(S11_IDS_FILE, 'utf-8'));
  console.log(`Found ${s11Ids.length} inserted IDs to remove.`);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  const Category = require('../models/Category');

  // Verify baseline IDs are not in the delete list
  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
  const baselineIds = new Set(baseline.products.map(p => p.id));
  const safeIds = s11Ids.filter(id => !baselineIds.has(id));

  if (safeIds.length !== s11Ids.length) {
    throw new Error('CRITICAL: Attempted to delete a baseline product in rollback!');
  }

  // Delete products
  const delResult = await Product.deleteMany({ id: { $in: safeIds } });
  console.log(`Deleted ${delResult.deletedCount} products.`);

  // Check remaining in category
  const remaining = await Product.countDocuments({ category: 'security-camera' });
  if (remaining === 0) {
    await Category.deleteOne({ slug: 'security-camera' });
    console.log('Category security-camera removed.');
  } else {
    console.log(`Remaining products in security-camera: ${remaining}`);
  }

  // Remove output files
  if (fs.existsSync(S11_IDS_FILE)) fs.unlinkSync(S11_IDS_FILE);
  const s11DataFile = path.join(__dirname, '../output/source_11_security_camera.json');
  if (fs.existsSync(s11DataFile)) fs.unlinkSync(s11DataFile);
  const s11Pending = path.join(__dirname, '../output/pending_images_s11.json');
  if (fs.existsSync(s11Pending)) fs.unlinkSync(s11Pending);

  const totalProducts = await Product.countDocuments();
  const totalCategories = await Category.countDocuments();
  console.log(`Rollback completed. Total Products in DB: ${totalProducts}, Total Categories: ${totalCategories}`);

  await mongoose.disconnect();
}

if (require.main === module) {
  rollbackSource11().catch(console.error);
}

module.exports = rollbackSource11;

