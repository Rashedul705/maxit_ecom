const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function main() {
  const res = await fetch('https://bdshop.com/category/Solar-Accessories', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Look for any links with page or pagination or numbers
  console.log('All links inside main or product list area:');
  const pag = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    if (href.includes('Solar-Accessories') || href.includes('page') || /^\d+$/.test(text) || text === 'Next' || text === '»' || text === '>') {
      pag.push({ text, href });
    }
  });

  console.log('Pagination / category matches:', pag);

  // Also test fetching page 2
  const res2 = await fetch('https://bdshop.com/category/Solar-Accessories?page=2', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html2 = await res2.text();
  const $2 = cheerio.load(html2);
  const p2Links = [];
  $2('a[href*="/product/"]').each((_, el) => {
    const h = $2(el).attr('href');
    if (!p2Links.includes(h)) p2Links.push(h);
  });
  console.log(`Page 2 product count: ${p2Links.length}`);
  if (p2Links.length > 0) {
    console.log('First p2 product:', p2Links[0]);
  }
}

main().catch(console.error);

