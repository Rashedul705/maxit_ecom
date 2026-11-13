require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const INSERTED_IDS_PATH = path.join(__dirname, '../output/source-4-inserted-ids.json');

async function rollback() {
  console.log('=== ROLLBACK SOURCE #4 (Solar Battery) ===');

  if (!fs.existsSync(INSERTED_IDS_PATH)) {
    console.error(`Inserted IDs file not found at: ${INSERTED_IDS_PATH}`);
    process.exit(1);
  }

  const insertedIds = JSON.parse(fs.readFileSync(INSERTED_IDS_PATH, 'utf-8'));
  console.log(`Found ${insertedIds.length} product IDs to delete.`);

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  const Category = require('../models/Category');

  // 1. Delete products matching inserted IDs only
  const delRes = await Product.deleteMany({ id: { $in: insertedIds } });
  console.log(`Deleted ${delRes.deletedCount} products matching Source #4 IDs.`);

  // 2. Check remaining products in category 'solar-battery'
  const remainingCount = await Product.countDocuments({ category: 'solar-battery' });
  console.log(`Remaining products in category 'solar-battery': ${remainingCount}`);

  if (remainingCount === 0) {
    const catDelRes = await Category.deleteOne({ slug: 'solar-battery' });
    console.log(`Removed category 'solar-battery' (deleted: ${catDelRes.deletedCount}) because no products remain in it.`);
  } else {
    console.log(`Retained category 'solar-battery' because it still contains ${remainingCount} products.`);
  }

  const finalProductCount = await Product.countDocuments();
  const finalCategoryCount = await Category.countDocuments();
  console.log(`Final Database Counts: Products = ${finalProductCount}, Categories = ${finalCategoryCount}`);

  await mongoose.disconnect();
  console.log('Rollback completed.');
}

if (require.main === module) {
  rollback().catch(err => {
    console.error('Rollback failed:', err);
    process.exit(1);
  });
}

module.exports = rollback;

