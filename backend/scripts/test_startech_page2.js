const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function testDetail(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $('h1.product-name').first().text().trim() || $('.product-details .product-name').first().text().trim();
  
  // Breadcrumbs
  const breadcrumbs = [];
  $('ul.breadcrumb li a, .breadcrumb li').each((i, el) => {
    breadcrumbs.push($(el).text().trim());
  });

  // Info table rows
  let brand = '';
  let productCode = '';
  let status = '';
  let price = 0;
  let regularPrice = 0;

  // Let's inspect .product-info-table or .product-info-data
  $('.product-info-table tr, .product-info-data tr').each((i, el) => {
    const text = $(el).text();
    const val = $(el).find('td:last-child').text().trim();
    if (text.includes('Brand')) brand = val;
    if (text.includes('Product Code')) productCode = val;
    if (text.includes('Status')) status = val;
    if (text.includes('Price') && !text.includes('Regular')) {
      const num = parseInt(val.replace(/[^\d]/g, ''), 10);
      if (!isNaN(num)) price = num;
    }
    if (text.includes('Regular Price')) {
      const num = parseInt(val.replace(/[^\d]/g, ''), 10);
      if (!isNaN(num)) regularPrice = num;
    }
  });

  // Check fallback price from price container
  if (!price) {
    const pStr = $('.product-price .price-new, .product-price').first().text().replace(/[^\d]/g, '');
    price = parseInt(pStr, 10) || 0;
  }
  if (!regularPrice) {
    const regStr = $('.product-price .price-old, .product-regular-price').first().text().replace(/[^\d]/g, '');
    regularPrice = parseInt(regStr, 10) || 0;
  }

  // Gallery Images - high resolution 500x500
  const images = [];
  $('ul.thumbnails a, .product-thumbnail-slider a, .thumbnail a, .product-image-container a').each((i, el) => {
    let href = $(el).attr('href');
    if (href && href.includes('/image/cache/') && !images.includes(href)) {
      href = href.replace(/-\d+x\d+\.(webp|jpg|png)$/, '-500x500.$1');
      if (!images.includes(href)) images.push(href);
    }
  });

  if (images.length === 0) {
    $('.product-image-container img, .main-img, .thumbnail img').each((i, el) => {
      let src = $(el).attr('src');
      if (src && !images.includes(src)) {
        src = src.replace(/-\d+x\d+\.(webp|jpg|png)$/, '-500x500.$1');
        if (!images.includes(src)) images.push(src);
      }
    });
  }

  // Key Features
  const keyFeatures = [];
  $('.short-description ul li, .product-features ul li').each((i, el) => {
    const text = $(el).text().trim();
    if (text && !keyFeatures.includes(text)) keyFeatures.push(text);
  });

  // Grouped Specs
  const specs = {};
  let warranty = '';
  $('table.data-table, .specification-inner table').each((i, table) => {
    const groupName = $(table).find('thead th').first().text().trim() || 'General Information';
    const groupSpecs = {};
    $(table).find('tbody tr').each((j, tr) => {
      const key = $(tr).find('td:first-child').text().trim();
      const val = $(tr).find('td:last-child').text().trim();
      if (key && val) {
        groupSpecs[key] = val;
        if (key.toLowerCase().includes('warranty')) {
          warranty = val;
        }
      }
    });
    if (Object.keys(groupSpecs).length > 0) {
      specs[groupName] = groupSpecs;
    }
  });

  // Description HTML
  const descEl = $('#description, .full-description, .product-description').first();
  const descHtml = descEl.html() || '';

  console.log('PARSED DETAIL:');
  console.log('Title:', title);
  console.log('Brand:', brand);
  console.log('Product Code:', productCode);
  console.log('Status:', status);
  console.log('Price (Source):', price, '-> +10%:', Math.round((price * 1.10) / 10) * 10);
  console.log('Regular Price (Source):', regularPrice, '-> +10%:', regularPrice ? Math.round((regularPrice * 1.10) / 10) * 10 : 0);
  console.log('Images found:', images);
  console.log('Key Features:', keyFeatures);
  console.log('Warranty:', warranty);
  console.log('Spec Groups:', Object.keys(specs));
  console.log('Breadcrumbs:', breadcrumbs);
}

testDetail('https://www.startech.com.bd/gospower-gpex-6kl1-6kw-hybrid-solar-inverter').catch(console.error);
