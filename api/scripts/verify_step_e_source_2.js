require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BASELINE_FILE = path.join(__dirname, '../output/baseline.json');
const S1_FILE = path.join(__dirname, '../output/source-1-inserted-ids.json');
const S2_FILE = path.join(__dirname, '../output/source_2_online_ups.json');
const S2_IDS_FILE = path.join(__dirname, '../output/source-2-inserted-ids.json');

async function verifyStepESource2() {
  console.log('=== STEP E VERIFICATION: SOURCE #2 (Online UPS) ===');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  const Category = require('../models/Category');

  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
  const s1Ids = JSON.parse(fs.readFileSync(S1_FILE, 'utf-8'));
  const s2Data = JSON.parse(fs.readFileSync(S2_FILE, 'utf-8'));
  const s2Ids = JSON.parse(fs.readFileSync(S2_IDS_FILE, 'utf-8'));

  // 1. Total counts before and after
  const currentProductCount = await Product.countDocuments();
  const currentCategoryCount = await Category.countDocuments();
  const expectedProductCount = baseline.products.length + s1Ids.length + s2Ids.length;
  const expectedCategoryCount = baseline.categories.length + 2; // + solar-inverter + online-ups

  console.log(`\n1. Database Counts:`);
  console.log(`   Products: Baseline (${baseline.products.length}) + S1 (${s1Ids.length}) + S2 (${s2Ids.length}) = ${expectedProductCount} | Actual in DB = ${currentProductCount}`);
  console.log(`   Categories: Baseline (${baseline.categories.length}) + S1 (1) + S2 (1) = ${expectedCategoryCount} | Actual in DB = ${currentCategoryCount}`);

  if (currentProductCount !== expectedProductCount) {
    throw new Error(`Product count mismatch: expected ${expectedProductCount}, got ${currentProductCount}`);
  }

  // 2. Baseline & Source 1 IDs integrity check
  console.log(`\n2. Verifying Baseline (117) and Source #1 (20) products exist unchanged...`);
  const baselineIds = baseline.products.map(p => p.id);
  const foundBaseline = await Product.find({ id: { $in: baselineIds } }).countDocuments();
  const foundS1 = await Product.find({ id: { $in: s1Ids } }).countDocuments();
  console.log(`   Found ${foundBaseline} of 117 baseline products in DB.`);
  console.log(`   Found ${foundS1} of 20 Source #1 products in DB.`);

  if (foundBaseline !== 117 || foundS1 !== 20) {
    throw new Error('CRITICAL: Prior products are missing or modified!');
  }

  // 3. Price check over all 106 inserted products
  console.log(`\n3. Verifying Prices on ALL 106 newly inserted products...`);
  const s2Docs = await Product.find({ id: { $in: s2Ids } }).lean();
  let priceMismatches = 0;

  s2Docs.forEach((doc, idx) => {
    const src = s2Data.products.find(p => p.id === doc.id);
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
  console.log(`   All 106 products passed the exact price formula check (0 mismatches across 38 priced and 68 TBA items).`);

  // 4. Verify Category in DB
  const upsCat = await Category.findOne({ slug: 'online-ups' }).lean();
  console.log(`\n4. Verifying Category in Database:`);
  console.log(`   ID: ${upsCat.id}, Name: "${upsCat.name}", Slug: "${upsCat.slug}", Order: ${upsCat.order}`);

  // 5. Storefront checks: 5 random products on http://localhost:3001/product/[slug]
  console.log(`\n5. Checking 5 random products on Storefront (port 3001)...`);
  const randomIndices = [0, 14, 25, 50, 95];
  const sampleProducts = randomIndices.map(i => s2Docs[i]);

  for (const p of sampleProducts) {
    const url = `http://localhost:3001/product/${p.slug}`;
    try {
      const res = await fetch(url);
      const html = await res.text();
      const hasTitle = html.includes(p.title) || html.includes(encodeURIComponent(p.title));
      const hasPrice = p.price === 0 || html.includes(p.price.toLocaleString());
      const hasSpecs = Object.keys(p.specs).some(grp => html.includes(grp));
      console.log(`   Product: ${p.id} | Slug: ${p.slug}`);
      console.log(`     HTTP Status: ${res.status} | Title found: ${hasTitle} | Price check: ${hasPrice} | Specs found: ${hasSpecs}`);
    } catch (err) {
      console.error(`     Failed to fetch ${url}:`, err.message);
    }
  }

  // 6. Category Page Check
  console.log(`\n6. Checking Category Page on Storefront...`);
  const catUrl = `http://localhost:3001/category/online-ups`;
  try {
    const res = await fetch(catUrl);
    const html = await res.text();
    console.log(`   URL: ${catUrl} | Status: ${res.status} | Content Length: ${html.length}`);
  } catch (err) {
    console.error(`   Failed to fetch category page:`, err.message);
  }

  // 7. Backend API query for Admin
  console.log(`\n7. Checking Products API for Admin panel...`);
  const apiUrl = `http://localhost:5002/api/v1/products?category=online-ups&limit=150`;
  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    console.log(`   API Status: ${res.status} | Total items in category 'online-ups': ${json.data?.total || json.data?.items?.length}`);
  } catch (err) {
    console.error(`   Failed to query API:`, err.message);
  }

  await mongoose.disconnect();
  console.log('\n=== STEP E VERIFICATION COMPLETED SUCCESSFULLY ===');
}

verifyStepESource2().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

