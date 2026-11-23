require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

async function seedDemoData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for Step 0 Demo Data creation...');

  // 1. Clean up any existing demo data first to keep it idempotent
  await Category.deleteMany({ slug: /^demo-/ });
  await Product.deleteMany({ slug: /^demo-/ });
  await Order.deleteMany({ orderNumber: /^DEMO-ORD-/ });

  console.log('Cleaned up previous demo records if any.');

  // 2. Create 4 Demo Categories under existing Mother Categories
  const demoCategories = [
    {
      id: 'cat-demo-solar-tech',
      name: 'Demo Solar Tech',
      slug: 'demo-solar-tech',
      parent: 'solar-renewable-energy',
      description: 'Demo Category for Solar Panels and Solar Engineering Accessories',
      order: 100,
      isActive: true,
      subcategories: [
        { id: 'sub-demo-solar-1', name: 'Demo Solar PV', slug: 'demo-solar-pv' },
        { id: 'sub-demo-solar-2', name: 'Demo Inverter Tech', slug: 'demo-inverter-tech' }
      ]
    },
    {
      id: 'cat-demo-smart-devices',
      name: 'Demo Smart Devices',
      slug: 'demo-smart-devices',
      parent: 'smart-home-automation',
      description: 'Demo Category for Smart IoT and Automation Controllers',
      order: 101,
      isActive: true,
      subcategories: [
        { id: 'sub-demo-smart-1', name: 'Demo Smart Switches', slug: 'demo-smart-switches' },
        { id: 'sub-demo-smart-2', name: 'Demo Zigbee Sensors', slug: 'demo-zigbee-sensors' }
      ]
    },
    {
      id: 'cat-demo-power-equipment',
      name: 'Demo Power Equipment',
      slug: 'demo-power-equipment',
      parent: 'batteries-portable-power',
      description: 'Demo Category for High Capacity LiFePO4 and Portable Power Stations',
      order: 102,
      isActive: true,
      subcategories: [
        { id: 'sub-demo-power-1', name: 'Demo LiFePO4 Cells', slug: 'demo-lifepo4-cells' },
        { id: 'sub-demo-power-2', name: 'Demo Smart BMS', slug: 'demo-smart-bms' }
      ]
    },
    {
      id: 'cat-demo-robotics-kits',
      name: 'Demo Robotics Kits',
      slug: 'demo-robotics-kits',
      parent: 'robotics-drone-kits',
      description: 'Demo Category for Educational Robotics and DIY STEM Kits',
      order: 103,
      isActive: true,
      subcategories: [
        { id: 'sub-demo-robotics-1', name: 'Demo STEM Kits', slug: 'demo-stem-kits' },
        { id: 'sub-demo-robotics-2', name: 'Demo Drone Parts', slug: 'demo-drone-parts' }
      ]
    }
  ];

  for (const cat of demoCategories) {
    await Category.create(cat);
  }
  console.log('Created 4 Demo Categories successfully.');

  // High quality placeholder/sample image URLs
  const sampleValidImages = [
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1548611716-ad02263309a4?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558441719-79774619da37?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80'
  ];

  // 3. Create 10 Products for each Demo Category (40 Products Total)
  const productsToInsert = [];
  let prodIndex = 1;

  for (const cat of demoCategories) {
    for (let i = 1; i <= 10; i++) {
      const sub = cat.subcategories[(i % 2)];
      let stock = 20;
      let images = [];
      let isFeatured = i <= 2;
      let isDeal = i === 3 || i === 7;

      if (i === 1) {
        // In stock, single valid image
        stock = 45;
        images = [sampleValidImages[0]];
      } else if (i === 2) {
        // In stock, 4 gallery images
        stock = 30;
        images = [sampleValidImages[1], sampleValidImages[2], sampleValidImages[3], sampleValidImages[4]];
      } else if (i === 3) {
        // Low stock (stock = 3), 3 gallery images
        stock = 3;
        images = [sampleValidImages[2], sampleValidImages[3], sampleValidImages[5]];
      } else if (i === 4) {
        // Out of stock (stock = 0), single image
        stock = 0;
        images = [sampleValidImages[3]];
      } else if (i === 5) {
        // In stock, intentionally BROKEN external image to test placeholder
        stock = 15;
        images = ['https://example.com/non-existent-broken-image-404.jpg'];
      } else if (i === 6) {
        // In stock, EMPTY images array to test placeholder
        stock = 12;
        images = [];
      } else if (i === 7) {
        // In stock, 5 gallery images
        stock = 25;
        images = sampleValidImages.slice(0, 5);
      } else if (i === 8) {
        // Low stock (stock = 2), intentionally non-existent local image
        stock = 2;
        images = ['/uploads/non-existent-demo-image-404.png'];
      } else if (i === 9) {
        // In stock, 2 images
        stock = 35;
        images = [sampleValidImages[4], sampleValidImages[5]];
      } else if (i === 10) {
        // In stock, 3 images
        stock = 18;
        images = [sampleValidImages[5], sampleValidImages[0], sampleValidImages[1]];
      }

      const price = 500 + (prodIndex * 150);
      const oldPrice = isDeal ? Math.round(price * 1.25) : 0;

      productsToInsert.push({
        id: `demo-prod-${prodIndex}`,
        title: `${cat.name} Product #${i} - Model D${100 + prodIndex}`,
        slug: `demo-prod-${prodIndex}-${cat.slug}-${i}`,
        price,
        oldPrice,
        discountPercentage: oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0,
        category: cat.slug,
        categoryName: cat.name,
        subcategory: sub.slug,
        subcategoryName: sub.name,
        brand: 'MaxiT Demo',
        stock,
        image: images[0] || '',
        images,
        shortDescription: `High performance ${cat.name} demonstration product with genuine warranty and fast delivery across Bangladesh.`,
        description: `### Product Overview for ${cat.name} Product #${i}\n\nThis is a certified demo product created for quality assurance, stock monitoring, image gallery testing, and storefront cart testing.\n\n- **Stock Level**: ${stock} units\n- **Warranty**: 1 Year Official MaxiTShop Warranty\n- **Category**: ${cat.name}\n- **Subcategory**: ${sub.name}`,
        productCode: `MX-DEMO-${1000 + prodIndex}`,
        warranty: '1 Year MaxiT Official',
        rating: 4.8,
        reviewCount: 5 + (i * 2),
        isNewItem: i <= 3,
        isFeatured,
        isDeal,
        isHotDeal: isDeal
      });

      prodIndex++;
    }
  }

  await Product.insertMany(productsToInsert);
  console.log(`Created ${productsToInsert.length} Demo Products across 4 Demo Categories successfully.`);

  // 4. Create Demo Orders
  const sampleProduct = productsToInsert[0];
  const sampleProduct2 = productsToInsert[1];

  const demoOrders = [
    {
      id: 'demo-ord-1001',
      orderNumber: 'DEMO-ORD-1001',
      customer: {
        name: 'Demo Customer One',
        phone: '01855786749',
        email: 'demo.customer1@example.com',
        division: 'Dhaka',
        district: 'Dhaka',
        thana: 'Gulshan',
        area: 'Gulshan-2',
        address: 'House 12, Road 4, Gulshan-2, Dhaka',
        notes: 'Demo pending order for delivery verification'
      },
      items: [
        {
          productId: sampleProduct.id,
          title: sampleProduct.title,
          slug: sampleProduct.slug,
          price: sampleProduct.price,
          quantity: 1,
          image: sampleProduct.image
        }
      ],
      subtotal: sampleProduct.price,
      deliveryCharge: 110,
      discount: 0,
      total: sampleProduct.price + 110,
      paymentMethod: 'COD',
      paymentStatus: 'unpaid',
      status: 'pending',
      timeline: [
        { status: 'pending', note: 'Order placed by demo customer', timestamp: new Date() }
      ]
    },
    {
      id: 'demo-ord-1002',
      orderNumber: 'DEMO-ORD-1002',
      customer: {
        name: 'Demo Customer Two',
        phone: '01712345678',
        email: 'demo.customer2@example.com',
        division: 'Rajshahi',
        district: 'Rajshahi',
        thana: 'Boalia',
        area: 'Uposhohor',
        address: 'Afroza Tower, Uposhohor, Rajshahi',
        notes: 'Demo confirmed order'
      },
      items: [
        {
          productId: sampleProduct2.id,
          title: sampleProduct2.title,
          slug: sampleProduct2.slug,
          price: sampleProduct2.price,
          quantity: 2,
          image: sampleProduct2.image
        }
      ],
      subtotal: sampleProduct2.price * 2,
      deliveryCharge: 150,
      discount: 100,
      total: (sampleProduct2.price * 2) + 150 - 100,
      paymentMethod: 'bKash',
      paymentStatus: 'paid',
      status: 'confirmed',
      timeline: [
        { status: 'pending', note: 'Order placed', timestamp: new Date(Date.now() - 3600000) },
        { status: 'confirmed', note: 'Payment verified via bKash', timestamp: new Date() }
      ]
    },
    {
      id: 'demo-ord-1003',
      orderNumber: 'DEMO-ORD-1003',
      customer: {
        name: 'Demo Customer Three',
        phone: '01912345678',
        email: 'demo.customer3@example.com',
        division: 'Chattogram',
        district: 'Chattogram',
        thana: 'Panchlaish',
        area: 'GEC Circle',
        address: 'GEC Circle, Chattogram',
        notes: 'Demo delivered order'
      },
      items: [
        {
          productId: sampleProduct.id,
          title: sampleProduct.title,
          slug: sampleProduct.slug,
          price: sampleProduct.price,
          quantity: 1,
          image: sampleProduct.image
        }
      ],
      subtotal: sampleProduct.price,
      deliveryCharge: 150,
      discount: 0,
      total: sampleProduct.price + 150,
      paymentMethod: 'COD',
      paymentStatus: 'paid',
      status: 'delivered',
      timeline: [
        { status: 'pending', note: 'Order placed', timestamp: new Date(Date.now() - 86400000) },
        { status: 'confirmed', note: 'Order confirmed', timestamp: new Date(Date.now() - 72000000) },
        { status: 'delivered', note: 'Successfully delivered to customer', timestamp: new Date() }
      ]
    },
    {
      id: 'demo-ord-1004',
      orderNumber: 'DEMO-ORD-1004',
      customer: {
        name: 'Demo Customer Four',
        phone: '01612345678',
        email: 'demo.customer4@example.com',
        division: 'Sylhet',
        district: 'Sylhet',
        thana: 'Kotwali',
        area: 'Zindabazar',
        address: 'Zindabazar, Sylhet',
        notes: 'Demo cancelled order'
      },
      items: [
        {
          productId: sampleProduct2.id,
          title: sampleProduct2.title,
          slug: sampleProduct2.slug,
          price: sampleProduct2.price,
          quantity: 1,
          image: sampleProduct2.image
        }
      ],
      subtotal: sampleProduct2.price,
      deliveryCharge: 150,
      discount: 0,
      total: sampleProduct2.price + 150,
      paymentMethod: 'COD',
      paymentStatus: 'unpaid',
      status: 'cancelled',
      timeline: [
        { status: 'pending', note: 'Order placed', timestamp: new Date(Date.now() - 86400000) },
        { status: 'cancelled', note: 'Cancelled by customer request', timestamp: new Date() }
      ]
    }
  ];

  await Order.insertMany(demoOrders);
  console.log(`Created ${demoOrders.length} Demo Orders successfully.`);

  await mongoose.disconnect();
  console.log('Step 0 Demo Data Seed Completed!');
}

seedDemoData().catch(err => {
  console.error('Error seeding demo data:', err);
  process.exit(1);
});
