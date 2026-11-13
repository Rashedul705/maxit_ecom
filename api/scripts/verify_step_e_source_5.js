require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BASELINE_FILE = path.join(__dirname, '../output/baseline.json');
const S1_FILE = path.join(__dirname, '../output/source-1-inserted-ids.json');
const S2_FILE = path.join(__dirname, '../output/source-2-inserted-ids.json');
const S3_FILE = path.join(__dirname, '../output/source-3-inserted-ids.json');
const S4_FILE = path.join(__dirname, '../output/source-4-inserted-ids.json');
const S5_FILE = path.join(__dirname, '../output/source_5_solar_package.json');
const S5_IDS_FILE = path.join(__dirname, '../output/source-5-inserted-ids.json');

async function verifyStepESource5() {
  console.log('=== STEP E VERIFICATION: SOURCE #5 (Solar Package) ===');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  const Category = require('../models/Category');

  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
  const s1Ids = JSON.parse(fs.readFileSync(S1_FILE, 'utf-8'));
  const s2Ids = JSON.parse(fs.readFileSync(S2_FILE, 'utf-8'));
  const s3Ids = JSON.parse(fs.readFileSync(S3_FILE, 'utf-8'));
  const s4Ids = JSON.parse(fs.readFileSync(S4_FILE, 'utf-8'));
  const s5Data = JSON.parse(fs.readFileSync(S5_FILE, 'utf-8'));
  const s5Ids = JSON.parse(fs.readFileSync(S5_IDS_FILE, 'utf-8'));

  // 1. Total counts before and after
  const currentProductCount = await Product.countDocuments();
  const currentCategoryCount = await Category.countDocuments();
  const expectedProductCount = baseline.products.length + s1Ids.length + s2Ids.length + s3Ids.length + s4Ids.length + s5Ids.length;
  const expectedCategoryCount = baseline.categories.length + 5; // + solar-inverter + online-ups + voltage-stabilizer + solar-battery + solar-package

  console.log(`\n1. Database Counts:`);
  console.log(`   Products: Baseline (${baseline.products.length}) + S1 (${s1Ids.length}) + S2 (${s2Ids.length}) + S3 (${s3Ids.length}) + S4 (${s4Ids.length}) + S5 (${s5Ids.length}) = ${expectedProductCount} | Actual in DB = ${currentProductCount}`);
  console.log(`   Categories: Baseline (${baseline.categories.length}) + S1,S2,S3,S4,S5 (5) = ${expectedCategoryCount} | Actual in DB = ${currentCategoryCount}`);

  if (currentProductCount !== expectedProductCount) {
    throw new Error(`Product count mismatch: expected ${expectedProductCount}, got ${currentProductCount}`);
  }

  // 2. Baseline & Prior Source IDs integrity check
  console.log(`\n2. Verifying Baseline (117) and Prior Sources (S1=20, S2=106, S3=10, S4=16) products exist unchanged...`);
  const baselineIds = baseline.products.map(p => p.id);
  const foundBaseline = await Product.find({ id: { $in: baselineIds } }).countDocuments();
  const foundS1 = await Product.find({ id: { $in: s1Ids } }).countDocuments();
  const foundS2 = await Product.find({ id: { $in: s2Ids } }).countDocuments();
  const foundS3 = await Product.find({ id: { $in: s3Ids } }).countDocuments();
  const foundS4 = await Product.find({ id: { $in: s4Ids } }).countDocuments();
  console.log(`   Found ${foundBaseline} of 117 baseline products in DB.`);
  console.log(`   Found ${foundS1} of 20 Source #1 products in DB.`);
  console.log(`   Found ${foundS2} of 106 Source #2 products in DB.`);
  console.log(`   Found ${foundS3} of 10 Source #3 products in DB.`);
  console.log(`   Found ${foundS4} of 16 Source #4 products in DB.`);

  if (foundBaseline !== 117 || foundS1 !== 20 || foundS2 !== 106 || foundS3 !== 10 || foundS4 !== 16) {
    throw new Error('CRITICAL: Prior products are missing or modified!');
  }

  // 3. Price check over all 6 inserted products
  console.log(`\n3. Verifying Prices on ALL 6 newly inserted products...`);
  const s5Docs = await Product.find({ id: { $in: s5Ids } }).lean();
  let priceMismatches = 0;

  s5Docs.forEach((doc, idx) => {
    const src = s5Data.products.find(p => p.id === doc.id);
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
  console.log(`   All 6 products passed the exact price formula check.`);

  // 4. Verify Category in DB
  const pkgCat = await Category.findOne({ slug: 'solar-package' }).lean();
  console.log(`\n4. Verifying Category in Database:`);
  console.log(`   ID: ${pkgCat.id} | Name: ${pkgCat.name} | Slug: ${pkgCat.slug} | Order: ${pkgCat.order} | Active: ${pkgCat.isActive}`);
  const catProdCount = await Product.countDocuments({ category: 'solar-package' });
  console.log(`   Products linked to 'solar-package': ${catProdCount} (Expected: 6)`);

  if (catProdCount !== 6) {
    throw new Error(`Category product count mismatch: expected 6, got ${catProdCount}`);
  }

  // 5. Select 3 sample products for check
  console.log(`\n5. Checking Sample Products:`);
  s5Docs.slice(0, 3).forEach((p, i) => {
    console.log(`   [Sample ${i + 1}] ${p.id} | ${p.title} | Price: ৳${p.price.toLocaleString('en-US')} | OldPrice: ৳${p.oldPrice.toLocaleString('en-US')} | Stock: ${p.stock} | Specs Groups: ${Object.keys(p.specs || {}).length} | Imgs: ${p.images?.length}`);
  });

  await mongoose.disconnect();
  console.log('\nStep E verification completed successfully!');
}

if (require.main === module) {
  verifyStepESource5().catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
  });
}

module.exports = verifyStepESource5;

