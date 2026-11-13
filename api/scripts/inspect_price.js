const cheerio = require('cheerio');

async function inspect() {
  const res = await fetch('https://www.startech.com.bd/gospower-gpex-6kl1-6kw-hybrid-solar-inverter', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('=== NUMBER OF TABLES ===', $('table.data-table').length);
  $('table.data-table').each((i, tbl) => {
    console.log(`Table ${i} HTML:`);
    console.log($(tbl).html());
  });
}

inspect();
