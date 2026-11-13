const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function main() {
  const res = await fetch('https://bdshop.com/category/Solar-Accessories', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Look for headings, subcategories grid, sidebars, or filters
  console.log('H1:', $('h1').text().trim());
  $('h2, h3, h4').each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length < 50) console.log('Heading:', $(el).prop('tagName'), t);
  });

  // Check pagination
  console.log('Pagination links:');
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('page=') || href.includes('/page/')) {
      console.log('  Page link:', $(el).text().trim(), '=>', href);
    }
  });

  // Check product item structure
  console.log('\nFirst 3 product cards:');
  const products = [];
  $('a[href*="/product/"]').each((_, el) => {
    const href = $(el).attr('href');
    const title = $(el).text().trim().replace(/\s+/g, ' ');
    if (title && title.length > 5 && !products.some(p => p.href === href)) {
      products.push({ title, href });
    }
  });

  products.slice(0, 5).forEach(p => console.log(' -', p.title, '=>', p.href));
}

main().catch(console.error);

