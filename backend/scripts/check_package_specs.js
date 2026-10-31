const cheerio = require('cheerio');

async function checkSpecs(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  const specs = {};
  let warranty = '';

  $('table.data-table, .specification-inner table').each((i, table) => {
    let currentGroup = 'General Information';
    $(table).find('thead, tbody').each((j, section) => {
      if (section.tagName === 'thead') {
        const heading = $(section).find('.heading-row, th').first().text().trim();
        if (heading) currentGroup = heading;
        if (!specs[currentGroup]) specs[currentGroup] = {};
      } else if (section.tagName === 'tbody') {
        if (!specs[currentGroup]) specs[currentGroup] = {};
        $(section).find('tr').each((k, tr) => {
          const kName = $(tr).find('td.name, td:first-child').text().trim();
          const kVal = $(tr).find('td.value, td:last-child').text().replace(/\s+/g, ' ').trim();
          if (kName && kVal) {
            specs[currentGroup][kName] = kVal;
            if (kName.toLowerCase().includes('warranty') && !warranty) {
              warranty = kVal;
            }
          }
        });
      }
    });
  });

  console.log('Specs groups:', Object.keys(specs));
  console.log('Specs content:', JSON.stringify(specs, null, 2));
  console.log('Warranty:', warranty);
}

checkSpecs('https://www.startech.com.bd/2kw-solar-package').catch(console.error);

