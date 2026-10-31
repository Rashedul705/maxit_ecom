const cheerio = require('cheerio');

async function testDetail(url) {
  console.log('Testing detail:', url);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $('h1.product-name').first().text().trim();
  let brand = '', productCode = '', statusText = 'In Stock';
  let sourcePrice = 0, sourceRegularPrice = 0;

  $('.product-info-table tr, .product-info-data tr').each((i, el) => {
    const label = $(el).find('td:first-child').text().trim().toLowerCase();
    const valTd = $(el).find('td:last-child');
    const valText = valTd.text().trim();
    if (label.includes('brand')) brand = valText;
    if (label.includes('product code')) productCode = valText;
    if (label.includes('status')) statusText = valText;
    if (label === 'price') {
      const insText = valTd.find('ins').text().replace(/[^\d]/g, '');
      sourcePrice = parseInt(insText || valText.replace(/[^\d]/g, ''), 10) || 0;
    }
    if (label.includes('regular price')) {
      sourceRegularPrice = parseInt(valText.replace(/[^\d]/g, ''), 10) || 0;
    }
  });

  const images = [];
  $('ul.thumbnails a.thumbnail, .product-thumbnail-slider a, .thumbnail a').each((i, el) => {
    let href = $(el).attr('href');
    if (href && href.includes('/image/cache/')) {
      images.push(href);
    }
  });

  const keyFeatures = [];
  $('.short-description ul li, .product-features ul li').each((i, el) => {
    const txt = $(el).text().trim();
    if (txt && !txt.toLowerCase().includes('view more') && !keyFeatures.includes(txt)) {
      keyFeatures.push(txt);
    }
  });

  console.log('Title:', title);
  console.log('Brand:', brand, '| Code:', productCode, '| Status:', statusText);
  console.log('Price:', sourcePrice, '| Regular Price:', sourceRegularPrice);
  console.log('Images found:', images.length);
  console.log('Key Features:', keyFeatures);
}

testDetail('https://www.startech.com.bd/2kw-solar-package').catch(console.error);

