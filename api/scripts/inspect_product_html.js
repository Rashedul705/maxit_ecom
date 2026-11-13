const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function main() {
  const res = await fetch('https://bdshop.com/product/deye-sun-12k-1p-hybrid', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('--- SPECIFICATIONS TAB HTML ---');
  console.log($('#specifications-tab').html()?.substring(0, 1500));

  console.log('\n--- DESCRIPTION TAB HTML (first 1000 chars) ---');
  console.log($('#description-tab').html()?.substring(0, 1000));

  console.log('\n--- Price selectors ---');
  console.log('Main price container:');
  $('[class*="price"]').each((_, el) => {
    console.log($(el).attr('class'), '=>', $(el).text().trim());
  });

  console.log('\n--- Brand and SKU ---');
  $('*').each((_, el) => {
    const t = $(el).text();
    if (t.includes('SKU:') || t.includes('Brand:')) {
      const directText = $(el).clone().children().remove().end().text().trim();
      if (directText) console.log($(el).prop('tagName'), directText);
    }
  });
}

main().catch(console.error);

