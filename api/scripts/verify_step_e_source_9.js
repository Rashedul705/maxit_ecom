require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BASELINE_FILE = path.join(__dirname, '../output/baseline.json');
const S1_FILE = path.join(__dirname, '../output/source-1-inserted-ids.json');
const S2_FILE = path.join(__dirname, '../output/source-2-inserted-ids.json');
const S3_FILE = path.join(__dirname, '../output/source-3-inserted-ids.json');
const S4_FILE = path.join(__dirname, '../output/source-4-inserted-ids.json');
const S5_FILE = path.join(__dirname, '../output/source-5-inserted-ids.json');
const S6_FILE = path.join(__dirname, '../output/source-6-inserted-ids.json');
const S7_FILE = path.join(__dirname, '../output/source-7-inserted-ids.json');
const S8_FILE = path.join(__dirname, '../output/source-8-inserted-ids.json');
const S9_FILE = path.join(__dirname, '../output/source_9_server_networking.json');
const S9_IDS_FILE = path.join(__dirname, '../output/source-9-inserted-ids.json');

async function verifyStepESource9() {
  console.log('=== STEP E VERIFICATION: SOURCE #9 (Server & Networking) ===');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  const Category = require('../models/Category');

  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
  const s1Ids = JSON.parse(fs.readFileSync(S1_FILE, 'utf-8'));
  const s2Ids = JSON.parse(fs.readFileSync(S2_FILE, 'utf-8'));
  const s3Ids = JSON.parse(fs.readFileSync(S3_FILE, 'utf-8'));
  const s4Ids = JSON.parse(fs.readFileSync(S4_FILE, 'utf-8'));
  const s5Ids = JSON.parse(fs.readFileSync(S5_FILE, 'utf-8'));
  const s6Ids = JSON.parse(fs.readFileSync(S6_FILE, 'utf-8'));
  const s7Ids = JSON.parse(fs.readFileSync(S7_FILE, 'utf-8'));
  const s8Ids = JSON.parse(fs.readFileSync(S8_FILE, 'utf-8'));
  const s9Data = JSON.parse(fs.readFileSync(S9_FILE, 'utf-8'));
  const s9Ids = JSON.parse(fs.readFileSync(S9_IDS_FILE, 'utf-8'));

  // 1. Total counts before and after
  const currentProductCount = await Product.countDocuments();
  const currentCategoryCount = await Category.countDocuments();
  const expectedProductCount = baseline.products.length + s1Ids.length + s2Ids.length + s3Ids.length + s4Ids.length + s5Ids.length + s6Ids.length + s7Ids.length + s8Ids.length + s9Ids.length;
  const expectedCategoryCount = baseline.categories.length + 9;

  console.log(`\n1. Database Counts:`);
  console.log(`   Products: Baseline (${baseline.products.length}) + Prior S1-S8 (${s1Ids.length + s2Ids.length + s3Ids.length + s4Ids.length + s5Ids.length + s6Ids.length + s7Ids.length + s8Ids.length}) + S9 (${s9Ids.length}) = ${expectedProductCount} | Actual in DB = ${currentProductCount}`);
  console.log(`   Categories: Baseline (${baseline.categories.length}) + 9 new categories = ${expectedCategoryCount} | Actual in DB = ${currentCategoryCount}`);

  if (currentProductCount !== expectedProductCount) {
    throw new Error(`Product count mismatch: expected ${expectedProductCount}, got ${currentProductCount}`);
  }

  // 2. Baseline & Prior Source IDs integrity check
  console.log(`\n2. Verifying Baseline and Prior Sources products exist unchanged...`);
  const baselineIds = baseline.products.map(p => p.id);
  const foundBaseline = await Product.find({ id: { $in: baselineIds } }).countDocuments();
  const foundS1 = await Product.find({ id: { $in: s1Ids } }).countDocuments();
  const foundS2 = await Product.find({ id: { $in: s2Ids } }).countDocuments();
  const foundS3 = await Product.find({ id: { $in: s3Ids } }).countDocuments();
  const foundS4 = await Product.find({ id: { $in: s4Ids } }).countDocuments();
  const foundS5 = await Product.find({ id: { $in: s5Ids } }).countDocuments();
  const foundS6 = await Product.find({ id: { $in: s6Ids } }).countDocuments();
  const foundS7 = await Product.find({ id: { $in: s7Ids } }).countDocuments();
  const foundS8 = await Product.find({ id: { $in: s8Ids } }).countDocuments();
  console.log(`   Found ${foundBaseline} of 117 baseline products in DB.`);
  console.log(`   Found ${foundS1} of 20 Source #1 products in DB.`);
  console.log(`   Found ${foundS2} of 106 Source #2 products in DB.`);
  console.log(`   Found ${foundS3} of 10 Source #3 products in DB.`);
  console.log(`   Found ${foundS4} of 16 Source #4 products in DB.`);
  console.log(`   Found ${foundS5} of 6 Source #5 products in DB.`);
  console.log(`   Found ${foundS6} of 76 Source #6 products in DB.`);
  console.log(`   Found ${foundS7} of 57 Source #7 products in DB.`);
  console.log(`   Found ${foundS8} of 41 Source #8 products in DB.`);

  if (foundBaseline !== 117 || foundS1 !== 20 || foundS2 !== 106 || foundS3 !== 10 || foundS4 !== 16 || foundS5 !== 6 || foundS6 !== 76 || foundS7 !== 57 || foundS8 !== 41) {
    throw new Error('CRITICAL: Prior products are missing or modified!');
  }

  // 3. Price check over all inserted products
  console.log(`\n3. Verifying Prices on ALL ${s9Ids.length} newly inserted products...`);
  const s9Docs = await Product.find({ id: { $in: s9Ids } }).lean();
  let priceMismatches = 0;

  s9Docs.forEach((doc, idx) => {
    const src = s9Data.products.find(p => p.id === doc.id);
    let expectedPrice = 0;
    if (src.audit.sourcePrice > 0) {
      expectedPrice = Math.round((src.audit.sourcePrice * 1.10) / 10) * 10;
    }
    const match = doc.price === expectedPrice;
    if (!match) {
      priceMismatches++;
      console.error(`   Mismatch on ${doc.id}: db=${doc.price}, expected=${expectedPrice}`);
    }
  });

  if (priceMismatches > 0) {
    throw new Error(`${priceMismatches} price mismatches found!`);
  }
  console.log(`   All ${s9Ids.length} products passed the exact price formula check.`);

  // 4. Verify Category in DB
  const snCat = await Category.findOne({ slug: 'server-networking' }).lean();
  console.log(`\n4. Verifying Category in Database:`);
  console.log(`   ID: ${snCat.id} | Name: ${snCat.name} | Slug: ${snCat.slug} | Order: ${snCat.order} | Active: ${snCat.isActive}`);
  const catProdCount = await Product.countDocuments({ category: 'server-networking' });
  console.log(`   Products linked to 'server-networking': ${catProdCount} (Expected: ${s9Ids.length})`);

  if (catProdCount !== s9Ids.length) {
    throw new Error(`Category product count mismatch: expected ${s9Ids.length}, got ${catProdCount}`);
  }

  // 5. Select 5 sample products for check
  console.log(`\n5. Checking 5 Sample Products:`);
  const shuffled = [...s9Docs].sort(() => 0.5 - Math.random()).slice(0, 5);
  shuffled.forEach((p, i) => {
    console.log(`   [Sample ${i + 1}] ${p.id} | ${p.title} | Price: ৳${p.price.toLocaleString('en-US')} | OldPrice: ৳${p.oldPrice.toLocaleString('en-US')} | Stock: ${p.stock} | Specs Groups: ${Object.keys(p.specs || {}).length} | Imgs: ${p.images?.length}`);
  });

  await mongoose.disconnect();
  console.log('\nStep E verification completed successfully!');
}

if (require.main === module) {
  verifyStepESource9().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
  });
}

module.exports = verifyStepESource9;

