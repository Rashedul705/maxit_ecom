const cheerio = require('cheerio');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function main() {
  const res = await fetch('https://bdshop.com/product/deye-sun-12k-1p-hybrid', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Look for gallery container
  const galleryImages = [];
  $('div[class*="overflow-x-"] img, div[class*="relative"] img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (!src || !src.includes('product_')) return;
    const isRelated = $(el).closest('.product-card, [class*="grid-cols-"], [class*="relative overflow-hidden"]').length > 0 &&
                      $(el).closest('[class*="overflow-x-"]').length === 0 &&
                      $(el).closest('[class*="w-full h-full relative"]').length === 0;
    if (!isRelated) {
      const cleanUrl = src.startsWith('http') ? src.split('?')[0] : 'https://bdshop.com' + src.split('?')[0];
      if (!galleryImages.includes(cleanUrl)) galleryImages.push(cleanUrl);
    }
  });

  console.log('Extracted Gallery Images for Deye:', galleryImages);
}

main().catch(console.error);

