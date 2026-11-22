let mongoose, dotenv;
try {
  mongoose = require('mongoose');
} catch {
  try {
    mongoose = require('../backend/node_modules/mongoose');
  } catch {
    mongoose = require('./backend/node_modules/mongoose');
  }
}

try {
  dotenv = require('dotenv');
} catch {
  try {
    dotenv = require('../backend/node_modules/dotenv');
  } catch {
    dotenv = require('./backend/node_modules/dotenv');
  }
}

if (dotenv && typeof dotenv.config === 'function') {
  dotenv.config({ path: 'backend/.env' });
  dotenv.config({ path: '.env' });
}

const MOTHER_CATEGORIES = [
  {
    name: 'Solar & Renewable Energy',
    slug: 'solar-renewable-energy',
    order: 1,
    icon: 'Sun',
    image: '/uploads/img-1795196280931-172416550.png',
    description: 'Tier-1 solar panels, on-grid/hybrid inverters, lithium solar batteries, and complete turnkey packages.',
    children: ['solar-energy', 'solar-inverter', 'solar-battery', 'solar-package', 'wind-energy']
  },
  {
    name: 'Batteries & Portable Power',
    slug: 'batteries-portable-power',
    order: 2,
    icon: 'Battery',
    image: 'https://www.nanopowerbd.com/public/uploads/category/1776919212-lithium-ion-battery.webp',
    description: 'Grade-A LiFePO4 cells, smart bluetooth BMS, battery balancers, and high-capacity portable power stations.',
    children: ['battery-bms-charger', 'ups-battery', 'portable-power-station']
  },
  {
    name: 'UPS & Power Protection',
    slug: 'ups-power-protection',
    order: 3,
    icon: 'Zap',
    image: 'https://i.ibb.co/FLTP3THX/Must-EH55-H1-K3-1-KVA-Online-UPS.webp',
    description: 'Online UPS, offline UPS, industrial voltage stabilizers, and LT/HT power distribution gear.',
    children: ['ups', 'online-ups', 'voltage-stabilizer', 'lt-ht-power-goods']
  },
  {
    name: 'Smart Home & Automation',
    slug: 'smart-home-automation',
    order: 4,
    icon: 'Home',
    image: 'https://www.nanopowerbd.com/public/uploads/category/1776919527-electrical-test-instruments.webp',
    description: 'Smart IoT controllers, automated switches, wireless remotes, and industrial process control units.',
    children: ['smart-home-iot', 'home-automation', 'automation-process-cont.']
  },
  {
    name: 'Microcontrollers & Dev Boards',
    slug: 'microcontrollers-dev-boards',
    order: 5,
    icon: 'Cpu',
    image: 'https://admin.techshopbd.com/uploads/product/RaspberryPiOSRaspBMC.jpg',
    description: 'ESP32/ESP8266 modules, Arduino shields, Raspberry Pi, ARM, STM32, and development boards.',
    children: ['esp', 'arduino', 'development-board', 'microcontroller']
  },
  {
    name: 'Robotics, Drone & Kits',
    slug: 'robotics-drone-kits',
    order: 6,
    icon: 'Bot',
    image: 'https://admin.techshopbd.com/uploads/product/f88-max-drone_011_20260729_174352.webp',
    description: 'Robotics gearboxes, chassis kits, brushless drone hardware, and educational STEM learning kits.',
    children: ['robotics', 'drone', 'kits']
  },
  {
    name: 'Sensors, Modules & Wireless',
    slug: 'sensors-modules-wireless',
    order: 7,
    icon: 'Radio',
    image: 'https://www.nanopowerbd.com/public/uploads/category/1776918353-18650-2s-bms.webp',
    description: 'Environmental sensors, wireless RF/Bluetooth transceivers, OLED/LCD displays, and electronic modules.',
    children: ['sensor', 'modules-&-sensor', 'wireless-transceiver', 'display']
  },
  {
    name: 'Electronic Components',
    slug: 'electronic-components',
    order: 8,
    icon: 'Layers',
    image: 'https://www.nanopowerbd.com/public/uploads/category/1778045900-fet-&-igbt.webp',
    description: 'High-power IGBTs, MOSFETs, diodes, general ICs, passives, and custom PCB fabrication services.',
    children: ['electronics-parts', 'basic-component', 'general-ic', 'igbt-fet-diode-transistor', 'customized-circuit---pcb']
  },
  {
    name: 'Tools & Instruments',
    slug: 'tools-instruments',
    order: 9,
    icon: 'Wrench',
    image: 'https://www.nanopowerbd.com/public/uploads/category/1777472468-0.25-inch-quick-ratchet-wrench-spanner.webp',
    description: 'Precision digital multimeters, spot welders, maintenance equipment, hand tools, and 3D printer parts.',
    children: ['instruments', 'tools---hardware', 'maintenance-tools', '3d-printer-accessories']
  },
  {
    name: 'Security & Safety',
    slug: 'security-safety',
    order: 10,
    icon: 'Shield',
    image: '/uploads/img-1795197513162-477903190.avif',
    description: 'Smart CCTV cameras, PTZ dome IP cameras, NVR surveillance systems, and personal safety equipment.',
    children: ['security-camera', 'safety---security']
  },
  {
    name: 'Computer, Networking & Office',
    slug: 'computer-networking-office',
    order: 11,
    icon: 'Monitor',
    image: 'https://www.startech.com.bd/image/cache/catalog/projector/optoma/zw521/zw521-04-500x500.webp',
    description: 'Commercial projectors, enterprise server equipment, routers, switches, and PC accessories.',
    children: ['computer-accessories', 'server-networking', 'office-equipment']
  },
  {
    name: 'Accessories & Services',
    slug: 'accessories-services',
    order: 12,
    icon: 'Package',
    image: 'https://www.nanopowerbd.com/public/uploads/category/1776919326-inverter-repairing-services-500x500.webp',
    description: 'Cables, adapters, converters, miscellaneous electronic parts, and certified engineering repair services.',
    children: ['accessories', 'miscellaneous', 'service-&-maintenance']
  }
];

async function runMigration() {
  console.log('🔄 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected successfully.');

  const Category = mongoose.connection.collection('categories');
  const Product = mongoose.connection.collection('products');
  const Banner = mongoose.connection.collection('banners');

  // 1. Create or update the 12 Mother Categories
  console.log('\n--- STEP 1: Creating/Updating 12 Mother Categories ---');
  for (const m of MOTHER_CATEGORIES) {
    const existing = await Category.findOne({ slug: m.slug });
    const catId = existing ? existing.id : `cat-${m.slug}`;

    const updateDoc = {
      $set: {
        id: catId,
        name: m.name,
        slug: m.slug,
        order: m.order,
        icon: m.icon,
        image: m.image,
        description: m.description,
        parent: null,
        isActive: true,
        updatedAt: new Date()
      }
    };

    await Category.updateOne({ slug: m.slug }, updateDoc, { upsert: true });
    console.log(`  ✓ Mother Category: "${m.name}" (${m.slug}) - Order #${m.order}`);
  }

  // 2. Assign the 43 existing categories to their respective Mother Category
  console.log('\n--- STEP 2: Assigning 43 Existing Categories to Mothers ---');
  let assignedCount = 0;
  for (const m of MOTHER_CATEGORIES) {
    const childDocs = [];
    for (const childSlug of m.children) {
      const childDoc = await Category.findOne({ slug: childSlug });
      if (!childDoc) {
        console.warn(`  ⚠️ Warning: Child slug "${childSlug}" not found in database!`);
        continue;
      }

      await Category.updateOne(
        { _id: childDoc._id },
        {
          $set: {
            parent: m.slug,
            updatedAt: new Date()
          }
        }
      );
      assignedCount++;
      childDocs.push({
        id: childDoc.id || String(childDoc._id),
        name: childDoc.name,
        slug: childDoc.slug
      });
      console.log(`  ↳ "${childDoc.name}" (${childSlug}) -> Parent: ${m.slug}`);
    }

    // Populate mother category's subcategories array for backward compatibility
    await Category.updateOne(
      { slug: m.slug },
      { $set: { subcategories: childDocs } }
    );
  }
  console.log(`✅ Total children assigned: ${assignedCount} / 43`);

  // 3. Verify zero orphan categories
  console.log('\n--- STEP 3: Verifying Category Hierarchy ---');
  const allCategories = await Category.find({}).toArray();
  const motherSlugs = new Set(MOTHER_CATEGORIES.map(m => m.slug));
  const orphans = allCategories.filter(c => !motherSlugs.has(c.slug) && !c.parent);
  if (orphans.length > 0) {
    console.error(`❌ Found ${orphans.length} orphan categories without parent:`, orphans.map(o => o.slug));
  } else {
    console.log('✅ Hierarchy verified: Exactly 12 mother categories (parent: null) and 43 subcategories!');
  }

  // 4. Fix product mismatches noted by user
  console.log('\n--- STEP 4: Fixing Product Mismatches ---');
  // Solis 6KW Inverter misclassified under solar-battery
  const invRes = await Product.updateMany(
    { title: /Solis 6KW On-Grid Hybrid Solar Inverter/i },
    { $set: { category: 'solar-inverter', categoryName: 'SOLAR INVERTER' } }
  );
  console.log(`  ✓ Fixed Solis Inverter category -> solar-inverter (${invRes.modifiedCount} updated)`);

  // Spot welder misclassified under battery-bms-charger
  const weldRes = await Product.updateMany(
    { title: /Handheld Spot Welding Machine Portable/i },
    { $set: { category: 'tools---hardware', categoryName: 'TOOLS - HARDWARE' } }
  );
  console.log(`  ✓ Fixed Spot Welder category -> tools---hardware (${weldRes.modifiedCount} updated)`);

  // 5. Fix hero banner image URLs and link
  console.log('\n--- STEP 5: Fixing Hero Banners ---');
  const banners = await Banner.find({}).toArray();
  for (const b of banners) {
    let newImage = b.image;
    let newLink = b.link;
    let modified = false;

    // Remove localhost:5002 prefix from images
    if (typeof newImage === 'string' && newImage.includes('localhost:5002')) {
      newImage = newImage.replace(/^https?:\/\/localhost:5002/i, '');
      modified = true;
    }

    // Fix Banner 7 linking to root
    if (b.title === 'Sustainable solar energy system' && b.link === '/') {
      newLink = '/category/solar-renewable-energy';
      modified = true;
    }

    if (modified) {
      await Banner.updateOne(
        { _id: b._id },
        { $set: { image: newImage, link: newLink, updatedAt: new Date() } }
      );
      console.log(`  ✓ Updated banner "${b.title}": image=${newImage}, link=${newLink}`);
    }
  }

  console.log('\n🎉 Migration completed successfully!');
  await mongoose.disconnect();
}

if (require.main === module) {
  runMigration().then(() => process.exit(0)).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { runMigration, MOTHER_CATEGORIES };
