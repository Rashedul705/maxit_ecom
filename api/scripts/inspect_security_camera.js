const cheerio = require('cheerio');

async function inspect() {
  const url = 'https://www.startech.com.bd/Security-Camera';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } });
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $('h1').text().trim();
  const bottomText = $('.bottom-bar').text().replace(/\s+/g, ' ').trim();
  
  // Last page number in pagination
  let lastPage = 1;
  $('.pagination li a').each((i, el) => {
    const href = $(el).attr('href') || '';
    const m = href.match(/page=(\d+)/);
    if (m) {
      const p = parseInt(m[1], 10);
      if (p > lastPage) lastPage = p;
    }
  });

  const productsOnPage = $('.p-item').length;

  const sampleProducts = [];
  $('.p-item').slice(0, 3).each((i, el) => {
    const name = $(el).find('.p-item-name a').text().trim();
    const link = $(el).find('.p-item-name a').attr('href');
    const price = $(el).find('.p-item-price').text().trim();
    sampleProducts.push({ name, link, price });
  });

  console.log({
    title,
    bottomText,
    lastPage,
    productsOnPage,
    sampleProducts
  });
}
inspect().catch(console.error);

