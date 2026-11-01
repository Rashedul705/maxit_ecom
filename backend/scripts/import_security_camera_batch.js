require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cheerio = require('cheerio');

const BASELINE_PATH = path.join(__dirname, '../output/baseline.json');
const OUTPUT_DIR = path.join(__dirname, '../output');
const CACHE_FILE = path.join(OUTPUT_DIR, 'image_cache.json');
const PENDING_FILE = path.join(OUTPUT_DIR, 'pending_images_s11.json');
const S11_OUTPUT_FILE = path.join(OUTPUT_DIR, 'source_11_security_camera.json');
const S11_IDS_FILE = path.join(OUTPUT_DIR, 'source-11-inserted-ids.json');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '4526cd8fc23e7f4b679b8b413e1920a1';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Parse CLI arguments: --startPage X --endPage Y
const args = process.argv.slice(2);
let startPage = 1;
let endPage = 3;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--startPage' && args[i + 1]) startPage = parseInt(args[i + 1], 10);
  if (args[i] === '--endPage' && args[i + 1]) endPage = parseInt(args[i + 1], 10);
}

// Clean Description
function cleanDescription(rawHtml) {
  if (!rawHtml) return { html: '', cleaned: false };

  let wasCleaned = false;
  const $ = cheerio.load(rawHtml, null, false);

  $('p2, p, h1, h2, h3, h4, h5, h6, li, span, a').each((i, el) => {
    const text = $(el).text();
    if (/star\s*tech/i.test(text)) {
      $(el).remove();
      wasCleaned = true;
      return;
    }
  });

  let html = $.html();
  if (/star\s*tech/i.test(html)) {
    wasCleaned = true;
    html = html.replace(/star\s*tech/gi, 'MaxiTShop');
  }

  return { html, cleaned: wasCleaned };
}

function generateSlug(title, existingSlugs) {
  let base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  if (!base) base = 'product';

  let slug = base;
  let counter = 2;
  while (existingSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  existingSlugs.add(slug);
  return slug;
}

async function uploadImageToImgbb(imageUrl, title, cache) {
  if (cache[imageUrl]) {
    return cache[imageUrl];
  }

  // Attempt fast upload if available
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(imageUrl, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const base64 = buffer.toString('base64');

      const formData = new URLSearchParams();
      formData.append('image', base64);
      formData.append('name', title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30));

      const upRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });

      const json = await upRes.json();
      if (json.success && json.data && json.data.url) {
        cache[imageUrl] = json.data.url;
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
        await sleep(150);
        return json.data.url;
      } else {
        throw new Error(json.error?.message || 'Imgbb upload failed');
      }
    } catch (err) {
      if (attempt < 1) await sleep(500);
    }
  }

  return null; // Return null if upload fails or is rate limited
}

async function scrapeDetail(url, itemTitle, existingSlugs, cache, pendingQueue) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Detail fetch failed HTTP ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $('h1.product-name').first().text().trim() || itemTitle;

  let brand = '';
  let productCode = '';
  let statusText = 'In Stock';
  let sourcePrice = 0;
  let sourceRegularPrice = 0;

  $('.product-info-table tr, .product-info-data tr').each((i, el) => {
    const label = $(el).find('td:first-child').text().trim().toLowerCase();
    const valTd = $(el).find('td:last-child');
    const valText = valTd.text().trim();

    if (label.includes('brand')) brand = valText;
    if (label.includes('product code')) productCode = valText;
    if (label.includes('status')) statusText = valText;

    if (label === 'price') {
      const insText = valTd.find('ins').text().replace(/[^\d]/g, '');
      if (insText) {
        sourcePrice = parseInt(insText, 10);
      } else {
        sourcePrice = parseInt(valText.replace(/[^\d]/g, ''), 10) || 0;
      }
    }

    if (label === 'regular price') {
      sourceRegularPrice = parseInt(valText.replace(/[^\d]/g, ''), 10) || 0;
    }
  });

  if (sourcePrice === 0) {
    const pText = $('.product-price, .product-info-price').first().text();
    const match = pText.replace(/,/g, '').match(/(\d+)\s*৳/);
    if (match) sourcePrice = parseInt(match[1], 10);
  }

  // Extract Subcategory from Breadcrumb
  // Breadcrumb structure: Home > Security Camera > Subcategory > [Child Subcategory] > Product
  let subcategoryName = '';
  let subcategorySlug = '';
  const breadcrumbItems = [];
  $('.breadcrumb li').each((i, el) => {
    const bText = $(el).text().trim();
    if (bText && !bText.toLowerCase().includes('home')) {
      breadcrumbItems.push(bText);
    }
  });

  if (breadcrumbItems.length >= 2) {
    // breadcrumbItems[0] is Category (e.g. Security Camera)
    // breadcrumbItems[1] is Subcategory (e.g. IP Camera, CC Camera, DVR, etc.)
    subcategoryName = breadcrumbItems[1];
    subcategorySlug = subcategoryName.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  }

  let price = 0;
  let oldPrice = 0;
  let discountPercentage = 0;

  if (sourcePrice > 0) {
    price = Math.round((sourcePrice * 1.10) / 10) * 10;
  }
  if (sourceRegularPrice > 0) {
    oldPrice = Math.round((sourceRegularPrice * 1.10) / 10) * 10;
  }
  if (oldPrice > price && oldPrice > 0) {
    discountPercentage = Math.round(((oldPrice - price) / oldPrice) * 100);
  } else {
    oldPrice = 0;
  }

  let stock = 0;
  const lowerStatus = statusText.toLowerCase();
  if (lowerStatus.includes('in stock') || lowerStatus.includes('pre order')) {
    stock = 10;
  } else if (lowerStatus.includes('up coming') || lowerStatus.includes('out of stock') || lowerStatus.includes('tba')) {
    stock = 0;
  }
  if (price === 0) {
    stock = 0;
  }

  const keyFeatures = [];
  $('.short-description ul li, .product-features ul li').each((i, el) => {
    const txt = $(el).text().trim();
    if (txt && !txt.toLowerCase().includes('view more') && !keyFeatures.includes(txt)) {
      keyFeatures.push(txt);
    }
  });

  const specs = {};
  let warranty = '';

  $('table.data-table, .specification-inner table').each((i, table) => {
    let currentGroup = 'General Information';
    $(table).find('thead, tbody').each((j, section) => {
      if (section.tagName === 'thead') {
        const heading = $(section).find('.heading-row, th').first().text().trim();
        if (heading) currentGroup = heading;
        if (!specs[currentGroup]) specs[currentGroup] = {};
      } else if (section.tagName === 'tbody') {
        if (!specs[currentGroup]) specs[currentGroup] = {};
        $(section).find('tr').each((k, tr) => {
          const kName = $(tr).find('td.name, td:first-child').text().trim();
          const kVal = $(tr).find('td.value, td:last-child').text().replace(/\s+/g, ' ').trim();
          if (kName && kVal) {
            specs[currentGroup][kName] = kVal;
            if (kName.toLowerCase().includes('warranty') && !warranty) {
              warranty = kVal;
            }
          }
        });
      }
    });
  });

  if (Object.keys(specs).length === 0) {
    const generalGroup = {};
    $('table.data-table tr').each((i, tr) => {
      const kName = $(tr).find('td:first-child').text().trim();
      const kVal = $(tr).find('td:last-child').text().replace(/\s+/g, ' ').trim();
      if (kName && kVal) generalGroup[kName] = kVal;
    });
    if (Object.keys(generalGroup).length > 0) {
      specs['General Information'] = generalGroup;
    }
  }

  const rawImageUrls = [];
  const mainImg = $('.product-image img, .thumbnail img').first().attr('src');
  if (mainImg) rawImageUrls.push(mainImg);

  $('.product-thumbnails img, .thumbnails img, .image-additional img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && !rawImageUrls.includes(src)) {
      rawImageUrls.push(src);
    }
  });

  if (rawImageUrls.length === 0) {
    $('.product-details img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && src.includes('/image/cache/') && !rawImageUrls.includes(src)) {
        rawImageUrls.push(src);
      }
    });
  }

  const uploadedImages = [];
  const unhostedImages = [];
  for (const rawUrl of rawImageUrls) {
    const ibbUrl = await uploadImageToImgbb(rawUrl, title, cache);
    if (ibbUrl) {
      uploadedImages.push(ibbUrl);
    } else {
      unhostedImages.push(rawUrl);
    }
  }

  const rawDescHtml = $('#description .full-description, #description').first().html() || '';
  const { html: description, cleaned } = cleanDescription(rawDescHtml);

  const urlSlug = url.split('/').pop().replace(/\.html$/, '');
  const slug = generateSlug(urlSlug, existingSlugs);
  const prodId = productCode ? `st-${productCode}` : `st-${slug}`;

  let cleanBrand = brand;
  if (!cleanBrand || cleanBrand === 'Others') {
    if (/dahua/i.test(title)) cleanBrand = 'Dahua';
    else if (/hikvision/i.test(title)) cleanBrand = 'Hikvision';
    else if (/cp\s*plus/i.test(title)) cleanBrand = 'CP PLUS';
    else if (/uniview/i.test(title)) cleanBrand = 'Uniview';
    else if (/zkteco/i.test(title)) cleanBrand = 'ZKTeco';
    else if (/jovision/i.test(title)) cleanBrand = 'Jovision';
    else if (/imou/i.test(title)) cleanBrand = 'Imou';
    else if (/tp-link|tapo/i.test(title)) cleanBrand = 'TP-Link';
    else if (/ezviz/i.test(title)) cleanBrand = 'Ezviz';
    else if (/tiandy/i.test(title)) cleanBrand = 'Tiandy';
    else if (/nexakey/i.test(title)) cleanBrand = 'Nexakey';
    else if (/vstarcam/i.test(title)) cleanBrand = 'Vstarcam';
    else if (/realtime/i.test(title)) cleanBrand = 'Realtime';
    else if (/safeway/i.test(title)) cleanBrand = 'SafeWay';
    else if (/chuango/i.test(title)) cleanBrand = 'Chuango';
    else cleanBrand = 'Security General';
  }

  if (unhostedImages.length > 0) {
    pendingQueue.push({ id: prodId, badImgs: unhostedImages });
  }

  return {
    doc: {
      id: prodId,
      title,
      slug,
      price,
      oldPrice,
      discountPercentage,
      category: 'security-camera',
      categoryName: 'SECURITY CAMERA',
      subcategory: subcategorySlug || '',
      subcategoryName: subcategoryName || '',
      brand: cleanBrand,
      productCode: productCode || '',
      stock,
      image: uploadedImages[0] || '',
      images: uploadedImages,
      shortDescription: keyFeatures.join('\n') || title,
      keyFeatures,
      warranty: warranty || '1 Year',
      description,
      specs,
      rating: 0,
      reviewCount: 0,
      reviewsCount: 0,
      isNewItem: true,
      isFeatured: false,
      isDeal: false,
      isHotDeal: false,
      sourceUrl: url,
      audit: {
        sourcePrice,
        sourceRegularPrice,
        calculatedPrice: price,
        calculatedOldPrice: oldPrice,
        priceMultiplier: 1.10,
        status: statusText,
        scrapedAt: new Date().toISOString()
      }
    },
    cleaned,
    uploadedCount: uploadedImages.length,
    unhostedCount: unhostedImages.length
  };
}

async function main() {
  console.log(`=== IMPORT SOURCE #11 (Security Camera) Pages ${startPage} to ${endPage} ===`);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  const Category = require('../models/Category');

  // Verify baseline integrity
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
  const baselineIds = baseline.products.map(p => p.id);
  const foundBaseline = await Product.find({ id: { $in: baselineIds } }).countDocuments();
  if (foundBaseline !== 117) {
    throw new Error(`CRITICAL: Baseline products check failed: expected 117, found ${foundBaseline}`);
  }

  // Slugs & IDs already in DB
  const existingProducts = await Product.find({}, { id: 1, slug: 1 }).lean();
  const existingSlugs = new Set(existingProducts.map(p => p.slug));
  const existingIds = new Set(existingProducts.map(p => p.id));

  // Category 'SECURITY CAMERA'
  await Category.bulkWrite([
    {
      updateOne: {
        filter: { slug: 'security-camera' },
        update: {
          $setOnInsert: {
            id: 'cat-security-camera',
            name: 'SECURITY CAMERA',
            slug: 'security-camera',
            order: 22,
            isActive: true,
            icon: 'Video',
            image: '',
            description: 'Find the best CCTV security solutions, IP cameras, CC cameras, DVR, NVR, access control, and security accessories with official warranty in Bangladesh.'
          }
        },
        upsert: true
      }
    }
  ]);

  const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) : {};
  let pendingQueue = fs.existsSync(PENDING_FILE) ? JSON.parse(fs.readFileSync(PENDING_FILE, 'utf-8')) : [];

  // Crawl listing pages
  const listingItems = [];
  const seenListingUrls = new Set();

  for (let p = startPage; p <= endPage; p++) {
    const pageUrl = p === 1 ? 'https://www.startech.com.bd/Security-Camera' : `https://www.startech.com.bd/Security-Camera?page=${p}`;
    console.log(`Crawling listing page ${p}: ${pageUrl}`);
    const res = await fetch(pageUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) {
      console.warn(`Failed to fetch listing page ${p}: HTTP ${res.status}`);
      continue;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    $('.p-item').each((i, el) => {
      const link = $(el).find('.p-item-name a').attr('href');
      const itemTitle = $(el).find('.p-item-name a').text().trim();
      if (link && !seenListingUrls.has(link)) {
        seenListingUrls.add(link);
        listingItems.push({ link, itemTitle });
      }
    });

    await sleep(200);
  }

  console.log(`Found ${listingItems.length} products to process across pages ${startPage} - ${endPage}.`);

  const batchDocs = [];
  const batchInsertedIds = [];

  for (let i = 0; i < listingItems.length; i++) {
    const item = listingItems[i];
    console.log(`[${i + 1}/${listingItems.length}] Processing: ${item.itemTitle}`);

    try {
      const { doc } = await scrapeDetail(item.link, item.itemTitle, existingSlugs, cache, pendingQueue);

      // Check if product with this id already in DB
      if (existingIds.has(doc.id)) {
        console.log(`  Already exists in DB: ${doc.id}`);
        continue;
      }

      batchDocs.push(doc);
      batchInsertedIds.push(doc.id);
      existingIds.add(doc.id);

      await sleep(150);
    } catch (err) {
      console.error(`  Error processing ${item.link}:`, err.message);
    }
  }

  // Insert into Atlas in chunks of 50
  if (batchDocs.length > 0) {
    const CHUNK_SIZE = 50;
    for (let c = 0; c < batchDocs.length; c += CHUNK_SIZE) {
      const chunk = batchDocs.slice(c, c + CHUNK_SIZE);
      console.log(`Inserting chunk [${c + 1} - ${c + chunk.length}]...`);
      const ops = chunk.map(doc => ({
        insertOne: {
          document: doc
        }
      }));
      await Product.bulkWrite(ops, { ordered: true });
    }

    // Append to S11 inserted IDs
    let allS11Ids = fs.existsSync(S11_IDS_FILE) ? JSON.parse(fs.readFileSync(S11_IDS_FILE, 'utf-8')) : [];
    allS11Ids = [...allS11Ids, ...batchInsertedIds];
    fs.writeFileSync(S11_IDS_FILE, JSON.stringify(allS11Ids, null, 2), 'utf-8');

    // Append to S11 full data file
    let s11AllData = { count: 0, products: [] };
    if (fs.existsSync(S11_OUTPUT_FILE)) {
      s11AllData = JSON.parse(fs.readFileSync(S11_OUTPUT_FILE, 'utf-8'));
    }
    s11AllData.products = [...s11AllData.products, ...batchDocs];
    s11AllData.count = s11AllData.products.length;
    fs.writeFileSync(S11_OUTPUT_FILE, JSON.stringify(s11AllData, null, 2), 'utf-8');

    // Save pending images file
    fs.writeFileSync(PENDING_FILE, JSON.stringify(pendingQueue, null, 2), 'utf-8');
  }

  // Counts after batch
  const totalS11InCat = await Product.countDocuments({ category: 'security-camera' });
  const totalInDb = await Product.countDocuments();
  const totalCategories = await Category.countDocuments();

  console.log(`\n=== BATCH PAGES ${startPage} - ${endPage} COMPLETED ===`);
  console.log(`Batch products inserted: ${batchDocs.length}`);
  console.log(`Total S11 products in category 'security-camera': ${totalS11InCat}`);
  console.log(`Current Total Products in DB: ${totalInDb}`);
  console.log(`Current Total Categories in DB: ${totalCategories}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal batch import error:', err);
  process.exit(1);
});

