require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASELINE_PATH = path.join(__dirname, '../output/baseline.json');
const OUTPUT_DIR = path.join(__dirname, '../output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'source_9_server_networking.json');
const CACHE_FILE = path.join(OUTPUT_DIR, 'image_cache.json');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '4526cd8fc23e7f4b679b8b413e1920a1';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load baseline & existing products to prevent ID or slug collisions
const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
const existingSlugs = new Set(baseline.products.map(p => p.slug));
const existingIds = new Set(baseline.products.map(p => p.id));
const existingSourceUrls = new Set(baseline.products.map(p => p.sourceUrl).filter(Boolean));

// Include Source 1 to 8 products in collision check
[
  'source_1_inverter_p2.json',
  'source_2_online_ups.json',
  'source_3_stabilizer.json',
  'source_4_solar_battery.json',
  'source_5_solar_package.json',
  'source_6_ups.json',
  'source_7_ups_battery.json',
  'source_8_portable_power_station.json'
].forEach(f => {
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
        await sleep(200);
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
  for (const rawUrl of rawImageUrls) {
    const ibbUrl = await uploadImageToImgbb(rawUrl, title);
    uploadedImages.push(ibbUrl);
  }

  const rawDescHtml = $('#description .full-description, #description').first().html() || '';
  const { html: description, cleaned } = cleanDescription(rawDescHtml);

  const urlSlug = item.url.split('/').pop().replace(/\.html$/, '');
  const slug = generateSlug(urlSlug, sessionSlugs);
  const prodId = productCode ? `st-${productCode}` : `st-${slug}`;

  // Clean brand fallback
  let cleanBrand = brand;
  if (!cleanBrand || cleanBrand === 'Others') {
    if (/amd/i.test(title)) cleanBrand = 'AMD';
    else if (/intel/i.test(title)) cleanBrand = 'Intel';
    else if (/dell/i.test(title)) cleanBrand = 'Dell';
    else if (/cisco/i.test(title)) cleanBrand = 'Cisco';
    else if (/hp|hpe/i.test(title)) cleanBrand = 'HP';
    else if (/lenovo/i.test(title)) cleanBrand = 'Lenovo';
    else if (/synology/i.test(title)) cleanBrand = 'Synology';
    else if (/qnap/i.test(title)) cleanBrand = 'QNAP';
    else if (/supermicro/i.test(title)) cleanBrand = 'Supermicro';
    else if (/mikrotik/i.test(title)) cleanBrand = 'MikroTik';
    else if (/tp-link/i.test(title)) cleanBrand = 'TP-Link';
    else if (/ubiquiti|unifi/i.test(title)) cleanBrand = 'Ubiquiti';
    else if (/seagate/i.test(title)) cleanBrand = 'Seagate';
    else if (/western digital|\bwd\b/i.test(title)) cleanBrand = 'Western Digital';
    else if (/toshiba/i.test(title)) cleanBrand = 'Toshiba';
    else if (/kingston/i.test(title)) cleanBrand = 'Kingston';
    else if (/transcend/i.test(title)) cleanBrand = 'Transcend';
    else if (/totolink/i.test(title)) cleanBrand = 'Totolink';
    else if (/d-link/i.test(title)) cleanBrand = 'D-Link';
    else cleanBrand = 'Enterprise';
  }

  return {
    doc: {
      id: prodId,
      title,
      slug,
      price,
      oldPrice,
      discountPercentage,
      category: 'server-networking',
      categoryName: 'SERVER & NETWORKING',
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

async function scrapeSource9() {
  console.log('=== PHASE 2 - SOURCE #9 (Server & Networking) ===');
  console.log('Target URL: https://www.startech.com.bd/server-networking');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allProductUrls = [];
  const seenUrls = new Set();
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const pageUrl = page === 1 ? 'https://www.startech.com.bd/server-networking' : `https://www.startech.com.bd/server-networking?page=${page}`;
    console.log(`Crawling listing page ${page}: ${pageUrl}`);

    const res = await fetch(pageUrl, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!res.ok) {
      console.warn(`Listing page ${page} returned HTTP ${res.status}`);
      break;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const itemsOnPage = [];
    $('.p-item').each((i, el) => {
      const nameEl = $(el).find('.p-item-name a').first();
      const href = nameEl.attr('href');
      const title = nameEl.text().trim();
      if (href && !seenUrls.has(href)) {
        seenUrls.add(href);
        itemsOnPage.push({ url: href, title });
      }
    });

    console.log(`Page ${page}: found ${itemsOnPage.length} new products`);
    if (itemsOnPage.length === 0) {
      hasMorePages = false;
      break;
    }

    allProductUrls.push(...itemsOnPage);

    // Stop if we reach page 17 or no Next button
    const nextBtn = $('.pagination li a').filter((i, el) => $(el).text().trim().toLowerCase() === 'next');
    if (nextBtn.length === 0 || page >= 17) {
      hasMorePages = false;
    } else {
      page++;
      await sleep(250);
    }
  }

  console.log(`Total unique products found: ${allProductUrls.length}`);

  const sessionSlugs = new Set();
  const products = [];
  let cleanedCount = 0;
  let totalImages = 0;

  for (let i = 0; i < allProductUrls.length; i++) {
    const item = allProductUrls[i];
    console.log(`[${i + 1}/${allProductUrls.length}] Scraping: ${item.title}`);

    try {
      const { doc, cleaned, imageCount } = await scrapeProductDetail(item, sessionSlugs);
      products.push(doc);
      if (cleaned) cleanedCount++;
      totalImages += imageCount;
      console.log(`   -> ID: ${doc.id} | Slug: ${doc.slug} | Price: ৳${doc.price.toLocaleString()} | OldPrice: ৳${doc.oldPrice.toLocaleString()} | Stock: ${doc.stock} | Imgs: ${imageCount}`);
    } catch (err) {
      console.error(`   -> ERROR scraping ${item.url}:`, err.message);
    }

    await sleep(200);
  }

  const categoryDoc = {
    id: 'cat-server-networking',
    name: 'SERVER & NETWORKING',
    slug: 'server-networking',
    image: '',
    icon: 'Server',
    description: 'Enterprise servers, server processors, server racks, NAS/SAN storage, and networking hardware with official warranty in Bangladesh.',
    order: 20,
    isActive: true
  };

  const outputData = {
    category: categoryDoc,
    sourceUrl: 'https://www.startech.com.bd/server-networking',
    totalScraped: products.length,
    cleanedDescriptionsCount: cleanedCount,
    totalImagesUploaded: totalImages,
    imageUploadFailures,
    products
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`\n=== DRY RUN COMPLETED ===`);
  console.log(`Output saved to: ${OUTPUT_FILE}`);
  console.log(`Total Products: ${products.length}`);
  console.log(`Descriptions Cleaned: ${cleanedCount}`);
  console.log(`Total Gallery Images: ${totalImages}`);
  console.log(`Image Upload Failures: ${imageUploadFailures}`);
}

scrapeSource9().catch(console.error);

