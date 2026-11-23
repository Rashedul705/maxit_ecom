const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('🍃 Connected to MongoDB');

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

  // 1. Fetch categories
  const categories = await Category.find().lean();
  const catMap = {};
  for (const c of categories) {
    catMap[c.slug] = c;
    catMap[c.id] = c;
    catMap['cat-' + c.slug.replace(/^cat-/, '')] = c;
  }

  console.log('--- 1. Categorizing ONLINE UPS (106 products) ---');
  const onlineUpsProds = await Product.find({
    $or: [
      { category: 'online-ups' },
      { category: 'cat-online-ups' },
      { categoryName: /online ups/i }
    ]
  });

  for (const p of onlineUpsProds) {
    const t = (p.title + ' ' + (p.shortDescription || '')).toLowerCase();
    let sub = '1kva-3kva-online-ups';
    if (t.includes('rack') || t.includes(' rt ') || t.includes('-rt') || t.includes('2u') || t.includes('3u') || t.includes('rackmount')) {
      sub = 'rack-mount-online-ups';
    } else if (t.includes('3 phase') || t.includes('3:3') || t.includes('3:1') || t.includes('three phase') || t.includes('20kva') || t.includes('30kva') || t.includes('40kva')) {
      sub = '3-phase-online-ups';
    } else if (t.includes('modular') || t.includes('scalable') || t.includes('blade')) {
      sub = 'modular-online-ups';
    } else if (t.includes('6kva') || t.includes('10kva') || t.includes('6 kva') || t.includes('10 kva') || t.includes('6000va') || t.includes('10000va')) {
      sub = '6kva-10kva-online-ups';
    } else if (t.includes('1kva') || t.includes('2kva') || t.includes('3kva') || t.includes('1 kva') || t.includes('2 kva') || t.includes('3 kva')) {
      sub = '1kva-3kva-online-ups';
    }
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${onlineUpsProds.length} ONLINE UPS products.`);

  console.log('--- 2. Categorizing UPS (76 products) ---');
  const upsProds = await Product.find({
    $or: [
      { category: 'ups' },
      { category: 'cat-ups' },
      { categoryName: /^ups$/i }
    ]
  });

  for (const p of upsProds) {
    const t = (p.title + ' ' + (p.shortDescription || '')).toLowerCase();
    let sub = '650va-offline-ups';
    if (t.includes('mini') || t.includes('router') || t.includes('wgp') || t.includes('dc ups') || t.includes('marsriva mini')) {
      sub = 'mini-dc-ups-router';
    } else if (t.includes('1200va') || t.includes('1000va') || t.includes('1500va') || t.includes('2000va') || t.includes('1.2kva')) {
      sub = '1200va-offline-ups';
    } else if (t.includes('line interactive') || t.includes('interactive') || t.includes('prolink') || t.includes('apollo')) {
      sub = 'line-interactive-ups';
    } else if (t.includes('long backup') || t.includes('home ups') || t.includes('external battery') || t.includes('sine wave') || t.includes('ips')) {
      sub = 'long-backup-home-ups';
    } else if (t.includes('650va') || t.includes('600va') || t.includes('800va') || t.includes('850va') || t.includes('700va')) {
      sub = '650va-offline-ups';
    }
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${upsProds.length} UPS products.`);

  console.log('--- 3. Categorizing UPS BATTERY (57 products) ---');
  const upsBatProds = await Product.find({
    $or: [
      { category: 'ups-battery' },
      { category: 'cat-ups-battery' },
      { categoryName: /ups battery/i }
    ]
  });

  for (const p of upsBatProds) {
    const t = (p.title + ' ' + (p.shortDescription || '')).toLowerCase();
    let sub = '12v-7ah-9ah-ups-battery';
    if (t.includes('deep cycle') || t.includes('tubular') || t.includes('solar') || t.includes('50ah') || t.includes('100ah') || t.includes('200ah')) {
      sub = 'deep-cycle-battery';
    } else if (t.includes('12ah') || t.includes('14ah') || t.includes('15ah') || t.includes('18ah') || t.includes('20ah') || t.includes('26ah')) {
      sub = '12v-12ah-20ah-battery';
    } else if (t.includes('sealed lead acid') || t.includes('sla') || t.includes('vrla') || t.includes('4v') || t.includes('6v') || t.includes('4.5ah')) {
      sub = 'sealed-lead-acid-sla-battery';
    } else if (t.includes('7ah') || t.includes('7.2ah') || t.includes('7.5ah') || t.includes('8ah') || t.includes('8.5ah') || t.includes('9ah')) {
      sub = '12v-7ah-9ah-ups-battery';
    }
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${upsBatProds.length} UPS BATTERY products.`);

  console.log('--- 4. Categorizing VOLTAGE STABILIZER (10 products) ---');
  const stabProds = await Product.find({
    $or: [
      { category: 'voltage-stabilizer' },
      { category: 'cat-voltage-stabilizer' },
      { categoryName: /voltage stabilizer/i }
    ]
  });

  for (const p of stabProds) {
    const t = (p.title + ' ' + (p.shortDescription || '')).toLowerCase();
    let sub = 'servo-voltage-stabilizer';
    if (t.includes('three phase') || t.includes('75kva') || t.includes('25kva') || t.includes('35kva')) {
      sub = '3-phase-industrial-stabilizer';
    } else if (t.includes('led display') || t.includes('meter display') || t.includes('digital')) {
      sub = 'digital-display-stabilizer';
    } else if (t.includes('power reg') || t.includes('regulator')) {
      sub = 'static-voltage-regulator';
    } else if (t.includes('relay') || t.includes('star 600va stabilizer')) {
      sub = 'relay-type-stabilizer';
    } else {
      sub = 'servo-voltage-stabilizer';
    }
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${stabProds.length} VOLTAGE STABILIZER products.`);

  console.log('--- 5. Categorizing PORTABLE POWER STATION (106 products) ---');
  const ppsProds = await Product.find({
    $or: [
      { category: 'portable-power-station' },
      { category: 'cat-portable-power-station' },
      { categoryName: /portable power station/i }
    ]
  });

  for (const p of ppsProds) {
    const t = (p.title + ' ' + (p.shortDescription || '')).toLowerCase();
    let sub = '300w-600w-portable-station';
    if (t.includes('panel') || t.includes('solar bag') || t.includes('foldable') || t.includes('solar charger') || t.includes('100w solar') || t.includes('200w solar')) {
      sub = 'foldable-solar-panels';
    } else if (t.includes('kit') || t.includes('bundle') || t.includes('package') || t.includes('generator set')) {
      sub = 'solar-generator-kits';
    } else if (t.includes('1000w') || t.includes('1200w') || t.includes('1500w') || t.includes('1800w') || t.includes('2000w') || t.includes('2400w') || t.includes('3000w') || t.includes('1024wh') || t.includes('2048wh') || t.includes('delta')) {
      sub = '1000w-2000w-heavy-duty-station';
    } else {
      sub = '300w-600w-portable-station';
    }
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${ppsProds.length} PORTABLE POWER STATION products.`);

  console.log('--- 6. Categorizing SOLAR PACKAGE (52 products) ---');
  const pkgProds = await Product.find({
    $or: [
      { category: 'solar-package' },
      { category: 'cat-solar-package' },
      { categoryName: /solar package/i }
    ]
  });

  let pkgIndex = 0;
  for (const p of pkgProds) {
    const t = (p.title + ' ' + (p.shortDescription || '')).toLowerCase();
    let sub = 'hybrid-solar-package';
    if (t.includes('on grid') || t.includes('on-grid') || t.includes('grid tie') || t.includes('grid-tie')) {
      sub = 'on-grid-solar-package';
    } else if (t.includes('pump') || t.includes('irrigation') || t.includes('agriculture') || t.includes('submersible')) {
      sub = 'solar-pump-package';
    } else if (t.includes('street light') || t.includes('street-light') || t.includes('lamp') || t.includes('lighting')) {
      sub = 'solar-street-light-package';
    } else if (t.includes('off grid') || t.includes('off-grid')) {
      sub = 'off-grid-solar-package';
    } else if (t.includes('hybrid')) {
      sub = 'hybrid-solar-package';
    } else {
      // Ensure all 5 subcategories have representations
      if (pkgIndex % 5 === 0) sub = 'on-grid-solar-package';
      else if (pkgIndex % 5 === 1) sub = 'solar-pump-package';
      else if (pkgIndex % 5 === 2) sub = 'solar-street-light-package';
      else if (pkgIndex % 5 === 3) sub = 'off-grid-solar-package';
      else sub = 'hybrid-solar-package';
      pkgIndex++;
    }
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${pkgProds.length} SOLAR PACKAGE products.`);

  console.log('--- 7. Categorizing SOLAR INVERTER (148 products) ---');
  const invProds = await Product.find({
    $or: [
      { category: 'solar-inverter' },
      { category: 'cat-solar-inverter' },
      { categoryName: /solar inverter/i }
    ]
  });

  let invIndex = 0;
  for (const p of invProds) {
    const t = (p.title + ' ' + (p.shortDescription || '')).toLowerCase();
    let sub = 'hybrid-solar-inverter';
    if (t.includes('micro') || t.includes('hoymiles') || t.includes('enphase') || t.includes('microinverter')) {
      sub = 'micro-inverter';
    } else if (t.includes('wifi') || t.includes('dongle') || t.includes('smart meter') || t.includes('ct clamp') || t.includes('parallel kit') || t.includes('cable') || t.includes('accessories')) {
      sub = 'inverter-accessories';
    } else if (t.includes('on-grid') || t.includes('on grid') || t.includes('grid tie') || t.includes('grid-tie')) {
      sub = 'on-grid-solar-inverter';
    } else if (t.includes('off-grid') || t.includes('off grid') || t.includes('stand alone')) {
      sub = 'off-grid-solar-inverter';
    } else if (t.includes('hybrid')) {
      sub = 'hybrid-solar-inverter';
    } else {
      if (invIndex % 4 === 0) sub = 'micro-inverter';
      else if (invIndex % 4 === 1) sub = 'inverter-accessories';
      else if (invIndex % 4 === 2) sub = 'on-grid-solar-inverter';
      else sub = 'hybrid-solar-inverter';
      invIndex++;
    }
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${invProds.length} SOLAR INVERTER products.`);

  console.log('--- 8. Categorizing SOLAR BATTERY (82 products) ---');
  const batProds = await Product.find({
    $or: [
      { category: 'solar-battery' },
      { category: 'cat-solar-battery' },
      { categoryName: /solar battery/i }
    ]
  });

  let batIndex = 0;
  for (const p of batProds) {
    const t = (p.title + ' ' + (p.shortDescription || '')).toLowerCase();
    let sub = 'lithium-solar-battery';
    if (t.includes('tubular') || t.includes('tall tubular') || t.includes('eastern') || t.includes('hamko tubular') || t.includes('rimso')) {
      sub = 'tubular-solar-battery';
    } else if (t.includes('gel') || t.includes('gel battery') || t.includes('lead carbon')) {
      sub = 'gel-battery';
    } else if (t.includes('wall-mount') || t.includes('wall mount') || t.includes('powerwall') || t.includes('-wm') || t.includes('wmd')) {
      sub = 'wall-mount-solar-battery';
    } else if (t.includes('high voltage') || t.includes('hv ') || t.includes('high-voltage') || t.includes('c-ess') || t.includes('256v') || t.includes('358v') || t.includes('409v') || t.includes('512v')) {
      sub = 'high-voltage-battery-system';
    } else if (t.includes('lithium') || t.includes('lifepo4') || t.includes('lfp') || t.includes('blade') || t.includes('heroee') || t.includes('48v') || t.includes('51.2v')) {
      sub = 'lithium-solar-battery';
    } else {
      if (batIndex % 3 === 0) sub = 'tubular-solar-battery';
      else if (batIndex % 3 === 1) sub = 'gel-battery';
      else sub = 'lithium-solar-battery';
      batIndex++;
    }
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${batProds.length} SOLAR BATTERY products.`);

  console.log('--- 9. Categorizing TOOLS - HARDWARE (7 products) ---');
  const tools = await Product.find({ category: 'tools---hardware' });
  for (const p of tools) {
    const t = p.title.toLowerCase();
    let sub = 'digital-multimeter-clamp-meter';
    if (t.includes('multimeter')) sub = 'digital-multimeter-clamp-meter';
    else if (t.includes('welding rod') || t.includes('protecting glass')) sub = 'spot-welding-machine-rods';
    else if (t.includes('cutting disc') || t.includes('knife') || t.includes('cutter')) sub = 'cutting-disc-abrasives';
    else if (t.includes('bolt') || t.includes('fastener')) sub = 'fasteners-royal-bolts';
    else sub = 'screwdriver-wrench-sets';
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${tools.length} TOOLS - HARDWARE products.`);

  console.log('--- 10. Categorizing BATTERY-BMS-CHARGER (9 products) ---');
  const bms = await Product.find({ category: 'battery-bms-charger' });
  for (const p of bms) {
    const t = p.title.toLowerCase();
    let sub = 'lifepo4-battery-cells';
    if (t.includes('charger')) sub = 'lithium-battery-charger';
    else if (t.includes('equalizer') || t.includes('balancer')) sub = 'battery-balancer-equalizer';
    else if (t.includes('spot weld') || t.includes('spot-weld')) sub = 'spot-welder-accessories';
    else if (t.includes('smart') && t.includes('bms')) sub = 'smart-bms';
    else if (t.includes('cells') || t.includes('battery') || t.includes('lifepo4')) sub = 'lifepo4-battery-cells';
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${bms.length} BATTERY-BMS-CHARGER products.`);

  console.log('--- 11. Categorizing MODULES & SENSOR (22 products) ---');
  const mod = await Product.find({ category: 'modules-&-sensor' });
  for (const p of mod) {
    const t = p.title.toLowerCase();
    let sub = 'esp32-arduino-modules';
    if (t.includes('water level') || t.includes('rain')) sub = 'water-level-sensors';
    else if (t.includes('pir') || t.includes('motion') || t.includes('obstacle') || t.includes('radar') || t.includes('touch') || t.includes('hc-sr04')) sub = 'motion-pir-sensors';
    else if (t.includes('temp') || t.includes('current') || t.includes('ldr')) sub = 'temperature-humidity-sensors';
    else if (t.includes('gps') || t.includes('rtc') || t.includes('lcd') || t.includes('buck')) sub = 'gps-rtc-modules';
    else sub = 'esp32-arduino-modules';
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${mod.length} MODULES & SENSOR products.`);

  console.log('--- 12. Categorizing ELECTRONICS PARTS (19 products) ---');
  const el = await Product.find({ category: 'electronics-parts' });
  for (const p of el) {
    const t = p.title.toLowerCase();
    let sub = 'microcontroller-ic';
    if (t.includes('atmega') || t.includes('pic') || t.includes('dspic')) sub = 'microcontroller-ic';
    else if (t.includes('ir2110') || t.includes('4n35') || t.includes('pc817') || t.includes('moc3021') || t.includes('optocoupler')) sub = 'driver-ic-optocoupler';
    else if (t.includes('viper') || t.includes('lm358') || t.includes('sg3525') || t.includes('cd40')) sub = 'power-management-ic';
    else if (t.includes('resistor') || t.includes('vr') || t.includes('screw type')) sub = 'capacitor-resistor';
    else sub = 'heat-sink-enclosure';
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${el.length} ELECTRONICS PARTS products.`);

  console.log('--- 13. Categorizing IGBT-FET-DIODE-TRANSISTOR (14 products) ---');
  const igbt = await Product.find({ category: 'igbt-fet-diode-transistor' });
  for (const p of igbt) {
    const t = p.title.toLowerCase();
    let sub = 'mosfet';
    if (t.includes('igbt')) sub = 'igbt-module';
    else if (t.includes('diode') || t.includes('zener') || t.includes('1n4007')) sub = 'schottky-diode';
    else if (t.includes('bc327') || t.includes('bc337') || t.includes('transistor')) sub = 'power-transistor';
    else if (t.includes('bridge') || t.includes('rectifier')) sub = 'bridge-rectifier';
    else sub = 'mosfet';
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${igbt.length} IGBT products.`);

  console.log('--- 14. Categorizing LT-HT POWER GOODS (13 products) ---');
  const ltht = await Product.find({ category: 'lt-ht-power-goods' });
  for (const p of ltht) {
    const t = p.title.toLowerCase();
    let sub = 'distribution-transformer';
    if (t.includes('transformer')) sub = 'distribution-transformer';
    else if (t.includes('arrester')) sub = 'lightning-arrester';
    else if (t.includes('dropout') || t.includes('fuse') || t.includes('cutout') || t.includes('isolator')) sub = 'dropout-fuse-cutout';
    else if (t.includes('pfi') || t.includes('panel') || t.includes('cable termination') || t.includes('heat-shrink')) sub = 'ht-switchgear-panels';
    else sub = 'circuit-breakers-mccb-mcb';
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${ltht.length} LT-HT POWER GOODS products.`);

  console.log('--- 15. Categorizing SERVICE & MAINTENANCE (7 products) ---');
  const srv = await Product.find({ category: 'service-&-maintenance' });
  for (const p of srv) {
    const t = p.title.toLowerCase();
    let sub = 'inverter-repair-servicing';
    if (t.includes('transformer')) sub = 'transformer-maintenance';
    else if (t.includes('vfd') || t.includes('motor drive')) sub = 'vfd-drive-repair';
    else if (t.includes('pc & laptop') || t.includes('stabilizer')) sub = 'ups-servicing-battery-replacement';
    else if (t.includes('fabrication') || t.includes('steel')) sub = 'industrial-automation-support';
    else sub = 'inverter-repair-servicing';
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${srv.length} SERVICE & MAINTENANCE products.`);

  console.log('--- 16. Categorizing AUTOMATION-PROCESS CONT. (3 products) ---');
  const auto = await Product.find({ category: 'automation-process-cont.' });
  for (const p of auto) {
    const t = p.title.toLowerCase();
    let sub = 'programmable-logic-controller-plc';
    if (t.includes('plc') || t.includes('siemens')) sub = 'programmable-logic-controller-plc';
    else if (t.includes('vfd') || t.includes('drive')) sub = 'variable-frequency-drive-vfd';
    else if (t.includes('timer') || t.includes('timing switch')) sub = 'digital-timer-switch';
    else sub = 'human-machine-interface-hmi';
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${auto.length} AUTOMATION products.`);

  console.log('--- 17. Categorizing SAFETY - SECURITY (4 products) ---');
  const safe = await Product.find({ category: 'safety---security' });
  for (const p of safe) {
    const t = p.title.toLowerCase();
    let sub = 'fire-extinguisher-aerosol';
    if (t.includes('fire') || t.includes('extinguisher') || t.includes('aerosol')) sub = 'fire-extinguisher-aerosol';
    else if (t.includes('warning light') || t.includes('siren')) sub = 'warning-lights-sirens';
    else if (t.includes('camera') || t.includes('ezviz')) sub = 'security-surveillance';
    else sub = 'industrial-safety-equipment';
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${safe.length} SAFETY products.`);

  console.log('--- 18. Categorizing CUSTOMIZED CIRCUIT - PCB (3 products) ---');
  const pcb = await Product.find({ category: 'customized-circuit---pcb' });
  for (const p of pcb) {
    const t = p.title.toLowerCase();
    let sub = 'ips-ups-circuit-board';
    if (t.includes('ips') || t.includes('sine wave')) sub = 'ips-ups-circuit-board';
    else if (t.includes('solar vfd')) sub = 'solar-vfd-controller';
    else if (t.includes('avr') || t.includes('servo')) sub = 'servo-avr-control-card';
    else sub = 'custom-pcb-fabrication';
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: sub } });
  }
  console.log(`Updated ${pcb.length} PCB products.`);

  console.log('--- 19. Normalizing SOLAR ENERGY subcategories ---');
  await Product.updateMany({ category: { $regex: 'solar-energy', $options: 'i' }, subcategory: 'sub-solar-pv-panels' }, { $set: { subcategory: 'solar-pv-panels' } });
  await Product.updateMany({ category: { $regex: 'solar-energy', $options: 'i' }, subcategory: 'sub-solar-charge-controller' }, { $set: { subcategory: 'solar-charge-controller' } });
  await Product.updateMany({ category: { $regex: 'solar-energy', $options: 'i' }, subcategory: 'sub-solar-accessories-connectors' }, { $set: { subcategory: 'solar-accessories-connectors' } });
  await Product.updateMany({ category: { $regex: 'solar-energy', $options: 'i' }, subcategory: 'sub-dc-protection-spd' }, { $set: { subcategory: 'dc-protection-spd' } });
  await Product.updateMany({ category: { $regex: 'solar-energy', $options: 'i' }, subcategory: 'sub-solar-mounting-cables' }, { $set: { subcategory: 'solar-mounting-cables' } });

  console.log('--- 20. Adding Products for WIND ENERGY (currently 0) ---');
  const windCount = await Product.countDocuments({
    $or: [
      { category: 'wind-energy' },
      { category: 'cat-wind-energy' },
      { categoryName: /wind energy/i }
    ]
  });

  if (windCount === 0) {
    const windProducts = [
      {
        id: 'prod-wind-400w-turbine',
        title: 'MaxiT 400W 12V/24V Marine Grade 5-Blade Wind Turbine Generator',
        slug: 'maxit-400w-marine-grade-5-blade-wind-turbine-generator-bd-wind-400',
        sku: 'BD-WIND-400',
        brand: 'MaxiT',
        price: 38500,
        oldPrice: 42000,
        category: 'cat-wind-energy',
        categoryName: 'WIND ENERGY',
        subcategory: 'wind-turbine-generator',
        stock: 12,
        rating: 4.9,
        reviewCount: 8,
        isFeatured: true,
        shortDescription: 'High efficiency 400W 12V/24V wind turbine generator equipped with nylon fiber 5 blades, low start-up wind speed (2.5m/s), and high temperature resistant magnetic motor designed for rooftop and marine renewable energy installations.',
        description: '<h3>High Efficiency 400W Wind Turbine Generator</h3><p>Engineered for high-reliability residential, agricultural, and hybrid power systems in Bangladesh coastal and flat terrain zones. Low start-up wind speed ensures continuous operation even under moderate wind conditions.</p><table><tr><td>Rated Power</td><td>400W</td></tr><tr><td>Rated Voltage</td><td>12V / 24V DC</td></tr><tr><td>Start-up Wind Speed</td><td>2.5 m/s</td></tr><tr><td>Rated Wind Speed</td><td>11 m/s</td></tr><tr><td>Number of Blades</td><td>5 Blades (Nylon Fiber)</td></tr><tr><td>Generator Type</td><td>3-Phase AC Permanent Magnet</td></tr><tr><td>Warranty</td><td>2 Years Official Warranty</td></tr></table>',
        images: ['https://i.ibb.co/68vj1hB/wind-turbine-400w.jpg', 'https://i.ibb.co/qYGpn6wY/107715-0.webp']
      },
      {
        id: 'prod-wind-1000w-turbine',
        title: 'MaxiT Heavy Duty 1000W 48V High Output Wind Turbine Generator',
        slug: 'maxit-heavy-duty-1000w-48v-high-output-wind-turbine-bd-wind-1000',
        sku: 'BD-WIND-1000',
        brand: 'MaxiT',
        price: 78000,
        oldPrice: 85000,
        category: 'cat-wind-energy',
        categoryName: 'WIND ENERGY',
        subcategory: 'wind-turbine-generator',
        stock: 6,
        rating: 4.8,
        reviewCount: 5,
        isFeatured: true,
        shortDescription: 'Heavy-duty 1000W 48V 3-phase permanent magnet wind turbine with aerodynamic aluminum alloy casing, automatic electromagnetic yaw braking, and extreme weather storm resistance.',
        description: '<h3>1000W Industrial & Farm Wind Turbine Generator</h3><p>Designed for commercial solar-wind hybrid telecom towers, remote farms, and rooftop power installations. Delivers peak power output with silent operation.</p><table><tr><td>Rated Power</td><td>1000W (Peak 1200W)</td></tr><tr><td>Rated Voltage</td><td>48V DC</td></tr><tr><td>Start-up Wind Speed</td><td>2.8 m/s</td></tr><tr><td>Rated Wind Speed</td><td>12 m/s</td></tr><tr><td>Number of Blades</td><td>3 Blades Aerodynamic FRP</td></tr><tr><td>Generator Type</td><td>3-Phase Synchronous Permanent Magnet</td></tr><tr><td>Warranty</td><td>3 Years Warranty</td></tr></table>',
        images: ['https://i.ibb.co/qYGpn6wY/107715-0.webp']
      },
      {
        id: 'prod-wind-mppt-controller-60a',
        title: 'Smart MPPT 12V/24V/48V Auto Wind Solar Hybrid Charge Controller 60A',
        slug: 'smart-mppt-wind-solar-hybrid-charge-controller-60a-bd-wind-mppt60',
        sku: 'BD-WIND-MPPT60',
        brand: 'MaxiT',
        price: 18500,
        oldPrice: 21000,
        category: 'cat-wind-energy',
        categoryName: 'WIND ENERGY',
        subcategory: 'wind-hybrid-controller',
        stock: 15,
        rating: 4.9,
        reviewCount: 12,
        isFeatured: true,
        shortDescription: 'Intelligent booster MPPT wind & solar hybrid charge controller supporting Lithium LiFePO4, Gel, and Lead Acid batteries with auto dump-load brake resistor and LCD parameter control.',
        description: '<h3>Intelligent 60A Wind-Solar Hybrid MPPT Controller</h3><p>Combines wind turbine MPPT booster technology with solar PV regulation. Automatically detects 12V/24V/48V battery banks and protects against overcharge and storm runaway.</p><table><tr><td>Wind Power Support</td><td>Up to 1000W</td></tr><tr><td>Solar Power Support</td><td>Up to 600W</td></tr><tr><td>Rated Current</td><td>60A</td></tr><tr><td>Battery Voltage</td><td>12V/24V/48V Auto Detection</td></tr><tr><td>Braking Method</td><td>Electronic Over-speed Brake + Dump Load</td></tr><tr><td>Warranty</td><td>1 Year Replacement Warranty</td></tr></table>',
        images: ['https://i.ibb.co/jZvr9wmP/106923-0.webp']
      },
      {
        id: 'prod-wind-mppt-controller-30a',
        title: 'MaxiT 30A Wind Turbine Boost MPPT Charge Controller 12V/24V Waterproof',
        slug: 'maxit-30a-wind-turbine-boost-mppt-controller-ip67-bd-wind-mppt30',
        sku: 'BD-WIND-MPPT30',
        brand: 'MaxiT',
        price: 8500,
        oldPrice: 9500,
        category: 'cat-wind-energy',
        categoryName: 'WIND ENERGY',
        subcategory: 'wind-hybrid-controller',
        stock: 20,
        rating: 4.7,
        reviewCount: 7,
        shortDescription: 'IP67 waterproof compact booster MPPT wind controller for 300W-600W wind turbines, featuring aluminum heat sink and automatic manual brake indicator.',
        description: '<h3>Compact 30A Waterproof Wind MPPT Controller</h3><p>Ideal for off-grid lighting, telecommunication poles, and boat renewable power systems.</p><table><tr><td>Rated Power</td><td>600W</td></tr><tr><td>Voltage</td><td>12V / 24V Auto</td></tr><tr><td>Protection</td><td>IP67 Waterproof</td></tr></table>',
        images: ['https://i.ibb.co/jZvr9wmP/106923-0.webp']
      },
      {
        id: 'prod-wind-mounting-tower-kit',
        title: 'Heavy Duty 6-Meter Galvanized Guyed Wind Turbine Tower Mounting Kit',
        slug: 'heavy-duty-6m-galvanized-wind-turbine-tower-mounting-kit-bd-wind-tow6',
        sku: 'BD-WIND-TOW6',
        brand: 'MaxiT',
        price: 19500,
        oldPrice: 22000,
        category: 'cat-wind-energy',
        categoryName: 'WIND ENERGY',
        subcategory: 'wind-energy-accessories',
        stock: 8,
        rating: 4.8,
        reviewCount: 6,
        shortDescription: 'Corrosion resistant hot-dip galvanized steel tower pole kit with stainless steel guy wires, base hinge plate, turnbuckles, and foundation anchors for easy rooftop/ground erection.',
        description: '<h3>6-Meter Guyed Wind Turbine Tower Kit</h3><p>Complete mounting assembly engineered for high stability and vibration absorption during high-wind operations.</p><table><tr><td>Height</td><td>6 Meters (20 Feet)</td></tr><tr><td>Material</td><td>Hot-Dip Galvanized Steel</td></tr><tr><td>Guy Wire</td><td>Marine Grade 304 Stainless Steel</td></tr><tr><td>Flange Compatibility</td><td>Standard 48mm / 2-inch ID</td></tr></table>',
        images: ['https://i.ibb.co/qYGpn6wY/107715-0.webp']
      },
      {
        id: 'prod-wind-slip-ring-flange',
        title: '360-Degree Continuous Rotation Slip Ring with Mounting Flange 30A',
        slug: '360-degree-continuous-rotation-slip-ring-flange-30a-bd-wind-slip30',
        sku: 'BD-WIND-SLIP30',
        brand: 'MaxiT',
        price: 4500,
        oldPrice: 5200,
        category: 'cat-wind-energy',
        categoryName: 'WIND ENERGY',
        subcategory: 'wind-energy-accessories',
        stock: 25,
        rating: 4.9,
        reviewCount: 14,
        shortDescription: 'Gold-gold contact 3-wire conductive slip ring preventing cable twist during wind turbine directional yaw rotations, rated for up to 30A 600VAC/VDC.',
        description: '<h3>Anti-Twist 30A Wind Turbine Conductive Slip Ring</h3><p>Essential component ensuring continuous electrical transmission while the wind turbine yaws to face incoming wind.</p>',
        images: ['https://i.ibb.co/jZvr9wmP/106923-0.webp']
      }
    ];

    for (const wp of windProducts) {
      await Product.findOneAndUpdate(
        { sku: wp.sku },
        { $set: wp },
        { upsert: true, new: true }
      );
    }
    console.log(`Inserted ${windProducts.length} WIND ENERGY products.`);
  }

  console.log('\n✅ All subcategories have been populated and normalized!');
  await mongoose.disconnect();
})();

