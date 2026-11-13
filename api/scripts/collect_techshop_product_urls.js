const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');

const cats = JSON.parse(fs.readFileSync('techshop_categories_source.json', 'utf8'));

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  console.log('🚀 Starting collection of all product URLs from TechShopBD...');

  // Resume capability
  let productMap = {};
  if (fs.existsSync('techshop_product_urls.json')) {
    try {
      productMap = JSON.parse(fs.readFileSync('techshop_product_urls.json', 'utf8'));
      console.log(`Loaded ${Object.keys(productMap).length} existing product URLs from cache.`);
    } catch (e) {}
  }

  for (let cIdx = 0; cIdx < cats.length; cIdx++) {
    const cat = cats[cIdx];
    console.log(`\n[${cIdx + 1}/${cats.length}] Processing Category: ${cat.name} (${cat.slug})`);

    // Fetch page 1 to find total pages
    let maxPage = 1;
    try {
      const htmlP1 = await fetchHtml(cat.url);
      const $ = cheerio.load(htmlP1);

      $('a[href*="page="]').each((i, el) => {
        const m = $(el).attr('href').match(/page=(\d+)/);
        if (m && parseInt(m[1]) > maxPage) maxPage = parseInt(m[1]);
      });

      console.log(`  -> Found ${maxPage} page(s) for ${cat.name}`);

      for (let p = 1; p <= maxPage; p++) {
        const pageUrl = p === 1 ? cat.url : `${cat.url}?page=${p}`;
        try {
          const pageHtml = p === 1 ? htmlP1 : await fetchHtml(pageUrl);
          const $p = cheerio.load(pageHtml);

          let pageCount = 0;
          $p('a[href*="/product/"]').each((i, el) => {
            let href = $p(el).attr('href').trim();
            if (href.startsWith('/')) href = 'https://techshopbd.com' + href;
            // Clean hash or query
            href = href.split('?')[0].split('#')[0];

            if (!productMap[href]) {
              productMap[href] = {
                url: href,
                sourceCategory: cat.slug,
                sourceCategoryName: cat.name,
                discoveredAt: new Date().toISOString()
              };
              pageCount++;
            }
          });

          process.stdout.write(`    Page ${p}/${maxPage}: +${pageCount} new URLs (Total unique: ${Object.keys(productMap).length})\n`);
          if (p < maxPage) await new Promise(r => setTimeout(r, 400));
        } catch (err) {
          console.error(`    ❌ Error on page ${p}:`, err.message);
        }
      }

      // Save checkpoint after each category
      fs.writeFileSync('techshop_product_urls.json', JSON.stringify(productMap, null, 2));
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`  ❌ Error on category ${cat.name}:`, err.message);
    }
  }

  console.log(`\n🎉 Collection Complete! Total Unique Products Discovered: ${Object.keys(productMap).length}`);
  fs.writeFileSync('techshop_product_urls.json', JSON.stringify(productMap, null, 2));
})();

