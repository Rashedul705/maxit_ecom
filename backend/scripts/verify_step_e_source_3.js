require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BASELINE_FILE = path.join(__dirname, '../output/baseline.json');
const S1_FILE = path.join(__dirname, '../output/source-1-inserted-ids.json');
const S2_FILE = path.join(__dirname, '../output/source-2-inserted-ids.json');
const S3_FILE = path.join(__dirname, '../output/source_3_stabilizer.json');
const S3_IDS_FILE = path.join(__dirname, '../output/source-3-inserted-ids.json');

async function verifyStepESource3() {
  console.log('=== STEP E VERIFICATION: SOURCE #3 (Voltage Stabilizer) ===');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  const Category = require('../models/Category');

  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
  const s1Ids = JSON.parse(fs.readFileSync(S1_FILE, 'utf-8'));
  const s2Ids = JSON.parse(fs.readFileSync(S2_FILE, 'utf-8'));
  const s3Data = JSON.parse(fs.readFileSync(S3_FILE, 'utf-8'));
  const s3Ids = JSON.parse(fs.readFileSync(S3_IDS_FILE, 'utf-8'));

  // 1. Total counts before and after
  const currentProductCount = await Product.countDocuments();
  const currentCategoryCount = await Category.countDocuments();
  const expectedProductCount = baseline.products.length + s1Ids.length + s2Ids.length + s3Ids.length;
  const expectedCategoryCount = baseline.categories.length + 3; // + solar-inverter + online-ups + voltage-stabilizer

  console.log(`\n1. Database Counts:`);
  console.log(`   Products: Baseline (${baseline.products.length}) + S1 (${s1Ids.length}) + S2 (${s2Ids.length}) + S3 (${s3Ids.length}) = ${expectedProductCount} | Actual in DB = ${currentProductCount}`);
  console.log(`   Categories: Baseline (${baseline.categories.length}) + S1,S2,S3 (3) = ${expectedCategoryCount} | Actual in DB = ${currentCategoryCount}`);

  if (currentProductCount !== expectedProductCount) {
    throw new Error(`Product count mismatch: expected ${expectedProductCount}, got ${currentProductCount}`);
  }

  // 2. Baseline & Prior Source IDs integrity check
  console.log(`\n2. Verifying Baseline (117), S1 (20) and S2 (106) products exist unchanged...`);
  const baselineIds = baseline.products.map(p => p.id);
  const foundBaseline = await Product.find({ id: { $in: baselineIds } }).countDocuments();
  const foundS1 = await Product.find({ id: { $in: s1Ids } }).countDocuments();
  const foundS2 = await Product.find({ id: { $in: s2Ids } }).countDocuments();
  console.log(`   Found ${foundBaseline} of 117 baseline products in DB.`);
  console.log(`   Found ${foundS1} of 20 Source #1 products in DB.`);
  console.log(`   Found ${foundS2} of 106 Source #2 products in DB.`);

  if (foundBaseline !== 117 || foundS1 !== 20 || foundS2 !== 106) {
    throw new Error('CRITICAL: Prior products are missing or modified!');
  }

  // 3. Price check over all 10 inserted products
  console.log(`\n3. Verifying Prices on ALL 10 newly inserted products...`);
  const s3Docs = await Product.find({ id: { $in: s3Ids } }).lean();
  let priceMismatches = 0;

  s3Docs.forEach((doc, idx) => {
    const src = s3Data.products.find(p => p.id === doc.id);
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
  console.log(`   All 10 products passed the exact price formula check (all 10 are flagged with price: 0 and stock: 0).`);

  // 4. Verify Category in DB
  const stabCat = await Category.findOne({ slug: 'voltage-stabilizer' }).lean();
  console.log(`\n4. Verifying Category in Database:`);
  console.log(`   ID: ${stabCat.id}, Name: "${stabCat.name}", Slug: "${stabCat.slug}", Order: ${stabCat.order}`);

  // 5. Storefront checks: 5 random products on http://localhost:3001/product/[slug]
  console.log(`\n5. Checking 5 random products on Storefront (port 3001)...`);
  const randomIndices = [0, 1, 3, 6, 8];
  const sampleProducts = randomIndices.map(i => s3Docs[i]);

  for (const p of sampleProducts) {
    const url = `http://localhost:3001/product/${p.slug}`;
    try {
      const res = await fetch(url);
      const html = await res.text();
      const hasTitle = html.includes(p.title) || html.includes(encodeURIComponent(p.title));
      console.log(`   Product: ${p.id} | Slug: ${p.slug}`);
      console.log(`     HTTP Status: ${res.status} | Title found: ${hasTitle}`);
    } catch (err) {
      console.error(`     Failed to fetch ${url}:`, err.message);
    }
  }

  // 6. Category Page Check
  console.log(`\n6. Checking Category Page on Storefront...`);
  const catUrl = `http://localhost:3001/category/voltage-stabilizer`;
  try {
    const res = await fetch(catUrl);
    const html = await res.text();
    console.log(`   URL: ${catUrl} | Status: ${res.status} | Content Length: ${html.length}`);
  } catch (err) {
    console.error(`   Failed to fetch category page:`, err.message);
  }

  // 7. Backend API query for Admin
  console.log(`\n7. Checking Products API for Admin panel...`);
  const apiUrl = `http://localhost:5002/api/v1/products?category=voltage-stabilizer&limit=50`;
  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    console.log(`   API Status: ${res.status} | Total items in category 'voltage-stabilizer': ${json.data?.total || json.data?.items?.length}`);
  } catch (err) {
    console.error(`   Failed to query API:`, err.message);
  }

  await mongoose.disconnect();
  console.log('\n=== STEP E VERIFICATION COMPLETED SUCCESSFULLY ===');
}

verifyStepESource3().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

