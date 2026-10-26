// Complete seed data modeled after nanopowerbd.com taxonomy for maxitshop
const seedData = {
  categories: require('./nanopower_categories.json'),

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
  products: require('./nanopower_products.json'),

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
