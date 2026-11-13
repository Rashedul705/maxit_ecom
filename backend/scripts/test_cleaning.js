const cheerio = require('cheerio');

function cleanDescriptionHtml(rawHtml, title, brand) {
  if (!rawHtml) return '';
  const $ = cheerio.load(rawHtml, { xmlMode: false });

  // Remove scripts, styles, iframes, inputs, buttons
  $('script, style, iframe, input, button, form, noscript').remove();

  // Remove external links or rewrite anchor tags to plain text
  $('a').each((_, el) => {
    const text = $(el).text();
    $(el).replaceWith(`<span>${text}</span>`);
  });

  // Remove elements or text with bdshop branding or phone numbers
  $('*').each((_, el) => {
    const text = $(el).text();
    if (/bdshop|09613|01788|09678|buy online from/i.test(text)) {
      // Check if it's a paragraph exclusively about bdshop
      if ($(el).is('p, div, span') && $(el).children().length === 0) {
        if (/bdshop\.com|09613-800800|visit bdshop|contact bdshop/i.test(text)) {
          $(el).remove();
        }
      }
    }
  });

  let html = $('body').html() || '';

  // Clean strings
  html = html
    .replace(/BDShop(\.com)?/gi, 'MaxiTShop')
    .replace(/09613[- ]?800800/g, '01733272445')
    .replace(/\+?8801[3-9]\d{8}/g, '01733272445')
    .replace(/buy from bdshop/gi, 'buy from MaxiTShop')
    .replace(/bdshop bangladesh/gi, 'MaxiTShop Bangladesh');

  return html.trim();
}

function generateShortDescription(title, brand, specs, keyFeatures) {
  const parts = [];
  const brandName = brand && brand !== 'General' ? brand : '';
  parts.push(`The ${title} delivers dependable high-performance power and efficiency for modern residential and industrial applications.`);
  
  if (keyFeatures && keyFeatures.length > 0) {
    const feat = keyFeatures[0].replace(/^[0-9.-]+\s*/, '').replace(/^[•\s]+/, '');
    if (feat.length < 150) {
      parts.push(`Key advantage includes ${feat.charAt(0).toLowerCase() + feat.slice(1)}.`);
    }
  }

  if (specs && specs['Warranty']) {
    parts.push(`Backed by official ${specs['Warranty']} warranty and full technical support from MaxiTShop.`);
  } else {
    parts.push(`Available in Bangladesh with 100% genuine quality assurance, verified specifications, and nationwide delivery.`);
  }

  return parts.join(' ');
}

// Test sample
const sampleHtml = `
<div class="product-description">
  <h2>Deye 12KW Single Phase Hybrid Inverter – Power Your Future in Bangladesh</h2>
  <p>Buy original Deye inverter from BDShop.com at best price. Call 09613-800800 for orders.</p>
  <h3>Key Features:</h3>
  <ul>
    <li>12KW Continuous Output</li>
    <li>Dual MPPT Trackers</li>
  </ul>
</div>
`;

console.log('Cleaned HTML:');
console.log(cleanDescriptionHtml(sampleHtml, 'Deye 12KW Single Phase Hybrid Inverter', 'Deye'));
console.log('\nShort Description:');
console.log(generateShortDescription('Deye 12KW Single Phase Hybrid Inverter', 'Deye', { Warranty: '5 Years' }, ['12KW Continuous Output']));

