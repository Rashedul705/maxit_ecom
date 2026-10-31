require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASELINE_PATH = path.join(__dirname, '../output/baseline.json');
const OUTPUT_DIR = path.join(__dirname, '../output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'source_1_inverter_p2.json');
const CACHE_FILE = path.join(OUTPUT_DIR, 'image_cache.json');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '4526cd8fc23e7f4b679b8b413e1920a1';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load baseline to prevent any collision
const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
const existingSlugs = new Set(baseline.products.map(p => p.slug));
const existingIds = new Set(baseline.products.map(p => p.id));
const existingSourceUrls = new Set(baseline.products.map(p => p.sourceUrl).filter(Boolean));

// Load existing image cache if exists
const uploadedImageCache = new Map();
if (fs.existsSync(CACHE_FILE)) {
  try {
    const rawCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    for (const [k, v] of Object.entries(rawCache)) {
      uploadedImageCache.set(k, v);
    }
  } catch (e) {}
}

// Also seed cache from existing source_1_inverter_p2.json if available
if (fs.existsSync(OUTPUT_FILE)) {
  try {
    const oldOut = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
    if (oldOut.products) {
      oldOut.products.forEach(p => {
        if (p.sourceUrl && p.image && p.image.includes('i.ibb.co')) {
          uploadedImageCache.set(p.sourceUrl + '_main', p.image);
        }
      });
    }
  } catch (e) {}
}

let imageUploadFailures = 0;

function saveImageCache() {
  const obj = {};
  for (const [k, v] of uploadedImageCache.entries()) {
    obj[k] = v;
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
}

async function uploadImageToImgbb(imageUrl, title) {
  if (uploadedImageCache.has(imageUrl)) {
    return uploadedImageCache.get(imageUrl);
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(imageUrl, {
        headers: { 'User-Agent': USER_AGENT }
      });
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

      if (upRes.status === 429) {
        console.warn(`[imgbb] 429 Rate limited. Backing off ${attempt * 3}s...`);
        await sleep(attempt * 3000);
        continue;
      }

      const json = await upRes.json();
      if (json.success && json.data && json.data.url) {
        uploadedImageCache.set(imageUrl, json.data.url);
        saveImageCache();
        await sleep(300);
        return json.data.url;
      } else {
        throw new Error(json.error?.message || 'Imgbb upload failed');
      }
    } catch (err) {
      console.warn(`[imgbb] Attempt ${attempt} failed for ${imageUrl}:`, err.message);
      if (attempt < 3) await sleep(attempt * 1500);
    }
  }

  imageUploadFailures++;
  console.error(`[imgbb] FAILED to upload image after 3 attempts: ${imageUrl}`);
  return imageUrl;
}

function cleanDescription(rawHtml) {
  if (!rawHtml) return { html: '', cleaned: false };

  let wasCleaned = false;
  const $ = cheerio.load(rawHtml, null, false);

  // 1. Remove only the specific heading or paragraph that mentions "Buy ... from Star Tech" or contains "star tech"
  $('h1, h2, h3, h4, h5, h6, p, li').each((i, el) => {
    const text = $(el).text();
    // If element explicitly talks about buying from Star Tech / Star Tech shop
    if (/star\s*tech/i.test(text)) {
      $(el).remove();
      wasCleaned = true;
      return;
    }
    // "What is the price of ... in Bangladesh?"
    if (/what is the price of.*in bangladesh\??/i.test(text) || /price of.*in bd\??/i.test(text)) {
      $(el).remove();
      wasCleaned = true;
      return;
    }
    // Remove sentences quoting taka amounts if any
    let html = $(el).html();
    if (html && /(?:৳|\b(?:taka|tk)\b|\d+,\d{3}\s*(?:taka|tk|৳))/i.test(html)) {
      html = html.replace(/[^.!?\n<>]*(?:৳|\b(?:taka|tk)\b|\d+,\d{3}\s*(?:taka|tk|৳))[^.!?\n<>]*(?:[.!?]|$)/gi, '');
      $(el).html(html);
      wasCleaned = true;
    }
  });

  // 2. Remove external links to startech
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('startech.com.bd')) {
      $(el).replaceWith($(el).text());
      wasCleaned = true;
    }
  });

  // 3. Remove empty tags
  $('h1, h2, h3, h4, h5, h6, p').each((i, el) => {
    if (!$(el).text().trim() && $(el).children().length === 0) {
      $(el).remove();
    }
  });

  return { html: $.html().trim(), cleaned: wasCleaned };
}

function generateSlug(rawSlug, currentSlugs) {
  let slug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!currentSlugs.has(slug) && !existingSlugs.has(slug)) {
    currentSlugs.add(slug);
    return slug;
  }
  let counter = 2;
  while (currentSlugs.has(`${slug}-${counter}`) || existingSlugs.has(`${slug}-${counter}`)) {
    counter++;
  }
  const uniqueSlug = `${slug}-${counter}`;
  currentSlugs.add(uniqueSlug);
  return uniqueSlug;
}

async function scrapeSource1() {
  console.log('=== PHASE 2 - STEP 2.1: SOURCE #1 (Inverter Page 2) ===');
  console.log('Target URL: https://www.startech.com.bd/inverter?page=2');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Fetch listing page
  const listRes = await fetch('https://www.startech.com.bd/inverter?page=2', {
    headers: { 'User-Agent': USER_AGENT }
  });
  if (!listRes.ok) throw new Error(`Listing fetch failed HTTP ${listRes.status}`);
  const listHtml = await listRes.text();
  const $list = cheerio.load(listHtml);

  const productUrls = [];
  $list('.p-item').each((i, el) => {
    const title = $list(el).find('.p-item-name a').text().trim();
    const href = $list(el).find('.p-item-name a').attr('href');
    if (href) productUrls.push({ title, url: href });
  });

  console.log(`Found ${productUrls.length} products on page 2.`);

  const scrapedProducts = [];
  const sessionSlugs = new Set();
  let cleanedDescCount = 0;
  let totalImagesUploaded = 0;

  for (let idx = 0; idx < productUrls.length; idx++) {
    const item = productUrls[idx];
    console.log(`[${idx + 1}/${productUrls.length}] Scraping: ${item.title}`);

    // Polite delay
    await sleep(1200);

    const res = await fetch(item.url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!res.ok) {
      console.error(`    FAILED to fetch ${item.url} (HTTP ${res.status})`);
      continue;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // 1. Title
    const title = $('h1.product-name').first().text().trim() || item.title;

    // 2. Info Table: Brand, Product Code, Status, Price, Regular Price
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

    // 3. Stock computation
    let stock = 10;
    const lowerStatus = statusText.toLowerCase();
    if (lowerStatus.includes('in stock') || lowerStatus.includes('pre order')) {
      stock = 10;
    } else if (lowerStatus.includes('up coming') || lowerStatus.includes('out of stock')) {
      stock = 0;
    }

    // 4. Price calculation: source × 1.10 rounded to nearest 10 taka
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

    // 5. Key Features
    const keyFeatures = [];
    $('.short-description ul li, .product-features ul li').each((i, el) => {
      const txt = $(el).text().trim();
      if (txt && !txt.toLowerCase().includes('view more') && !keyFeatures.includes(txt)) {
        keyFeatures.push(txt);
      }
    });

    // 6. Grouped Specifications
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

    // 7. Images
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
    for (const rawUrl of rawImageUrls) {
      const ibbUrl = await uploadImageToImgbb(rawUrl, title);
      uploadedImages.push(ibbUrl);
      totalImagesUploaded++;
    }

    // 8. Description
    const rawDescHtml = $('#description .full-description, #description').first().html() || '';
    const { html: description, cleaned } = cleanDescription(rawDescHtml);
    if (cleaned) cleanedDescCount++;

    // 9. ID and Slug
    const urlSlug = item.url.split('/').pop().replace(/\.html$/, '');
    const slug = generateSlug(urlSlug, sessionSlugs);
    const prodId = productCode ? `st-${productCode}` : `st-${slug}`;

    const productDoc = {
      id: prodId,
      title,
      slug,
      price,
      oldPrice,
      discountPercentage,
      category: 'solar-inverter',
      categoryName: 'Solar Inverter',
      brand: brand || 'Solar',
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
      sourceUrl: item.url,
      audit: {
        sourcePrice,
        sourceRegularPrice,
        calculatedPrice: price,
        calculatedOldPrice: oldPrice,
        priceMultiplier: 1.10,
        status: statusText,
        scrapedAt: new Date().toISOString()
      }
    };

    scrapedProducts.push(productDoc);
    console.log(`    [OK] ${productDoc.id} | Price: ৳${price} (Src: ৳${sourcePrice}) | Desc: ${description.length} chars | Imgs: ${uploadedImages.length}`);
  }

  // Category plan
  const categoryPlan = {
    id: 'cat-solar-inverter',
    name: 'Solar Inverter',
    slug: 'solar-inverter',
    order: 12,
    isActive: true,
    image: scrapedProducts[0]?.image || '',
    icon: 'Sun',
    description: 'High efficiency on-grid, off-grid and hybrid solar inverters.'
  };

  const outputPayload = {
    source: 'https://www.startech.com.bd/inverter?page=2',
    sourceName: 'source_1_inverter_p2',
    scrapedAt: new Date().toISOString(),
    totalCrawledPages: 1,
    totalProductsFound: scrapedProducts.length,
    categoriesToCreate: [categoryPlan],
    categoriesExisting: [],
    stats: {
      total: scrapedProducts.length,
      withPrice: scrapedProducts.filter(p => p.price > 0).length,
      withoutPrice: scrapedProducts.filter(p => p.price === 0).length,
      descriptionsCleaned: cleanedDescCount,
      totalImagesUploaded,
      imageUploadFailures
    },
    products: scrapedProducts
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputPayload, null, 2), 'utf-8');
  console.log(`\nSuccessfully saved ${scrapedProducts.length} products to:`);
  console.log(OUTPUT_FILE);
}

scrapeSource1().catch(err => {
  console.error('Fatal scrape error:', err);
  process.exit(1);
});
