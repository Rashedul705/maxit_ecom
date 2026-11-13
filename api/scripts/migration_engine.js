const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Category = require('../models/Category');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ImgBB Keys
const rawKeys = (process.env.IMGBB_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
let currentKeyIdx = 0;

function getActiveKey() {
  return rawKeys[currentKeyIdx % rawKeys.length];
}

function rotateKey() {
  currentKeyIdx = (currentKeyIdx + 1) % rawKeys.length;
  console.log(`[ImgBB] Rotated to key index ${currentKeyIdx} (${getActiveKey().substring(0, 6)}...)`);
}

// Image Map cache
const IMAGE_MAP_FILE = path.join(__dirname, '../../image_map.json');
const BACKEND_CACHE_FILE = path.join(__dirname, '../output/image_cache.json');
let imageMap = {};

function loadImageMap() {
  if (fs.existsSync(IMAGE_MAP_FILE)) {
    try {
      imageMap = JSON.parse(fs.readFileSync(IMAGE_MAP_FILE, 'utf-8'));
      console.log(`[ImageMap] Loaded ${Object.keys(imageMap).length} cached images from image_map.json`);
    } catch (e) {
      console.warn('[ImageMap] Error reading image_map.json:', e.message);
    }
  }
}

function saveImageMap() {
  try {
    fs.writeFileSync(IMAGE_MAP_FILE, JSON.stringify(imageMap, null, 2), 'utf-8');
    // Also mirror to backend output
    const outDir = path.join(__dirname, '../output');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(BACKEND_CACHE_FILE, JSON.stringify(imageMap, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[ImageMap] Error saving cache:', e.message);
  }
}

// Polite fetch with backoff
async function politeFetch(url, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // 2.5 seconds pause between page requests as requested
      await sleep(2500);
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, ...(options.headers || {}) },
        ...options
      });
      if (res.status === 429) {
        const delay = attempt * 5000;
        console.warn(`[PoliteFetch] 429 Rate limited on ${url}. Backing off ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      console.warn(`[PoliteFetch] Attempt ${attempt} failed for ${url}:`, err.message);
      if (attempt === retries) throw err;
      await sleep(attempt * 2000);
    }
  }
}

// ImgBB Upload with key rotation, backoff, and graceful fallback
async function uploadToImgbbSlowly(imageUrl, title = 'product') {
  if (imageMap[imageUrl]) {
    return imageMap[imageUrl];
  }

  // Short pause before uploading
  await sleep(1500);

  const cleanTitle = (title || 'product').substring(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // 1. Download image locally
      const imgRes = await fetch(imageUrl, {
        headers: { 'User-Agent': USER_AGENT }
      });
      if (!imgRes.ok) throw new Error(`Download HTTP ${imgRes.status}`);
      const buffer = Buffer.from(await imgRes.arrayBuffer());

      // 2. Upload to ImgBB
      const key = getActiveKey();
      const params = new URLSearchParams();
      params.append('image', buffer.toString('base64'));
      params.append('name', cleanTitle);

      const upRes = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
        method: 'POST',
        body: params
      });

      const json = await upRes.json();

      if (json.success && json.data && json.data.url) {
        const hostedUrl = json.data.url;
        imageMap[imageUrl] = hostedUrl;
        saveImageMap();
        console.log(`[ImgBB] Uploaded image -> ${hostedUrl}`);
        return hostedUrl;
      } else {
        const errMsg = json.error?.message || 'ImgBB upload rejected';
        console.warn(`[ImgBB] Key ${key.substring(0, 6)} failed (${errMsg}). Rotating key...`);
        rotateKey();
        await sleep(2000);
      }
    } catch (err) {
      console.warn(`[ImgBB] Attempt ${attempt} failed for ${imageUrl}:`, err.message);
      rotateKey();
      await sleep(2000);
    }
  }

  console.warn(`[ImgBB] Rate limit reached on keys. Preserving original high-res URL: ${imageUrl}`);
  imageMap[imageUrl] = imageUrl;
  saveImageMap();
  return imageUrl;
}

// Clean HTML content
function cleanDescriptionHtml(rawHtml, title, brand) {
  if (!rawHtml) return '';
  const $ = cheerio.load(rawHtml, { xmlMode: false });

  // Remove scripts, styles, iframes, inputs, buttons, noscript
  $('script, style, iframe, input, button, form, noscript').remove();

  // Remove anchor tags pointing to external sites, keep text
  $('a').each((_, el) => {
    const text = $(el).text();
    $(el).replaceWith(`<span>${text}</span>`);
  });

  // Remove elements exclusively about bdshop
  $('*').each((_, el) => {
    const text = $(el).text().trim();
    if (/bdshop|09613|01788|09678|buy online from/i.test(text)) {
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

// Generate short description rewritten in our own words
function generateShortDescription(title, brand, specs, keyFeatures) {
  const parts = [];
  const brandName = brand && brand !== 'General' ? brand : '';
  
  parts.push(`The ${title} is engineered for exceptional reliability, energy efficiency, and safety in residential and industrial setups across Bangladesh.`);

  if (keyFeatures && keyFeatures.length > 0) {
    const feat = keyFeatures[0].replace(/^[-•*]\s*/, '').trim();
    if (feat.length > 5 && feat.length < 160) {
      parts.push(`Primary highlight includes ${feat.charAt(0).toLowerCase() + feat.slice(1)}.`);
    }
  }

  if (specs && specs['Warranty']) {
    parts.push(`Includes official ${specs['Warranty']} warranty and dedicated technical support from MaxiTShop.`);
  } else {
    parts.push(`Supplied brand new with 100% genuine quality assurance, verified parameters, and nationwide cash on delivery.`);
  }

  return parts.join(' ');
}

// Subcategory classifier
function classifySubcategory(title, specs, categorySlug) {
  const t = (title + ' ' + JSON.stringify(specs)).toLowerCase();

  if (categorySlug === 'solar-package') {
    if (t.includes('hybrid')) return { id: 'sub-hybrid-solar-package', name: 'Hybrid Solar Package', slug: 'hybrid-solar-package' };
    if (t.includes('on-grid') || t.includes('on grid') || t.includes('grid tie')) return { id: 'sub-on-grid-solar-package', name: 'On-Grid Solar Package', slug: 'on-grid-solar-package' };
    if (t.includes('pump')) return { id: 'sub-solar-pump-package', name: 'Solar Pump Package', slug: 'solar-pump-package' };
    if (t.includes('street light')) return { id: 'sub-solar-street-light-package', name: 'Solar Street Light Package', slug: 'solar-street-light-package' };
    return { id: 'sub-off-grid-solar-package', name: 'Off-Grid Solar Package', slug: 'off-grid-solar-package' };
  }

  if (categorySlug === 'solar-inverter') {
    if (t.includes('hybrid')) return { id: 'sub-hybrid-solar-inverter', name: 'Hybrid Solar Inverter', slug: 'hybrid-solar-inverter' };
    if (t.includes('on-grid') || t.includes('on grid') || t.includes('grid tie') || t.includes('three phase on-grid')) return { id: 'sub-on-grid-solar-inverter', name: 'On-Grid Solar Inverter', slug: 'on-grid-solar-inverter' };
    if (t.includes('micro inverter') || t.includes('microinverter')) return { id: 'sub-micro-inverter', name: 'Micro Inverter', slug: 'micro-inverter' };
    if (t.includes('wifi') || t.includes('adapter') || t.includes('dongle') || t.includes('cable') || t.includes('card')) return { id: 'sub-inverter-accessories', name: 'Inverter Accessories', slug: 'inverter-accessories' };
    return { id: 'sub-off-grid-solar-inverter', name: 'Off-Grid Solar Inverter', slug: 'off-grid-solar-inverter' };
  }

  if (categorySlug === 'solar-battery') {
    if (t.includes('high voltage') || t.includes('hv') || t.includes('358v') || t.includes('512v') && t.includes('rack')) return { id: 'sub-high-voltage-battery-system', name: 'High Voltage Battery System', slug: 'high-voltage-battery-system' };
    if (t.includes('wall mount') || t.includes('wall-mounted') || t.includes('wall mounted') || t.includes('powerwall')) return { id: 'sub-wall-mount-solar-battery', name: 'Wall-Mount Solar Battery', slug: 'wall-mount-solar-battery' };
    if (t.includes('tubular')) return { id: 'sub-tubular-solar-battery', name: 'Tubular Solar Battery', slug: 'tubular-solar-battery' };
    if (t.includes('gel')) return { id: 'sub-gel-battery', name: 'Gel Battery', slug: 'gel-battery' };
    return { id: 'sub-lithium-solar-battery', name: 'Lithium Solar Battery (LiFePO4)', slug: 'lithium-solar-battery' };
  }

  if (categorySlug === 'solar-energy') {
    // Check DC Protection & SPD
    if (t.includes('spd') || t.includes('surge') || t.includes('breaker') || t.includes('mccb') || t.includes('mcb') || t.includes('auto phase') || t.includes('phase selector') || t.includes('fuse') || t.includes('arrester')) {
      return { id: 'sub-dc-protection-spd', name: 'DC Protection & SPD', slug: 'dc-protection-spd' };
    }
    // Check Solar Mounting & Cables
    if (t.includes('cable') || t.includes('wire') || t.includes('mounting') || t.includes('rail') || t.includes('screw') || t.includes('clamp') || t.includes('lug') || t.includes('bracket')) {
      return { id: 'sub-solar-mounting-cables', name: 'Solar Mounting & Cables', slug: 'solar-mounting-cables' };
    }
    // Check Solar PV Panels
    if (t.includes('panel') || t.includes('monocrystalline') || t.includes('bifacial') || t.includes('polycrystalline')) {
      return { id: 'sub-solar-pv-panels', name: 'Solar PV Panels', slug: 'solar-pv-panels' };
    }
    // Check Solar Charge Controller
    if (t.includes('charge controller') || t.includes('mppt') || t.includes('pwm')) {
      return { id: 'sub-solar-charge-controller', name: 'Solar Charge Controller', slug: 'solar-charge-controller' };
    }
    // Default to Solar Accessories & Connectors
    return { id: 'sub-solar-accessories-connectors', name: 'Solar Accessories & Connectors', slug: 'solar-accessories-connectors' };
  }

  if (categorySlug === 'smart-home-iot') {
    if (t.includes('switch') || t.includes('socket') || t.includes('touch switch') || t.includes('breaker')) return { id: 'sub-smart-wifi-switches', name: 'Smart WiFi Switches', slug: 'smart-wifi-switches' };
    if (t.includes('alexa') || t.includes('google home') || t.includes('voice') || t.includes('speaker') || t.includes('echo')) return { id: 'sub-voice-control-devices', name: 'Voice Control Devices', slug: 'voice-control-devices' };
    if (t.includes('sensor') || t.includes('monitor') || t.includes('temperature') || t.includes('humidity') || t.includes('motion') || t.includes('water leak')) return { id: 'sub-remote-sensor-monitor', name: 'Remote & Sensor Monitor', slug: 'remote-sensor-monitor' };
    return { id: 'sub-smart-security-sensors', name: 'Smart Sensors & Accessories', slug: 'smart-sensors-accessories' };
  }

  if (categorySlug === 'portable-power-station') {
    if (t.includes('1000w') || t.includes('1200w') || t.includes('1500w') || t.includes('2000w') || t.includes('2400w')) {
      return { id: 'sub-1000w-2000w-station', name: '1000W - 2000W Heavy Duty Station', slug: '1000w-2000w-heavy-duty-station' };
    }
    return { id: 'sub-300w-600w-station', name: '300W - 600W Portable Station', slug: '300w-600w-portable-station' };
  }

  return { id: '', name: '', slug: '' };
}

// Single product parser
async function parseProductPage(sourceUrl) {
  const res = await politeFetch(sourceUrl);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Title
  let title = $('h1').first().text().trim().replace(/\s+/g, ' ');
  if (!title) {
    title = $('title').text().trim().replace(/\s+/g, ' ');
  }
  title = title.replace(/\s*\|\s*BDShop(\.com)?/gi, '').replace(/\s*-\s*BDShop(\.com)?/gi, '').trim();

  // SKU, Brand, Category, Specs
  let sku = '';
  let brand = 'General';
  let categoryName = '';
  let warranty = '';
  const specs = {};

  $('#specifications-tab dl div, .specifications dl div, dl div').each((_, div) => {
    const dt = $(div).find('dt').text().trim().replace(/:$/, '');
    const dd = $(div).find('dd').text().trim();
    if (!dt || !dd) return;
    if (/product id|sku|model/i.test(dt) && !sku) sku = dd;
    if (/brand/i.test(dt)) brand = dd;
    if (/category/i.test(dt)) categoryName = dd;
    if (/warranty/i.test(dt)) warranty = dd;
    specs[dt] = dd;
  });

  // Price & Old Price
  let price = 0;
  let oldPrice = 0;
  let stock = 10;
  let inStock = true;

  const priceBlock = $('.product-price-block, [class*="product-price"], [class*="price-block"]').first();
  const priceMatches = priceBlock.text().match(/৳\s*([0-9,]+)/g);
  if (priceMatches && priceMatches.length > 0) {
    const nums = priceMatches.map(m => parseInt(m.replace(/[^0-9]/g, ''), 10));
    price = nums[0];
    if (nums.length > 1) {
      if (nums[1] > nums[0]) {
        oldPrice = nums[1];
      } else {
        oldPrice = nums[0];
        price = nums[1];
      }
    }
  }

  // Stock
  const stockMatch = priceBlock.text().match(/In stock\s*\((\d+)\s*available\)/i) || $('body').text().match(/In stock\s*\((\d+)\s*available\)/i);
  if (stockMatch) {
    stock = parseInt(stockMatch[1], 10);
    inStock = stock > 0;
  } else if (/out of stock/i.test(priceBlock.text())) {
    stock = 0;
    inStock = false;
  }

  // Fallback SKU
  if (!sku) {
    const urlSlug = sourceUrl.split('/').pop().replace(/\.html$/, '');
    sku = 'MX-' + urlSlug.substring(0, 15).toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  // Images: only main gallery images, excluding related products
  const rawImages = [];
  $('div[class*="overflow-x-"] img, div[class*="relative"] img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (!src || !src.includes('product_')) return;
    const isRelated = $(el).closest('.product-card, [class*="grid-cols-"], [class*="relative overflow-hidden"]').length > 0 &&
                      $(el).closest('[class*="overflow-x-"]').length === 0 &&
                      $(el).closest('[class*="w-full h-full relative"]').length === 0;
    if (!isRelated) {
      const cleanUrl = src.startsWith('http') ? src.split('?')[0] : 'https://bdshop.com' + src.split('?')[0];
      if (!rawImages.includes(cleanUrl)) rawImages.push(cleanUrl);
    }
  });

  // Fallback if gallery selector yielded nothing
  if (rawImages.length === 0) {
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && src.includes('product_') && !src.includes('logo') && !src.includes('banner')) {
        const cleanUrl = src.startsWith('http') ? src.split('?')[0] : 'https://bdshop.com' + src.split('?')[0];
        if (!rawImages.includes(cleanUrl)) rawImages.push(cleanUrl);
      }
    });
  }

  // Description HTML
  const rawDescHtml = $('#description-tab .product-description, #description-tab, .product-description').first().html() || '';

  // Key features
  const keyFeatures = [];
  $('#description-tab ul li, .product-description ul li').each((_, li) => {
    const text = $(li).text().trim();
    if (text && text.length > 8 && text.length < 200 && !keyFeatures.includes(text)) {
      keyFeatures.push(text);
    }
  });

  return {
    title,
    sku,
    brand,
    categoryName,
    price,
    oldPrice,
    stock,
    inStock,
    warranty,
    specs,
    keyFeatures: keyFeatures.slice(0, 10),
    rawImages,
    rawDescHtml,
    sourceUrl
  };
}

module.exports = {
  loadImageMap,
  saveImageMap,
  politeFetch,
  uploadToImgbbSlowly,
  cleanDescriptionHtml,
  generateShortDescription,
  classifySubcategory,
  parseProductPage
};

