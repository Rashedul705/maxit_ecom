const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function main() {
  const res = await fetch('https://bdshop.com/', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Print all distinct hrefs containing /category/
  const categoryLinks = new Map();
  $('a[href*="/category/"]').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (!categoryLinks.has(href)) {
      categoryLinks.set(href, []);
    }
    if (text && !categoryLinks.get(href).includes(text)) {
      categoryLinks.get(href).push(text);
    }
  });

  console.log(`Found ${categoryLinks.size} unique category links on homepage:`);
  for (const [href, texts] of categoryLinks.entries()) {
    console.log(`${href} => ${texts.join(' | ')}`);
  }
}

main().catch(console.error);

