const cheerio = require('cheerio');

async function test() {
  const res = await fetch('https://www.startech.com.bd/Star-600VA-Meter-Display-Stabilizer', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log('Tables on page:', $('table').length);
  $('table').each((i, tbl) => console.log('Table class:', $(tbl).attr('class')));
  console.log('Short description:', $('.short-description').text().replace(/\s+/g, ' ').trim());
  console.log('Specification section:', $('#specification').html());
}
test();

