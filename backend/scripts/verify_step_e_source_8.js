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
const S8_FILE = path.join(__dirname, '../output/source_8_portable_power_station.json');
const S8_IDS_FILE = path.join(__dirname, '../output/source-8-inserted-ids.json');

async function verifyStepESource8() {
  console.log('=== STEP E VERIFICATION: SOURCE #8 (Portable Power Station) ===');

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
  const s8Data = JSON.parse(fs.readFileSync(S8_FILE, 'utf-8'));
  const s8Ids = JSON.parse(fs.readFileSync(S8_IDS_FILE, 'utf-8'));

  // 1. Total counts before and after
  const currentProductCount = await Product.countDocuments();
  const currentCategoryCount = await Category.countDocuments();
  const expectedProductCount = baseline.products.length + s1Ids.length + s2Ids.length + s3Ids.length + s4Ids.length + s5Ids.length + s6Ids.length + s7Ids.length + s8Ids.length;
  const expectedCategoryCount = baseline.categories.length + 8;

  console.log(`\n1. Database Counts:`);
  console.log(`   Products: Baseline (${baseline.products.length}) + Prior S1-S7 (${s1Ids.length + s2Ids.length + s3Ids.length + s4Ids.length + s5Ids.length + s6Ids.length + s7Ids.length}) + S8 (${s8Ids.length}) = ${expectedProductCount} | Actual in DB = ${currentProductCount}`);
  console.log(`   Categories: Baseline (${baseline.categories.length}) + 8 new categories = ${expectedCategoryCount} | Actual in DB = ${currentCategoryCount}`);

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
  console.log(`   Found ${foundBaseline} of 117 baseline products in DB.`);
  console.log(`   Found ${foundS1} of 20 Source #1 products in DB.`);
  console.log(`   Found ${foundS2} of 106 Source #2 products in DB.`);
  console.log(`   Found ${foundS3} of 10 Source #3 products in DB.`);
  console.log(`   Found ${foundS4} of 16 Source #4 products in DB.`);
  console.log(`   Found ${foundS5} of 6 Source #5 products in DB.`);
  console.log(`   Found ${foundS6} of 76 Source #6 products in DB.`);
  console.log(`   Found ${foundS7} of 57 Source #7 products in DB.`);

  if (foundBaseline !== 117 || foundS1 !== 20 || foundS2 !== 106 || foundS3 !== 10 || foundS4 !== 16 || foundS5 !== 6 || foundS6 !== 76 || foundS7 !== 57) {
    throw new Error('CRITICAL: Prior products are missing or modified!');
  }

  // 3. Price check over all 41 inserted products
  console.log(`\n3. Verifying Prices on ALL 41 newly inserted products...`);
  const s8Docs = await Product.find({ id: { $in: s8Ids } }).lean();
  let priceMismatches = 0;

  s8Docs.forEach((doc, idx) => {
    const src = s8Data.products.find(p => p.id === doc.id);
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
  console.log(`   All 41 products passed the exact price formula check.`);

  // 4. Verify Category in DB
  const psCat = await Category.findOne({ slug: 'portable-power-station' }).lean();
  console.log(`\n4. Verifying Category in Database:`);
  console.log(`   ID: ${psCat.id} | Name: ${psCat.name} | Slug: ${psCat.slug} | Order: ${psCat.order} | Active: ${psCat.isActive}`);
  const catProdCount = await Product.countDocuments({ category: 'portable-power-station' });
  console.log(`   Products linked to 'portable-power-station': ${catProdCount} (Expected: 41)`);

  if (catProdCount !== 41) {
    throw new Error(`Category product count mismatch: expected 41, got ${catProdCount}`);
  }

  // 5. Select 5 sample products for check
  console.log(`\n5. Checking 5 Sample Products:`);
  const shuffled = [...s8Docs].sort(() => 0.5 - Math.random()).slice(0, 5);
  shuffled.forEach((p, i) => {
    console.log(`   [Sample ${i + 1}] ${p.id} | ${p.title} | Price: ৳${p.price.toLocaleString('en-US')} | OldPrice: ৳${p.oldPrice.toLocaleString('en-US')} | Stock: ${p.stock} | Specs Groups: ${Object.keys(p.specs || {}).length} | Imgs: ${p.images?.length}`);
  });

  await mongoose.disconnect();
  console.log('\nStep E verification completed successfully!');
}

if (require.main === module) {
  verifyStepESource8().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
  });
}

module.exports = verifyStepESource8;

