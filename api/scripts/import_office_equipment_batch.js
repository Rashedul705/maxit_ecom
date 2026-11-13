require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const BASELINE_PATH = path.join(__dirname, '../output/baseline.json');
const OUTPUT_DIR = path.join(__dirname, '../output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'source_10_office_equipment.json');
const INSERTED_IDS_FILE = path.join(OUTPUT_DIR, 'source-10-inserted-ids.json');
const CACHE_FILE = path.join(OUTPUT_DIR, 'image_cache.json');
const PENDING_FILE = path.join(OUTPUT_DIR, 'pending_images_s10.json');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
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
    if (/what is the price of.*in bangladesh\??/i.test(text) || /price of.*in bd\??/i.test(text)) {
      $(el).remove();
      wasCleaned = true;
      return;
    }
    let html = $(el).html();
    if (html && /(?:৳|\b(?:taka|tk)\b|\d+,\d{3}\s*(?:taka|tk|৳))/i.test(html)) {
      html = html.replace(/[^.!?\n<>]*(?:৳|\b(?:taka|tk)\b|\d+,\d{3}\s*(?:taka|tk|৳))[^.!?\n<>]*(?:[.!?]|$)/gi, '');
      $(el).html(html);
      wasCleaned = true;
    }
  });

  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('startech.com.bd')) {
      $(el).replaceWith($(el).text());
      wasCleaned = true;
    }
  });

  $('h1, h2, h3, h4, h5, h6, p').each((i, el) => {
    if (!$(el).text().trim() && $(el).children().length === 0) {
      $(el).remove();
    }
  });

  let htmlStr = $.html();
  htmlStr = htmlStr.replace(/<p2[\s\S]*?<\/p2>/gi, '');
  htmlStr = htmlStr.replace(/[^.!?\n<>]*(?:star\s*tech)[^.!?\n<>]*(?:[.!?]|$)/gi, '');

  return { html: htmlStr.trim(), cleaned: wasCleaned };
}

// Generate Slug
function generateSlug(rawSlug, existingSlugs) {
  let slug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!existingSlugs.has(slug)) {
    existingSlugs.add(slug);
    return slug;
  }
  let counter = 2;
  while (existingSlugs.has(`${slug}-${counter}`)) {
    counter++;
  }
  const uniqueSlug = `${slug}-${counter}`;
  existingSlugs.add(uniqueSlug);
  return uniqueSlug;
}

async function uploadImageToImgbb(imageUrl, title, cache) {
  if (cache[imageUrl]) {
    return cache[imageUrl];
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(imageUrl, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) throw new Error(`Download failed HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      const formData = new URLSearchParams();
      formData.append('image', base64);
      formData.append('name', title.substring(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_'));

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
      if (attempt < 2) await sleep(1000);
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
    if (label.includes('regular price')) {
      sourceRegularPrice = parseInt(valText.replace(/[^\d]/g, ''), 10) || 0;
    }
  });

  if (!sourceRegularPrice) {
    const delText = $('.product-price del').first().text().replace(/[^\d]/g, '');
    if (delText) sourceRegularPrice = parseInt(delText, 10) || 0;
  }

  if (!sourcePrice) {
    const pText = $('.product-price .price-new, .product-price').first().text().replace(/[^\d]/g, '');
    sourcePrice = parseInt(pText, 10) || 0;
  }

  let price = 0;
  let oldPrice = 0;
  let discountPercentage = 0;

  if (sourcePrice > 0) {
    price = Math.round((sourcePrice * 1.10) / 10) * 10;
  } else {
    price = 0;
  }

  if (sourceRegularPrice > 0) {
    oldPrice = Math.round((sourceRegularPrice * 1.10) / 10) * 10;
    if (oldPrice > price && price > 0) {
      discountPercentage = Math.round(((oldPrice - price) / oldPrice) * 100);
    }
  }

  let stock = 10;
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
  const mainImgSrc = $('img.main-img').attr('src');
  if (mainImgSrc) {
    rawImageUrls.push(mainImgSrc.replace(/-\d+x\d+\.(webp|jpg|png)$/, '-500x500.$1'));
  }
  $('ul.thumbnails a.thumbnail, .product-thumbnail-slider a, .thumbnail a').each((i, el) => {
    let href = $(el).attr('href');
    if (href && href.includes('/image/cache/')) {
      href = href.replace(/-\d+x\d+\.(webp|jpg|png)$/, '-500x500.$1');
      if (!rawImageUrls.includes(href)) rawImageUrls.push(href);
    }
  });

  if (rawImageUrls.length === 0) {
    $('.product-image-container img').each((i, el) => {
      let src = $(el).attr('src');
      if (src) {
        src = src.replace(/-\d+x\d+\.(webp|jpg|png)$/, '-500x500.$1');
        if (!rawImageUrls.includes(src)) rawImageUrls.push(src);
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
    if (/canon/i.test(title)) cleanBrand = 'Canon';
    else if (/epson/i.test(title)) cleanBrand = 'Epson';
    else if (/hp|hewlett-packard/i.test(title)) cleanBrand = 'HP';
    else if (/brother/i.test(title)) cleanBrand = 'Brother';
    else if (/pantum/i.test(title)) cleanBrand = 'Pantum';
    else if (/ricoh/i.test(title)) cleanBrand = 'Ricoh';
    else if (/toshiba/i.test(title)) cleanBrand = 'Toshiba';
    else if (/viewsonic/i.test(title)) cleanBrand = 'ViewSonic';
    else if (/optoma/i.test(title)) cleanBrand = 'Optoma';
    else if (/benq/i.test(title)) cleanBrand = 'BenQ';
    else if (/panasonic/i.test(title)) cleanBrand = 'Panasonic';
    else if (/zebex/i.test(title)) cleanBrand = 'Zebex';
    else if (/honeywell/i.test(title)) cleanBrand = 'Honeywell';
    else if (/deli/i.test(title)) cleanBrand = 'Deli';
    else cleanBrand = 'Office General';
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
      category: 'office-equipment',
      categoryName: 'OFFICE EQUIPMENT',
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
  console.log(`=== IMPORT SOURCE #10 (Office Equipment) Pages ${startPage} to ${endPage} ===`);

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

  // Category 'OFFICE EQUIPMENT'
  await Category.bulkWrite([
    {
      updateOne: {
        filter: { slug: 'office-equipment' },
        update: {
          $setOnInsert: {
            id: 'cat-office-equipment',
            name: 'OFFICE EQUIPMENT',
            slug: 'office-equipment',
            order: 21,
            isActive: true,
            icon: 'Briefcase',
            image: '',
            description: 'Printers, projectors, scanners, photocopiers, paper shredders, and conference systems with official warranty in Bangladesh.'
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
    const pageUrl = p === 1 ? 'https://www.startech.com.bd/office-equipment' : `https://www.startech.com.bd/office-equipment?page=${p}`;
    console.log(`Crawling listing page ${p}: ${pageUrl}`);
    const res = await fetch(pageUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) {
      console.warn(`Page ${p} returned HTTP ${res.status}`);
      break;
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    $('.p-item').each((i, el) => {
      const nameEl = $(el).find('.p-item-name a').first();
      const href = nameEl.attr('href');
      const title = nameEl.text().trim();
      if (href && !seenListingUrls.has(href)) {
        seenListingUrls.add(href);
        listingItems.push({ url: href, title });
      }
    });
    await sleep(200);
  }

  console.log(`Found ${listingItems.length} products to process across pages ${startPage} - ${endPage}.`);

  const processedDocs = [];
  for (let i = 0; i < listingItems.length; i++) {
    const item = listingItems[i];
    console.log(`[${i + 1}/${listingItems.length}] Processing: ${item.title}`);
    try {
      const { doc } = await scrapeDetail(item.url, item.title, existingSlugs, cache, pendingQueue);
      processedDocs.push(doc);
    } catch (err) {
      console.error(`   Error processing ${item.url}:`, err.message);
    }
    await sleep(150);
  }

  // Insert into DB in chunks of 50
  const insertedIds = [];
  const chunkSize = 50;
  for (let i = 0; i < processedDocs.length; i += chunkSize) {
    const chunk = processedDocs.slice(i, i + chunkSize);
    const ops = chunk.map(p => {
      insertedIds.push(p.id);
      return {
        insertOne: {
          document: p
        }
      };
    });

    console.log(`Inserting chunk [${i + 1} - ${Math.min(i + chunkSize, processedDocs.length)}]...`);
    await Product.bulkWrite(ops, { ordered: true });
  }

  // Append inserted IDs
  let allInsertedIds = fs.existsSync(INSERTED_IDS_FILE) ? JSON.parse(fs.readFileSync(INSERTED_IDS_FILE, 'utf-8')) : [];
  allInsertedIds.push(...insertedIds);
  fs.writeFileSync(INSERTED_IDS_FILE, JSON.stringify(allInsertedIds, null, 2), 'utf-8');

  // Append output data
  let allSavedDocs = fs.existsSync(OUTPUT_FILE) ? JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8')) : { products: [] };
  allSavedDocs.products.push(...processedDocs);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allSavedDocs, null, 2), 'utf-8');

  // Save pending queue
  fs.writeFileSync(PENDING_FILE, JSON.stringify(pendingQueue, null, 2), 'utf-8');

  // Post counts
  const finalProductCount = await Product.countDocuments();
  const finalCategoryCount = await Category.countDocuments();
  const catProductCount = await Product.countDocuments({ category: 'office-equipment' });

  console.log(`\n=== BATCH PAGES ${startPage} - ${endPage} COMPLETED ===`);
  console.log(`Batch products inserted: ${processedDocs.length}`);
  console.log(`Total S10 products in category 'office-equipment': ${catProductCount}`);
  console.log(`Current Total Products in DB: ${finalProductCount}`);
  console.log(`Current Total Categories in DB: ${finalCategoryCount}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Fatal batch execution error:', err);
  process.exit(1);
});

