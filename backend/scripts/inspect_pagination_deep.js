const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function main() {
  const res = await fetch('https://bdshop.com/category/Solar-Accessories', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Look for any div or nav with pagination
  console.log('Classes containing page:');
  $('[class*="page"], [class*="pagination"], [id*="page"], [id*="pagination"]').each((_, el) => {
    console.log($(el).prop('tagName'), 'class:', $(el).attr('class'), 'id:', $(el).attr('id'));
  });

  // Let's check page 3, 4, 5 etc.
  for (let p = 1; p <= 6; p++) {
    const r = await fetch(`https://bdshop.com/category/Solar-Accessories?page=${p}`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    const h = await r.text();
    const $$ = cheerio.load(h);
    const prodCount = $$('a[href*="/product/"]').length;
    console.log(`Page ${p} has ${prodCount} product links`);
    if (prodCount === 0) {
      console.log(`End of pages reached at page ${p}`);
      break;
    }
    await new Promise(res => setTimeout(res, 1000));
  }
}

main().catch(console.error);

