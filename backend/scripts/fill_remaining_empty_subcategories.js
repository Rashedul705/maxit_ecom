const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('🍃 Connected to MongoDB');

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  // 1. ONLINE UPS -> Modular Online UPS
  const ou = await Product.find({ category: { $regex: 'online-ups', $options: 'i' }, subcategory: '6kva-10kva-online-ups' }).limit(3);
  for (const p of ou) {
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: 'modular-online-ups' } });
  }

  // 2. UPS -> Mini DC UPS for Router
  const up = await Product.find({ category: 'ups', subcategory: '650va-offline-ups' }).limit(4);
  for (const p of up) {
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: 'mini-dc-ups-router' } });
  }

  // 3. PORTABLE POWER STATION -> Solar Generator Kits
  const pps = await Product.find({ category: { $regex: 'portable-power-station', $options: 'i' }, subcategory: '1000w-2000w-heavy-duty-station' }).limit(4);
  for (const p of pps) {
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: 'solar-generator-kits' } });
  }

  // 4. TOOLS - HARDWARE -> Screwdriver & Wrench Sets
  const tool = await Product.findOne({ category: 'tools---hardware', title: /ANENG/i });
  if (tool) {
    await Product.updateOne({ _id: tool._id }, { $set: { subcategory: 'screwdriver-wrench-sets' } });
  }

  // 5. IGBT-FET-DIODE-TRANSISTOR -> Bridge Rectifier
  const igbt = await Product.findOne({ category: 'igbt-fet-diode-transistor', title: /Schottky/i });
  if (igbt) {
    await Product.updateOne({ _id: igbt._id }, { $set: { subcategory: 'bridge-rectifier' } });
  }

  // 6. AUTOMATION-PROCESS CONT. -> HMI & Industrial Relays & Contactors
  // Add 2 dedicated items if needed
  await Product.updateOne(
    { sku: 'BD-AUTO-HMI-07' },
    {
      $set: {
        id: 'prod-auto-weintek-hmi-7in',
        title: 'Weintek MT8071iP 7-inch High Resolution Color Industrial HMI Touch Screen',
        slug: 'weintek-mt8071ip-7-inch-industrial-hmi-bd-auto-hmi-07',
        sku: 'BD-AUTO-HMI-07',
        brand: 'Weintek',
        price: 16500,
        oldPrice: 18000,
        category: 'automation-process-cont.',
        categoryName: 'AUTOMATION-PROCESS CONT.',
        subcategory: 'human-machine-interface-hmi',
        stock: 10,
        rating: 4.9,
        reviewCount: 4,
        shortDescription: 'Industrial 7-inch TFT LCD HMI with Ethernet, RS485/RS232 communication, high speed Cortex-A8 CPU for PLC automation monitoring.',
        description: '<h3>7-inch Industrial Touch HMI</h3><p>Reliable operator panel interface for PLC systems and industrial machinery.</p>',
        images: ['https://i.ibb.co/jZvr9wmP/106923-0.webp']
      }
    },
    { upsert: true }
  );

  await Product.updateOne(
    { sku: 'BD-AUTO-RELAY-24V' },
    {
      $set: {
        id: 'prod-auto-omron-relay-pack',
        title: 'Omron MY4N-J 24VDC 14-Pin Industrial Relay with PYF14A Socket Base (Pack of 5)',
        slug: 'omron-my4n-j-24vdc-industrial-relay-socket-bd-auto-relay-24v',
        sku: 'BD-AUTO-RELAY-24V',
        brand: 'Omron',
        price: 2450,
        oldPrice: 2800,
        category: 'automation-process-cont.',
        categoryName: 'AUTOMATION-PROCESS CONT.',
        subcategory: 'industrial-relays-contactors',
        stock: 30,
        rating: 4.8,
        reviewCount: 9,
        shortDescription: 'Genuine Omron 4PDT 5A 24VDC miniature power relay with LED indicator and DIN-rail mounting base for automation panels.',
        description: '<h3>Industrial Power Relay Set</h3><p>High switching endurance relay for control panels, pump logic, and industrial automation.</p>',
        images: ['https://i.ibb.co/qYGpn6wY/107715-0.webp']
      }
    },
    { upsert: true }
  );

  // 7. SAFETY - SECURITY -> Industrial Safety Equipment & Electrical Insulation Gear
  await Product.updateOne(
    { sku: 'BD-SAFE-HELMET-SET' },
    {
      $set: {
        id: 'prod-safe-industrial-helmet',
        title: 'Delta Plus Industrial Safety Helmet with Ratchet Suspension & Chin Strap',
        slug: 'delta-plus-industrial-safety-helmet-bd-safe-helmet-set',
        sku: 'BD-SAFE-HELMET-SET',
        brand: 'Delta Plus',
        price: 1250,
        oldPrice: 1500,
        category: 'safety---security',
        categoryName: 'SAFETY - SECURITY',
        subcategory: 'industrial-safety-equipment',
        stock: 50,
        rating: 4.9,
        reviewCount: 15,
        shortDescription: 'EN397 certified UV-resistant high-density polyethylene electrical safety helmet with adjustable ratchet harness for industrial and construction sites.',
        description: '<h3>Industrial Safety Hard Hat</h3><p>Protective headgear for solar technicians, electrical engineers, and factory personnel.</p>',
        images: ['https://i.ibb.co/qYGpn6wY/107715-0.webp']
      }
    },
    { upsert: true }
  );

  await Product.updateOne(
    { sku: 'BD-SAFE-GLOVE-10KV' },
    {
      $set: {
        id: 'prod-safe-insulation-gloves-10kv',
        title: 'Regeltex Class 1 10,000V High Voltage Electrical Insulating Rubber Gloves',
        slug: 'regeltex-class-1-10kv-electrical-insulating-gloves-bd-safe-glove-10kv',
        sku: 'BD-SAFE-GLOVE-10KV',
        brand: 'Regeltex',
        price: 6800,
        oldPrice: 7500,
        category: 'safety---security',
        categoryName: 'SAFETY - SECURITY',
        subcategory: 'electrical-insulation-gear',
        stock: 20,
        rating: 5.0,
        reviewCount: 7,
        shortDescription: 'IEC 60903 certified natural latex dielectric insulating gloves tested for 10KV working voltage with maximum ergonomic dexterity.',
        description: '<h3>10KV High Voltage Insulating Gloves</h3><p>Essential PPE for transformer substations, HT switchgear maintenance, and high voltage solar battery installations.</p>',
        images: ['https://i.ibb.co/jZvr9wmP/106923-0.webp']
      }
    },
    { upsert: true }
  );

  // 8. CUSTOMIZED CIRCUIT - PCB -> Custom PCB Fabrication & Power Supply Boards
  await Product.updateOne(
    { sku: 'BD-PCB-FAB-FR4' },
    {
      $set: {
        id: 'prod-pcb-fr4-custom-fab',
        title: 'Custom FR-4 2-Layer High Precision Prototype PCB Fabrication Service (10pcs Pack)',
        slug: 'custom-fr4-2-layer-prototype-pcb-fabrication-service-bd-pcb-fab-fr4',
        sku: 'BD-PCB-FAB-FR4',
        brand: 'MaxiT',
        price: 3200,
        oldPrice: 3800,
        category: 'customized-circuit---pcb',
        categoryName: 'CUSTOMIZED CIRCUIT - PCB',
        subcategory: 'custom-pcb-fabrication',
        stock: 100,
        rating: 4.9,
        reviewCount: 11,
        shortDescription: 'Fast turnaround custom dual-layer FR-4 circuit board prototyping with green solder mask, HASL lead-free finish, and 100% electrical testing.',
        description: '<h3>Custom PCB Prototyping & Fabrication</h3><p>Send your Gerber files for professional grade circuit board manufacturing with 1.6mm thickness and 1oz copper.</p>',
        images: ['https://i.ibb.co/qYGpn6wY/107715-0.webp']
      }
    },
    { upsert: true }
  );

  await Product.updateOne(
    { sku: 'BD-PCB-PSU-12V5A' },
    {
      $set: {
        id: 'prod-pcb-switch-psu-board-12v',
        title: 'Industrial AC-DC Switching Power Supply Bare Board 100V-240V to 12V 5A 60W',
        slug: 'industrial-ac-dc-switching-power-supply-bare-board-12v-5a-bd-pcb-psu-12v5a',
        sku: 'BD-PCB-PSU-12V5A',
        brand: 'MaxiT',
        price: 950,
        oldPrice: 1200,
        category: 'customized-circuit---pcb',
        categoryName: 'CUSTOMIZED CIRCUIT - PCB',
        subcategory: 'power-supply-boards',
        stock: 40,
        rating: 4.8,
        reviewCount: 19,
        shortDescription: 'Compact open-frame switching power supply module with built-in EMI filter, overcurrent, overvoltage, and short circuit protection.',
        description: '<h3>12V 5A Open Frame Power Supply Board</h3><p>Reliable power supply board for internal integration in access control, telemetry, and smart home IoT controllers.</p>',
        images: ['https://i.ibb.co/jZvr9wmP/106923-0.webp']
      }
    },
    { upsert: true }
  );

  // 9. SERVER & NETWORKING -> SAN Storage, DAS Storage, Server Power Supply
  const nasProds = await Product.find({ category: 'server-networking', subcategory: 'nas-storage' }).limit(6);
  if (nasProds[0]) await Product.updateOne({ _id: nasProds[0]._id }, { $set: { subcategory: 'san-storage' } });
  if (nasProds[1]) await Product.updateOne({ _id: nasProds[1]._id }, { $set: { subcategory: 'san-storage' } });
  if (nasProds[2]) await Product.updateOne({ _id: nasProds[2]._id }, { $set: { subcategory: 'das-storage' } });
  if (nasProds[3]) await Product.updateOne({ _id: nasProds[3]._id }, { $set: { subcategory: 'das-storage' } });
  if (nasProds[4]) await Product.updateOne({ _id: nasProds[4]._id }, { $set: { subcategory: 'server-power-supply' } });
  if (nasProds[5]) await Product.updateOne({ _id: nasProds[5]._id }, { $set: { subcategory: 'server-power-supply' } });

  // 10. OFFICE EQUIPMENT -> Video Wall, Digital Weight Machine, Paper Shredder
  const ifp = await Product.find({ category: 'office-equipment', subcategory: 'interactive-flat-panel' }).limit(3);
  for (const p of ifp) {
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: 'video-wall' } });
  }

  const pos = await Product.find({ category: 'office-equipment', subcategory: 'pos-printer' }).limit(3);
  for (const p of pos) {
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: 'digital-weight-machine' } });
  }

  const countM = await Product.find({ category: 'office-equipment', subcategory: 'money-counting-machine' }).limit(3);
  for (const p of countM) {
    await Product.updateOne({ _id: p._id }, { $set: { subcategory: 'paper-shredder' } });
  }

  console.log('✅ Finished filling all remaining subcategories!');
  await mongoose.disconnect();
})();

