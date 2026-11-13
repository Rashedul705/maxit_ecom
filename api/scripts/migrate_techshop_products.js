const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

const mapping = JSON.parse(fs.readFileSync('techshop_category_mapping.json', 'utf8'));

// HTTP Fetch helper with timeout & retries
function fetchHtml(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) redirectUrl = 'https://techshopbd.com' + redirectUrl;
        return resolve(fetchHtml(redirectUrl, retries - 1));
      }
      if (res.statusCode === 404) {
        return resolve(null); // Not found
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('timeout', () => {
      req.destroy();
      if (retries > 0) {
        setTimeout(() => resolve(fetchHtml(url, retries - 1)), 1500);
      } else {
        reject(new Error(`Timeout fetching ${url}`));
      }
    });

    req.on('error', err => {
      if (retries > 0) {
        setTimeout(() => resolve(fetchHtml(url, retries - 1)), 1500);
      } else {
        reject(err);
      }
    });
  });
}

function cleanHtmlText(htmlStr) {
  if (!htmlStr) return '';
  // Load into cheerio to strip promo/boilerplates cleanly
  const $ = cheerio.load(htmlStr, null, false);
  
  // Remove boilerplate promo sections
  $('h2, h3, p, div').each((i, el) => {
    const text = $(el).text().trim();
    if (
      text.includes('Where to Buy in Bangladesh') ||
      text.includes('Why Should You Buy Products') ||
      text.includes('Need Help?') ||
      text.includes('Our engineers are available to assist you') ||
      text.includes('Ordering Information')
    ) {
      $(el).closest('div[style*="background-color"], div.card, div').remove();
    }
  });

  let cleaned = $.html();
  return cleaned
    .replace(/TechShopBD/gi, 'MaxiTShop')
    .replace(/TechShop BD/gi, 'MaxiTShop')
    .replace(/TechShop/gi, 'MaxiTShop')
    .replace(/techshopbd\.com/gi, 'm4xit.com')
    .replace(/\+?880\s?1[3-9]\d{2}[-\s]?\d{6}/g, '01733272445')
    .replace(/09678[-\s]?\d{6}/g, '01733272445')
    .replace(/09\d{9}/g, '01733272445')
    .replace(/01[3-9]\d{8}/g, '01733272445')
    .replace(/info@techshopbd\.com/gi, 'sales@m4xit.com')
    .replace(/support@techshopbd\.com/gi, 'sales@m4xit.com')
    .replace(/<a\b[^>]*href=["'](?!#)[^"']*["'][^>]*>(.*?)<\/a>/gi, '$1') // unwrap links
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // strip iframes
    .trim();
}

function parseProductPage(html, productUrl, sourceCat) {
  if (!html) return null;
  const $ = cheerio.load(html);

  // 1. DataLayer extraction
  let dlItem = {};
  try {
    const dlMatch = html.match(/'ecommerce':\s*\{[\s\S]*?'items':\s*\[\s*(\{[\s\S]*?\})\s*\]/);
    if (dlMatch && dlMatch[1]) {
      // Evaluate safe object properties
      const itemBlock = dlMatch[1];
      const idM = itemBlock.match(/'item_id':\s*'([^']+)'/);
      const nameM = itemBlock.match(/'item_name':\s*'([^']+)'/);
      const priceM = itemBlock.match(/'price':\s*([0-9.]+)/);
      const catM = itemBlock.match(/'item_category':\s*'([^']+)'/);
      const brandM = itemBlock.match(/'item_brand':\s*'([^']+)'/);
      const stockM = itemBlock.match(/'stockstatus':\s*'([^']+)'/);

      dlItem = {
        id: idM ? idM[1] : null,
        name: nameM ? nameM[1] : null,
        price: priceM ? parseFloat(priceM[1]) : 0,
        category: catM ? catM[1] : null,
        brand: brandM ? brandM[1] : null,
        stockStatus: stockM ? stockM[1] : null
      };
    }
  } catch (e) {}

  // 2. Title
  let title = $('h1').first().text().trim();
  if (!title && dlItem.name) title = dlItem.name;
  if (!title) {
    title = $('title').text().replace(/Price in BD.*$/i, '').trim();
  }
  title = title
    .replace(/TechShopBD/gi, '')
    .replace(/TechShop/gi, '')
    .trim();

  if (!title) return null; // invalid product

  // 3. Price
  let price = dlItem.price || 0;
  if (!price) {
    const priceText = $('.product-price, .price, #product_price, [class*="price"]').text();
    const m = priceText.match(/৳\s*([0-9,.]+)/);
    if (m) {
      price = parseFloat(m[1].replace(/,/g, ''));
    }
  }
  price = Math.round(price);

  // 4. SKU
  let sku = dlItem.id;
  if (!sku) {
    const skuText = $('body').text().match(/SKU:\s*([A-Za-z0-9_-]+)/i);
    if (skuText) sku = skuText[1];
  }
  if (!sku) {
    // Generate fallback from slug
    const urlSlug = productUrl.split('/product/')[1] || Math.random().toString(36).substring(7);
    sku = urlSlug.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }
  const formattedSku = `TSBD-${sku.trim()}`;

  // 5. Brand
  let brand = dlItem.brand || 'Generic';
  if (brand.toLowerCase().includes('made in china') || brand.toLowerCase().includes('generic')) {
    // Try to extract real brand from title (e.g. Sanwa, Soundtech, Arduino, Raspberry Pi, Weintek)
    const titleFirstWord = title.split(' ')[0];
    if (titleFirstWord && titleFirstWord.length > 2) {
      brand = titleFirstWord;
    } else {
      brand = 'Generic';
    }
  }

  // 6. Stock
  let stock = 20;
  if (dlItem.stockStatus === 'OutOfStock') {
    stock = 0;
  } else {
    const bodyText = $('body').text();
    if (bodyText.includes('Out of Stock') || bodyText.includes('Stock Out')) {
      stock = 0;
    }
  }

  // 7. Images
  const rawImages = [];
  $('img').each((i, el) => {
    let src = $(el).attr('src') || $(el).attr('data-src');
    if (src && (src.includes('uploads/product') || src.includes('uploads/products') || src.includes('admin.techshopbd.com'))) {
      if (src.startsWith('//')) src = 'https:' + src;
      else if (src.startsWith('/')) src = 'https://techshopbd.com' + src;
      rawImages.push(src);
    }
  });

  const uniqueImages = [...new Set(rawImages)];
  const images = uniqueImages.length > 0 ? uniqueImages : ['https://i.ibb.co/qYGpn6wY/107715-0.webp'];

  // 8. Description & Specs
  let descHtml = $('#description, .description-content, [id*="description"]').html() || '';
  let specsHtml = $('#specification, .specification-content, [id*="specification"]').html() || '';

  let fullDescription = '';
  if (descHtml.trim()) {
    fullDescription += `<div class="product-description">${cleanHtmlText(descHtml)}</div>`;
  }
  if (specsHtml.trim()) {
    fullDescription += `<div class="product-specifications mt-4"><h3>Specifications</h3>${cleanHtmlText(specsHtml)}</div>`;
  }

  if (!fullDescription.trim()) {
    fullDescription = `<p>High quality genuine ${title} engineered for reliability and long service life. 100% authentic product available at MaxiTShop Bangladesh with full technical support and warranty.</p>`;
  }

  // Short description
  let shortDesc = cleanHtmlText($('meta[name="description"]').attr('content') || '');
  if (!shortDesc || shortDesc.length < 20 || shortDesc.includes('No.1 Online Robotics')) {
    shortDesc = `Original ${title} from ${brand}. Features high precision performance, reliable operation, and solid build quality for electronics, robotics, and engineering projects in Bangladesh.`;
  }

  // 9. Category & Subcategory Mapping
  const catRule = mapping[sourceCat] || { defaultCat: 'modules-&-sensor', defaultSub: 'esp32-arduino-modules' };
  let targetCat = catRule.defaultCat || 'modules-&-sensor';
  let targetSub = catRule.defaultSub || 'esp32-arduino-modules';

  // Check breadcrumbs for subcategory
  const breadcrumbs = [];
  $('.breadcrumb li, .breadcrumb a').each((i, el) => {
    breadcrumbs.push($(el).text().trim());
  });
  const breadcrumbStr = (breadcrumbs.join(' ') + ' ' + (dlItem.category || '')).toLowerCase();

  if (catRule.subs) {
    for (const [subKey, subTarget] of Object.entries(catRule.subs)) {
      const cleanKey = subKey.replace(/-/g, ' ');
      if (breadcrumbStr.includes(cleanKey) || productUrl.includes(subKey)) {
        targetCat = subTarget.cat;
        targetSub = subTarget.sub;
        break;
      }
    }
  }

  // 10. Generate Slug
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
  const slug = `${titleSlug}-${formattedSku.toLowerCase()}`;

  return {
    id: `prod-tsbd-${sku}`,
    title,
    slug,
    sku: formattedSku,
    brand,
    price,
    oldPrice: price > 0 ? Math.round(price * 1.1) : 0,
    category: targetCat,
    subcategory: targetSub,
    stock,
    rating: 4.8,
    reviewCount: 6,
    isFeatured: false,
    shortDescription: shortDesc,
    description: fullDescription,
    images,
    sourceUrl: productUrl
  };
}

module.exports = {
  fetchHtml,
  cleanHtmlText,
  parseProductPage
};
