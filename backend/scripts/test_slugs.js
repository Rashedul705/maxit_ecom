const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const testSlugs = [
  'solar-energy',
  'solar-wind-energy',
  'Wind-Energy',
  'wind-energy',
  'smart-home-iot',
  'smart-home',
  'solar-package',
  'solar-inverter',
  'solar-battery',
  'Solar-Accessories',
  'solar-accessories',
  'solar-accessories-connectors',
  'solar-accessories-and-connectors',
  'dc-protection-spd',
  'dc-protection',
  'solar-mounting-cables',
  'solar-mounting',
  'solar-cables',
  'charge-controllers',
  'solar-panels',
  'solar-station'
];

async function checkSlug(slug) {
  const url = `https://bdshop.com/category/${slug}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('title').text().trim();
    const h1 = $('h1').text().trim();
    const prodCount = $('a[href*="/product/"]').length;
    console.log(`[${res.status}] /category/${slug} -> Title: "${title}", H1: "${h1}", Products: ${prodCount}`);
  } catch (e) {
    console.log(`ERR /category/${slug} ->`, e.message);
  }
}

async function main() {
  for (const s of testSlugs) {
    await checkSlug(s);
    await new Promise(r => setTimeout(r, 600));
  }
}

main().catch(console.error);

