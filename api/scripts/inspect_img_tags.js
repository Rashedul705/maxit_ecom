const cheerio = require('cheerio');

async function checkImg(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log('All img tags:');
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    const cl = $(el).attr('class') || '';
    if (src && !src.includes('logo') && !src.includes('svg')) {
      console.log(' - class:', cl, '| src:', src);
    }
  });
}

checkImg('https://www.startech.com.bd/2kw-solar-package').catch(console.error);

