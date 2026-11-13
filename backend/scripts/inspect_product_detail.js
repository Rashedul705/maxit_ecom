const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function inspectProduct(url) {
  console.log(`\n========================================`);
  console.log(`Inspecting product: ${url}`);
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Title
  const title = $('h1').text().trim();
  console.log('Title:', title);

  // Price & Old Price
  const prices = [];
  $('[class*="price"], .price, .current-price, .old-price, .special-price').each((_, el) => {
    const t = $(el).text().trim().replace(/\s+/g, ' ');
    if (t && t.length < 40 && !prices.includes(t)) prices.push(t);
  });
  console.log('Prices found:', prices);

  // SKU, Brand, Stock
  const meta = [];
  $('[class*="sku"], [class*="brand"], [class*="stock"], .product-info, .product-meta').each((_, el) => {
    const t = $(el).text().trim().replace(/\s+/g, ' ');
    if (t && t.length < 60) meta.push(t);
  });
  console.log('Meta:', meta);

  // Images
  const images = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-zoom-image');
    if (src && (src.includes('/product') || src.includes('/upload') || src.includes('bdshop') || src.includes('.jpg') || src.includes('.png') || src.includes('.webp'))) {
      if (!images.includes(src) && !src.includes('logo') && !src.includes('icon') && !src.includes('banner')) {
        images.push(src);
      }
    }
  });
  console.log('Product images:', images);

  // Gallery / Thumbnails
  const gallery = [];
  $('[data-image], [data-zoom-image], .gallery img, .thumbnail img, .product-images img').each((_, el) => {
    const src = $(el).attr('data-zoom-image') || $(el).attr('data-image') || $(el).attr('src');
    if (src && !gallery.includes(src)) gallery.push(src);
  });
  console.log('Gallery images:', gallery);

  // Description / Specs
  console.log('Description sections found:');
  $('#description, .description, .product-description, #specifications, .specifications, .tab-content, #specs').each((_, el) => {
    console.log(' - Section:', $(el).attr('id') || $(el).attr('class'), 'length:', $(el).text().trim().length);
  });

  // Check specs table
  const specs = {};
  $('table tr').each((_, tr) => {
    const td = $(tr).find('td, th');
    if (td.length >= 2) {
      const k = $(td[0]).text().trim();
      const v = $(td[1]).text().trim();
      if (k && v) specs[k] = v;
    }
  });
  console.log('Specs table keys count:', Object.keys(specs).length);
  if (Object.keys(specs).length > 0) {
    console.log('Sample specs:', Object.entries(specs).slice(0, 5));
  }
}

async function main() {
  await inspectProduct('https://bdshop.com/product/deye-sun-12k-1p-hybrid');
  await inspectProduct('https://bdshop.com/product/lux-25mm-dc-flexible-battery-cable');
}

main().catch(console.error);

