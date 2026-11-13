const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function parseProduct(sourceUrl) {
  const res = await fetch(sourceUrl, {
    headers: { 'User-Agent': USER_AGENT }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Title
  const title = $('h1').first().text().trim().replace(/\s+/g, ' ');

  // Brand, SKU, Weight, Category from Specifications tab
  let sku = '';
  let brand = 'General';
  let categoryName = '';
  let warranty = '';
  const specs = {};

  $('#specifications-tab dl div, .specifications dl div, dl div').each((_, div) => {
    const dt = $(div).find('dt').text().trim().replace(/:$/, '');
    const dd = $(div).find('dd').text().trim();
    if (!dt || !dd) return;
    if (/product id|sku|model/i.test(dt) && !sku) sku = dd;
    if (/brand/i.test(dt)) brand = dd;
    if (/category/i.test(dt)) categoryName = dd;
    if (/warranty/i.test(dt)) warranty = dd;
    specs[dt] = dd;
  });

  // Price & Old Price
  let price = 0;
  let oldPrice = 0;
  let inStock = true;
  let stock = 10;

  const priceBlock = $('.product-price-block, [class*="product-price"], [class*="price-block"]').first();
  const priceText = priceBlock.text() || $('body').text();

  // Match ৳ price or BDT price
  const priceMatches = priceBlock.text().match(/৳\s*([0-9,]+)/g);
  if (priceMatches && priceMatches.length > 0) {
    const nums = priceMatches.map(m => parseInt(m.replace(/[^0-9]/g, ''), 10));
    price = nums[0];
    if (nums.length > 1) {
      // If there's an old crossed-out price
      if (nums[1] > nums[0]) {
        oldPrice = nums[1];
      } else {
        oldPrice = nums[0];
        price = nums[1];
      }
    }
  }

  // Stock check
  const stockMatch = priceBlock.text().match(/In stock\s*\((\d+)\s*available\)/i) || $('body').text().match(/In stock\s*\((\d+)\s*available\)/i);
  if (stockMatch) {
    stock = parseInt(stockMatch[1], 10);
    inStock = stock > 0;
  } else if (/out of stock/i.test(priceBlock.text())) {
    inStock = false;
    stock = 0;
  }

  // Fallback SKU if not in DL
  if (!sku) {
    const slug = sourceUrl.split('/').pop().replace(/\.html$/, '');
    sku = 'BD-' + slug.substring(0, 15).toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  // Images: find all product images in gallery
  const images = [];
  // Look for gallery thumbnails or main images
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-zoom-image');
    if (!src) return;
    if (src.includes('/assets/images/products/') || src.includes('/products/')) {
      // Clean query params to get full high-res image
      const cleanUrl = src.startsWith('http') ? src.split('?')[0] : 'https://bdshop.com' + src.split('?')[0];
      if (!images.includes(cleanUrl)) {
        images.push(cleanUrl);
      }
    }
  });

  // Description HTML
  let descriptionHtml = $('#description-tab .product-description, #description-tab, .product-description').first().html() || '';

  // Extract key features if list exists
  const keyFeatures = [];
  $('#description-tab ul li, .product-description ul li').each((_, li) => {
    const text = $(li).text().trim();
    if (text && text.length > 8 && text.length < 200 && !keyFeatures.includes(text)) {
      keyFeatures.push(text);
    }
  });

  return {
    title,
    sku,
    brand,
    categoryName,
    price,
    oldPrice,
    stock,
    inStock,
    warranty,
    specs,
    keyFeatures: keyFeatures.slice(0, 10),
    images,
    descriptionLength: descriptionHtml.length,
    sourceUrl
  };
}

async function test() {
  const urls = [
    'https://bdshop.com/product/deye-sun-12k-1p-hybrid',
    'https://bdshop.com/product/lux-25mm-dc-flexible-battery-cable',
    'https://bdshop.com/product/gearup-core-300'
  ];
  for (const u of urls) {
    console.log(`\nParsing: ${u}`);
    const res = await parseProduct(u);
    console.log(JSON.stringify(res, null, 2));
  }
}

test().catch(console.error);

