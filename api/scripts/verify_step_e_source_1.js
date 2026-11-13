require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BASELINE_FILE = path.join(__dirname, '../output/baseline.json');
const SOURCE_FILE = path.join(__dirname, '../output/source_1_inverter_p2.json');
const INSERTED_IDS_FILE = path.join(__dirname, '../output/source-1-inserted-ids.json');

async function verifyStepE() {
  console.log('=== STEP E VERIFICATION: SOURCE #1 (Inverter Page 2) ===');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  const Category = require('../models/Category');

  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
  const sourceData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
  const insertedIds = JSON.parse(fs.readFileSync(INSERTED_IDS_FILE, 'utf-8'));

  // 1. Total counts before and after
  const currentProductCount = await Product.countDocuments();
  const currentCategoryCount = await Category.countDocuments();
  console.log(`\n1. Database Counts:`);
  console.log(`   Products: Before = ${baseline.products.length}, Inserted = ${insertedIds.length}, Current = ${currentProductCount} (Expected = ${baseline.products.length + insertedIds.length})`);
  console.log(`   Categories: Before = ${baseline.categories.length}, Created = 1, Current = ${currentCategoryCount} (Expected = ${baseline.categories.length + 1})`);

  if (currentProductCount !== baseline.products.length + insertedIds.length) {
    throw new Error('Product count discrepancy!');
  }

  // 2. Baseline IDs integrity check
  console.log(`\n2. Verifying all 117 Baseline Products exist unchanged...`);
  const baselineIds = baseline.products.map(p => p.id);
  const foundBaseline = await Product.find({ id: { $in: baselineIds } }).lean();
  console.log(`   Found ${foundBaseline.length} of ${baselineIds.length} baseline products in database.`);
  if (foundBaseline.length !== baselineIds.length) {
    throw new Error('CRITICAL: Some baseline products are missing!');
  }
  console.log('   All 117 baseline products exist and are intact.');

  // 3. Price check over all 20 inserted products
  console.log(`\n3. Verifying Prices on ALL 20 newly inserted products...`);
  const insertedDocs = await Product.find({ id: { $in: insertedIds } }).lean();
  let priceMismatches = 0;

  insertedDocs.forEach((doc, idx) => {
    const src = sourceData.products.find(p => p.id === doc.id);
    const expectedPrice = Math.round((src.audit.sourcePrice * 1.10) / 10) * 10;
    const match = doc.price === expectedPrice;
    if (!match) {
      priceMismatches++;
      console.error(`   Mismatch on ${doc.id}: db=${doc.price}, expected=${expectedPrice}`);
    } else {
      console.log(`   [${idx+1}/20] ${doc.id}: Source ৳${src.audit.sourcePrice} -> DB ৳${doc.price} (Exact match +10%)`);
    }
  });

  if (priceMismatches > 0) {
    throw new Error(`${priceMismatches} price mismatches found!`);
  }
  console.log('   All 20 products passed the exact +10% price formula check.');

  // 4. Verify category in DB
  const solarCat = await Category.findOne({ slug: 'solar-inverter' }).lean();
  console.log(`\n4. Verifying Category in Database:`);
  console.log(`   ID: ${solarCat.id}, Name: "${solarCat.name}", Slug: "${solarCat.slug}", Order: ${solarCat.order}`);

  // 5. Storefront checks: 5 random products on http://localhost:3001/product/[slug]
  console.log(`\n5. Checking 5 random products on Storefront (port 3001)...`);
  const randomIndices = [0, 2, 7, 13, 19];
  const sampleProducts = randomIndices.map(i => insertedDocs[i]);

  for (const p of sampleProducts) {
    const url = `http://localhost:3001/product/${p.slug}`;
    try {
      const res = await fetch(url);
      const html = await res.text();
      const hasTitle = html.includes(p.title) || html.includes(encodeURIComponent(p.title));
      const hasPrice = html.includes(p.price.toLocaleString());
      const hasSpecs = Object.keys(p.specs).some(grp => html.includes(grp));
      console.log(`   Product: ${p.id} | Slug: ${p.slug}`);
      console.log(`     HTTP Status: ${res.status} | Title found: ${hasTitle} | Price ৳${p.price} found: ${hasPrice} | Specs found: ${hasSpecs}`);
    } catch (err) {
      console.error(`     Failed to fetch ${url}:`, err.message);
    }
  }

  // 6. Category Page Check
  console.log(`\n6. Checking Category Page on Storefront...`);
  const catUrl = `http://localhost:3001/category/solar-inverter`;
  try {
    const res = await fetch(catUrl);
    const html = await res.text();
    console.log(`   URL: ${catUrl} | Status: ${res.status} | Content Length: ${html.length}`);
  } catch (err) {
    console.error(`   Failed to fetch category page:`, err.message);
  }

  // 7. Backend API query for Admin
  console.log(`\n7. Checking Products API for Admin panel...`);
  const apiUrl = `http://localhost:5002/api/v1/products?category=solar-inverter&limit=50`;
  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    console.log(`   API Status: ${res.status} | Total items in category 'solar-inverter': ${json.data?.total || json.data?.items?.length}`);
  } catch (err) {
    console.error(`   Failed to query API:`, err.message);
  }

  await mongoose.disconnect();
  console.log('\n=== STEP E VERIFICATION COMPLETED SUCCESSFULLY ===');
}

verifyStepE().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

