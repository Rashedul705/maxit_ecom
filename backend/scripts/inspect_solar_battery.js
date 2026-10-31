const cheerio = require('cheerio');

async function inspect() {
  const url = 'https://www.startech.com.bd/solar-battery';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
  });
  console.log('HTTP Status:', res.status);
  const html = await res.text();
  const $ = cheerio.load(html);
  const items = [];
  $('.p-item').each((i, el) => {
    const a = $(el).find('.p-item-name a');
    const price = $(el).find('.p-item-price').text().trim();
    items.push({ title: a.text().trim(), url: a.attr('href'), price });
  });
  console.log('Total items on page 1:', items.length);
  const pag = $('ul.pagination li a').map((i, el) => $(el).text().trim() + ' -> ' + $(el).attr('href')).get();
  console.log('Pagination links:', pag);
  console.log('All items:');
  items.forEach((it, idx) => console.log(` ${idx + 1}.`, it.title, '|', it.price, '|', it.url));
}

inspect().catch(console.error);

