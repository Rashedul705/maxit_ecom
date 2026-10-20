/**
 * Mock Database for maxitshop
 * Can be seamlessly replaced with MongoDB / Mongoose models via the services layer.
 */

const categories = [
  // Parent Categories
  {
    id: 'cat-solar',
    name: 'Solar & Green Energy',
    slug: 'solar-green-energy',
    parent: null,
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80',
    icon: 'Sun'
  },
  {
    id: 'cat-mobile',
    name: 'Mobile Phones',
    slug: 'mobile-phones',
    parent: null,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    icon: 'Smartphone'
  },
  {
    id: 'cat-laptops',
    name: 'Laptops',
    slug: 'laptops',
    parent: null,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
    icon: 'Laptop'
  },
  {
    id: 'cat-watches',
    name: 'Smart Watches',
    slug: 'smart-watches',
    parent: null,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    icon: 'Watch'
  },
  {
    id: 'cat-home',
    name: 'Home Appliances',
    slug: 'home-appliances',
    parent: null,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80',
    icon: 'Home'
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    parent: null,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    icon: 'Headphones'
  },

  // Subcategories
  // Solar
  { id: 'sub-solar-panels', name: 'Solar Panels', slug: 'solar-panels', parent: 'solar-green-energy', image: 'https://images.unsplash.com/photo-1508873696983-2df570464756?w=300&q=80' },
  { id: 'sub-solar-inverters', name: 'Inverters & Controllers', slug: 'inverters-controllers', parent: 'solar-green-energy', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&q=80' },
  { id: 'sub-solar-batteries', name: 'Solar Batteries', slug: 'solar-batteries', parent: 'solar-green-energy', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&q=80' },
  { id: 'sub-solar-lights', name: 'Solar Street Lights', slug: 'solar-street-lights', parent: 'solar-green-energy', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80' },

  // Mobile
  { id: 'sub-mob-smartphones', name: 'Smartphones', slug: 'smartphones', parent: 'mobile-phones', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&q=80' },
  { id: 'sub-mob-tablets', name: 'Tablets & iPads', slug: 'tablets-ipads', parent: 'mobile-phones', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80' },
  { id: 'sub-mob-feature', name: 'Feature Phones', slug: 'feature-phones', parent: 'mobile-phones', image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&q=80' },

  // Laptops
  { id: 'sub-lap-gaming', name: 'Gaming Laptops', slug: 'gaming-laptops', parent: 'laptops', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&q=80' },
  { id: 'sub-lap-ultrabooks', name: 'Ultrabooks & Slim', slug: 'ultrabooks-slim', parent: 'laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80' },
  { id: 'sub-lap-business', name: 'Business Laptops', slug: 'business-laptops', parent: 'laptops', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&q=80' },

  // Watches
  { id: 'sub-wat-fitness', name: 'Fitness Bands', slug: 'fitness-bands', parent: 'smart-watches', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&q=80' },
  { id: 'sub-wat-calling', name: 'Calling Smartwatches', slug: 'calling-smartwatches', parent: 'smart-watches', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&q=80' },

  // Home
  { id: 'sub-home-cleaners', name: 'Robot Vacuums', slug: 'robot-vacuums', parent: 'home-appliances', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80' },
  { id: 'sub-home-kitchen', name: 'Air Fryers & Blenders', slug: 'kitchen-appliances', parent: 'home-appliances', image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=300&q=80' },

  // Accessories
  { id: 'sub-acc-powerbanks', name: 'Power Banks', slug: 'power-banks', parent: 'accessories', image: 'https://images.unsplash.com/photo-1609592424364-7dfcf7ea8548?w=300&q=80' },
  { id: 'sub-acc-audio', name: 'TWS Earbuds', slug: 'tws-earbuds', parent: 'accessories', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80' },
  { id: 'sub-acc-chargers', name: 'Fast Chargers', slug: 'fast-chargers', parent: 'accessories', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80' }
];

const banners = [
  {
    id: 'banner-1',
    title: 'Super Green Solar Power Solutions',
    subtitle: 'Save up to 70% on electricity bills with Tier-1 Mono PERC Panels',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1400&q=80',
    link: '/category/solar-green-energy',
    badge: 'Eco Energy Week'
  },
  {
    id: 'banner-2',
    title: 'Mega Gadget Festival 2026',
    subtitle: 'Official Flagship Phones, Laptops & Smartwatches with Brand Warranty',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400&q=80',
    link: '/category/mobile-phones',
    badge: 'Cash on Delivery BD'
  },
  {
    id: 'banner-3',
    title: 'High Performance Gaming & Workstations',
    subtitle: 'RTX 40-Series Powered Laptops for Creators & Gamers',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1400&q=80',
    link: '/category/laptops',
    badge: 'Zero EMI Available'
  },
  {
    id: 'banner-4',
    title: 'Premium Audio & Smart Wearables',
    subtitle: 'Noise Cancelling Earbuds & AMOLED Smartwatches at Unbeatable Prices',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&q=80',
    link: '/category/accessories',
    badge: 'Special Flash Sale'
  }
];

const products = [
  // --- Category: Solar & Green Energy (6 products) ---
  {
    id: 'prod-001',
    title: 'MaxitVolt 550W Mono PERC Half-Cut Solar Panel',
    slug: 'maxitvolt-550w-mono-perc-solar-panel',
    price: 18500,
    oldPrice: 21500,
    category: 'solar-green-energy',
    brand: 'MaxitVolt',
    stock: 25,
    isNew: false,
    isFeatured: true,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df570464756?w=600&q=80'
    ],
    shortDescription: 'High-efficiency 550W Tier-1 Mono PERC solar panel engineered for high ambient temperatures in Bangladesh.',
    description: 'The MaxitVolt 550W panel features 144 half-cut monocrystalline cells offering up to 21.3% conversion efficiency. Built with anti-reflective tempered glass and robust aluminum anodized frame, ideal for residential rooftops and industrial setups.',
    specs: {
      'Rated Power': '550 Watt',
      'Cell Type': 'Monocrystalline PERC (Half-Cut)',
      'Efficiency': '21.3%',
      'Max Voltage (Vmp)': '41.95V',
      'Max Current (Imp)': '13.12A',
      'Warranty': '25 Years Performance Guarantee'
    }
  },
  {
    id: 'prod-002',
    title: 'SolarTech 3.5kVA Pure Sine Wave Hybrid Inverter 24V',
    slug: 'solartech-35kva-pure-sine-wave-hybrid-inverter',
    price: 46000,
    oldPrice: 52000,
    category: 'solar-green-energy',
    brand: 'SolarTech',
    stock: 12,
    isNew: true,
    isFeatured: true,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80'
    ],
    shortDescription: '3500W solar hybrid inverter with built-in 80A MPPT charge controller and LCD telemetry.',
    description: 'Intelligent energy management for load shedding prevention. Supports both grid feedback, battery priority, and solar direct pass-through for running air conditioners, refrigerators, and PCs.',
    specs: {
      'Continuous Power': '3500W / 3500VA',
      'Battery Voltage': '24V DC',
      'MPPT Solar Charger': '80A (Up to 500V PV)',
      'Waveform': 'Pure Sine Wave',
      'Warranty': '2 Years Official Warranty'
    }
  },
  {
    id: 'prod-003',
    title: 'LithiumPro 100Ah 48V LiFePO4 Solar Energy Storage Battery',
    slug: 'lithiumpro-100ah-48v-lifepo4-battery',
    price: 88000,
    oldPrice: 96000,
    category: 'solar-green-energy',
    brand: 'LithiumPro',
    stock: 8,
    isNew: true,
    isFeatured: true,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80'
    ],
    shortDescription: 'Deep cycle 48V 100Ah Lithium Iron Phosphate battery with 6000+ lifecycle and smart BMS.',
    description: 'Wall-mounted lithium battery bank designed for modern hybrid solar systems. High thermal stability, zero maintenance, and compatible with all major hybrid inverters.',
    specs: {
      'Capacity': '5.12 kWh (48V 100Ah)',
      'Chemistry': 'LiFePO4 (Grade-A Cells)',
      'Cycle Life': '6000+ Cycles @ 80% DoD',
      'BMS Protection': 'Overcharge, Overdischarge, Temp Sensors',
      'Warranty': '5 Years Replacement Warranty'
    }
  },
  {
    id: 'prod-004',
    title: 'SunRay 100W All-in-One Integrated Solar Street Light',
    slug: 'sunray-100w-all-in-one-solar-street-light',
    price: 4800,
    oldPrice: 6200,
    category: 'solar-green-energy',
    brand: 'SunRay',
    stock: 45,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80'
    ],
    shortDescription: 'IP65 waterproof outdoor solar light with radar motion sensor and remote controller.',
    description: 'Ideal for rural roads, homestead pathways, gardens, and factory perimeter walls. Dusk to dawn operation with automatic brightness stepping when pedestrians or vehicles approach.',
    specs: {
      'LED Power': '100W Ultra-Bright Bridgelux Chips',
      'Battery': '12Ah 3.2V LifePO4',
      'Solar Panel': '15W Poly',
      'Waterproof Rating': 'IP65',
      'Runtime': '12-14 Hours full charge'
    }
  },
  {
    id: 'prod-005',
    title: 'EcoCharge 60A MPPT Solar Charge Controller 12V/24V/48V',
    slug: 'ecocharge-60a-mppt-solar-charge-controller',
    price: 7200,
    oldPrice: 8500,
    category: 'solar-green-energy',
    brand: 'EcoCharge',
    stock: 18,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80'
    ],
    shortDescription: 'High precision 99% tracking efficiency MPPT charge controller with back-lit LCD.',
    description: 'Maximizes power harvesting from solar arrays even during cloudy monsoon weather in Bangladesh. Multi-stage battery charging prolongs battery life.',
    specs: {
      'Current': '60 Ampere',
      'System Voltage': '12V / 24V / 36V / 48V Auto Detect',
      'Max PV Input': '150V DC',
      'Display': 'LCD with real-time solar harvest metrics'
    }
  },
  {
    id: 'prod-006',
    title: 'MaxitVolt Portable 200W Foldable Solar Briefcase for Camping',
    slug: 'maxitvolt-portable-200w-foldable-solar-briefcase',
    price: 14500,
    oldPrice: 17000,
    category: 'solar-green-energy',
    brand: 'MaxitVolt',
    stock: 14,
    isNew: true,
    isFeatured: false,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df570464756?w=600&q=80'
    ],
    shortDescription: 'Compact ETFE foldable solar kit with MC4 and DC outputs for portable power stations.',
    description: 'Designed for field workers, travelers, campers, and outdoor adventurers. Easily charges 12V battery banks, power stations, and smartphones via direct USB QC3.0.',
    specs: {
      'Power': '200W',
      'Folded Dimensions': '54 x 50 x 4 cm',
      'Outputs': 'MC4 18V, USB-A QC3.0, USB-C PD 45W',
      'Weight': '5.2 kg'
    }
  },

  // --- Category: Mobile Phones (7 products) ---
  {
    id: 'prod-007',
    title: 'Galaxy Ultra S24 5G (12GB RAM, 256GB Storage)',
    slug: 'galaxy-ultra-s24-5g-12gb-256gb',
    price: 142000,
    oldPrice: 155000,
    category: 'mobile-phones',
    brand: 'Samsung',
    stock: 15,
    isNew: true,
    isFeatured: true,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80'
    ],
    shortDescription: 'Snapdragon 8 Gen 3 for Galaxy, Titanium Frame, 200MP Quad Camera with Galaxy AI.',
    description: 'The pinnacle of smartphone engineering. Featuring a flat 6.8-inch Dynamic AMOLED 2X 120Hz display with Gorilla Armor glass, built-in S-Pen, and advanced photo assist AI.',
    specs: {
      'Display': '6.8" QHD+ Dynamic AMOLED 2X, 120Hz, 2600 nits',
      'Processor': 'Snapdragon 8 Gen 3 (4nm)',
      'Rear Camera': '200MP + 50MP + 12MP + 10MP',
      'Battery': '5000 mAh with 45W Fast Charging',
      'Network': '5G Dual SIM + eSIM'
    }
  },
  {
    id: 'prod-008',
    title: 'iPhone 15 Pro Max (256GB Storage, Natural Titanium)',
    slug: 'iphone-15-pro-max-256gb-natural-titanium',
    price: 168000,
    oldPrice: 179000,
    category: 'mobile-phones',
    brand: 'Apple',
    stock: 10,
    isNew: false,
    isFeatured: true,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80'
    ],
    shortDescription: 'A17 Pro chip, Aerospace-grade titanium, 5x Telephoto Optical Zoom, USB-C 3.',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, and the most versatile camera system ever on iPhone.',
    specs: {
      'Display': '6.7" Super Retina XDR with ProMotion 120Hz',
      'Chip': 'A17 Pro chip with 6-core GPU',
      'Camera': '48MP Main | 12MP Ultra Wide | 12MP 5x Telephoto',
      'Connector': 'USB-C with USB 3 support (up to 10Gb/s)'
    }
  },
  {
    id: 'prod-009',
    title: 'Redmi Note 13 Pro+ 5G (8GB RAM, 256GB)',
    slug: 'redmi-note-13-pro-plus-5g-8gb-256gb',
    price: 38500,
    oldPrice: 42000,
    category: 'mobile-phones',
    brand: 'Xiaomi',
    stock: 30,
    isNew: true,
    isFeatured: true,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80'
    ],
    shortDescription: '200MP OIS camera, 1.5K Curved AMOLED 120Hz display, 120W HyperCharge, IP68 water resistance.',
    description: 'Premium flagship features brought to the upper mid-range category. Features Dimensity 7200-Ultra processor and blazing fast 120W wired charging that reaches 100% in 19 minutes.',
    specs: {
      'Display': '6.67" 1.5K 120Hz Curved AMOLED',
      'Processor': 'MediaTek Dimensity 7200-Ultra',
      'Camera': '200MP Samsung ISOCELL HP3 with OIS',
      'Charging': '120W HyperCharge in-box charger'
    }
  },
  {
    id: 'prod-010',
    title: 'Pixel 8a 5G (8GB RAM, 128GB Storage)',
    slug: 'pixel-8a-5g-8gb-128gb',
    price: 54000,
    oldPrice: 59000,
    category: 'mobile-phones',
    brand: 'Google',
    stock: 14,
    isNew: true,
    isFeatured: false,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80'
    ],
    shortDescription: 'Google Tensor G3 chip, Best Take, Magic Audio Eraser, 7 years of OS and security updates.',
    description: 'The Google phone that does it all for less. Powered by Google Tensor G3 and the Titan M2 security coprocessor, capturing stunning photos in low light with Night Sight.',
    specs: {
      'Display': '6.1" Actua 120Hz OLED, 2000 nits',
      'Processor': 'Google Tensor G3',
      'Camera': '64MP Quad PD wide + 13MP Ultrawide',
      'OS': 'Android 14 with 7 Years Updates'
    }
  },
  {
    id: 'prod-011',
    title: 'OnePlus Nord CE4 5G (8GB RAM, 128GB)',
    slug: 'oneplus-nord-ce4-5g-8gb-128gb',
    price: 31500,
    oldPrice: 35000,
    category: 'mobile-phones',
    brand: 'OnePlus',
    stock: 22,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'
    ],
    shortDescription: 'Snapdragon 7 Gen 3, 100W SUPERVOOC charging, 5500mAh massive battery, 120Hz AMOLED.',
    description: 'Designed for fluid everyday performance with OxygenOS 14, Sony LYT-600 OIS camera, and industry-leading battery longevity.',
    specs: {
      'Display': '6.7" FHD+ AMOLED 120Hz',
      'Processor': 'Qualcomm Snapdragon 7 Gen 3',
      'Battery': '5500 mAh + 100W Fast Charger',
      'RAM/ROM': '8GB LPDDR4X / 128GB UFS 3.1'
    }
  },
  {
    id: 'prod-012',
    title: 'iPad Air 11-inch M2 Chip (128GB Wi-Fi, Space Gray)',
    slug: 'ipad-air-11-inch-m2-chip-128gb',
    price: 82000,
    oldPrice: 89000,
    category: 'mobile-phones',
    brand: 'Apple',
    stock: 11,
    isNew: true,
    isFeatured: true,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80'
    ],
    shortDescription: 'Supercharged by the Apple M2 chip, Liquid Retina display, Landscape 12MP front camera.',
    description: 'The redesigned iPad Air delivers incredible performance for AI, creative workflows, note taking with Apple Pencil Pro, and high-framerate mobile gaming.',
    specs: {
      'Display': '11-inch Liquid Retina with True Tone & P3 wide color',
      'Chip': 'Apple M2 with 8-core CPU and 9-core GPU',
      'Storage': '128GB SSD',
      'Accessories Support': 'Apple Pencil Pro and Magic Keyboard'
    }
  },
  {
    id: 'prod-013',
    title: 'Nokia 105 4G Feature Phone with Dual SIM & Wireless FM',
    slug: 'nokia-105-4g-dual-sim-feature-phone',
    price: 3200,
    oldPrice: 3600,
    category: 'mobile-phones',
    brand: 'Nokia',
    stock: 50,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80'
    ],
    shortDescription: 'HD voice calls over 4G LTE, built-in flashlight, long battery backup and crystal sound.',
    description: 'Reliable, rugged daily driver phone for elders, secondary SIM backup, or field staff. Features easy zoom menus and legendary Nokia build quality.',
    specs: {
      'Network': '4G VoLTE Dual SIM',
      'Battery': '1450 mAh Removable Battery (Days of standby)',
      'Display': '1.8" QQVGA',
      'Audio': '3.5mm jack, Wireless FM Radio, Loudspeaker'
    }
  },

  // --- Category: Laptops (7 products) ---
  {
    id: 'prod-014',
    title: 'MacBook Air 13.6-inch M3 Chip (16GB RAM, 512GB SSD)',
    slug: 'macbook-air-13-inch-m3-16gb-512gb',
    price: 172000,
    oldPrice: 185000,
    category: 'laptops',
    brand: 'Apple',
    stock: 9,
    isNew: true,
    isFeatured: true,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'
    ],
    shortDescription: 'Liquid Retina display, M3 with Hardware-accelerated ray tracing, MagSafe 3 charging, 18hr battery.',
    description: 'Blazingly fast and impossibly thin (11.3 mm). The fanless design ensures silent operation even under heavy computational workloads, coding, and 4K ProRes video rendering.',
    specs: {
      'Processor': 'Apple M3 chip (8-core CPU, 10-core GPU)',
      'Memory': '16GB Unified Memory',
      'Storage': '512GB NVMe SSD',
      'Display': '13.6" Liquid Retina (2560x1664, 500 nits)',
      'Battery Life': 'Up to 18 hours'
    }
  },
  {
    id: 'prod-015',
    title: 'ASUS ROG Zephyrus G16 RTX 4070 Gaming Laptop',
    slug: 'asus-rog-zephyrus-g16-rtx-4070',
    price: 245000,
    oldPrice: 268000,
    category: 'laptops',
    brand: 'ASUS',
    stock: 6,
    isNew: true,
    isFeatured: true,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80'
    ],
    shortDescription: 'Intel Core Ultra 9 185H, NVIDIA RTX 4070 8GB, 2.5K 240Hz OLED ROG Nebula Display.',
    description: 'CNC aluminum unibody gaming marvel. Combines cutting edge Intel AI NPU architecture with NVIDIA DLSS 3.5 graphics and a sublime 0.2ms response time OLED display.',
    specs: {
      'CPU': 'Intel Core Ultra 9 185H (16 Cores, 22 Threads)',
      'GPU': 'NVIDIA GeForce RTX 4070 8GB GDDR6',
      'RAM': '32GB LPDDR5X 7467MHz',
      'Storage': '1TB PCIe 4.0 NVMe M.2 SSD',
      'Screen': '16" 2.5K 240Hz 0.2ms ROG Nebula OLED'
    }
  },
  {
    id: 'prod-016',
    title: 'Lenovo ThinkPad X1 Carbon Gen 12 Ultrabook',
    slug: 'lenovo-thinkpad-x1-carbon-gen-12',
    price: 215000,
    oldPrice: 230000,
    category: 'laptops',
    brand: 'Lenovo',
    stock: 8,
    isNew: false,
    isFeatured: true,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80'
    ],
    shortDescription: 'Intel Core Ultra 7 155H, 16GB RAM, 1TB SSD, Carbon-fiber chassis, Military-grade durability.',
    description: 'The quintessential business laptop. Renowned ergonomic keyboard with TrackPoint, enterprise dTPM 2.0 security, and a 14-inch 2.8K OLED HDR anti-glare display.',
    specs: {
      'CPU': 'Intel Core Ultra 7 155H',
      'Display': '14.0" 2.8K (2880 x 1800) OLED 120Hz 400 nits',
      'RAM': '16GB LPDDR5x',
      'Weight': '1.09 kg',
      'Security': 'Fingerprint reader, IR Camera with Privacy Shutter'
    }
  },
  {
    id: 'prod-017',
    title: 'Dell Inspiron 15 3520 (Intel Core i5-1235U, 8GB, 512GB SSD)',
    slug: 'dell-inspiron-15-3520-core-i5',
    price: 66000,
    oldPrice: 72000,
    category: 'laptops',
    brand: 'Dell',
    stock: 20,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80'
    ],
    shortDescription: '15.6" 120Hz FHD display, 12th Gen Intel Core i5, express charge battery, full numeric keypad.',
    description: 'Great for students and remote office professionals in Bangladesh. Built with lift hinge design for comfortable typing posture and enhanced thermals.',
    specs: {
      'Processor': 'Intel Core i5-1235U (10 Cores, up to 4.4GHz)',
      'RAM': '8GB DDR4 3200MHz (Upgradable)',
      'Storage': '512GB M.2 PCIe NVMe SSD',
      'Display': '15.6" FHD 120Hz Anti-Glare WVA'
    }
  },
  {
    id: 'prod-018',
    title: 'HP Pavilion 14 (Core i7-1355U, 16GB RAM, 512GB SSD, Silver)',
    slug: 'hp-pavilion-14-core-i7-1355u',
    price: 94000,
    oldPrice: 102000,
    category: 'laptops',
    brand: 'HP',
    stock: 12,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80'
    ],
    shortDescription: '13th Gen Intel Core i7, B&O Audio, Backlit Keyboard, Fingerprint Reader, Fast Charging.',
    description: 'Sleek aluminum cover laptop with all-day battery life, vivid micro-edge IPS display, and audio tuned by Bang & Olufsen for crystal-clear virtual meetings.',
    specs: {
      'CPU': 'Intel Core i7-1355U (Up to 5.0 GHz with Turbo Boost)',
      'RAM': '16GB DDR4-3200 MHz',
      'Display': '14.0" diagonal FHD IPS Micro-edge',
      'Audio': 'Audio by B&O Dual Speakers'
    }
  },
  {
    id: 'prod-019',
    title: 'Acer Nitro V 15 (Core i5-13420H, RTX 4050 6GB, 16GB, 512GB)',
    slug: 'acer-nitro-v-15-rtx-4050',
    price: 116000,
    oldPrice: 128000,
    category: 'laptops',
    brand: 'Acer',
    stock: 10,
    isNew: true,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80'
    ],
    shortDescription: 'Next-gen budget gaming king with 144Hz IPS display, RTX 4050 Ray Tracing, and dual-fan cooling.',
    description: 'Dominate esports titles like Valorant, CS2, GTA V, and Cyberpunk. Supports high-speed Wi-Fi 6 and DTS:X Ultra audio for directional spatial sound.',
    specs: {
      'GPU': 'NVIDIA GeForce RTX 4050 with 6GB GDDR6',
      'CPU': 'Intel Core i5-13420H 8 Cores',
      'Screen': '15.6" 144Hz FHD IPS SlimBezel',
      'Cooling': 'Dual-Fan, Dual-Intake Exhaust'
    }
  },
  {
    id: 'prod-020',
    title: 'UGREEN 9-in-1 USB-C Hub with 4K HDMI & 100W PD',
    slug: 'ugreen-9-in-1-usb-c-hub-4k-hdmi-100w',
    price: 4200,
    oldPrice: 4900,
    category: 'laptops',
    brand: 'UGREEN',
    stock: 35,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&q=80'
    ],
    shortDescription: 'Expands MacBook or Windows laptop with 4K@60Hz HDMI, Gigabit Ethernet, 100W PD, SD/TF card slot.',
    description: 'Aircraft aluminum shell dissipates heat efficiently. Plug and play compatibility with macOS, Windows 11, ChromeOS, and iPadOS.',
    specs: {
      'Ports': 'HDMI 4K@60Hz, RJ45 Gigabit, 3x USB 3.0, 100W PD, SD/TF',
      'Material': 'Aluminum Alloy',
      'Compatibility': 'Universal USB-C / Thunderbolt 3 & 4'
    }
  },

  // --- Category: Smart Watches (6 products) ---
  {
    id: 'prod-021',
    title: 'Apple Watch Ultra 2 (GPS + Cellular, 49mm Titanium Case)',
    slug: 'apple-watch-ultra-2-49mm-titanium',
    price: 98000,
    oldPrice: 108000,
    category: 'smart-watches',
    brand: 'Apple',
    stock: 7,
    isNew: false,
    isFeatured: true,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'
    ],
    shortDescription: 'The ultimate sports and adventure watch. S9 SiP, 3000-nit display, Precision Dual-Frequency GPS.',
    description: 'Rugged titanium case with sapphire front crystal. 100m water resistance, EN13319 certification for recreational scuba diving, and up to 72 hours of battery in Low Power Mode.',
    specs: {
      'Case': '49mm Aerospace-grade Titanium',
      'Display': 'Always-On Retina OLED, 3000 nits max brightness',
      'Sensors': 'Depth gauge, Water temp, ECG, Blood Oxygen, Temp sensor',
      'Connectivity': 'LTE and UMTS, Wi-Fi 4, Bluetooth 5.3'
    }
  },
  {
    id: 'prod-022',
    title: 'Samsung Galaxy Watch 6 Classic (47mm, Bluetooth, Black)',
    slug: 'samsung-galaxy-watch-6-classic-47mm',
    price: 36000,
    oldPrice: 41000,
    category: 'smart-watches',
    brand: 'Samsung',
    stock: 14,
    isNew: true,
    isFeatured: true,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80'
    ],
    shortDescription: 'Iconic rotating bezel, Sapphire Crystal Glass, Advanced Sleep Coaching, BIA Body Composition.',
    description: 'Timeless styling paired with cutting edge wellness tracking. Measures skeletal muscle, body fat percentage, heart rate alerts, and personalized heart rate zones.',
    specs: {
      'Screen': '1.5" Super AMOLED Sapphire Crystal (480x480)',
      'OS': 'Wear OS powered by Samsung',
      'Bezel': 'Physical Rotating Stainless Steel',
      'Water Resistance': '5ATM + IP68 / MIL-STD-810H'
    }
  },
  {
    id: 'prod-023',
    title: 'Amazfit GTR 4 Smartwatch with Dual-Band GPS & Alexa',
    slug: 'amazfit-gtr-4-smartwatch',
    price: 19500,
    oldPrice: 22500,
    category: 'smart-watches',
    brand: 'Amazfit',
    stock: 18,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80'
    ],
    shortDescription: '14-day battery life, 1.43" HD AMOLED, Bluetooth phone calls, 150+ sports modes, BioTracker 4.0.',
    description: 'Industry-first circularly polarized dual-band GPS antenna provides 99% accuracy matching handheld GPS locators. Broadcasts sports data live through headphones.',
    specs: {
      'Battery': '475 mAh (14 Days Typical Usage)',
      'Display': '1.43" AMOLED 326 PPI Anti-fingerprint Glass',
      'Health': 'BioTracker 4.0 PPG biometric optical sensor',
      'Calling': 'Microphone and Loudspeaker built-in'
    }
  },
  {
    id: 'prod-024',
    title: 'Kieslect Ks Pro Calling Smart Watch (2.01" AMOLED)',
    slug: 'kieslect-ks-pro-calling-smartwatch',
    price: 6800,
    oldPrice: 7900,
    category: 'smart-watches',
    brand: 'Kieslect',
    stock: 40,
    isNew: true,
    isFeatured: true,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80'
    ],
    shortDescription: 'Massive 2.01-inch super AMOLED display, abnormal heart rate alert, stable Bluetooth 5.2 phone calls.',
    description: 'Extremely popular in Bangladesh for its vivid high-contrast curved AMOLED screen, stylish magnetic straps, Bengali language font support, and clear speaker calls.',
    specs: {
      'Display': '2.01" FHD AMOLED (410x502 resolution)',
      'Body': 'Sleek metal casing with rotating crown',
      'Battery': 'Up to 6-8 days typical usage',
      'Features': 'AI Voice Assistant, 100 Sports Modes, IP68'
    }
  },
  {
    id: 'prod-025',
    title: 'Xiaomi Smart Band 8 (1.62" AMOLED 60Hz Fitness Tracker)',
    slug: 'xiaomi-smart-band-8',
    price: 3600,
    oldPrice: 4200,
    category: 'smart-watches',
    brand: 'Xiaomi',
    stock: 55,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80'
    ],
    shortDescription: '60Hz high refresh rate screen, quick-release stylish strap system, 16-day battery life, 5ATM.',
    description: 'Wear it on your wrist, as a necklace pendant, or clip it to your running shoe to track posture, cadence, and stride length with Pebble Mode.',
    specs: {
      'Screen': '1.62" AMOLED 60Hz 600 nits auto-brightness',
      'Sensors': '6-axis sensor, PPG heart rate sensor',
      'Battery': '190 mAh (16 Days on single charge)',
      'Charging': 'Magnetic fast charging (1 Hour full)'
    }
  },
  {
    id: 'prod-026',
    title: 'Havit M9030 Wireless Charging Calling Smart Watch',
    slug: 'havit-m9030-wireless-charging-smartwatch',
    price: 4500,
    oldPrice: 5300,
    category: 'smart-watches',
    brand: 'Havit',
    stock: 25,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80'
    ],
    shortDescription: 'Wireless magnetic charging base, HD Bluetooth dialer, metallic bezel, sleep monitor.',
    description: 'Premium look with zinc alloy craftsmanship. Supports customizable watch faces and full social media notification alerts.',
    specs: {
      'Display': '1.39" TFT Full Touch Screen',
      'Battery': '260 mAh with Wireless Dock',
      'Waterproof': 'IP67 Daily Splash Proof'
    }
  },

  // --- Category: Home Appliances (7 products) ---
  {
    id: 'prod-027',
    title: 'Xiaomi Robot Vacuum S10+ with LDS Laser Navigation',
    slug: 'xiaomi-robot-vacuum-s10-plus',
    price: 38500,
    oldPrice: 44000,
    category: 'home-appliances',
    brand: 'Xiaomi',
    stock: 8,
    isNew: true,
    isFeatured: true,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80'
    ],
    shortDescription: '4000Pa suction power, dual-pad pressure mopping, 3D obstacle avoidance, 5200mAh battery.',
    description: 'Keeps your apartment spotless. Maps multi-floor spaces accurately with 360-degree LiDAR, avoiding shoes, carpets, and cables while delivering spotless mopping with water tank control.',
    specs: {
      'Suction Power': '4000Pa Fan Blower',
      'Battery Capacity': '5200 mAh (Cleans up to 200 sqm)',
      'Mopping': 'Dual Rotary Pads with 200ml Electronic Tank',
      'Control': 'Mi Home / Xiaomi Home App & Google Assistant'
    }
  },
  {
    id: 'prod-028',
    title: 'Philips Digital Air Fryer XL 6.2L (Rapid Air Tech, 2000W)',
    slug: 'philips-digital-air-fryer-xl-6-2l',
    price: 18500,
    oldPrice: 22000,
    category: 'home-appliances',
    brand: 'Philips',
    stock: 16,
    isNew: false,
    isFeatured: true,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&q=80'
    ],
    shortDescription: 'Fry with up to 90% less oil. Touchscreen with 7 preset cooking programs and keep warm function.',
    description: 'Rapid Air Technology with its unique starfish bottom design swirls hot air to create delicious foods that are crispy on the outside and tender on the inside.',
    specs: {
      'Capacity': '6.2 Liters (1.2 kg basket for 5 portions)',
      'Power': '2000 Watts',
      'Temperature Range': '40°C - 200°C',
      'Dishwasher Safe': 'QuickClean basket and non-stick drawer'
    }
  },
  {
    id: 'prod-029',
    title: 'Gree 1.5 Ton Inverter Air Conditioner (Pular Series, WiFi)',
    slug: 'gree-15-ton-inverter-ac-pular',
    price: 68500,
    oldPrice: 75000,
    category: 'home-appliances',
    brand: 'Gree',
    stock: 10,
    isNew: false,
    isFeatured: true,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80'
    ],
    shortDescription: '18000 BTU, 60% energy saving, Golden Fin anti-corrosion condenser, ultra-quiet cooling.',
    description: 'Engineered for extreme heatwaves in Bangladesh. Cold plasma generator purifies indoor air by eliminating dust mites, smoke, and odors.',
    specs: {
      'Capacity': '1.5 Ton (18,000 BTU/hr)',
      'Refrigerant': 'Eco-Friendly R32',
      'Compressor': 'Tropical Dual-Rotary Inverter',
      'Warranty': '10 Years Compressor Warranty'
    }
  },
  {
    id: 'prod-030',
    title: 'Panasonic 27L Convection Microwave Oven (Magic Grill)',
    slug: 'panasonic-27l-convection-microwave-oven',
    price: 24500,
    oldPrice: 28000,
    category: 'home-appliances',
    brand: 'Panasonic',
    stock: 12,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&q=80'
    ],
    shortDescription: 'Bake, roast, grill and reheat with 101 auto cook menus and zero oil cooking recipes.',
    description: 'Stainless steel cavity ensures uniform heat distribution and durability. Features compact design with maximum internal turntable diameter.',
    specs: {
      'Capacity': '27 Liters',
      'Power Output': '900W Microwave / 1400W Grill',
      'Control': 'Touch Key Pad with LED Display'
    }
  },
  {
    id: 'prod-031',
    title: 'Kent Grand Plus RO + UV + UF Water Purifier with TDS Controller',
    slug: 'kent-grand-plus-ro-water-purifier',
    price: 26500,
    oldPrice: 30000,
    category: 'home-appliances',
    brand: 'Kent',
    stock: 15,
    isNew: true,
    isFeatured: false,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80'
    ],
    shortDescription: 'Multi-stage purification with in-tank UV disinfection. Purifies tap and groundwater across BD.',
    description: 'Retains essential natural minerals using patented Mineral RO technology. Fully automatic operation with filter change alarm and UV fail alarm.',
    specs: {
      'Storage Tank': '9 Liters',
      'Purification Rate': 'Up to 20 L/hour',
      'Membrane': 'Thin Film Composite RO',
      'Input Water Pressure': '0.3 kg/cm² to 3.0 kg/cm²'
    }
  },
  {
    id: 'prod-032',
    title: 'Miyako 750W Heavy Duty Food Processor & Blender (4-in-1)',
    slug: 'miyako-750w-heavy-duty-food-processor',
    price: 5200,
    oldPrice: 6000,
    category: 'home-appliances',
    brand: 'Miyako',
    stock: 30,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&q=80'
    ],
    shortDescription: '100% copper motor, unbreakable polycarbonate jars, stainless steel blades for spices and pastes.',
    description: 'Household staple in Bangladesh for blending turmeric, ginger, garlic pastes, and making fresh fruit juices with pulse speed regulator.',
    specs: {
      'Motor': '750W 100% Copper Winding with Overload Protector',
      'Jars': 'Wet Grinding, Dry Grinding, Chutney Jar, Juice Extractor',
      'Speed': '3 Speed Settings with Pulse'
    }
  },
  {
    id: 'prod-033',
    title: 'Baseus Blade 100W 20000mAh Ultra-Thin Power Bank',
    slug: 'baseus-blade-100w-20000mah-power-bank',
    price: 6500,
    oldPrice: 7500,
    category: 'home-appliances',
    brand: 'Baseus',
    stock: 25,
    isNew: true,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1609592424364-7dfcf7ea8548?w=600&q=80'
    ],
    shortDescription: 'Slim 18mm profile, 100W Power Delivery capable of charging MacBook Pro and laptops on the go.',
    description: 'Features digital status screen showing remaining battery percentage, charging wattage, and estimated completion time in real-time.',
    specs: {
      'Capacity': '20000mAh / 74Wh',
      'Max Output': '100W via Type-C PD 3.0',
      'Ports': '2x USB Type-C + 2x USB-A QC4.0',
      'Thickness': '18mm ultra-slim book style'
    }
  },

  // --- Category: Accessories (7 products) ---
  {
    id: 'prod-034',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    slug: 'sony-wh-1000xm5-wireless-headphones',
    price: 36000,
    oldPrice: 42000,
    category: 'accessories',
    brand: 'Sony',
    stock: 9,
    isNew: false,
    isFeatured: true,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80'
    ],
    shortDescription: 'Industry leading active noise cancellation with 8 microphones, 30hr battery, LDAC Hi-Res Audio.',
    description: 'Auto NC Optimizer automatically adjusts noise cancelling based on your wearing conditions and environmental pressure. Speak-to-chat pauses music instantly when you talk.',
    specs: {
      'Battery Life': 'Up to 30 hours (NC ON), 40 hours (NC OFF)',
      'Drivers': '30mm specially engineered carbon-fiber composite',
      'Codecs': 'LDAC, AAC, SBC with DSEE Extreme audio upscaling',
      'Weight': '250 grams lightweight luxury leatherette'
    }
  },
  {
    id: 'prod-035',
    title: 'AirPods Pro 2nd Gen with USB-C MagSafe Case',
    slug: 'airpods-pro-2nd-gen-usb-c',
    price: 28500,
    oldPrice: 32000,
    category: 'accessories',
    brand: 'Apple',
    stock: 16,
    isNew: true,
    isFeatured: true,
    isDeal: false,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80'
    ],
    shortDescription: 'H2 chip, Adaptive Audio, Active Noise Cancellation, Personalized Spatial Audio with dynamic head tracking.',
    description: 'Up to 2x more active noise cancellation than previous generation. Dust, sweat, and water resistant (IP54) for both earbuds and case with built-in Precision Finding speaker.',
    specs: {
      'Audio Chip': 'Apple H2 chip in earbuds, U1 in case',
      'Battery': 'Up to 6 hours listening on single charge (30 hrs with case)',
      'Charging': 'USB-C, MagSafe, Apple Watch charger, Qi certified'
    }
  },
  {
    id: 'prod-036',
    title: 'Anker 737 Power Bank (PowerCore 24K, 140W Output)',
    slug: 'anker-737-power-bank-24k-140w',
    price: 13500,
    oldPrice: 15500,
    category: 'accessories',
    brand: 'Anker',
    stock: 14,
    isNew: false,
    isFeatured: true,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1609592424364-7dfcf7ea8548?w=600&q=80'
    ],
    shortDescription: 'Ultra-powerful 140W bi-directional charging with smart digital color display and ActiveShield 2.0.',
    description: 'Equipped with the latest Power Delivery 3.1 and bi-directional technology to quickly recharge the power bank itself at 140W in under 52 minutes while fueling laptops and phones.',
    specs: {
      'Capacity': '24,000 mAh (Charges iPhone 15 five times)',
      'Total Output': '140W max via single USB-C port',
      'Ports': '2x USB-C + 1x USB-A'
    }
  },
  {
    id: 'prod-037',
    title: 'UGREEN Nexode 65W GaN Fast Charger (3-Port)',
    slug: 'ugreen-nexode-65w-gan-fast-charger',
    price: 3200,
    oldPrice: 3800,
    category: 'accessories',
    brand: 'UGREEN',
    stock: 35,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80'
    ],
    shortDescription: 'Gallium Nitride (GaN) technology charges laptops, tablets and smartphones simultaneously.',
    description: '50% smaller than standard 65W power bricks. Thermal Guard system monitors temperature 800 times per second for safe overnight charging.',
    specs: {
      'Output': '65W Max Power Delivery',
      'Ports': '2x USB-C + 1x USB-A',
      'Protocols': 'PD 3.0, QC 4.0+, PPS, SCP, FCP, AFC'
    }
  },
  {
    id: 'prod-038',
    title: 'Samsung 25W Type-C Super Fast Wall Charger (Original Adapter)',
    slug: 'samsung-25w-super-fast-wall-charger',
    price: 1650,
    oldPrice: 2100,
    category: 'accessories',
    brand: 'Samsung',
    stock: 60,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80'
    ],
    shortDescription: 'Official Samsung Power Delivery adapter with Power Delivery 3.0 PPS protocol.',
    description: 'Gives Galaxy smartphones, earbuds and tablets optimal 25W super fast charge capability with zero heating.',
    specs: {
      'Input': '100-240V AC 50-60Hz',
      'Output': 'PDO: 9V/2.77A | PPS: 3.3-5.9V/3A or 3.3-11V/2.25A',
      'Color': 'Black'
    }
  },
  {
    id: 'prod-039',
    title: 'Baseus Cafule Braided 100W Type-C to Type-C Cable (2 Meter)',
    slug: 'baseus-cafule-100w-type-c-cable-2m',
    price: 750,
    oldPrice: 950,
    category: 'accessories',
    brand: 'Baseus',
    stock: 80,
    isNew: false,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&q=80'
    ],
    shortDescription: 'High density nylon braided 5A 100W PD charging cable with E-Marker smart chip.',
    description: 'Tangle-resistant cable with zinc alloy reinforced connectors tested for over 10,000 bends. Supports 480Mbps data transfer speed.',
    specs: {
      'Current/Wattage': '20V 5A (100W Max)',
      'Length': '2 Meters (6.6 ft)',
      'Material': 'High-density woven nylon braid + Aluminum alloy'
    }
  },
  {
    id: 'prod-040',
    title: 'QCY T13 ANC Wireless Earbuds with 28dB Active Noise Cancellation',
    slug: 'qcy-t13-anc-wireless-earbuds',
    price: 2100,
    oldPrice: 2600,
    category: 'accessories',
    brand: 'QCY',
    stock: 45,
    isNew: true,
    isFeatured: false,
    isDeal: true,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80'
    ],
    shortDescription: 'Affordable noise cancelling earbuds with 4-mic crystal call quality and 30-hour playback.',
    description: '10mm bio-diaphragm dynamic driver produces deep punchy bass. Customize EQ profiles through the dedicated QCY Companion App.',
    specs: {
      'Noise Reduction': '28dB Active Noise Cancellation',
      'Bluetooth': 'V5.3 low latency gaming mode 68ms',
      'Battery': '7 hours per charge, 30 hours total with case',
      'Waterproof': 'IPX5 Sweat and rain resistant'
    }
  }
];

// In-memory orders store
let orders = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-2026-1001',
    customerName: 'Tanvir Hossain',
    phone: '01712345678',
    address: 'House 42, Road 7, Block C, Dhanmondi',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Dhanmondi',
    items: [
      {
        id: 'prod-024',
        title: 'Kieslect Ks Pro Calling Smart Watch (2.01" AMOLED)',
        price: 6800,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80'
      }
    ],
    subtotal: 6800,
    deliveryCharge: 80,
    total: 6880,
    paymentMethod: 'cod',
    note: 'Please call before delivery',
    status: 'Processing', // Placed, Processing, Shipped, Delivered, Cancelled
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-2026-1002',
    customerName: 'Farhana Ahmed',
    phone: '01898765432',
    address: 'Agrabad C/A, Street 3',
    division: 'Chittagong',
    district: 'Chittagong',
    area: 'Agrabad',
    items: [
      {
        id: 'prod-037',
        title: 'UGREEN Nexode 65W GaN Fast Charger (3-Port)',
        price: 3200,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80'
      }
    ],
    subtotal: 6400,
    deliveryCharge: 130,
    total: 6530,
    paymentMethod: 'cod',
    note: 'Office address delivery between 10am-5pm',
    status: 'Shipped',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

module.exports = {
  categories,
  banners,
  products,
  orders
};
