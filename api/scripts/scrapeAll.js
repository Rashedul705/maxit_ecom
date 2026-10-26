const https = require('https');
const fs = require('fs');
const path = require('path');

const categories = [
  {
    id: "cat-battery-bms-charger",
    name: "BATTERY-BMS-CHARGER",
    slug: "battery-bms-charger",
    image: "https://www.nanopowerbd.com/public/uploads/category/1776919212-lithium-ion-battery.webp",
    icon: "https://www.nanopowerbd.com/public/uploads/category/1776919212-lithium-ion-battery.webp",
    description: "LiFePO4, Lithium Ion Batteries, Active Balancers, Smart BMS & Chargers",
    order: 1,
    isActive: true
  },
  {
    id: "cat-customized-circuit-pcb",
    name: "CUSTOMIZED CIRCUIT - PCB",
    slug: "customized-circuit---pcb",
    image: "https://www.nanopowerbd.com/public/uploads/category/1776919114-servo-avr-control-card.webp",
    icon: "https://www.nanopowerbd.com/public/uploads/category/1776919114-servo-avr-control-card.webp",
    description: "Custom Servo AVR Control Cards, Inverter Motherboards & Circuit Solutions",
    order: 2,
    isActive: true
  },
  {
    id: "cat-safety-security",
    name: "SAFETY - SECURITY",
    slug: "safety---security",
    image: "https://www.nanopowerbd.com/public/uploads/category/1776918982-dahua-goods.webp",
    icon: "https://www.nanopowerbd.com/public/uploads/category/1776918982-dahua-goods.webp",
    description: "IP Cameras, NVR, Smart Door Locks, Fire Extinguishers & Industrial Safety",
    order: 3,
    isActive: true
  },
  {
    id: "cat-tools-hardware",
    name: "TOOLS - HARDWARE",
    slug: "tools---hardware",
    image: "https://www.nanopowerbd.com/public/uploads/category/1777472468-0.25-inch-quick-ratchet-wrench-spanner.webp",
    icon: "https://www.nanopowerbd.com/public/uploads/category/1777472468-0.25-inch-quick-ratchet-wrench-spanner.webp",
    description: "Multimeters, Crimping Tools, Hex Keys, Soldering Stations & Precision Kits",
    order: 4,
    isActive: true
  },
  {
    id: "cat-lt-ht-power-goods",
    name: "LT-HT POWER GOODS",
    slug: "lt-ht-power-goods",
    image: "https://www.nanopowerbd.com/public/uploads/category/1776918494-dropout-e3.webp",
    icon: "https://www.nanopowerbd.com/public/uploads/category/1776918494-dropout-e3.webp",
    description: "Transformers, Drop-out Fuses, Vacuum Circuit Breakers & Switchgear",
    order: 5,
    isActive: true
  },
  {
    id: "cat-modules-sensor",
    name: "MODULES & SENSOR",
    slug: "modules-&-sensor",
    image: "https://www.nanopowerbd.com/public/uploads/category/1776918353-18650-2s-bms.webp",
    icon: "https://www.nanopowerbd.com/public/uploads/category/1776918353-18650-2s-bms.webp",
    description: "Current Sensors, Temperature, Proximity, Relay Modules & Smart Controllers",
    order: 6,
    isActive: true
  },
  {
    id: "cat-igbt-fet-diode-transistor",
    name: "IGBT-FET-DIODE-TRANSISTOR",
    slug: "igbt-fet-diode-transistor",
    image: "https://www.nanopowerbd.com/public/uploads/category/1778045900-fet-&amp;-igbt.webp",
    icon: "https://www.nanopowerbd.com/public/uploads/category/1778045900-fet-&amp;-igbt.webp",
    description: "Power IGBT Modules, Fast Recovery Diodes, MOSFETs & Power Transistors",
    order: 7,
    isActive: true
  },
  {
    id: "cat-electronics-parts",
    name: "ELECTRONICS PARTS",
    slug: "electronics-parts",
    image: "https://www.nanopowerbd.com/public/uploads/category/1776918073-atmega328p.webp",
    icon: "https://www.nanopowerbd.com/public/uploads/category/1776918073-atmega328p.webp",
    description: "Microcontrollers, Capacitors, Resistors, Optocouplers & Connectors",
    order: 8,
    isActive: true
  },
  {
    id: "cat-solar-energy",
    name: "SOLAR ENERGY",
    slug: "solar-energy",
    image: "https://www.nanopowerbd.com/public/uploads/category/1776917773-solar-pv.webp",
    icon: "https://www.nanopowerbd.com/public/uploads/category/1776917773-solar-pv.webp",
    description: "Tier-1 Solar Panels, Hybrid Inverters, Solar Controllers & Mounting",
    order: 9,
    isActive: true
  },
  {
    id: "cat-service-maintenance",
    name: "SERVICE & MAINTENANCE",
    slug: "service-&-maintenance",
    image: "https://www.nanopowerbd.com/public/uploads/category/1776919326-inverter-repairing-services-500x500.webp",
    icon: "https://www.nanopowerbd.com/public/uploads/category/1776919326-inverter-repairing-services-500x500.webp",
    description: "Solar Inverter Repairing, IPS Maintenance & Engineering Service Support",
    order: 10,
    isActive: true
  },
  {
    id: "cat-automation-process-cont",
    name: "AUTOMATION-PROCESS CONT.",
    slug: "automation-process-cont.",
    image: "https://www.nanopowerbd.com/public/uploads/category/1776919527-electrical-test-instruments.webp",
    icon: "https://www.nanopowerbd.com/public/uploads/category/1776919527-electrical-test-instruments.webp",
    description: "Siemens PLC, VFD Drives, HMI Displays & Industrial Automation Cards",
    order: 11,
    isActive: true
  }
];

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

async function scrapeAll() {
  console.log('=== Starting Nanopowerbd Scraper ===');
  const allProducts = [];
  const visitedUrls = new Set();

  for (const cat of categories) {
    console.log(`\nFetching category: ${cat.name} (${cat.slug})...`);
    const catUrl = `https://www.nanopowerbd.com/category/${encodeURIComponent(cat.slug)}`;
    
    let html = '';
    try {
      html = await fetchHtml(catUrl);
    } catch (err) {
      console.error(`Failed to fetch category ${cat.name}:`, err.message);
      continue;
    }

    // Extract product links from category page
    const prodRegex = /href=["\'](https:\/\/www\.nanopowerbd\.com\/product\/[^"\']+)["\']/gi;
    let match;
    const catProductUrls = [];
    while ((match = prodRegex.exec(html)) !== null) {
      const url = match[1].replace(/&amp;/g, '&');
      if (!visitedUrls.has(url)) {
        visitedUrls.add(url);
        catProductUrls.push(url);
      }
    }

    console.log(`Found ${catProductUrls.length} new products in ${cat.name}`);

    // Process products with rate limiting
    for (let i = 0; i < catProductUrls.length; i++) {
      const prodUrl = catProductUrls[i];
      process.stdout.write(`  [${i + 1}/${catProductUrls.length}] Scraping: ${prodUrl.split('/').pop().slice(0, 40)}... `);

      try {
        const prodHtml = await fetchHtml(prodUrl);
        
        // 1. Title
        let title = '';
        const nameMatch = prodHtml.match(/<div class="product-cart">[\s\S]*?<p class="name">([\s\S]*?)<\/p>/i)
          || prodHtml.match(/<p class="name">([\s\S]*?)<\/p>/i)
          || prodHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        if (nameMatch) {
          title = cleanText(nameMatch[1].replace(/<[^>]+>/g, ''));
        }
        if (!title) {
          const rawSlug = prodUrl.split('/').pop();
          title = rawSlug.replace(/-\d+$/, '').replace(/-/g, ' ');
        }

        // 2. Price
        let price = 0;
        let oldPrice = 0;
        const priceSection = prodHtml.match(/class="details-price">([\s\S]*?)<\/p>/i);
        if (priceSection) {
          const pContent = priceSection[1];
          const newPriceM = pContent.match(/<span[^>]*id="newPrice"[^>]*>৳\s*([0-9,]+)<\/span>/i)
            || pContent.match(/৳\s*([0-9,]+)/i);
          if (newPriceM) {
            price = parseInt(newPriceM[1].replace(/,/g, ''), 10) || 0;
          }

          const delM = pContent.match(/<del>৳\s*([0-9,]+)<\/del>/i);
          if (delM) {
            oldPrice = parseInt(delM[1].replace(/,/g, ''), 10) || 0;
          }
        }

        // 3. Discount Percentage
        let discount = 0;
        if (oldPrice > price && price > 0) {
          discount = Math.round(((oldPrice - price) / oldPrice) * 100);
        }

        // 4. Images
        const imgSet = new Set();
        // Look in slider/indicator
        const sliderImgs = [...prodHtml.matchAll(/src=["\'](https:\/\/www\.nanopowerbd\.com\/public\/uploads\/product\/[^"\']+)["\']/gi)];
        for (const simg of sliderImgs) {
          imgSet.add(simg[1]);
        }

        const images = Array.from(imgSet);
        const mainImage = images[0] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80';

        // 5. Description & Specs
        let description = '';
        const descMatch = prodHtml.match(/id="description"[^>]*>([\s\S]*?)<\/div>/i)
          || prodHtml.match(/class="description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        if (descMatch) {
          description = descMatch[1]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .trim();
        } else {
          description = `<p>High quality ${title} genuine component sourced from authorized global distributors. Backed by full replacement warranty and engineer support.</p>`;
        }

        // 6. Generate specs
        const specs = {
          Category: cat.name,
          Condition: "Brand New Genuine",
          Warranty: "1 Year Official Service Warranty",
          Availability: "In Stock (Rajshahi & Dhaka Hubs)",
          Origin: "Imported / Certified"
        };

        const prodSlug = prodUrl.split('/').pop().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const prodId = `np-${allProducts.length + 1}`;

        allProducts.push({
          id: prodId,
          title,
          slug: prodSlug,
          category: cat.slug,
          categoryName: cat.name,
          price,
          oldPrice: oldPrice || (discount > 0 ? Math.round(price * 1.15) : 0),
          discountPercentage: discount,
          image: mainImage,
          images: images.length > 0 ? images : [mainImage],
          brand: "MaxiT Certified",
          stock: 45,
          rating: 4.8,
          reviewsCount: Math.floor(Math.random() * 18) + 3,
          isFeatured: allProducts.length % 4 === 0,
          isHotDeal: discount > 0 || allProducts.length % 3 === 0,
          description,
          specs,
          sourceUrl: prodUrl
        });

        console.log(`OK (৳${price})`);
      } catch (err) {
        console.log(`ERR: ${err.message}`);
      }

      // Small pause to be polite
      await new Promise(r => setTimeout(r, 80));
    }
  }

  console.log(`\n=== Scraping Complete: ${allProducts.length} total products scraped ===`);

  // Save to JSON files
  const outputPath = path.join(__dirname, '../data/nanopower_products.json');
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2), 'utf-8');
  console.log(`Saved products to: ${outputPath}`);

  const catOutputPath = path.join(__dirname, '../data/nanopower_categories.json');
  fs.writeFileSync(catOutputPath, JSON.stringify(categories, null, 2), 'utf-8');
  console.log(`Saved categories to: ${catOutputPath}`);
}

scrapeAll().catch(err => {
  console.error('Fatal scrape error:', err);
  process.exit(1);
});
