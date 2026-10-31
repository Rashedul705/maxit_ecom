const cheerio = require('cheerio');

async function countPages() {
  let page = 1;
  const urls = new Set();

  while (true) {
    const url = page === 1 ? 'https://www.startech.com.bd/ups-battery' : `https://www.startech.com.bd/ups-battery?page=${page}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) {
      console.log(`Page ${page} status: ${res.status}`);
      break;
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    let count = 0;
    $('.p-item').each((i, el) => {
      const href = $(el).find('.p-item-name a').attr('href');
      if (href && !urls.has(href)) {
        urls.add(href);
        count++;
      }
    });
    console.log(`Page ${page}: found ${count} products.`);
    const hasNext = $(`ul.pagination li a[href*="page=${page + 1}"]`).length > 0;
    if (!hasNext || count === 0) break;
    page++;
  }

  console.log(`Total listing pages: ${page}, Total unique products: ${urls.size}`);
}

countPages().catch(console.error);

