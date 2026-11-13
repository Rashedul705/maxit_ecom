const fs = require('fs');
const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function main() {
  console.log('Fetching bdshop.com homepage...');
  const res = await fetch('https://bdshop.com/', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('Title:', $('title').text().trim());

  // Check nav / menu
  const matched = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (!href) return;
    
    // Check if relevant
    const isRel = /solar|wind|smart home|iot|inverter|battery|protection|spd|mounting|cable/i.test(text) ||
                  /solar|wind|smart-home|iot|inverter|battery|spd/i.test(href);
    if (isRel) {
      matched.push({ text, href });
    }
  });

  // Deduplicate by href
  const unique = [];
  const seen = new Set();
  for (const m of matched) {
    if (!seen.has(m.href)) {
      seen.add(m.href);
      unique.push(m);
    }
  }

  console.log(`Found ${unique.length} unique matching links.`);
  unique.forEach(u => console.log(`[${u.text}] => ${u.href}`));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

