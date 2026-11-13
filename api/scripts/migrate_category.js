const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Category = require('../models/Category');
const engine = require('./migration_engine');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const CATEGORY_CONFIGS = {
  solar_package: {
    sourceUrl: 'https://bdshop.com/category/solar-package',
    outputFile: 'products_solar_package.json',
    targetCategorySlug: 'solar-package',
    targetCategoryName: 'SOLAR PACKAGE',
    targetCategoryId: 'cat-solar-package'
  },
  solar_inverter: {
    sourceUrl: 'https://bdshop.com/category/solar-inverter',
    outputFile: 'products_solar_inverter.json',
    targetCategorySlug: 'solar-inverter',
    targetCategoryName: 'SOLAR INVERTER',
    targetCategoryId: 'cat-solar-inverter'
  },
  solar_battery: {
    sourceUrl: 'https://bdshop.com/category/solar-battery',
    outputFile: 'products_solar_battery.json',
    targetCategorySlug: 'solar-battery',
    targetCategoryName: 'SOLAR BATTERY',
    targetCategoryId: 'cat-solar-battery'
  },
  solar_accessories: {
    sourceUrl: 'https://bdshop.com/category/Solar-Accessories',
    outputFile: 'products_solar_accessories.json',
    targetCategorySlug: 'solar-energy',
    targetCategoryName: 'SOLAR ENERGY',
    targetCategoryId: 'cat-solar-energy'
  },
  smart_home_iot: {
    sourceUrl: 'https://bdshop.com/category/smart-home-iot',
    outputFile: 'products_smart_home_iot.json',
    targetCategorySlug: 'smart-home-iot',
    targetCategoryName: 'SMART HOME IOT',
    targetCategoryId: 'cat-smart-home-iot'
  },
  wind_energy: {
    sourceUrl: 'https://bdshop.com/category/Wind-Energy',
    outputFile: 'products_wind_energy.json',
    targetCategorySlug: 'wind-energy',
    targetCategoryName: 'WIND ENERGY',
    targetCategoryId: 'cat-wind-energy'
  },
  solar_panels: {
    sourceUrl: 'https://bdshop.com/category/solar-panels',
    outputFile: 'products_solar_panels.json',
    targetCategorySlug: 'solar-energy',
    targetCategoryName: 'SOLAR ENERGY',
    targetCategoryId: 'cat-solar-energy'
  },
  charge_controllers: {
    sourceUrl: 'https://bdshop.com/category/charge-controllers',
    outputFile: 'products_charge_controllers.json',
    targetCategorySlug: 'solar-energy',
    targetCategoryName: 'SOLAR ENERGY',
    targetCategoryId: 'cat-solar-energy'
  },
  solar_station: {
    sourceUrl: 'https://bdshop.com/category/solar-station',
    outputFile: 'products_solar_station.json',
    targetCategorySlug: 'portable-power-station',
    targetCategoryName: 'PORTABLE POWER STATION',
    targetCategoryId: 'cat-portable-power-station'
  }
};

async function crawlCategoryProductUrls(sourceUrl) {
  const productUrls = [];
  let page = 1;

  console.log(`\n[Crawl] Starting URL collection for ${sourceUrl}`);
  while (true) {
    const pageUrl = page === 1 ? sourceUrl : `${sourceUrl}?page=${page}`;
    console.log(`[Crawl] Fetching page ${page}: ${pageUrl}`);
    try {
      const res = await engine.politeFetch(pageUrl);
      if (!res.ok) break;
      const html = await res.text();
      const $ = cheerio.load(html);

      let foundOnPage = 0;
      $('a[href*="/product/"]').each((_, el) => {
        let href = $(el).attr('href');
        if (!href) return;
        const fullUrl = href.startsWith('http') ? href : `https://bdshop.com${href}`;
        if (!productUrls.includes(fullUrl)) {
          productUrls.push(fullUrl);
          foundOnPage++;
        }
      });

      console.log(`[Crawl] Page ${page} yielded ${foundOnPage} new product URLs (Total so far: ${productUrls.length})`);
      if (foundOnPage === 0) break;
      page++;
    } catch (e) {
      console.warn(`[Crawl] Error on page ${page}:`, e.message);
      break;
    }
  }

  console.log(`[Crawl] Finished! Collected ${productUrls.length} total product URLs.`);
  return productUrls;
}

async function collectCategoryProducts(catKey) {
  const config = CATEGORY_CONFIGS[catKey];
  if (!config) throw new Error(`Unknown category key: ${catKey}`);

  const outputFile = path.join(__dirname, '../../', config.outputFile);
  let products = [];

  // Check if already partially or fully collected
  if (fs.existsSync(outputFile)) {
    try {
      products = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
      console.log(`[Collect] Found existing ${products.length} products in ${config.outputFile}`);
    } catch (e) {}
  }

  const collectedUrls = new Set(products.map(p => p.sourceUrl));
  const productUrls = await crawlCategoryProductUrls(config.sourceUrl);

  const missingUrls = productUrls.filter(u => !collectedUrls.has(u));
  console.log(`[Collect] Need to collect ${missingUrls.length} products for ${catKey}`);

  let count = 0;
  for (const url of missingUrls) {
    count++;
    console.log(`[Collect ${count}/${missingUrls.length}] Parsing: ${url}`);
    try {
      const data = await engine.parseProductPage(url);
      products.push(data);
      // Save after each product to ensure safety
      fs.writeFileSync(outputFile, JSON.stringify(products, null, 2), 'utf-8');
    } catch (err) {
      console.error(`[Collect] Failed to parse ${url}:`, err.message);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(products, null, 2), 'utf-8');
  console.log(`[Collect] Done! Saved ${products.length} products to ${config.outputFile}`);
  return products;
}

async function processAndImportCategory(catKey) {
  const config = CATEGORY_CONFIGS[catKey];
  const outputFile = path.join(__dirname, '../../', config.outputFile);

  if (!fs.existsSync(outputFile)) {
    throw new Error(`Output file ${config.outputFile} does not exist. Run collect first.`);
  }

  const products = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
  console.log(`\n[Import] Processing ${products.length} products for category: ${catKey}`);

  engine.loadImageMap();

  let importedCount = 0;
  let updatedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    console.log(`\n--- [${i + 1}/${products.length}] ${item.title} ---`);

    try {
      // 1. Process Images via ImgBB
      const uploadedImages = [];
      const imagesToProcess = (item.rawImages && item.rawImages.length > 0) ? item.rawImages : [];

      for (let imgIdx = 0; imgIdx < imagesToProcess.length; imgIdx++) {
        const rawImgUrl = imagesToProcess[imgIdx];
        const hostedUrl = await engine.uploadToImgbbSlowly(rawImgUrl, `${item.sku}_${imgIdx}`);
        uploadedImages.push(hostedUrl);
      }

      const primaryImage = uploadedImages.length > 0 
        ? uploadedImages[0] 
        : "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80";

      // 2. Clean content
      const cleanedDesc = engine.cleanDescriptionHtml(item.rawDescHtml, item.title, item.brand);
      const shortDesc = engine.generateShortDescription(item.title, item.brand, item.specs, item.keyFeatures);

      // 3. Classify subcategory
      const sub = engine.classifySubcategory(item.title, item.specs, config.targetCategorySlug);

      // 4. Calculate discount percentage if oldPrice exists
      let discountPercentage = 0;
      if (item.oldPrice && item.oldPrice > item.price) {
        discountPercentage = Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100);
      }

      // Generate unique slug with SKU suffix
      const formattedSku = item.sku && String(item.sku).startsWith('BD-') ? String(item.sku) : `BD-${item.sku || Date.now()}`;
      const baseSlug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 65);
      const slug = `${baseSlug}-${item.sku || Math.floor(Math.random() * 1000)}`.toLowerCase();

      // 5. Duplicate Check & Save to MongoDB (Scoped to sourceUrl or BD SKU)
      const filter = {
        $or: [
          { sourceUrl: item.sourceUrl },
          { productCode: formattedSku },
          { slug: slug },
          { title: item.title, category: config.targetCategoryId }
        ]
      };

      const productPayload = {
        title: item.title,
        slug: slug,
        price: Number(item.price || 0),
        oldPrice: Number(item.oldPrice || 0),
        discountPercentage,
        category: config.targetCategoryId,
        categoryName: config.targetCategoryName,
        subcategory: sub.id || '',
        subcategoryName: sub.name || '',
        brand: item.brand || 'General',
        stock: item.stock !== undefined ? Number(item.stock) : 10,
        image: primaryImage,
        images: uploadedImages.length > 0 ? uploadedImages : [primaryImage],
        shortDescription: shortDesc,
        description: cleanedDesc,
        productCode: formattedSku,
        keyFeatures: item.keyFeatures || [],
        warranty: item.warranty || item.specs?.['Warranty'] || '',
        specs: item.specs || {},
        rating: 4.8,
        reviewCount: 14,
        isNewItem: false,
        isFeatured: item.price > 50000,
        isDeal: discountPercentage > 0,
        isHotDeal: discountPercentage >= 15,
        sourceUrl: item.sourceUrl
      };

      const existing = await Product.findOne(filter);

      if (existing) {
        await Product.findByIdAndUpdate(existing._id, productPayload, { returnDocument: 'after' });
        console.log(`[MongoDB] Updated existing product ID: ${existing.id} (${existing.title})`);
        updatedCount++;
      } else {
        productPayload.id = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        try {
          await Product.create(productPayload);
          console.log(`[MongoDB] Created NEW product ID: ${productPayload.id} (${productPayload.title})`);
          importedCount++;
        } catch (createErr) {
          if (createErr.code === 11000) {
            // Duplicate slug edge-case, retry with random suffix
            productPayload.slug = `${slug}-${Date.now().toString().slice(-4)}`;
            await Product.create(productPayload);
            console.log(`[MongoDB] Created NEW product (adjusted slug) ID: ${productPayload.id}`);
            importedCount++;
          } else {
            throw createErr;
          }
        }
      }

      // Verify batch progress every 5 items
      if ((i + 1) % 5 === 0 || i === products.length - 1) {
        console.log(`>>> Progress: ${i + 1}/${products.length} (New: ${importedCount}, Updated: ${updatedCount}, Failed: ${failedCount})`);
      }

    } catch (err) {
      console.error(`[Error] Failed to process product ${item.title}:`, err.message);
      failedCount++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`Finished category: ${catKey}`);
  console.log(`Total: ${products.length} | Created: ${importedCount} | Updated: ${updatedCount} | Failed: ${failedCount}`);
  console.log(`======================================================\n`);

  return {
    category: catKey,
    total: products.length,
    created: importedCount,
    updated: updatedCount,
    failed: failedCount
  };
}

async function runCategory(catKey) {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[MongoDB] Connected successfully');
  }

  // STEP 4: Collect products and save to products_<category>.json
  console.log(`\n>>> STEP 4: Collecting ${catKey}...`);
  await collectCategoryProducts(catKey);

  // STEP 5, 6, 7: Upload images, clean content, and import into website
  console.log(`\n>>> STEP 5, 6, 7: Processing & Importing ${catKey}...`);
  const result = await processAndImportCategory(catKey);

  return result;
}

// Allow CLI execution: node migrate_category.js <catKey>
if (require.main === module) {
  const catKey = process.argv[2] || 'solar_package';
  runCategory(catKey)
    .then(res => {
      console.log('Result:', JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal Migration Error:', err);
      process.exit(1);
    });
}

module.exports = {
  runCategory,
  CATEGORY_CONFIGS
};

