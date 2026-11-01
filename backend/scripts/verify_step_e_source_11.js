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
const S9_FILE = path.join(__dirname, '../output/source-9-inserted-ids.json');
const S10_FILE = path.join(__dirname, '../output/source-10-inserted-ids.json');
const S11_FILE = path.join(__dirname, '../output/source_11_security_camera.json');
const S11_IDS_FILE = path.join(__dirname, '../output/source-11-inserted-ids.json');

async function verifyStepESource11() {
  console.log('=== STEP E VERIFICATION: SOURCE #11 (Security Camera) ===');

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
  const s9Ids = JSON.parse(fs.readFileSync(S9_FILE, 'utf-8'));
  const s10Ids = JSON.parse(fs.readFileSync(S10_FILE, 'utf-8'));
  const s11Data = JSON.parse(fs.readFileSync(S11_FILE, 'utf-8'));
  const s11Ids = JSON.parse(fs.readFileSync(S11_IDS_FILE, 'utf-8'));

  // 1. Total counts before and after
  const currentProductCount = await Product.countDocuments();
  const currentCategoryCount = await Category.countDocuments();
  const priorCount = baseline.products.length + s1Ids.length + s2Ids.length + s3Ids.length + s4Ids.length + s5Ids.length + s6Ids.length + s7Ids.length + s8Ids.length + s9Ids.length + s10Ids.length;
  const expectedProductCount = priorCount + s11Ids.length;
  const expectedCategoryCount = baseline.categories.length + 11;

  console.log(`\n1. Database Counts:`);
  console.log(`   Products: Baseline (${baseline.products.length}) + Prior S1-S10 (${priorCount - baseline.products.length}) + S11 (${s11Ids.length}) = ${expectedProductCount} | Actual in DB = ${currentProductCount}`);
  console.log(`   Categories: Baseline (${baseline.categories.length}) + 11 new categories = ${expectedCategoryCount} | Actual in DB = ${currentCategoryCount}`);

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
  const foundS9 = await Product.find({ id: { $in: s9Ids } }).countDocuments();
  const foundS10 = await Product.find({ id: { $in: s10Ids } }).countDocuments();
  console.log(`   Found ${foundBaseline} of 117 baseline products in DB.`);
  console.log(`   Found ${foundS1} of 20 Source #1 products in DB.`);
  console.log(`   Found ${foundS2} of 106 Source #2 products in DB.`);
  console.log(`   Found ${foundS3} of 10 Source #3 products in DB.`);
  console.log(`   Found ${foundS4} of 16 Source #4 products in DB.`);
  console.log(`   Found ${foundS5} of 6 Source #5 products in DB.`);
  console.log(`   Found ${foundS6} of 76 Source #6 products in DB.`);
  console.log(`   Found ${foundS7} of 57 Source #7 products in DB.`);
  console.log(`   Found ${foundS8} of 41 Source #8 products in DB.`);
  console.log(`   Found ${foundS9} of 330 Source #9 products in DB.`);
  console.log(`   Found ${foundS10} of 2186 Source #10 products in DB.`);

  if (foundBaseline !== 117 || foundS1 !== 20 || foundS2 !== 106 || foundS3 !== 10 || foundS4 !== 16 || foundS5 !== 6 || foundS6 !== 76 || foundS7 !== 57 || foundS8 !== 41 || foundS9 !== 330 || foundS10 !== 2186) {
    throw new Error('CRITICAL: Prior products are missing or modified!');
  }

  // 3. Price check over all inserted products
  console.log(`\n3. Verifying Prices on ALL ${s11Ids.length} newly inserted products...`);
  const s11Docs = await Product.find({ id: { $in: s11Ids } }).lean();
  let priceMismatches = 0;

  s11Docs.forEach((doc) => {
    const src = s11Data.products.find(p => p.id === doc.id);
    if (!src) return;
    let expectedPrice = 0;
    if (src.audit && src.audit.sourcePrice > 0) {
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
  console.log(`   All ${s11Ids.length} products passed the exact price formula check.`);

  // 4. Verify Category in DB
  const scCat = await Category.findOne({ slug: 'security-camera' }).lean();
  console.log(`\n4. Verifying Category in Database:`);
  console.log(`   ID: ${scCat.id} | Name: ${scCat.name} | Slug: ${scCat.slug} | Order: ${scCat.order} | Active: ${scCat.isActive}`);
  const catProdCount = await Product.countDocuments({ category: 'security-camera' });
  console.log(`   Products linked to 'security-camera': ${catProdCount} (Expected: ${s11Ids.length})`);

  if (catProdCount !== s11Ids.length) {
    throw new Error(`Category product count mismatch: expected ${s11Ids.length}, got ${catProdCount}`);
  }

  // 5. Select 5 sample products for check
  console.log(`\n5. Checking 5 Sample Products:`);
  const shuffled = [...s11Docs].sort(() => 0.5 - Math.random()).slice(0, 5);
  shuffled.forEach((p, i) => {
    console.log(`   [Sample ${i + 1}] ${p.id} | ${p.title || p.name} | Price: ৳${p.price.toLocaleString('en-US')} | OldPrice: ৳${p.oldPrice.toLocaleString('en-US')} | Stock: ${p.stock} | Specs Groups: ${Object.keys(p.specs || {}).length} | Imgs: ${p.images?.length}`);
  });

  await mongoose.disconnect();
  console.log('\nStep E verification for Source #11 completed successfully!');
}

if (require.main === module) {
  verifyStepESource11().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
  });
}

module.exports = verifyStepESource11;

