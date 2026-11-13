const mongoose = require('mongoose');
const fs = require('fs');
const { fetchHtml, parseProductPage } = require('./migrate_techshop_products');
require('dotenv').config({ path: 'backend/.env' });

(async () => {
  console.log('🚀 Starting TechShopBD Concurrent Product Migration into MaxiTShop...');

  // 1. Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('🍃 Connected to MongoDB');

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  // 2. Load discovered product URLs
  if (!fs.existsSync('techshop_product_urls.json')) {
    console.error('❌ techshop_product_urls.json not found!');
    process.exit(1);
  }

  const allUrlsMap = JSON.parse(fs.readFileSync('techshop_product_urls.json', 'utf8'));
  const urlEntries = Object.values(allUrlsMap);
  console.log(`📋 Total discovered TechShopBD products: ${urlEntries.length}`);

  // 3. Load migration progress
  let progress = {};
  if (fs.existsSync('techshop_migration_progress.json')) {
    try {
      progress = JSON.parse(fs.readFileSync('techshop_migration_progress.json', 'utf8'));
    } catch (e) {}
  }
  console.log(`⏩ Previously migrated products in progress cache: ${Object.keys(progress).length}`);

  // Filter pending items
  const pendingItems = urlEntries.filter(item => !progress[item.url] || progress[item.url].status !== 'success');
  console.log(`🎯 Products remaining to migrate: ${pendingItems.length}`);

  let successCount = 0;
  let failCount = 0;
  let processedCount = 0;
  const startTime = Date.now();

  const CONCURRENCY = 6;
  let currentIndex = 0;

  async function worker(workerId) {
    while (currentIndex < pendingItems.length) {
      const idx = currentIndex++;
      const item = pendingItems[idx];
      const url = item.url;

      try {
        const html = await fetchHtml(url);
        if (!html) {
          progress[url] = { status: 'failed', reason: '404 or empty response', time: new Date().toISOString() };
          failCount++;
          processedCount++;
          continue;
        }

        const product = parseProductPage(html, url, item.sourceCategory);
        if (!product || !product.title) {
          progress[url] = { status: 'failed', reason: 'Could not parse title', time: new Date().toISOString() };
          failCount++;
          processedCount++;
          continue;
        }

        // Upsert into MongoDB
        await Product.findOneAndUpdate(
          { $or: [{ sku: product.sku }, { sourceUrl: product.sourceUrl }] },
          { $set: product },
          { upsert: true, new: true }
        );

        progress[url] = {
          status: 'success',
          sku: product.sku,
          title: product.title,
          category: product.category,
          subcategory: product.subcategory,
          price: product.price,
          time: new Date().toISOString()
        };
        successCount++;
        processedCount++;

        if (processedCount % 50 === 0 || idx === pendingItems.length - 1) {
          const elapsedMin = ((Date.now() - startTime) / 60000).toFixed(1);
          const rate = (processedCount / ((Date.now() - startTime) / 1000)).toFixed(1);
          console.log(`[Progress: ${processedCount}/${pendingItems.length} (${((processedCount / pendingItems.length) * 100).toFixed(1)}%)] Success: ${successCount} | Failed: ${failCount} | Rate: ${rate} items/s | Elapsed: ${elapsedMin}m | Latest: ${product.title.substring(0, 30)}...`);
          fs.writeFileSync('techshop_migration_progress.json', JSON.stringify(progress, null, 2));
        }

        // Polite delay per worker
        await new Promise(r => setTimeout(r, 250));
      } catch (err) {
        progress[url] = { status: 'failed', reason: err.message, time: new Date().toISOString() };
        failCount++;
        processedCount++;
      }
    }
  }

  // Launch workers
  console.log(`🚀 Launching ${CONCURRENCY} concurrent migration workers...`);
  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push(worker(w));
  }
  await Promise.all(workers);

  // Save final progress
  fs.writeFileSync('techshop_migration_progress.json', JSON.stringify(progress, null, 2));

  console.log('\n=============================================');
  console.log(`🎉 TECHSHOPBD MIGRATION COMPLETE!`);
  console.log(`Total Target Products: ${urlEntries.length}`);
  console.log(`Successfully Imported: ${successCount}`);
  console.log(`Failed/Unavailable: ${failCount}`);
  console.log(`Elapsed Time: ${((Date.now() - startTime) / 60000).toFixed(1)} minutes`);
  console.log('=============================================\n');

  // Dump to seedData
  console.log('🔄 Syncing seedData.js with new catalog...');
  const allProducts = await Product.find({}, { _id: 0, __v: 0 }).lean();
  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
  const allCategories = await Category.find({}, { _id: 0, __v: 0 }).lean();

  const existingSeed = require('./backend/data/seedData.js');
  existingSeed.products = allProducts;
  existingSeed.categories = allCategories;

  const updatedCode = 'module.exports = ' + JSON.stringify(existingSeed, null, 2) + ';\n';
  fs.writeFileSync('backend/data/seedData.js', updatedCode, 'utf8');
  fs.writeFileSync('api/data/seedData.js', updatedCode, 'utf8');
  console.log(`✅ SeedData synced with ${allProducts.length} total products!`);

  await mongoose.disconnect();
})();
