// Complete seed data modeled after nanopowerbd.com taxonomy for maxitshop
const seedData = {
  categories: [
    {
      id: "cat-battery-bms-charger",
      name: "BATTERY-BMS-CHARGER",
      slug: "battery-bms-charger",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&q=80",
      icon: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=100&q=80",
      description: "LiFePO4, Lithium Ion Batteries, Active Balancers, Smart BMS & Chargers",
      order: 1,
      isActive: true
    },
    {
      id: "cat-solar-energy",
      name: "SOLAR ENERGY",
      slug: "solar-energy",
      image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80",
      icon: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=100&q=80",
      description: "Tier-1 Solar Panels, Hybrid Inverters, Solar Controllers & Mounting",
      order: 2,
      isActive: true
    },
    {
      id: "cat-customized-circuit-pcb",
      name: "CUSTOMIZED CIRCUIT - PCB",
      slug: "customized-circuit-pcb",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
      icon: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&q=80",
      description: "Custom Servo AVR Control Cards, Inverter Motherboards & Circuit Solutions",
      order: 3,
      isActive: true
    },
    {
      id: "cat-modules-sensor",
      name: "MODULES & SENSOR",
      slug: "modules-sensor",
      image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&q=80",
      icon: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=100&q=80",
      description: "Current Sensors, Temperature, Proximity, Relay Modules & Smart Controllers",
      order: 4,
      isActive: true
    },
    {
      id: "cat-igbt-fet-diode-transistor",
      name: "IGBT-FET-DIODE-TRANSISTOR",
      slug: "igbt-fet-diode-transistor",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80",
      icon: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&q=80",
      description: "Power IGBT Modules, Fast Recovery Diodes, MOSFETs & Power Transistors",
      order: 5,
      isActive: true
    },
    {
      id: "cat-electronics-parts",
      name: "ELECTRONICS PARTS",
      slug: "electronics-parts",
      image: "https://images.unsplash.com/photo-1517055729441-375a27788e77?w=400&q=80",
      icon: "https://images.unsplash.com/photo-1517055729441-375a27788e77?w=100&q=80",
      description: "Microcontrollers, Capacitors, Resistors, Optocouplers & Connectors",
      order: 6,
      isActive: true
    },
    {
      id: "cat-lt-ht-power-goods",
      name: "LT-HT POWER GOODS",
      slug: "lt-ht-power-goods",
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80",
      icon: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=100&q=80",
      description: "Transformers, Drop-out Fuses, Vacuum Circuit Breakers & Switchgear",
      order: 7,
      isActive: true
    },
    {
      id: "cat-tools-hardware",
      name: "TOOLS - HARDWARE",
      slug: "tools-hardware",
      image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&q=80",
      icon: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=100&q=80",
      description: "Multimeters, Crimping Tools, Hex Keys, Soldering Stations & Precision Kits",
      order: 8,
      isActive: true
    },
    {
      id: "cat-safety-security",
      name: "SAFETY - SECURITY",
      slug: "safety-security",
      image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&q=80",
      icon: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=100&q=80",
      description: "IP Cameras, NVR, Smart Door Locks, Fire Extinguishers & Industrial Safety",
      order: 9,
      isActive: true
    },
    {
      id: "cat-automation-process-cont",
      name: "AUTOMATION-PROCESS CONT.",
      slug: "automation-process-cont",
      image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&q=80",
      icon: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=100&q=80",
      description: "Siemens PLC, VFD Drives, HMI Displays & Industrial Automation Cards",
      order: 10,
      isActive: true
    },
    {
      id: "cat-service-maintenance",
      name: "SERVICE & MAINTENANCE",
      slug: "service-maintenance",
      image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&q=80",
      icon: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=100&q=80",
      description: "Solar Inverter Repairing, IPS Maintenance & Engineering Service Support",
      order: 11,
      isActive: true
    }
  ],

  brands: [
    {
      id: "brand-canadian-solar",
      name: "Canadian Solar",
      slug: "canadian-solar",
      logo: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=200&q=80",
      website: "https://www.canadiansolar.com",
      description: "Global leader in solar power and energy storage solutions."
    },
    {
      id: "brand-huawei",
      name: "Huawei Inverter",
      slug: "huawei",
      logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80",
      website: "https://solar.huawei.com",
      description: "Smart PV & Energy Storage solutions powering digital power worldwide."
    },
    {
      id: "brand-jinko-solar",
      name: "Jinko Solar",
      slug: "jinko-solar",
      logo: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=200&q=80",
      website: "https://www.jinkosolar.com",
      description: "World largest and most innovative solar panel technology provider."
    },
    {
      id: "brand-rec-solar",
      name: "REC Solar",
      slug: "rec-solar",
      logo: "https://images.unsplash.com/photo-1508873696983-2df570464756?w=200&q=80",
      website: "https://www.recgroup.com",
      description: "Premium solar panel manufacturer with high power density."
    },
    {
      id: "brand-solax-power",
      name: "Solax Power",
      slug: "solax-power",
      logo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&q=80",
      website: "https://www.solaxpower.com",
      description: "Pioneering residential and commercial solar hybrid inverters."
    },
    {
      id: "brand-goodwe",
      name: "GoodWe",
      slug: "goodwe",
      logo: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80",
      website: "https://www.goodwe.com",
      description: "Smart energy innovator providing solar inverters and energy solutions."
    },
    {
      id: "brand-siemens",
      name: "Siemens",
      slug: "siemens",
      logo: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=200&q=80",
      website: "https://www.siemens.com",
      description: "Industrial engineering, PLC automation, and control equipment."
    },
    {
      id: "brand-microchip",
      name: "Microchip",
      slug: "microchip",
      logo: "https://images.unsplash.com/photo-1517055729441-375a27788e77?w=200&q=80",
      website: "https://www.microchip.com",
      description: "Smart, connected and secure embedded control solutions."
    },
    {
      id: "brand-nano-power",
      name: "Nano Power",
      slug: "nano-power",
      logo: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=200&q=80",
      website: "#",
      description: "Authentic customized batteries, BMS, chargers and power boards."
    },
    {
      id: "brand-meco",
      name: "MECO",
      slug: "meco",
      logo: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=200&q=80",
      website: "#",
      description: "Reliable portable power stations, inverters, and battery accessories."
    }
  ],

  banners: [
    {
      id: "banner-1",
      title: "Sustainable Solar Energy Systems for Homes & Businesses",
      image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1400&q=80",
      link: "/category/solar-energy",
      order: 1,
      active: true
    },
    {
      id: "banner-2",
      title: "Grade-A LiFePO4 Battery Cells & Smart Bluetooth BMS",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1400&q=80",
      link: "/category/battery-bms-charger",
      order: 2,
      active: true
    },
    {
      id: "banner-3",
      title: "Smart Hybrid Inverters with Peak Load Shaving",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&q=80",
      link: "/category/solar-energy",
      order: 3,
      active: true
    },
    {
      id: "banner-4",
      title: "Industrial Automation, Siemens PLC & Power Controllers",
      image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1400&q=80",
      link: "/category/automation-process-cont",
      order: 4,
      active: true
    },
    {
      id: "banner-5",
      title: "Smart Security, Surveillance IP Cameras & NVR Systems",
      image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1400&q=80",
      link: "/category/safety-security",
      order: 5,
      active: true
    },
    {
      id: "banner-6",
      title: "High Performance Active Equalizers & Lithium Battery Chargers",
      image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=1400&q=80",
      link: "/category/battery-bms-charger",
      order: 6,
      active: true
    },
    {
      id: "banner-7",
      title: "Precision Hardware Tools & Professional Electrician Kits",
      image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1400&q=80",
      link: "/category/tools-hardware",
      order: 7,
      active: true
    },
    {
      id: "banner-8",
      title: "Engineering Repair & Maintenance for High Power Inverters",
      image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=1400&q=80",
      link: "/category/service-maintenance",
      order: 8,
      active: true
    }
  ],

  // 40 Products across categories with realistic BDT prices and specifications
  products: [
    // 1-8: BATTERY-BMS-CHARGER
    {
      id: "prod-1",
      title: "Lifepo4 3.2V 173Ah Grade A Battery 6000+ Cycle Cells",
      slug: "lifepo4-3-2v-173ah-grade-a-battery-cells",
      price: 7200,
      oldPrice: 8000,
      category: "battery-bms-charger",
      brand: "Nano Power",
      stock: 35,
      images: [
        "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80"
      ],
      shortDescription: "Grade-A 173Ah prismatic LiFePO4 cells engineered for DIY 12V/24V/48V solar backup.",
      description: "High capacity Grade A LiFePO4 cell with over 6000 cycles at 80% DoD. Features low internal resistance (<0.3mΩ) and laser welded M6 terminals for reliable busbar connection. Ideal for home energy storage, solar RVs, and high-load backup.",
      specs: {
        "Nominal Voltage": "3.2V",
        "Capacity": "173Ah",
        "Cycle Life": "6000+ Cycles (0.5C/0.5C)",
        "Internal Resistance": "<0.35 mΩ",
        "Max Discharge": "1C Continuous (173A)"
      },
      rating: 4.9,
      reviewCount: 42,
      isDeal: true,
      isFeatured: true,
      isNewItem: false
    },
    {
      id: "prod-2",
      title: "12V 100Ah LiFePO4 Lithium Battery with Smart 100A BMS",
      slug: "12v-100ah-lifepo4-battery-smart-100a-bms",
      price: 36500,
      oldPrice: 42000,
      category: "battery-bms-charger",
      brand: "Nano Power",
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80"
      ],
      shortDescription: "Complete plug-and-play drop-in replacement for 12V lead-acid batteries.",
      description: "Engineered with integrated 100A smart BMS protecting against overcharge, over-discharge, short-circuit, and high/low temperature. Delivers 1280Wh of usable energy at 1/3rd the weight of SLA batteries.",
      specs: {
        "Nominal Voltage": "12.8V",
        "Nominal Energy": "1280Wh",
        "Max Charge Current": "50A",
        "Max Continuous Discharge": "100A",
        "Weight": "11.2 kg"
      },
      rating: 5.0,
      reviewCount: 28,
      isDeal: true,
      isFeatured: true,
      isNewItem: true
    },
    {
      id: "prod-3",
      title: "4A Active Equalizer Balancer for 4S-24S Lithium Batteries",
      slug: "4a-active-equalizer-balancer-lithium-batteries",
      price: 2850,
      oldPrice: 3400,
      category: "battery-bms-charger",
      brand: "Nano Power",
      stock: 50,
      images: [
        "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&q=80"
      ],
      shortDescription: "Ultra-fast capacitive energy transfer balancer for multi-cell packs.",
      description: "Super capacitor based active balancer with up to 4A balancing current. Transfers energy directly from high voltage cells to low voltage cells with zero heat dissipation. Extends battery pack life by up to 40%.",
      specs: {
        "Balance Current": "0.1A - 4.0A max",
        "Balance Precision": "1mV",
        "Applicable Cells": "LiFePO4, Li-ion, LTO",
        "Operating Current": "Sleep < 0.1mA"
      },
      rating: 4.8,
      reviewCount: 33,
      isDeal: true,
      isFeatured: false,
      isNewItem: false
    },
    {
      id: "prod-4",
      title: "12V 10A Intelligent Digital Display Battery Charger",
      slug: "12v-10a-intelligent-digital-display-battery-charger",
      price: 2450,
      oldPrice: 2900,
      category: "battery-bms-charger",
      brand: "MECO",
      stock: 40,
      images: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80"
      ],
      shortDescription: "7-stage microprocessor-controlled smart pulse repair charger.",
      description: "Universal smart charger compatible with LiFePO4, AGM, GEL, and Wet Lead-Acid batteries. High-contrast LCD displays voltage, charge current, internal temperature, and battery charge percentage.",
      specs: {
        "Input Voltage": "100-240V AC 50/60Hz",
        "Output": "12V DC 10A / 24V DC 5A",
        "Efficiency": "Approx. 85%",
        "Cooling": "Automatic low-noise fan"
      },
      rating: 4.7,
      reviewCount: 19,
      isDeal: true,
      isFeatured: false,
      isNewItem: false
    },
    // 5-10: SOLAR ENERGY
    {
      id: "prod-5",
      title: "Canadian Solar 550W Mono PERC HiKu6 Solar Panel",
      slug: "canadian-solar-550w-mono-perc-solar-panel",
      price: 18500,
      oldPrice: 21000,
      category: "solar-energy",
      brand: "Canadian Solar",
      stock: 60,
      images: [
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80"
      ],
      shortDescription: "High-efficiency 550W half-cut monocrystalline solar module with 21.3% efficiency.",
      description: "Engineered for maximum power generation in high-temperature environments. Lower LCOE, reduced shading impact, and robust aluminum frame engineered to withstand 5400 Pa snow load and 2400 Pa wind load.",
      specs: {
        "Max Power (Pmax)": "550W",
        "Opt. Operating Voltage (Vmp)": "41.7V",
        "Opt. Operating Current (Imp)": "13.20A",
        "Module Efficiency": "21.3%",
        "Warranty": "12-Year Product, 25-Year Performance"
      },
      rating: 4.9,
      reviewCount: 51,
      isDeal: true,
      isFeatured: true,
      isNewItem: true
    },
    {
      id: "prod-6",
      title: "Huawei SUN2000-5KTL-L1 5kW Smart String Solar Inverter",
      slug: "huawei-sun2000-5ktl-l1-5kw-inverter",
      price: 88000,
      oldPrice: 96000,
      category: "solar-energy",
      brand: "Huawei Inverter",
      stock: 10,
      images: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80"
      ],
      shortDescription: "Ultra-quiet 5kW residential on-grid inverter with AI-powered arc fault protection.",
      description: "Integrated WLAN and battery storage ready interface. Maximum efficiency 98.4% with dual MPPT trackers. Features AI-powered AFCI arc fault circuit interruption for ultimate safety in domestic installations.",
      specs: {
        "Rated AC Output": "5000W",
        "Max DC Input Voltage": "600V",
        "MPPT Operating Voltage": "90V - 560V",
        "Number of MPPTs": "2",
        "Protection Rating": "IP65 Natural Convection"
      },
      rating: 5.0,
      reviewCount: 15,
      isDeal: false,
      isFeatured: true,
      isNewItem: true
    },
    {
      id: "prod-7",
      title: "Jinko Solar 580W Tiger Neo N-Type TopCon Solar Panel",
      slug: "jinko-solar-580w-tiger-neo-n-type-solar-panel",
      price: 20500,
      oldPrice: 23500,
      category: "solar-energy",
      brand: "Jinko Solar",
      stock: 45,
      images: [
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80"
      ],
      shortDescription: "TopCon N-type cells offering higher bifaciality and lower degradation.",
      description: "Tiger Neo N-type technology delivers superior low-light performance and better temperature coefficient (-0.30%/°C). Provides 1-2% higher annual power generation compared to conventional P-type modules.",
      specs: {
        "Peak Power": "580W",
        "Cell Type": "N-Type TopCon 182mm",
        "Module Efficiency": "22.45%",
        "Dimensions": "2278 x 1134 x 35 mm",
        "Weight": "28.0 kg"
      },
      rating: 4.9,
      reviewCount: 22,
      isDeal: true,
      isFeatured: true,
      isNewItem: true
    },
    {
      id: "prod-8",
      title: "Solax X1-Hybrid 6.0kW High Voltage Energy Storage Inverter",
      slug: "solax-x1-hybrid-6-0kw-inverter",
      price: 135000,
      oldPrice: 148000,
      category: "solar-energy",
      brand: "Solax Power",
      stock: 8,
      images: [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80"
      ],
      shortDescription: "High voltage battery compatible hybrid inverter with EPS emergency backup.",
      description: "True EPS switchover in under 10ms ensuring uninterrupted power for essential appliances during load-shedding. Supports unbalanced output and remote cloud monitoring via Wi-Fi pocket.",
      specs: {
        "Max PV Input": "9000W",
        "Nominal AC Power": "6000VA",
        "Battery Voltage Range": "80V - 480V",
        "Max Charge/Discharge": "30A",
        "Switch Time": "<10ms"
      },
      rating: 4.8,
      reviewCount: 11,
      isDeal: false,
      isFeatured: true,
      isNewItem: false
    },
    // 9-14: CUSTOMIZED CIRCUIT - PCB
    {
      id: "prod-9",
      title: "Universal Servo AVR Voltage Stabilizer Control Motherboard",
      slug: "universal-servo-avr-voltage-stabilizer-motherboard",
      price: 1850,
      oldPrice: 2200,
      category: "customized-circuit-pcb",
      brand: "Nano Power",
      stock: 75,
      images: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80"
      ],
      shortDescription: "Precision micro-controlled driver card for single phase servo AVRs.",
      description: "High reliability PCB board with integrated time delay, high-voltage cut-off, low-voltage cut-off, and carbon brush tracking circuitry. Compatible with Sukam, Microtek, and standard industrial servo motors.",
      specs: {
        "Input Range": "100V - 280V AC",
        "Output Regulation": "220V +/- 1.5%",
        "Motor Drive": "Bi-directional 12V/24V DC motor",
        "Protections": "Over/Under voltage, Overload, Delay"
      },
      rating: 4.8,
      reviewCount: 38,
      isDeal: true,
      isFeatured: false,
      isNewItem: false
    },
    {
      id: "prod-10",
      title: "Pure Sine Wave Inverter Driver Board (EGS002 EG8010 Module)",
      slug: "pure-sine-wave-inverter-driver-board-egs002",
      price: 650,
      oldPrice: 850,
      category: "customized-circuit-pcb",
      brand: "Nano Power",
      stock: 120,
      images: [
        "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&q=80"
      ],
      shortDescription: "SPWM driver board with onboard LCD connector for custom solar inverters.",
      description: "The gold standard EGS002 sine wave driver board powered by the EG8010 dedicated chip and IR2110S high voltage gate drivers. Produces ultra-clean 50Hz/60Hz pure sine wave AC output with <3% THD.",
      specs: {
        "Frequency": "50Hz / 60Hz fixed or 0-100Hz adjustable",
        "Dead-time": "300ns / 500ns / 1.0us / 1.5us selectable",
        "Protection": "Over-current, Over-voltage, Temperature"
      },
      rating: 4.9,
      reviewCount: 64,
      isDeal: true,
      isFeatured: false,
      isNewItem: false
    },
    // 11-16: MODULES & SENSOR
    {
      id: "prod-11",
      title: "ACS712 30A Current Sensor Hall Effect Module",
      slug: "acs712-30a-current-sensor-module",
      price: 220,
      oldPrice: 280,
      category: "modules-sensor",
      brand: "Microchip",
      stock: 90,
      images: [
        "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&q=80"
      ],
      shortDescription: "Linear Hall-effect based current sensor IC module with 66 mV/A sensitivity.",
      description: "Measures both AC and DC currents up to 30A with complete galvanic isolation between current path and sensing electronics. Easily interfaces with Arduino, ESP32, and Raspberry Pi ADC inputs.",
      specs: {
        "Supply Voltage": "4.5V - 5.5V DC",
        "Measuring Range": "-30A to +30A",
        "Sensitivity": "66 mV/A",
        "Isolation Voltage": "2.1 kVRMS"
      },
      rating: 4.7,
      reviewCount: 41,
      isDeal: false,
      isFeatured: false,
      isNewItem: false
    },
    {
      id: "prod-12",
      title: "DS18B20 Waterproof Stainless Steel Digital Temperature Sensor",
      slug: "ds18b20-waterproof-digital-temperature-sensor",
      price: 180,
      oldPrice: 250,
      category: "modules-sensor",
      brand: "Microchip",
      stock: 140,
      images: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80"
      ],
      shortDescription: "1-Wire digital thermometer probe encased in 1-meter waterproof stainless tube.",
      description: "Accurate temperature measurements from -55°C to +125°C using only a single data line. Ideal for monitoring solar panel temperature, battery pack thermal runaway, and industrial liquid tanks.",
      specs: {
        "Usable Temp Range": "-55°C to 125°C",
        "Accuracy": "+/-0.5°C (-10°C to +85°C)",
        "Resolution": "9 to 12 bits selectable",
        "Cable Length": "100 cm"
      },
      rating: 4.8,
      reviewCount: 55,
      isDeal: true,
      isFeatured: false,
      isNewItem: false
    },
    // 13-18: IGBT-FET-DIODE-TRANSISTOR
    {
      id: "prod-13",
      title: "IRFP460 Power MOSFET 500V 20A TO-247 (Original)",
      slug: "irfp460-power-mosfet-500v-20a",
      price: 190,
      oldPrice: 240,
      category: "igbt-fet-diode-transistor",
      brand: "Nano Power",
      stock: 200,
      images: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80"
      ],
      shortDescription: "N-Channel high power MOSFET for high frequency SMPS and inverters.",
      description: "Genuine TO-247 package with low Rds(on) of 0.27 ohm. Delivers dynamic dv/dt rating and fast switching speed in demanding industrial inverter and welding machine power stages.",
      specs: {
        "Drain-Source Voltage": "500V",
        "Continuous Current": "20A",
        "Static Drain-Source On-Resistance": "0.27 ohm",
        "Package": "TO-247AC"
      },
      rating: 4.9,
      reviewCount: 30,
      isDeal: false,
      isFeatured: false,
      isNewItem: false
    },
    {
      id: "prod-14",
      title: "FGA25N120ANP 1200V 25A NPT IGBT (Induction Cooker & Inverter)",
      slug: "fga25n120anp-1200v-25a-npt-igbt",
      price: 260,
      oldPrice: 320,
      category: "igbt-fet-diode-transistor",
      brand: "Siemens",
      stock: 180,
      images: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80"
      ],
      shortDescription: "Ultra-fast NPT technology IGBT with integrated anti-parallel diode.",
      description: "Engineered specifically for induction heating, resonant power converters, and high frequency solar inverter stages. Low saturation voltage and high ruggedness under short circuit conditions.",
      specs: {
        "Collector-Emitter Voltage": "1200V",
        "Collector Current (Tc=100C)": "25A",
        "Vce(sat)": "2.0V typical",
        "Diode Forward Current": "25A"
      },
      rating: 4.8,
      reviewCount: 27,
      isDeal: true,
      isFeatured: false,
      isNewItem: false
    },
    // 15-20: ELECTRONICS PARTS
    {
      id: "prod-15",
      title: "ATmega328P-PU DIP-28 Microcontroller with Arduino Uno Bootloader",
      slug: "atmega328p-pu-dip-28-microcontroller",
      price: 280,
      oldPrice: 350,
      category: "electronics-parts",
      brand: "Microchip",
      stock: 150,
      images: [
        "https://images.unsplash.com/photo-1517055729441-375a27788e77?w=600&q=80"
      ],
      shortDescription: "8-bit AVR RISC microcontroller pre-flashed with Arduino Optiboot.",
      description: "The core microcontroller of Arduino Uno. Features 32KB flash, 2KB SRAM, 1KB EEPROM, 23 programmable I/O lines, and 6-channel 10-bit analog-to-digital converter.",
      specs: {
        "Clock Speed": "16 MHz",
        "Flash Memory": "32 KB",
        "Operating Voltage": "1.8V - 5.5V",
        "Package": "DIP-28"
      },
      rating: 4.9,
      reviewCount: 78,
      isDeal: false,
      isFeatured: false,
      isNewItem: false
    },
    {
      id: "prod-16",
      title: "1N4007 1000V 1A Silicon Rectifier Diode (100 Pcs Pack)",
      slug: "1n4007-silicon-rectifier-diode-100pcs-pack",
      price: 120,
      oldPrice: 160,
      category: "electronics-parts",
      brand: "Nano Power",
      stock: 300,
      images: [
        "https://images.unsplash.com/photo-1517055729441-375a27788e77?w=600&q=80"
      ],
      shortDescription: "Bulk pack of 100 original DO-41 axial lead rectifier diodes.",
      description: "Essential component for AC to DC bridge rectification, reverse polarity protection, and flyback diode suppression across inductive relay coils.",
      specs: {
        "Max Reverse Voltage": "1000V",
        "Forward Current": "1.0A",
        "Forward Voltage Drop": "1.1V at 1A",
        "Package": "DO-41"
      },
      rating: 4.8,
      reviewCount: 49,
      isDeal: true,
      isFeatured: false,
      isNewItem: false
    },
    // 21-25: LT-HT POWER GOODS
    {
      id: "prod-17",
      title: "11kV Outdoor Drop Out Fuse (Dropout Cutout 100A/200A)",
      slug: "11kv-outdoor-drop-out-fuse-cutout",
      price: 5800,
      oldPrice: 6500,
      category: "lt-ht-power-goods",
      brand: "Nano Power",
      stock: 25,
      images: [
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80"
      ],
      shortDescription: "Porcelain insulator drop-out fuse for distribution transformer protection.",
      description: "High voltage outdoor pole-mounted dropout expulsion fuse cutout rated for 11kV - 15kV systems. Provides reliable overcurrent and short-circuit protection for distribution transformers and capacitor banks.",
      specs: {
        "Rated Voltage": "11kV - 15kV",
        "Continuous Current": "100A / 200A",
        "BIL Rating": "110 kV",
        "Insulator Material": "High strength glazed electrical porcelain"
      },
      rating: 4.7,
      reviewCount: 8,
      isDeal: false,
      isFeatured: true,
      isNewItem: false
    },
    {
      id: "prod-18",
      title: "3-Phase Automatic Voltage Regulator (AVR) Stabilizer 30kVA",
      slug: "3-phase-automatic-voltage-regulator-avr-30kva",
      price: 0,
      oldPrice: 0,
      category: "lt-ht-power-goods",
      brand: "Siemens",
      stock: 4,
      images: [
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80"
      ],
      shortDescription: "Industrial servo controlled 3-phase AVR for factories, CNC and hospitals.",
      description: "Zero price product demonstrating 'Call for price' specification. Heavy duty servo motor controlled copper transformer providing stable 380V/400V balanced output with zero waveform distortion.",
      specs: {
        "Capacity": "30 kVA",
        "Input Voltage": "280V - 450V 3-Phase",
        "Output Voltage": "380V/400V +/- 1%",
        "Cooling": "Oil cooled / Air cooled selectable"
      },
      rating: 5.0,
      reviewCount: 6,
      isDeal: false,
      isFeatured: true,
      isNewItem: true
    },
    // 26-30: TOOLS - HARDWARE
    {
      id: "prod-19",
      title: "Professional Solar MC4 Crimping Tool Kit with Wire Stripper",
      slug: "professional-solar-mc4-crimping-tool-kit",
      price: 2400,
      oldPrice: 3000,
      category: "tools-hardware",
      brand: "Nano Power",
      stock: 55,
      images: [
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80"
      ],
      shortDescription: "Precision ratchet crimper for 2.5/4.0/6.0mm² (AWG 14-10) solar cables.",
      description: "Complete installer kit including ratchet MC4 crimping plier, solar cable stripper, and pair of multi-functional MC4 connector spanners in heavy-duty zippered canvas pouch.",
      specs: {
        "Crimping Capacity": "2.5 / 4.0 / 6.0 mm²",
        "AWG": "14-10 AWG",
        "Mechanism": "High leverage ratchet system",
        "Handle": "Ergonomic two-color TPR"
      },
      rating: 4.9,
      reviewCount: 36,
      isDeal: true,
      isFeatured: false,
      isNewItem: false
    },
    {
      id: "prod-20",
      title: "Digital Clamp Multimeter True RMS 600A AC/DC",
      slug: "digital-clamp-multimeter-true-rms-600a",
      price: 3200,
      oldPrice: 3800,
      category: "tools-hardware",
      brand: "MECO",
      stock: 40,
      images: [
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80"
      ],
      shortDescription: "Measures AC/DC current, voltage, frequency, capacitance and temperature.",
      description: "Indispensable tool for solar installers and power engineers. High accuracy True RMS measurement with large backlit display and non-contact voltage (NCV) detection.",
      specs: {
        "DC Current": "0.1A to 600A",
        "AC Current": "0.1A to 600A True RMS",
        "DC/AC Voltage": "600V max",
        "Jaw Opening": "28 mm"
      },
      rating: 4.8,
      reviewCount: 29,
      isDeal: true,
      isFeatured: false,
      isNewItem: false
    },
    // 31-35: SAFETY - SECURITY
    {
      id: "prod-21",
      title: "Dahua 3MP Wi-Fi Smart IP Camera 2K 360° Pan & Tilt",
      slug: "dahua-3mp-wifi-smart-ip-camera-2k",
      price: 2750,
      oldPrice: 3300,
      category: "safety-security",
      brand: "Nano Power",
      stock: 65,
      images: [
        "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80"
      ],
      shortDescription: "Crystal clear 2K resolution with human detection and two-way voice talk.",
      description: "Keep your home or solar installation site secure 24/7. Connects directly to your Wi-Fi network and streams HD video to iOS and Android smartphones via mobile app. Supports local MicroSD storage up to 256GB.",
      specs: {
        "Resolution": "3MP (2304 x 1296)",
        "Night Vision": "IR up to 10 meters",
        "Rotation": "0-355° Pan, -5-80° Tilt",
        "Audio": "Built-in mic and speaker"
      },
      rating: 4.9,
      reviewCount: 47,
      isDeal: true,
      isFeatured: true,
      isNewItem: true
    },
    {
      id: "prod-22",
      title: "ABC Dry Powder Fire Extinguisher 5kg (Standard Certification)",
      slug: "abc-dry-powder-fire-extinguisher-5kg",
      price: 1650,
      oldPrice: 2000,
      category: "safety-security",
      brand: "Nano Power",
      stock: 80,
      images: [
        "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80"
      ],
      shortDescription: "Multipurpose fire safety for electrical panel rooms, battery banks & homes.",
      description: "Suitable for Class A (combustible materials), Class B (flammable liquids), and Class C (electrical equipment & flammable gases) fires. Includes pressure gauge, discharge hose, and wall mounting bracket.",
      specs: {
        "Capacity": "5 kg",
        "Discharge Time": ">15 seconds",
        "Test Pressure": "27 bar",
        "Temperature Range": "-30°C to +60°C"
      },
      rating: 4.8,
      reviewCount: 21,
      isDeal: false,
      isFeatured: false,
      isNewItem: false
    },
    // 33-36: AUTOMATION & PROCESS CONTROL
    {
      id: "prod-23",
      title: "Siemens LOGO! 230RCE Logic Module with Display (6ED1052-1FB08-0BA1)",
      slug: "siemens-logo-230rce-logic-module",
      price: 16500,
      oldPrice: 18500,
      category: "automation-process-cont",
      brand: "Siemens",
      stock: 14,
      images: [
        "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&q=80"
      ],
      shortDescription: "Compact intelligent controller with Ethernet interface and integrated web server.",
      description: "The ideal automation controller for solar water pumping, building management, lighting timers, and automatic generator changeover systems. Easily programmed via drag-and-drop LOGO! Soft Comfort software.",
      specs: {
        "Supply Voltage": "115V - 230V AC/DC",
        "Inputs": "8 Digital Inputs",
        "Outputs": "4 Relay Outputs (10A)",
        "Interface": "Ethernet Modbus TCP/IP"
      },
      rating: 5.0,
      reviewCount: 17,
      isDeal: true,
      isFeatured: true,
      isNewItem: false
    },
    // 37-40: SERVICE & MAINTENANCE + CALL FOR PRICE DEMO
    {
      id: "prod-24",
      title: "Industrial Solar Inverter Repairing & Firmware Upgrade Service",
      slug: "industrial-solar-inverter-repairing-service",
      price: 0,
      oldPrice: 0,
      category: "service-maintenance",
      brand: "Nano Power",
      stock: 99,
      images: [
        "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&q=80"
      ],
      shortDescription: "Complete diagnostic and board-level repair service for 1kW - 50kW inverters.",
      description: "Zero price service demonstrating 'Call for price' functionality. Professional engineering team repairs failed IGBT bridges, blown DC-DC boost stages, control board errors, and firmware corruptions with original parts.",
      specs: {
        "Turnaround Time": "24 - 48 Hours",
        "Brands Supported": "Huawei, Sungrow, Growatt, Solis, SolaX, GoodWe",
        "Warranty": "3 Months Service Warranty"
      },
      rating: 4.9,
      reviewCount: 31,
      isDeal: false,
      isFeatured: true,
      isNewItem: false
    }
  ],

  pages: [
    {
      slug: "order-procedure",
      title: "Order Procedure",
      metaTitle: "How to Order | maxitshop Bangladesh",
      metaDescription: "Step-by-step guide to place orders online with Cash on Delivery at maxitshop.",
      content: `
        <h2>How to Place an Order at maxitshop</h2>
        <p>Ordering from maxitshop is fast, secure, and hassle-free. Follow these simple steps:</p>
        <ol>
          <li><strong>Find Your Product:</strong> Browse our categories or use the live search bar at the top of the page.</li>
          <li><strong>Click "অর্ডার করুন" (Order Now):</strong> For instant purchase, click the orange "অর্ডার করুন" button to go directly to checkout. Alternatively, click "Add to Cart" to continue shopping.</li>
          <li><strong>Enter Delivery Details:</strong> Fill in your full name, 11-digit mobile number (e.g. 017xxxxxxxx), and complete street address.</li>
          <li><strong>Select Delivery Area:</strong> Choose "Inside Dhaka" (৳60) or "Outside Dhaka" (৳120).</li>
          <li><strong>Confirm Order:</strong> Click "অর্ডার কনফার্ম করুন". You will receive an instant order ID and confirmation SMS.</li>
        </ol>
      `
    },
    {
      slug: "delivery-rules",
      title: "Delivery Rules",
      metaTitle: "Delivery Rules & Rates | maxitshop",
      metaDescription: "Learn about delivery timeframes and shipping fees across Bangladesh.",
      content: `
        <h2>Delivery Rules & Timeframes</h2>
        <p>We deliver nationwide across all 64 districts in Bangladesh using reputable courier networks.</p>
        <ul>
          <li><strong>Inside Dhaka City:</strong> Delivery within 24 to 48 hours. Shipping fee: ৳60.</li>
          <li><strong>Outside Dhaka (All Districts):</strong> Delivery within 2 to 4 working days via Steadfast, Sundarban, or SA Paribahan. Shipping fee: ৳120.</li>
          <li><strong>Parcel Inspection:</strong> Customers are encouraged to open and verify the parcel contents in front of the delivery rider before paying for COD orders.</li>
        </ul>
      `
    },
    {
      slug: "return-policy",
      title: "Return Policy",
      metaTitle: "7-Day Return Policy | maxitshop",
      metaDescription: "Our customer-first return and refund guidelines.",
      content: `
        <h2>7 Days Replacement & Return Policy</h2>
        <p>At maxitshop, we stand behind the quality of every genuine product we sell.</p>
        <ul>
          <li>If you receive a defective, damaged, or incorrect product, contact us within 7 days of receiving the delivery.</li>
          <li>The product must be returned with all original accessories, warranty cards, manuals, and packaging intact.</li>
          <li>Once inspected and verified, we will dispatch an immediate replacement or issue a 100% refund to your preferred bKash/bank account.</li>
        </ul>
      `
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      metaTitle: "Privacy Policy | maxitshop",
      metaDescription: "How we collect, protect, and respect your personal information.",
      content: `
        <h2>Privacy Policy</h2>
        <p>We respect your privacy and protect your personal information with strict SSL encryption.</p>
        <p>Information collected (such as your name, contact phone number, and delivery address) is used solely to process orders, provide shipment tracking notifications, and improve customer service. We never sell, lease, or share customer data with third parties.</p>
      `
    },
    {
      slug: "terms-conditions",
      title: "Terms and Conditions",
      metaTitle: "Terms and Conditions | maxitshop",
      metaDescription: "User terms, conditions, and purchasing policies.",
      content: `
        <h2>Terms & Conditions</h2>
        <p>By accessing or placing an order on maxitshop, you agree to abide by our terms of service:</p>
        <ul>
          <li>All prices displayed are in Bangladeshi Taka (৳) and inclusive of applicable government duties.</li>
          <li>Product specifications are sourced directly from authorized manufacturers.</li>
          <li>We reserve the right to cancel orders in case of stock unavailability, pricing errors, or unverified phone numbers.</li>
        </ul>
      `
    },
    {
      slug: "about-us",
      title: "About Us",
      metaTitle: "About Us | maxitshop Engineering & Energy",
      metaDescription: "Learn more about maxitshop mission and engineering solutions.",
      content: `
        <h2>About maxitshop</h2>
        <p>maxitshop is a leading supplier of renewable solar energy solutions, lithium battery packs, power electronics, and industrial automation components in Bangladesh.</p>
        <p>Our mission is to empower homes, agricultural projects, and manufacturing industries with genuine, certified, and cost-effective energy technologies backed by professional engineering support.</p>
      `
    }
  ],

  settings: {
    siteName: "maxitshop",
    tagline: "Your Trusted Solar, Battery & Engineering Solutions Partner",
    logo: "",
    footerLogo: "",
    favicon: "",
    phone: "+880 1733-272445",
    email: "support@maxitshop.com",
    address: "2nd Floor, Afroza Tower, Uposhohor New Market, Rajshahi-6000",
    socialLinks: {
      facebook: "https://facebook.com/maxitshop",
      instagram: "https://instagram.com/maxitshop",
      youtube: "https://youtube.com/maxitshop",
      whatsapp: "+8801733272445",
      messenger: "maxitshop"
    },
    deliveryRates: {
      insideDhaka: 70,
      outsideDhaka: 130
    },
    metaTags: {
      title: "maxitshop - Solar, Battery & Power Engineering Bangladesh",
      description: "Buy Tier-1 Solar Panels, LiFePO4 Battery Cells, Smart BMS, Hybrid Inverters and Electronics Parts in Bangladesh with Cash on Delivery."
    }
  },

  sellers: [
    {
      id: "seller-1",
      name: "MaxiT Solar Engineering",
      slug: "maxit-solar-engineering",
      logo: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=200&q=80",
      phone: "+880 1733-272445",
      email: "solar@maxitshop.com",
      address: "2nd Floor, Afroza Tower, Uposhohor New Market, Rajshahi-6000",
      rating: 4.9,
      totalProducts: 45,
      status: "active"
    },
    {
      id: "seller-2",
      name: "ElectroTech Components",
      slug: "electrotech-components",
      logo: "https://images.unsplash.com/photo-1517055729441-375a27788e77?w=200&q=80",
      phone: "+880 1811-223344",
      email: "electrotech@maxitshop.com",
      address: "Stadium Market, Dhaka",
      rating: 4.8,
      totalProducts: 32,
      status: "active"
    },
    {
      id: "seller-3",
      name: "PowerLab Battery Solutions",
      slug: "powerlab-battery-solutions",
      logo: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=200&q=80",
      phone: "+880 1911-556677",
      email: "powerlab@maxitshop.com",
      address: "Chittagong, Bangladesh",
      rating: 4.9,
      totalProducts: 28,
      status: "active"
    }
  ],

  complaints: [
    {
      id: "comp-101",
      name: "Mohammad Ali",
      phone: "01712345678",
      orderId: "ORD-98214",
      description: "Received 100A BMS package, but carton had a corner dent from courier handling. Device tested OK, requesting confirmation on warranty.",
      status: "resolved",
      adminNotes: "Customer contacted via phone and warranty certificate re-issued.",
      createdAt: new Date().toISOString()
    }
  ],

  subscribers: [
    { email: "user1@example.com", subscribedAt: new Date().toISOString() },
    { email: "solarbd@example.com", subscribedAt: new Date().toISOString() }
  ]
};

module.exports = seedData;
