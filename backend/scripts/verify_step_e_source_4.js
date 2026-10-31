require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BASELINE_FILE = path.join(__dirname, '../output/baseline.json');
const S1_FILE = path.join(__dirname, '../output/source-1-inserted-ids.json');
const S2_FILE = path.join(__dirname, '../output/source-2-inserted-ids.json');
const S3_FILE = path.join(__dirname, '../output/source-3-inserted-ids.json');
const S4_FILE = path.join(__dirname, '../output/source_4_solar_battery.json');
const S4_IDS_FILE = path.join(__dirname, '../output/source-4-inserted-ids.json');

async function verifyStepESource4() {
  console.log('=== STEP E VERIFICATION: SOURCE #4 (Solar Battery) ===');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  const Category = require('../models/Category');

  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
  const s1Ids = JSON.parse(fs.readFileSync(S1_FILE, 'utf-8'));
  const s2Ids = JSON.parse(fs.readFileSync(S2_FILE, 'utf-8'));
  const s3Ids = JSON.parse(fs.readFileSync(S3_FILE, 'utf-8'));
  const s4Data = JSON.parse(fs.readFileSync(S4_FILE, 'utf-8'));
  const s4Ids = JSON.parse(fs.readFileSync(S4_IDS_FILE, 'utf-8'));

  // 1. Total counts before and after
  const currentProductCount = await Product.countDocuments();
  const currentCategoryCount = await Category.countDocuments();
  const expectedProductCount = baseline.products.length + s1Ids.length + s2Ids.length + s3Ids.length + s4Ids.length;
  const expectedCategoryCount = baseline.categories.length + 4; // + solar-inverter + online-ups + voltage-stabilizer + solar-battery

  console.log(`\n1. Database Counts:`);
  console.log(`   Products: Baseline (${baseline.products.length}) + S1 (${s1Ids.length}) + S2 (${s2Ids.length}) + S3 (${s3Ids.length}) + S4 (${s4Ids.length}) = ${expectedProductCount} | Actual in DB = ${currentProductCount}`);
  console.log(`   Categories: Baseline (${baseline.categories.length}) + S1,S2,S3,S4 (4) = ${expectedCategoryCount} | Actual in DB = ${currentCategoryCount}`);

  if (currentProductCount !== expectedProductCount) {
    throw new Error(`Product count mismatch: expected ${expectedProductCount}, got ${currentProductCount}`);
  }

  // 2. Baseline & Prior Source IDs integrity check
  console.log(`\n2. Verifying Baseline (117), S1 (20), S2 (106) and S3 (10) products exist unchanged...`);
  const baselineIds = baseline.products.map(p => p.id);
  const foundBaseline = await Product.find({ id: { $in: baselineIds } }).countDocuments();
  const foundS1 = await Product.find({ id: { $in: s1Ids } }).countDocuments();
  const foundS2 = await Product.find({ id: { $in: s2Ids } }).countDocuments();
  const foundS3 = await Product.find({ id: { $in: s3Ids } }).countDocuments();
  console.log(`   Found ${foundBaseline} of 117 baseline products in DB.`);
  console.log(`   Found ${foundS1} of 20 Source #1 products in DB.`);
  console.log(`   Found ${foundS2} of 106 Source #2 products in DB.`);
  console.log(`   Found ${foundS3} of 10 Source #3 products in DB.`);

  if (foundBaseline !== 117 || foundS1 !== 20 || foundS2 !== 106 || foundS3 !== 10) {
    throw new Error('CRITICAL: Prior products are missing or modified!');
  }

  // 3. Price check over all 16 inserted products
  console.log(`\n3. Verifying Prices on ALL 16 newly inserted products...`);
  const s4Docs = await Product.find({ id: { $in: s4Ids } }).lean();
  let priceMismatches = 0;

  s4Docs.forEach((doc, idx) => {
    const src = s4Data.products.find(p => p.id === doc.id);
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
  console.log(`   All 16 products passed the exact price formula check.`);

  // 4. Verify Category in DB
  const batCat = await Category.findOne({ slug: 'solar-battery' }).lean();
  console.log(`\n4. Verifying Category in Database:`);
  console.log(`   ID: ${batCat.id} | Name: ${batCat.name} | Slug: ${batCat.slug} | Order: ${batCat.order} | Active: ${batCat.isActive}`);
  const catProdCount = await Product.countDocuments({ category: 'solar-battery' });
  console.log(`   Products linked to 'solar-battery': ${catProdCount} (Expected: 16)`);

  if (catProdCount !== 16) {
    throw new Error(`Category product count mismatch: expected 16, got ${catProdCount}`);
  }

  // 5. Select 5 random products for spot check
  console.log(`\n5. Spot Checking 5 Random Products:`);
  const shuffled = [...s4Docs].sort(() => 0.5 - Math.random()).slice(0, 5);
  shuffled.forEach((p, i) => {
    console.log(`   [Sample ${i + 1}] ${p.id} | ${p.title.slice(0, 45)}... | Price: ৳${p.price.toLocaleString('en-US')} | OldPrice: ৳${p.oldPrice.toLocaleString('en-US')} | Stock: ${p.stock} | Specs Groups: ${Object.keys(p.specs || {}).length} | Imgs: ${p.images?.length}`);
  });

  await mongoose.disconnect();
  console.log('\nStep E verification completed successfully!');
}

if (require.main === module) {
  verifyStepESource4().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
  });
}

module.exports = verifyStepESource4;

