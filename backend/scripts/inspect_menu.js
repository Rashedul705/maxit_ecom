const cheerio = require('cheerio');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function main() {
  const res = await fetch('https://bdshop.com/', {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Look for menu / navigation containers
  console.log('Searching for menu containers...');
  
  // Find all category links in header / nav / aside
  const navItems = [];
  $('nav, .menu, .navigation, .sidebar, .category-menu, .megamenu, header, ul, li').each((_, el) => {
    // Check elements with sub-lists
    const $el = $(el);
    const parentA = $el.children('a').first();
    const subUl = $el.children('ul');
    if (parentA.length && subUl.length) {
      const parentText = parentA.text().trim().replace(/\s+/g, ' ');
      const parentHref = parentA.attr('href');
      const children = [];
      subUl.find('a').each((_, childA) => {
        children.push({
          text: $(childA).text().trim().replace(/\s+/g, ' '),
          href: $(childA).attr('href')
        });
      });
      if (children.length > 0) {
        navItems.push({ parentText, parentHref, children });
      }
    }
  });

  console.log(`Found ${navItems.length} menu items with children.`);
  navItems.forEach(item => {
    if (/solar|wind|smart|energy|battery|inverter/i.test(item.parentText) || item.children.some(c => /solar|wind|smart|energy|battery|inverter|spd|cable|mounting/i.test(c.text))) {
      console.log(`\nPARENT: [${item.parentText}] (${item.parentHref})`);
      item.children.forEach(c => console.log(`   --> [${c.text}] (${c.href})`));
    }
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

