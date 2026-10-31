const fs = require('fs');
const cheerio = require('cheerio');
const file = 'backend/output/source_2_online_ups.json';
const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

let cleanedCount = 0;
data.products.forEach(p => {
  if (/star\s*tech/i.test(p.description)) {
    const $ = cheerio.load(p.description, null, false);
    $('p2, p, h1, h2, h3, h4, h5, h6, li, span, a').each((i, el) => {
      const text = $(el).text();
      if (/star\s*tech/i.test(text)) {
        $(el).remove();
      }
    });
    let html = $.html();
    html = html.replace(/<p2[\s\S]*?<\/p2>/gi, '');
    html = html.replace(/[^.!?\n<>]*(?:star\s*tech)[^.!?\n<>]*(?:[.!?]|$)/gi, '');
    p.description = html.trim();
    cleanedCount++;
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
console.log(`Cleaned ${cleanedCount} descriptions in source_2_online_ups.json`);

