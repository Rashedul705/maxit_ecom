const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function main() {
  const res = await fetch('https://bdshop.com/product/deye-sun-12k-1p-hybrid', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('--- Image containers in product top section ---');
  // Usually inside something like .product-gallery, .product-images, [data-gallery], or before the title/description
  $('img').each((i, el) => {
    const parentClass = $(el).closest('div, section').attr('class') || '';
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && src.includes('product_')) {
      console.log(`Img ${i}: parent="${parentClass.substring(0, 40)}" src="${src}"`);
    }
  });
}

main().catch(console.error);

