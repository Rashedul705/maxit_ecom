const cheerio = require('cheerio');

const sampleHtml = `
<div class="full-description" itemprop="description"><h2>Gospower 6kW Hybrid Solar Inverter</h2>
<p>The <strong>Gospower 6kW</strong> Hybrid Solar Inverter is a high‑capacity renewable energy solution engineered for households and businesses that require reliable backup and efficient solar integration. Supporting 48V DC SLA and LiFePO4 batteries, this Gospower Hybrid Solar Inverter delivers a rated AC output of 6000W / 6000VA with surge capacity up to 9000VA for 1 second, ensuring stable performance even during heavy loads. With IP65 protection grade, DC switch, and multiple safety features including PV reverse connection protection, battery reverse connection protection, output short‑circuit protection, and anti‑island protection, the Gospower Off Grid Solar Inverter guarantees safe and durable operation in diverse environments.</p>
<p>Built for efficiency, the GosPower PV Inverter achieves up to 94% peak battery charging/discharging efficiency, helping maximize energy utilization while extending battery life. It supports a maximum charge/discharge current of 100A and delivers clean power with THDv under 3% and switching time below 10ms. The inverter provides a rated output current of 26.1A at 230V (L,N,PE) with frequency support for both 50Hz and 60Hz systems. Equipped with Wi‑Fi, RS485, CAN, and GPRS connectivity, along with app control and LCD display, the Gospower Inverter offers real‑time monitoring, smart management, and remote access for complete control over your energy system.</p>
<p>On the solar input side, the Gospower 6kW Hybrid Solar Inverter supports up to 8000W PV input power with a maximum voltage of 580V and an MPPT operating range of 120–550V. With dual MPPTs, each supporting up to 13A input current and 20A short‑circuit current, it ensures efficient solar harvesting across multiple panel configurations. This advanced design allows flexible installation while optimizing energy output, making it ideal for large residential and commercial setups.</p>
<p>Designed to withstand extreme conditions, the Gospower 6kW Hybrid Solar Inverter operates reliably within a wide temperature range of –25°C to 60°C. Combining robust build quality, advanced safety protections, and high efficiency, this inverter is the perfect solution for households and businesses looking to reduce electricity costs, ensure backup power, and maximize solar output. Whether you need a Gospower Off Grid Solar Inverter or a smart GosPower PV Inverter, this model delivers innovation, safety, and long‑term reliability for sustainable energy systems.</p>
<h2>Buy Gospower 6kW Hybrid Solar Inverter from Star Tech</h2>
<p>In Bangladesh, you can get original <strong>Gospower 6kW Hybrid Solar Inverter</strong> From Star Tech. We have a large collection of latest Gospower&nbsp;<a href="https://www.startech.com.bd/inverter">Inverter</a> to purchase. Order Online Or Visit your Nearest <a href="https://www.startech.com.bd">Star Tech Shop</a> to get yours at lowest price. The Gospower 6kW Hybrid Solar Inverter comes with 3 years warranty.</p></div>
`;

function cleanDescriptionCorrectly(rawHtml) {
  let wasCleaned = false;
  const $ = cheerio.load(rawHtml, null, false);

  // 1. Remove only the specific heading or paragraph that mentions "Buy ... from Star Tech" or contains "star tech"
  $('h1, h2, h3, h4, h5, h6, p, li').each((i, el) => {
    const text = $(el).text();
    // If element explicitly talks about buying from Star Tech / Star Tech shop
    if (/star\s*tech/i.test(text)) {
      $(el).remove();
      wasCleaned = true;
      return;
    }
    // "What is the price of ... in Bangladesh?"
    if (/what is the price of.*in bangladesh\??/i.test(text) || /price of.*in bd\??/i.test(text)) {
      $(el).remove();
      wasCleaned = true;
      return;
    }
    // Remove sentences quoting taka amounts if any
    let html = $(el).html();
    if (html && /(?:৳|\b(?:taka|tk)\b|\d+,\d{3}\s*(?:taka|tk|৳))/i.test(html)) {
      html = html.replace(/[^.!?\n<>]*(?:৳|\b(?:taka|tk)\b|\d+,\d{3}\s*(?:taka|tk|৳))[^.!?\n<>]*(?:[.!?]|$)/gi, '');
      $(el).html(html);
      wasCleaned = true;
    }
  });

  // 2. Remove external links to startech
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('startech.com.bd')) {
      $(el).replaceWith($(el).text());
      wasCleaned = true;
    }
  });

  // 3. Remove empty tags
  $('h1, h2, h3, h4, h5, h6, p').each((i, el) => {
    if (!$(el).text().trim() && $(el).children().length === 0) {
      $(el).remove();
    }
  });

  // Return the inner HTML or clean html
  return { html: $.html().trim(), wasCleaned };
}

const res = cleanDescriptionCorrectly(sampleHtml);
console.log('Result HTML length:', res.html.length);
console.log('Result HTML:');
console.log(res.html);

