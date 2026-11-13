const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

async function checkStabilizer() {
  const res = await fetch('https://www.startech.com.bd/stabilizer', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  const items = [];
  $('.p-item').each((i, el) => {
    const a = $(el).find('.p-item-name a');
    items.push({ title: a.text().trim(), href: a.attr('href') });
  });

  const pagination = [];
  $('ul.pagination li a').each((i, el) => {
    const pageNum = parseInt($(el).text().trim(), 10);
    const href = $(el).attr('href');
    if (!isNaN(pageNum) && href) {
      pagination.push({ pageNum, href });
    }
  });

  const breadcrumbs = [];
  $('ul.breadcrumb li').each((i, el) => breadcrumbs.push($(el).text().trim()));

  const summary = $('.bottom-bar .text-right').text().trim() || $('div:contains("Showing")').last().text().trim();

  console.log('Breadcrumbs:', breadcrumbs);
  console.log('Page 1 items count:', items.length);
  console.log('Sample items on page 1:', items.slice(0, 3));
  console.log('Pagination links found:', pagination);
  console.log('Summary:', summary);
}

checkStabilizer().catch(console.error);

