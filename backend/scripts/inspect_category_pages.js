const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function checkCategory(catUrl) {
  console.log(`\n================================`);
  console.log(`Checking: ${catUrl}`);
  const res = await fetch(catUrl, {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('Title:', $('title').text().trim());

  // Look for breadcrumb
  const breadcrumb = [];
  $('.breadcrumb, .breadcrumbs, [aria-label="breadcrumb"]').find('a, span').each((_, el) => {
    const t = $(el).text().trim();
    if (t) breadcrumb.push(t);
  });
  console.log('Breadcrumbs:', breadcrumb.join(' > '));

  // Look for subcategory links or sidebar filters
  const subcats = new Map();
  $('a[href*="/category/"], a[href*="/subcategory/"], .subcategory a, .subcategories a, .filter a, .sidebar a').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (href && text && text.length < 50) {
      if (!subcats.has(href)) subcats.set(href, text);
    }
  });

  console.log(`Found ${subcats.size} potential subcategory / related links:`);
  for (const [href, text] of subcats.entries()) {
    if (/solar|wind|smart|energy|battery|inverter|spd|dc|cable|mounting|connector|protection|iot/i.test(text) ||
        /solar|wind|smart|energy|battery|inverter|spd|dc|cable|mounting|connector|protection|iot/i.test(href)) {
      console.log(`  - [${text}] => ${href}`);
    }
  }

  // Count products on page
  const productLinks = new Set();
  $('a[href*="/product/"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) productLinks.add(href);
  });
  console.log(`Product links on page: ${productLinks.size}`);
  
  // Check pagination
  const pagination = [];
  $('a[href*="page="], .pagination a').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    pagination.push({ text, href });
  });
  if (pagination.length > 0) {
    console.log(`Pagination found: ${pagination.length} items`);
  }
}

async function run() {
  await checkCategory('https://bdshop.com/category/solar-wind-energy');
  await checkCategory('https://bdshop.com/category/Solar-Accessories');
  await checkCategory('https://bdshop.com/category/smart-home-iot');
}

run().catch(console.error);

