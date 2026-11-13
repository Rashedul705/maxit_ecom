const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const categories = [
  { name: 'Solar Package', url: 'https://bdshop.com/category/solar-package' },
  { name: 'Solar Inverters', url: 'https://bdshop.com/category/solar-inverter' },
  { name: 'Solar Batteries', url: 'https://bdshop.com/category/solar-battery' },
  { name: 'Solar Accessories', url: 'https://bdshop.com/category/Solar-Accessories' },
  { name: 'Solar Panels', url: 'https://bdshop.com/category/solar-panels' },
  { name: 'Solar Charge Controllers', url: 'https://bdshop.com/category/charge-controllers' },
  { name: 'Solar Power Station', url: 'https://bdshop.com/category/solar-station' },
  { name: 'Wind Energy', url: 'https://bdshop.com/category/Wind-Energy' },
  { name: 'Smart Home iOT', url: 'https://bdshop.com/category/smart-home-iot' },
  { name: 'Smart WiFi Switches', url: 'https://bdshop.com/category/smart-wifi-switches' },
  { name: 'Voice Control Devices', url: 'https://bdshop.com/category/voice-control-devices' },
  { name: 'Remote & Sensor Monitor', url: 'https://bdshop.com/category/remote-sensor-monitor' }
];

async function countCategory(cat) {
  let page = 1;
  const productSet = new Set();
  while (true) {
    try {
      const res = await fetch(`${cat.url}?page=${page}`, {
        headers: { 'User-Agent': USER_AGENT }
      });
      if (!res.ok) break;
      const html = await res.text();
      const $ = cheerio.load(html);
      let pageProds = 0;
      $('a[href*="/product/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !productSet.has(href)) {
          productSet.add(href);
          pageProds++;
        }
      });
      if (pageProds === 0) break;
      page++;
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.warn(`Error on ${cat.name} p${page}:`, e.message);
      break;
    }
  }
  console.log(`[${cat.name}] ${cat.url} -> Total Products: ${productSet.size} across ${page - 1} pages.`);
  return { ...cat, totalProducts: productSet.size, totalPages: page - 1 };
}

async function main() {
  console.log('Counting products across all categories...');
  const results = [];
  for (const c of categories) {
    results.push(await countCategory(c));
  }
}

main().catch(console.error);

