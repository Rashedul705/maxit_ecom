require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASELINE_PATH = path.join(__dirname, '../output/baseline.json');
const OUTPUT_DIR = path.join(__dirname, '../output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'source_4_solar_battery.json');
const CACHE_FILE = path.join(OUTPUT_DIR, 'image_cache.json');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '4526cd8fc23e7f4b679b8b413e1920a1';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load baseline & existing products to prevent ID or slug collisions
const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
const existingSlugs = new Set(baseline.products.map(p => p.slug));
const existingIds = new Set(baseline.products.map(p => p.id));
const existingSourceUrls = new Set(baseline.products.map(p => p.sourceUrl).filter(Boolean));

// Include Source 1, 2 & 3 products in collision check
['source_1_inverter_p2.json', 'source_2_online_ups.json', 'source_3_stabilizer.json'].forEach(f => {
  const pth = path.join(OUTPUT_DIR, f);
  if (fs.existsSync(pth)) {
    try {
      const d = JSON.parse(fs.readFileSync(pth, 'utf-8'));
      d.products.forEach(p => {
        existingSlugs.add(p.slug);
        existingIds.add(p.id);
        if (p.sourceUrl) existingSourceUrls.add(p.sourceUrl);
      });
    } catch (e) {}
  }
});

// Image Cache
const uploadedImageCache = new Map();
if (fs.existsSync(CACHE_FILE)) {
  try {
    const rawCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    for (const [k, v] of Object.entries(rawCache)) {
      uploadedImageCache.set(k, v);
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
        await sleep(250);
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

async function scrapeProductDetail(item, sessionSlugs) {
  const res = await fetch(item.url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  if (!res.ok) {
    throw new Error(`Detail fetch failed HTTP ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $('h1.product-name').first().text().trim() || item.title;

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

  let stock = 10;
  const lowerStatus = statusText.toLowerCase();
  if (lowerStatus.includes('in stock') || lowerStatus.includes('pre order')) {
    stock = 10;
  } else if (lowerStatus.includes('up coming') || lowerStatus.includes('out of stock') || lowerStatus.includes('tba')) {
    stock = 0;
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
  for (const rawUrl of rawImageUrls) {
    const ibbUrl = await uploadImageToImgbb(rawUrl, title);
    uploadedImages.push(ibbUrl);
  }

  const rawDescHtml = $('#description .full-description, #description').first().html() || '';
  const { html: description, cleaned } = cleanDescription(rawDescHtml);

  const urlSlug = item.url.split('/').pop().replace(/\.html$/, '');
  const slug = generateSlug(urlSlug, sessionSlugs);
  const prodId = productCode ? `st-${productCode}` : `st-${slug}`;

  return {
    doc: {
      id: prodId,
      title,
      slug,
      price,
      oldPrice,
      discountPercentage,
      category: 'solar-battery',
      categoryName: 'SOLAR BATTERY',
      brand: brand || 'Solar Battery',
      productCode: productCode || '',
      stock,
      image: uploadedImages[0] || '',
      images: uploadedImages,
      shortDescription: keyFeatures.join('\n') || title,
      keyFeatures,
      warranty: warranty || '3 Years',
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
    },
    cleaned,
    imageCount: uploadedImages.length
  };
}

async function scrapeSource4() {
  console.log('=== PHASE 2 - SOURCE #4 (Solar Battery) ===');
  console.log('Target URL: https://www.startech.com.bd/solar-battery');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allProductUrls = [];
  const seenUrls = new Set();
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const pageUrl = page === 1 ? 'https://www.startech.com.bd/solar-battery' : `https://www.startech.com.bd/solar-battery?page=${page}`;
    console.log(`Crawling listing page ${page}: ${pageUrl}`);

    const res = await fetch(pageUrl, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!res.ok) {
      console.warn(`Listing page ${page} returned HTTP ${res.status}. Ending pagination.`);
      break;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let pageProductCount = 0;
    $('.p-item').each((i, el) => {
      const a = $(el).find('.p-item-name a');
      const href = a.attr('href');
      const title = a.text().trim();
      if (href && !seenUrls.has(href)) {
        seenUrls.add(href);
        allProductUrls.push({ title, url: href, page });
        pageProductCount++;
      }
    });

    console.log(`  Page ${page} found ${pageProductCount} products.`);

    const hasNext = $(`ul.pagination li a[href*="page=${page + 1}"]`).length > 0;
    if (hasNext && pageProductCount > 0) {
      page++;
      await sleep(1000);
    } else {
      hasMorePages = false;
    }
  }

  console.log(`Total listing pages crawled: ${page}`);
  console.log(`Total unique products found: ${allProductUrls.length}`);

  const scrapedProducts = [];
  const sessionSlugs = new Set();
  let cleanedDescCount = 0;
  let totalImagesUploaded = 0;

  for (let idx = 0; idx < allProductUrls.length; idx++) {
    const item = allProductUrls[idx];
    console.log(`[${idx + 1}/${allProductUrls.length}] Scraping: ${item.title}`);

    if (existingSourceUrls.has(item.url)) {
      console.log(`    Skipping duplicate sourceUrl: ${item.url}`);
      continue;
    }

    await sleep(1200);

    try {
      const result = await scrapeProductDetail(item, sessionSlugs);
      scrapedProducts.push(result.doc);
      if (result.cleaned) cleanedDescCount++;
      totalImagesUploaded += result.imageCount;

      console.log(`    [OK] ${result.doc.id} | Price: ৳${result.doc.price} (Src: ৳${result.doc.audit.sourcePrice}) | Stock: ${result.doc.stock} | Imgs: ${result.imageCount}`);
    } catch (err) {
      console.error(`    FAILED to scrape ${item.url}:`, err.message);
    }
  }

  const categoryPlan = {
    id: 'cat-solar-battery',
    name: 'SOLAR BATTERY',
    slug: 'solar-battery',
    order: 15,
    isActive: true,
    image: scrapedProducts[0]?.image || '',
    icon: 'BatteryCharging',
    description: 'High performance LiFePO4 lithium and deep cycle solar batteries for residential, industrial, and off-grid solar energy systems.'
  };

  const outputPayload = {
    source: 'https://www.startech.com.bd/solar-battery',
    sourceName: 'source_4_solar_battery',
    scrapedAt: new Date().toISOString(),
    totalCrawledPages: page,
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

scrapeSource4().catch(err => {
  console.error('Fatal scrape error:', err);
  process.exit(1);
});

