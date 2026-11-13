const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function main() {
  const res = await fetch('https://bdshop.com/category/Solar-Accessories', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('--- Checking Form / Filter / Sidebar ---');
  $('form').each((i, el) => {
    console.log(`Form ${i}: action="${$(el).attr('action')}" method="${$(el).attr('method')}"`);
    $(el).find('input, select').each((_, inp) => {
      console.log(`   input name="${$(inp).attr('name')}" type="${$(inp).attr('type')}" value="${$(inp).attr('value')}"`);
    });
  });

  // Check any sidebar links or filter links
  console.log('--- Sidebar filter links ---');
  $('.filters, .filter, .sidebar, aside').find('a').each((_, el) => {
    console.log($(el).text().trim(), '=>', $(el).attr('href'));
  });
}

main().catch(console.error);

