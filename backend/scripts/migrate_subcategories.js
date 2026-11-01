require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BASELINE_PATH = path.join(__dirname, '../output/baseline.json');
const S11_PATH = path.join(__dirname, '../output/source_11_security_camera.json');

// Subcategory definitions
const OFFICE_EQUIPMENT_SUBCATEGORIES = [
  { name: 'Projector', slug: 'projector' },
  { name: 'Conference System', slug: 'conference-system' },
  { name: 'PA System', slug: 'pa-system' },
  { name: 'Interactive Flat Panel', slug: 'interactive-flat-panel' },
  { name: 'Video Wall', slug: 'video-wall' },
  { name: 'Signage', slug: 'signage' },
  { name: 'Kiosk', slug: 'kiosk' },
  { name: 'Printer', slug: 'printer' },
  { name: 'Laser Printer', slug: 'laser-printer' },
  { name: 'Large Format Printer', slug: 'large-format-printer' },
  { name: 'ID Card Printer', slug: 'id-card-printer' },
  { name: 'POS Printer', slug: 'pos-printer' },
  { name: 'Label Printer', slug: 'label-printer' },
  { name: 'Digital Weight Machine', slug: 'digital-weight-machine' },
  { name: 'Photocopier', slug: 'photocopier' },
  { name: 'Toner', slug: 'toner' },
  { name: 'Cartridge', slug: 'cartridge' },
  { name: 'Ink Bottle', slug: 'ink-bottle' },
  { name: 'Ribbon', slug: 'ribbon' },
  { name: 'Printer Paper', slug: 'printer-paper' },
  { name: 'Printer Drum', slug: 'printer-drum' },
  { name: 'Scanner', slug: 'scanner' },
  { name: 'Barcode Scanner', slug: 'barcode-scanner' },
  { name: 'Cash Drawer', slug: 'cash-drawer' },
  { name: 'Telephone Set', slug: 'telephone-set' },
  { name: 'IP Phone', slug: 'ip-phone' },
  { name: 'PABX System', slug: 'pabx-system' },
  { name: 'Money Counting Machine', slug: 'money-counting-machine' },
  { name: 'Paper Shredder', slug: 'paper-shredder' },
  { name: 'Laminating Machine', slug: 'laminating-machine' },
  { name: 'Binding Machine', slug: 'binding-machine' }
].map(s => ({ id: `sub-${s.slug}`, ...s }));

const SECURITY_CAMERA_SUBCATEGORIES = [
  { name: 'Portable WiFi Camera', slug: 'portable-wifi-camera' },
  { name: 'IP Camera', slug: 'ip-camera' },
  { name: 'CC Camera', slug: 'cc-camera' },
  { name: 'PTZ Camera', slug: 'ptz-camera' },
  { name: 'Solar Camera', slug: 'solar-camera' },
  { name: 'CC Camera Package', slug: 'cc-camera-package' },
  { name: 'IP Camera Package', slug: 'ip-camera-package' },
  { name: 'DVR', slug: 'dvr' },
  { name: 'NVR', slug: 'nvr' },
  { name: 'XVR', slug: 'xvr' },
  { name: 'CC Camera Accessories', slug: 'cc-camera-accessories' },
  { name: 'Door Lock', slug: 'door-lock' },
  { name: 'Smart Door Bell', slug: 'smart-door-bell' },
  { name: 'Access Control', slug: 'access-control' },
  { name: 'Entrance Control', slug: 'entrance-control' },
  { name: 'Digital Locker & Vault', slug: 'digital-locker-vault' },
  { name: 'KVM Switch', slug: 'kvm-switch' }
].map(s => ({ id: `sub-${s.slug}`, ...s }));

const SERVER_NETWORKING_SUBCATEGORIES = [
  { name: 'Server', slug: 'server' },
  { name: 'GPU Server', slug: 'gpu-server' },
  { name: 'Workstation', slug: 'workstation' },
  { name: 'Server Rack', slug: 'server-rack' },
  { name: 'NAS Storage', slug: 'nas-storage' },
  { name: 'SAN Storage', slug: 'san-storage' },
  { name: 'DAS Storage', slug: 'das-storage' },
  { name: 'Server HDD', slug: 'server-hdd' },
  { name: 'Server HDD Bay', slug: 'server-hdd-bay' },
  { name: 'Server RAM', slug: 'server-ram' },
  { name: 'Server SSD', slug: 'server-ssd' },
  { name: 'Server Power Supply', slug: 'server-power-supply' },
  { name: 'Server Processor', slug: 'server-processor' }
].map(s => ({ id: `sub-${s.slug}`, ...s }));

function classifyOfficeProduct(title) {
  const t = title.toLowerCase();
  
  if (t.includes('toner') || t.includes('refill kit') || t.includes('refill pouch') || t.includes('reload kit')) return { subcategory: 'toner', subcategoryName: 'Toner' };
  if (t.includes('cartridge') || t.includes('printhead')) return { subcategory: 'cartridge', subcategoryName: 'Cartridge' };
  if (t.includes('ink bottle') || (t.includes('ink') && t.includes('bottle')) || t.includes('pigment ink') || t.includes('sublimation ink')) return { subcategory: 'ink-bottle', subcategoryName: 'Ink Bottle' };
  if (t.includes('ribbon') || t.includes('film')) return { subcategory: 'ribbon', subcategoryName: 'Ribbon' };
  if (t.includes('drum unit') || t.includes('printer drum') || t.includes('imaging drum') || t.includes('drum')) return { subcategory: 'printer-drum', subcategoryName: 'Printer Drum' };
  if (t.includes('paper roll') || t.includes('photo paper') || t.includes('printer paper') || t.includes('glossy paper') || t.includes('paper')) return { subcategory: 'printer-paper', subcategoryName: 'Printer Paper' };

  if (t.includes('barcode scanner') || t.includes('barcode reader') || t.includes('scanner stand')) return { subcategory: 'barcode-scanner', subcategoryName: 'Barcode Scanner' };
  if (t.includes('scanner') || t.includes('digital sender')) return { subcategory: 'scanner', subcategoryName: 'Scanner' };

  if (t.includes('money counting') || t.includes('money counter') || t.includes('currency detection') || t.includes('note detector') || t.includes('fake note') || t.includes('uv detector') || t.includes('banknote banding')) return { subcategory: 'money-counting-machine', subcategoryName: 'Money Counting Machine' };
  if (t.includes('shredder')) return { subcategory: 'paper-shredder', subcategoryName: 'Paper Shredder' };
  if (t.includes('laminating') || t.includes('laminator') || t.includes('lamination')) return { subcategory: 'laminating-machine', subcategoryName: 'Laminating Machine' };
  if (t.includes('binding machine') || t.includes('binding ring') || t.includes('comb binding')) return { subcategory: 'binding-machine', subcategoryName: 'Binding Machine' };
  if (t.includes('cash drawer')) return { subcategory: 'cash-drawer', subcategoryName: 'Cash Drawer' };
  if (t.includes('weight machine') || t.includes('weighing scale') || t.includes('weight scale') || t.includes('balance')) return { subcategory: 'digital-weight-machine', subcategoryName: 'Digital Weight Machine' };

  if (t.includes('projector') || t.includes('projection screen') || t.includes('projector mount') || t.includes('projector bracket') || t.includes('gimbal projector')) return { subcategory: 'projector', subcategoryName: 'Projector' };

  if (t.includes('interactive flat panel') || t.includes('viewboard') || t.includes('touch interactive') || t.includes('ifp') || t.includes('board pro') || t.includes('interactive touch display') || t.includes('smart lectern')) return { subcategory: 'interactive-flat-panel', subcategoryName: 'Interactive Flat Panel' };
  if (t.includes('video wall')) return { subcategory: 'video-wall', subcategoryName: 'Video Wall' };
  if (t.includes('kiosk')) return { subcategory: 'kiosk', subcategoryName: 'Kiosk' };
  if (t.includes('signage') || t.includes('commercial display') || t.includes('smart signage')) return { subcategory: 'signage', subcategoryName: 'Signage' };

  if (t.includes('pabx') || t.includes('ip pbx') || t.includes('ip-pbx') || t.includes('ipabx') || t.includes('voip gateway') || t.includes('trunk gateway') || t.includes('intercom')) return { subcategory: 'pabx-system', subcategoryName: 'PABX System' };
  if (t.includes('ip phone') || t.includes('sip phone') || t.includes('wi-fi phone') || t.includes('video phone') || t.includes('extension module')) return { subcategory: 'ip-phone', subcategoryName: 'IP Phone' };
  if (t.includes('telephone') || t.includes('corded phone') || t.includes('cordless') || t.includes('phone set')) return { subcategory: 'telephone-set', subcategoryName: 'Telephone Set' };

  if (t.includes('conference') || t.includes('speakerphone') || t.includes('video bar') || t.includes('ptz camera') || t.includes('webcam') || t.includes('rally') || t.includes('screenbeam') || t.includes('panacast') || t.includes('smartdock') || t.includes('tap ip') || t.includes('screen sharing') || t.includes('tap scheduler')) return { subcategory: 'conference-system', subcategoryName: 'Conference System' };
  if (t.includes('pa system') || t.includes('ceiling speaker') || t.includes('column speaker') || t.includes('portable pa') || t.includes('microphone') || t.includes('mixing console') || t.includes('amplifier') || t.includes('gooseneck') || t.includes('loudspeaker') || t.includes('driver unit') || t.includes('horn speaker') || t.includes('pa speaker') || t.includes('sip speaker') || t.includes('multicast speaker') || t.includes('delegate unit') || t.includes('chairman unit') || t.includes('battery charger')) return { subcategory: 'pa-system', subcategoryName: 'PA System' };

  if (t.includes('id card printer') || t.includes('card printer') || t.includes('pvc card')) return { subcategory: 'id-card-printer', subcategoryName: 'ID Card Printer' };
  if (t.includes('pos printer') || t.includes('thermal receipt') || t.includes('receipt printer') || t.includes('pos terminal') || t.includes('sunmi')) return { subcategory: 'pos-printer', subcategoryName: 'POS Printer' };
  if (t.includes('label printer') || t.includes('barcode label') || t.includes('thermal label')) return { subcategory: 'label-printer', subcategoryName: 'Label Printer' };
  if (t.includes('large format') || t.includes('plotter') || t.includes('surecolor') || t.includes('imageprograf') || t.includes('designjet')) return { subcategory: 'large-format-printer', subcategoryName: 'Large Format Printer' };
  if (t.includes('photocopier') || t.includes('copier') || t.includes('imagerunner') || t.includes('e-studio') || t.includes('duplicator') || t.includes('pedestal') || t.includes('radf')) return { subcategory: 'photocopier', subcategoryName: 'Photocopier' };
  if (t.includes('laser printer') || t.includes('laserjet') || t.includes('mono laser') || t.includes('color laser') || t.includes('laser')) return { subcategory: 'laser-printer', subcategoryName: 'Laser Printer' };
  if (t.includes('printer') || t.includes('ink tank') || t.includes('ecotank') || t.includes('all-in-one') || t.includes('pixma') || t.includes('deskjet') || t.includes('ink advantage')) return { subcategory: 'printer', subcategoryName: 'Printer' };

  return { subcategory: 'projector', subcategoryName: 'Projector' };
}

function classifyServerProduct(title) {
  const t = title.toLowerCase();
  if (t.includes('gpu server')) return { subcategory: 'gpu-server', subcategoryName: 'GPU Server' };
  if (t.includes('workstation')) return { subcategory: 'workstation', subcategoryName: 'Workstation' };
  if (t.includes('rack')) return { subcategory: 'server-rack', subcategoryName: 'Server Rack' };
  if (t.includes('nas') || t.includes('network attached storage')) return { subcategory: 'nas-storage', subcategoryName: 'NAS Storage' };
  if (t.includes('san storage') || t.includes('san switch')) return { subcategory: 'san-storage', subcategoryName: 'SAN Storage' };
  if (t.includes('das storage')) return { subcategory: 'das-storage', subcategoryName: 'DAS Storage' };
  if (t.includes('hard drive') || t.includes('enterprise hdd') || t.includes('server hdd') || (t.includes('hdd') && !t.includes('bay'))) return { subcategory: 'server-hdd', subcategoryName: 'Server HDD' };
  if (t.includes('hdd bay') || t.includes('drive bay') || t.includes('caddy')) return { subcategory: 'server-hdd-bay', subcategoryName: 'Server HDD Bay' };
  if (t.includes('ecc') || t.includes('server ram') || t.includes('server memory') || t.includes('rdimm') || t.includes('udimm')) return { subcategory: 'server-ram', subcategoryName: 'Server RAM' };
  if (t.includes('server ssd') || t.includes('enterprise ssd')) return { subcategory: 'server-ssd', subcategoryName: 'Server SSD' };
  if (t.includes('power supply') || t.includes('server psu') || t.includes('redundant power')) return { subcategory: 'server-power-supply', subcategoryName: 'Server Power Supply' };
  if (t.includes('epyc') || t.includes('xeon') || t.includes('server processor')) return { subcategory: 'server-processor', subcategoryName: 'Server Processor' };
  return { subcategory: 'server', subcategoryName: 'Server' };
}

function normalizeSecuritySubcategory(rawSubName) {
  if (!rawSubName) return { subcategory: 'cc-camera', subcategoryName: 'CC Camera' };
  const raw = rawSubName.trim();
  
  if (/portable wifi camera|wifi camera/i.test(raw)) return { subcategory: 'portable-wifi-camera', subcategoryName: 'Portable WiFi Camera' };
  if (/ip camera package/i.test(raw)) return { subcategory: 'ip-camera-package', subcategoryName: 'IP Camera Package' };
  if (/cc camera package/i.test(raw)) return { subcategory: 'cc-camera-package', subcategoryName: 'CC Camera Package' };
  if (/ptz camera/i.test(raw)) return { subcategory: 'ptz-camera', subcategoryName: 'PTZ Camera' };
  if (/solar camera/i.test(raw)) return { subcategory: 'solar-camera', subcategoryName: 'Solar Camera' };
  if (/ip camera/i.test(raw)) return { subcategory: 'ip-camera', subcategoryName: 'IP Camera' };
  if (/cc camera accessories/i.test(raw)) return { subcategory: 'cc-camera-accessories', subcategoryName: 'CC Camera Accessories' };
  if (/cc camera/i.test(raw)) return { subcategory: 'cc-camera', subcategoryName: 'CC Camera' };
  if (/dvr/i.test(raw)) return { subcategory: 'dvr', subcategoryName: 'DVR' };
  if (/nvr/i.test(raw)) return { subcategory: 'nvr', subcategoryName: 'NVR' };
  if (/xvr/i.test(raw)) return { subcategory: 'xvr', subcategoryName: 'XVR' };
  if (/door lock/i.test(raw)) return { subcategory: 'door-lock', subcategoryName: 'Door Lock' };
  if (/door bell|doorbell/i.test(raw)) return { subcategory: 'smart-door-bell', subcategoryName: 'Smart Door Bell' };
  if (/entrance control/i.test(raw)) return { subcategory: 'entrance-control', subcategoryName: 'Entrance Control' };
  if (/access control/i.test(raw)) return { subcategory: 'access-control', subcategoryName: 'Access Control' };
  if (/digital locker|vault/i.test(raw)) return { subcategory: 'digital-locker-vault', subcategoryName: 'Digital Locker & Vault' };
  if (/kvm switch/i.test(raw)) return { subcategory: 'kvm-switch', subcategoryName: 'KVM Switch' };
  if (/access point/i.test(raw)) return { subcategory: 'access-control', subcategoryName: 'Access Control' };

  return { subcategory: 'cc-camera', subcategoryName: 'CC Camera' };
}

async function runMigration() {
  console.log('=== SUBCATEGORY ARCHITECTURE MIGRATION ===');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  const Product = require('../models/Product');
  const Category = require('../models/Category');

  // Verify baseline
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
  const baselineIds = baseline.products.map(p => p.id);
  const foundBaseline = await Product.find({ id: { $in: baselineIds } }).countDocuments();
  if (foundBaseline !== 117) {
    throw new Error(`CRITICAL: Baseline mismatch: expected 117, found ${foundBaseline}`);
  }

  // 1. Update Categories with subcategories
  console.log('\n1. Updating Category documents with subcategories arrays...');

  await Category.updateOne(
    { slug: 'office-equipment' },
    { $set: { subcategories: OFFICE_EQUIPMENT_SUBCATEGORIES } }
  );
  console.log(`   Updated 'office-equipment' with ${OFFICE_EQUIPMENT_SUBCATEGORIES.length} subcategories.`);

  await Category.updateOne(
    { slug: 'security-camera' },
    { $set: { subcategories: SECURITY_CAMERA_SUBCATEGORIES } }
  );
  console.log(`   Updated 'security-camera' with ${SECURITY_CAMERA_SUBCATEGORIES.length} subcategories.`);

  await Category.updateOne(
    { slug: 'server-networking' },
    { $set: { subcategories: SERVER_NETWORKING_SUBCATEGORIES } }
  );
  console.log(`   Updated 'server-networking' with ${SERVER_NETWORKING_SUBCATEGORIES.length} subcategories.`);

  // 2. Classify and update products in 'security-camera'
  console.log('\n2. Updating products in category: security-camera...');
  const s11Data = JSON.parse(fs.readFileSync(S11_PATH, 'utf-8'));
  const s11SubMap = new Map();
  s11Data.products.forEach(p => {
    s11SubMap.set(p.id, p.subcategoryName || '');
  });

  const secProds = await Product.find({ category: 'security-camera' }).lean();
  console.log(`   Found ${secProds.length} security-camera products.`);

  const secOps = [];
  for (const p of secProds) {
    const rawSub = s11SubMap.get(p.id) || '';
    const { subcategory, subcategoryName } = normalizeSecuritySubcategory(rawSub);
    secOps.push({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { subcategory, subcategoryName } }
      }
    });
  }

  if (secOps.length > 0) {
    for (let i = 0; i < secOps.length; i += 200) {
      await Product.bulkWrite(secOps.slice(i, i + 200));
    }
  }
  console.log(`   Updated ${secOps.length} security-camera products with subcategories.`);

  // 3. Classify and update products in 'office-equipment'
  console.log('\n3. Updating products in category: office-equipment...');
  const offProds = await Product.find({ category: 'office-equipment' }).lean();
  console.log(`   Found ${offProds.length} office-equipment products.`);

  const offOps = [];
  for (const p of offProds) {
    const { subcategory, subcategoryName } = classifyOfficeProduct(p.title || p.name || '');
    offOps.push({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { subcategory, subcategoryName } }
      }
    });
  }

  if (offOps.length > 0) {
    for (let i = 0; i < offOps.length; i += 200) {
      await Product.bulkWrite(offOps.slice(i, i + 200));
    }
  }
  console.log(`   Updated ${offOps.length} office-equipment products with subcategories.`);

  // 4. Classify and update products in 'server-networking'
  console.log('\n4. Updating products in category: server-networking...');
  const servProds = await Product.find({ category: 'server-networking' }).lean();
  console.log(`   Found ${servProds.length} server-networking products.`);

  const servOps = [];
  for (const p of servProds) {
    const { subcategory, subcategoryName } = classifyServerProduct(p.title || p.name || '');
    servOps.push({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { subcategory, subcategoryName } }
      }
    });
  }

  if (servOps.length > 0) {
    for (let i = 0; i < servOps.length; i += 200) {
      await Product.bulkWrite(servOps.slice(i, i + 200));
    }
  }
  console.log(`   Updated ${servOps.length} server-networking products with subcategories.`);

  // 5. Verification
  console.log('\n5. Verification:');
  const sampleOff = await Product.find({ category: 'office-equipment' }).limit(3).lean();
  console.log('   Office Equipment Samples:', sampleOff.map(p => ({ title: p.title || p.name, sub: p.subcategory, subName: p.subcategoryName })));

  const sampleSec = await Product.find({ category: 'security-camera' }).limit(3).lean();
  console.log('   Security Camera Samples:', sampleSec.map(p => ({ title: p.title || p.name, sub: p.subcategory, subName: p.subcategoryName })));

  const sampleServ = await Product.find({ category: 'server-networking' }).limit(3).lean();
  console.log('   Server Samples:', sampleServ.map(p => ({ title: p.title || p.name, sub: p.subcategory, subName: p.subcategoryName })));

  // Final check: baseline
  const finalBaseline = await Product.find({ id: { $in: baselineIds } }).countDocuments();
  console.log(`   Baseline products intact: ${finalBaseline} of 117.`);

  await mongoose.disconnect();
  console.log('\nMigration complete!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

