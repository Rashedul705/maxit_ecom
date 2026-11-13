const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function checkOverlap() {
  const existingUrls = new Set();
  ['baseline.json', 'source_1_inverter_p2.json', 'source_2_online_ups.json', 'source_3_stabilizer.json', 'source_4_solar_battery.json', 'source_5_solar_package.json', 'source_6_ups.json', 'source_7_ups_battery.json'].forEach(f => {
    const pth = path.join(__dirname, '../output', f);
    if (fs.existsSync(pth)) {
      const d = JSON.parse(fs.readFileSync(pth, 'utf-8'));
      (d.products || []).forEach(p => {
        if (p.sourceUrl) existingUrls.add(p.sourceUrl);
      });
    }
  });

  console.log('Total existing source URLs tracked:', existingUrls.size);

  let page = 1;
  let overlapping = 0;
  let newUrls = 0;

  while (true) {
    const url = page === 1 ? 'https://www.startech.com.bd/portable-power-station' : `https://www.startech.com.bd/portable-power-station?page=${page}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) break;
    const html = await res.text();
    const $ = cheerio.load(html);
    let count = 0;
    $('.p-item').each((i, el) => {
      const href = $(el).find('.p-item-name a').attr('href');
      if (href) {
        if (existingUrls.has(href)) {
          overlapping++;
          console.log('Overlapping URL:', href);
        } else {
          newUrls++;
        }
        count++;
      }
    });
    const hasNext = $(`ul.pagination li a[href*="page=${page + 1}"]`).length > 0;
    if (!hasNext || count === 0) break;
    page++;
  }

  console.log(`Summary: ${overlapping} overlapping with previous sources, ${newUrls} new unique products.`);
}

checkOverlap().catch(console.error);

