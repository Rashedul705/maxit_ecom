const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const seedData = require('../data/seedData');

// Mongoose Models
const Category = require('../models/Category');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Banner = require('../models/Banner');
const Order = require('../models/Order');
const Complaint = require('../models/Complaint');
const Seller = require('../models/Seller');
const Page = require('../models/Page');
const Setting = require('../models/Setting');
const Subscriber = require('../models/Subscriber');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_maxitshop_2026';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@maxitshop.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin_secret_token_123';

// In-Memory store holding seed data as fallback/immediate storage
const memoryStore = {
  categories: JSON.parse(JSON.stringify(seedData.categories)),
  brands: JSON.parse(JSON.stringify(seedData.brands)),
  banners: JSON.parse(JSON.stringify(seedData.banners)),
  products: JSON.parse(JSON.stringify(seedData.products)),
  pages: JSON.parse(JSON.stringify(seedData.pages)),
  settings: JSON.parse(JSON.stringify(seedData.settings)),
  sellers: JSON.parse(JSON.stringify(seedData.sellers)),
  complaints: JSON.parse(JSON.stringify(seedData.complaints)),
  subscribers: JSON.parse(JSON.stringify(seedData.subscribers)),
  orders: [
    {
      id: "ord-1001",
      orderNumber: "ORD-94812",
      customer: {
        name: "Abdur Rahman",
        phone: "01733115391",
        address: "House 45, Road 7, Dhanmondi, Dhaka",
        area: "inside_dhaka",
        notes: "Please call before arrival"
      },
      items: [
        {
          productId: "prod-1",
          title: "Lifepo4 3.2V 173Ah Grade A Battery 6000+ Cycle Cells",
          price: 7200,
          quantity: 2,
          image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80"
        }
      ],
      subtotal: 14400,
      deliveryCharge: 60,
      discount: 0,
      total: 14460,
      paymentMethod: "cod",
      status: "confirmed",
      timeline: [
        { status: "pending", note: "Order placed online", timestamp: new Date(Date.now() - 86400000).toISOString() },
        { status: "confirmed", note: "Customer verified via phone call", timestamp: new Date().toISOString() }
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  users: [
    {
      id: "user-admin",
      name: "MaxiTShop Administrator",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      phone: "+8801733115391",
      role: "admin"
    }
  ]
};

const isMongo = () => mongoose.connection.readyState === 1;

// Sync seed data to MongoDB if connected and empty
const syncMongoSeeds = async () => {
  if (!isMongo()) return;
  try {
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      console.log('🌱 Seeding MongoDB collections...');
      await Category.insertMany(seedData.categories);
      await Brand.insertMany(seedData.brands);
      await Banner.insertMany(seedData.banners);
      await Product.insertMany(seedData.products);
      await Page.insertMany(seedData.pages);
      await Setting.create(seedData.settings);
      await Seller.insertMany(seedData.sellers);
      await Complaint.insertMany(seedData.complaints);
      console.log('✅ MongoDB seeded successfully.');
    }
  } catch (err) {
    console.warn('⚠️ Mongo sync warning:', err.message);
  }
};

mongoose.connection.on('connected', () => {
  syncMongoSeeds();
});

const db = {
  // --- AUTHENTICATION ---
  async authenticateAdmin({ email, password, token }) {
    if (token && token === ADMIN_TOKEN) {
      const jwtToken = jwt.sign({ role: 'admin', email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: '7d' });
      return {
        token: jwtToken,
        user: { name: 'MaxiTShop Administrator', email: ADMIN_EMAIL, role: 'admin' }
      };
    }
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const jwtToken = jwt.sign({ role: 'admin', email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: '7d' });
      return {
        token: jwtToken,
        user: { name: 'MaxiTShop Administrator', email: ADMIN_EMAIL, role: 'admin' }
      };
    }
    return null;
  },

  async registerCustomer({ name, email, phone, password, address }) {
    const existing = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email already registered');
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password, // In real app: bcrypt.hashSync(password, 10)
      role: 'customer',
      addresses: address ? [{ name, phone, address, isDefault: true }] : []
    };
    memoryStore.users.push(newUser);
    const token = jwt.sign({ id: newUser.id, role: 'customer', email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });
    return { token, user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role } };
  },

  async loginCustomer({ email, password }) {
    const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      return null;
    }
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    return { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } };
  },

  // --- CATEGORIES ---
  async getCategories() {
    if (isMongo()) {
      const docs = await Category.find({ isActive: true }).sort({ order: 1 });
      if (docs && docs.length) return docs;
    }
    return memoryStore.categories.filter(c => c.isActive !== false).sort((a, b) => a.order - b.order);
  },

  async getCategoryBySlug(slug) {
    if (isMongo()) {
      const doc = await Category.findOne({ slug });
      if (doc) return doc;
    }
    return memoryStore.categories.find(c => c.slug === slug) || null;
  },

  async createCategory(data) {
    const cat = {
      id: `cat-${Date.now()}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      isActive: true,
      order: memoryStore.categories.length + 1,
      ...data
    };
    memoryStore.categories.push(cat);
    if (isMongo()) {
      try { await Category.create(cat); } catch(e) {}
    }
    return cat;
  },

  async updateCategory(id, data) {
    const idx = memoryStore.categories.findIndex(c => c.id === id || c.slug === id);
    if (idx === -1) return null;
    memoryStore.categories[idx] = { ...memoryStore.categories[idx], ...data };
    if (isMongo()) {
      try { await Category.findOneAndUpdate({ id }, data); } catch(e) {}
    }
    return memoryStore.categories[idx];
  },

  async deleteCategory(id) {
    const idx = memoryStore.categories.findIndex(c => c.id === id || c.slug === id);
    if (idx === -1) return false;
    memoryStore.categories.splice(idx, 1);
    if (isMongo()) {
      try { await Category.findOneAndDelete({ id }); } catch(e) {}
    }
    return true;
  },

  // --- PRODUCTS ---
  async getProducts({ category, brand, search, minPrice, maxPrice, sort, page = 1, limit = 20, isDeal, isFeatured, isNewItem }) {
    let list = [...memoryStore.products];

    if (category) {
      const c = category.toLowerCase().trim();
      list = list.filter(p => {
        if (!p.category) return false;
        const pc = p.category.toLowerCase().trim();
        return pc === c ||
               pc.replace(/[^a-z0-9]/g, '') === c.replace(/[^a-z0-9]/g, '') ||
               (p.categoryName && p.categoryName.toLowerCase().trim() === c);
      });
    }
    if (brand) {
      const bLower = brand.toLowerCase();
      list = list.filter(p => p.brand && p.brand.toLowerCase() === bLower);
    }
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    if (minPrice !== undefined && minPrice !== '') {
      list = list.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      list = list.filter(p => p.price <= Number(maxPrice));
    }
    if (isDeal) {
      list = list.filter(p => p.isDeal || p.isHotDeal);
    }
    if (isFeatured) {
      list = list.filter(p => p.isFeatured);
    }
    if (isNewItem) {
      list = list.filter(p => p.isNewItem);
    }

    // Sorting
    if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'popular') {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else {
      // newest
      list.sort((a, b) => (b.id > a.id ? 1 : -1));
    }

    const total = list.length;
    const p = Math.max(1, Number(page));
    const l = Math.max(1, Number(limit));
    const startIndex = (p - 1) * l;
    const paginatedItems = list.slice(startIndex, startIndex + l);

    return {
      items: paginatedItems,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l)
    };
  },

  async getProductBySlug(slug) {
    if (!slug) return null;
    const s = slug.toLowerCase().trim();
    const product = memoryStore.products.find(p => 
      p.slug === slug || 
      p.id === slug || 
      p.slug.toLowerCase() === s ||
      p.id.toLowerCase() === s
    );
    if (!product) return null;

    // Fetch up to 6 related products in same category
    const related = memoryStore.products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 6);

    return { ...product, related };
  },

  async createProduct(data) {
    const prod = {
      id: `prod-${Date.now()}`,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      stock: data.stock !== undefined ? Number(data.stock) : 10,
      price: Number(data.price || 0),
      oldPrice: Number(data.oldPrice || 0),
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ["https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80"],
      specs: data.specs || {},
      rating: 5.0,
      reviewCount: 1,
      ...data
    };
    memoryStore.products.unshift(prod);
    if (isMongo()) {
      try { await Product.create(prod); } catch(e) {}
    }
    return prod;
  },

  async updateProduct(id, data) {
    const idx = memoryStore.products.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return null;
    memoryStore.products[idx] = { ...memoryStore.products[idx], ...data };
    if (isMongo()) {
      try { await Product.findOneAndUpdate({ id }, data); } catch(e) {}
    }
    return memoryStore.products[idx];
  },

  async deleteProduct(id) {
    const idx = memoryStore.products.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return false;
    memoryStore.products.splice(idx, 1);
    if (isMongo()) {
      try { await Product.findOneAndDelete({ id }); } catch(e) {}
    }
    return true;
  },

  // --- BRANDS ---
  async getBrands() {
    return memoryStore.brands;
  },

  async getBrandBySlug(slug) {
    const brand = memoryStore.brands.find(b => b.slug === slug || b.id === slug);
    if (!brand) return null;
    const products = memoryStore.products.filter(p => p.brand && p.brand.toLowerCase() === brand.name.toLowerCase());
    return { ...brand, products };
  },

  async createBrand(data) {
    const b = {
      id: `brand-${Date.now()}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ...data
    };
    memoryStore.brands.push(b);
    return b;
  },

  async updateBrand(id, data) {
    const idx = memoryStore.brands.findIndex(b => b.id === id || b.slug === id);
    if (idx === -1) return null;
    memoryStore.brands[idx] = { ...memoryStore.brands[idx], ...data };
    return memoryStore.brands[idx];
  },

  async deleteBrand(id) {
    const idx = memoryStore.brands.findIndex(b => b.id === id || b.slug === id);
    if (idx === -1) return false;
    memoryStore.brands.splice(idx, 1);
    return true;
  },

  // --- BANNERS ---
  async getBanners() {
    return memoryStore.banners.filter(b => b.active !== false).sort((a, b) => a.order - b.order);
  },

  async createBanner(data) {
    const banner = {
      id: `banner-${Date.now()}`,
      order: memoryStore.banners.length + 1,
      active: true,
      ...data
    };
    memoryStore.banners.push(banner);
    return banner;
  },

  async updateBanner(id, data) {
    const idx = memoryStore.banners.findIndex(b => b.id === id);
    if (idx === -1) return null;
    memoryStore.banners[idx] = { ...memoryStore.banners[idx], ...data };
    return memoryStore.banners[idx];
  },

  async deleteBanner(id) {
    const idx = memoryStore.banners.findIndex(b => b.id === id);
    if (idx === -1) return false;
    memoryStore.banners.splice(idx, 1);
    return true;
  },

  // --- ORDERS & TRACKING ---
  async createOrder({ customer, items, paymentMethod = 'cod' }) {
    if (!customer || !customer.name || !customer.phone || !customer.address) {
      throw new Error('Customer name, phone, and address are required');
    }
    if (!items || !items.length) {
      throw new Error('Order must contain at least one item');
    }

    // Resolve products from store
    const resolvedItems = items.map(item => {
      const prodId = item.productId || item.id;
      const prod = memoryStore.products.find(p => p.id === prodId || p.slug === prodId);
      return {
        id: prod ? prod.id : (item.id || item.productId),
        productId: prod ? prod.id : (item.productId || item.id),
        title: item.title || (prod ? prod.title : 'Product Item'),
        price: Number(item.price !== undefined ? item.price : (prod ? prod.price : 0)),
        quantity: Math.max(1, Number(item.quantity) || 1),
        image: item.image || (prod && prod.images ? prod.images[0] : '')
      };
    });

    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const subtotal = resolvedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const isInsideDhaka = customer.area === 'inside_dhaka' || (customer.division && customer.division.toLowerCase() === 'dhaka');
    const deliveryCharge = isInsideDhaka ? 70 : 130;
    const discount = 0;
    const total = subtotal + deliveryCharge - discount;

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customer.name,
      phone: customer.phone,
      address: customer.address,
      division: customer.division || 'Dhaka',
      district: customer.district || 'Dhaka',
      area: customer.area || 'City',
      customer,
      items: resolvedItems,
      subtotal,
      deliveryCharge,
      discount,
      total,
      paymentMethod,
      note: customer.note || '',
      status: 'pending',
      timeline: [
        {
          status: 'pending',
          note: 'Order submitted by customer',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };

    memoryStore.orders.unshift(newOrder);

    // Decrement stock in memory
    for (const item of resolvedItems) {
      const prod = memoryStore.products.find(p => p.id === item.productId || p.slug === item.productId);
      if (prod && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    if (isMongo()) {
      try { await Order.create(newOrder); } catch(e) {}
    }

    return newOrder;
  },

  async getOrders({ status, search, page = 1, limit = 20 } = {}) {
    let list = [...memoryStore.orders];
    if (status) {
      list = list.filter(o => o.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const p = Math.max(1, Number(page));
    const l = Math.max(1, Number(limit));
    const startIndex = (p - 1) * l;

    return {
      items: list.slice(startIndex, startIndex + l),
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l)
    };
  },

  async getOrderById(id) {
    return memoryStore.orders.find(o => o.id === id || o.orderNumber === id) || null;
  },

  async trackOrder({ phone, orderNumber, invoiceId }) {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const targetOrderNo = orderNumber || invoiceId;

    const matched = memoryStore.orders.filter(o => {
      const pMatch = cleanPhone ? o.customer.phone.replace(/[^0-9]/g, '').includes(cleanPhone) : true;
      const oMatch = targetOrderNo ? o.orderNumber.toLowerCase() === targetOrderNo.toLowerCase() : true;
      return pMatch && oMatch;
    });

    return matched;
  },

  async updateOrderStatus(id, { status, note }) {
    const order = memoryStore.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;
    order.status = status;
    order.timeline.push({
      status,
      note: note || `Order marked as ${status}`,
      timestamp: new Date().toISOString()
    });
    if (isMongo()) {
      try { await Order.findOneAndUpdate({ id: order.id }, { status, $push: { timeline: { status, note, timestamp: new Date() } } }); } catch(e) {}
    }
    return order;
  },

  // --- COMPLAINTS ---
  async getComplaints() {
    return memoryStore.complaints;
  },

  async createComplaint({ name, phone, orderId, description, image }) {
    if (!name || !phone || !description) {
      throw new Error('Name, phone, and problem description are required');
    }
    const comp = {
      id: `comp-${Date.now()}`,
      name,
      phone,
      orderId: orderId || '',
      description,
      image: image || '',
      status: 'new',
      adminNotes: '',
      createdAt: new Date().toISOString()
    };
    memoryStore.complaints.unshift(comp);
    if (isMongo()) {
      try { await Complaint.create(comp); } catch(e) {}
    }
    return comp;
  },

  async updateComplaintStatus(id, { status, adminNotes }) {
    const comp = memoryStore.complaints.find(c => c.id === id);
    if (!comp) return null;
    if (status) comp.status = status;
    if (adminNotes !== undefined) comp.adminNotes = adminNotes;
    return comp;
  },

  // --- SELLERS ---
  async getSellers() {
    return memoryStore.sellers;
  },

  async createSeller(data) {
    const seller = {
      id: `seller-${Date.now()}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: 5.0,
      totalProducts: 0,
      status: 'active',
      ...data
    };
    memoryStore.sellers.push(seller);
    return seller;
  },

  // --- STATIC PAGES ---
  async getPage(slug) {
    return memoryStore.pages.find(p => p.slug === slug) || null;
  },

  async getAllPages() {
    return memoryStore.pages.map(({ slug, title, metaTitle, metaDescription }) => ({ slug, title, metaTitle, metaDescription }));
  },

  async updatePage(slug, data) {
    const idx = memoryStore.pages.findIndex(p => p.slug === slug);
    if (idx === -1) {
      const newPage = { slug, title: data.title || slug, content: data.content || '', ...data };
      memoryStore.pages.push(newPage);
      return newPage;
    }
    memoryStore.pages[idx] = { ...memoryStore.pages[idx], ...data, updatedAt: new Date().toISOString() };
    return memoryStore.pages[idx];
  },

  // --- SETTINGS ---
  async getSettings() {
    return memoryStore.settings;
  },

  async updateSettings(data) {
    memoryStore.settings = { ...memoryStore.settings, ...data, updatedAt: new Date().toISOString() };
    return memoryStore.settings;
  },

  // --- NEWSLETTER ---
  async addSubscriber(email) {
    if (!email || !email.includes('@')) throw new Error('Valid email address is required');
    const clean = email.toLowerCase().trim();
    const existing = memoryStore.subscribers.find(s => s.email === clean);
    if (existing) return existing;
    const sub = { email: clean, subscribedAt: new Date().toISOString() };
    memoryStore.subscribers.unshift(sub);
    return sub;
  },

  async getSubscribers() {
    return memoryStore.subscribers;
  },

  // --- ADMIN DASHBOARD STATS ---
  async getDashboardStats() {
    if (isMongo()) {
      try {
        const [totalProducts, totalOrders, newComplaints, lowMongo, recentOrders] = await Promise.all([
          Product.countDocuments(),
          Order.countDocuments(),
          Complaint.countDocuments({ status: 'new' }),
          Product.find({ stock: { $lte: 10 } }).limit(10).lean(),
          Order.find().sort({ createdAt: -1 }).limit(5).lean()
        ]);

        const validOrders = await Order.find({ status: { $ne: 'cancelled' } }).lean();
        const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const pendingOrders = validOrders.filter(o => o.status === 'pending').length;

        const lowStockProducts = lowMongo.map(p => ({
          id: p._id.toString(),
          title: p.title,
          category: p.category,
          price: p.price,
          stock: p.stock
        }));

        return {
          totalOrders,
          totalRevenue,
          totalProducts,
          lowStockCount: lowStockProducts.length,
          lowStockProducts,
          pendingOrders,
          newComplaints,
          recentOrders
        };
      } catch (err) {
        console.warn('⚠️ MongoDB getDashboardStats error:', err.message);
      }
    }

    const totalOrders = memoryStore.orders.length;
    const totalRevenue = memoryStore.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const totalProducts = memoryStore.products.length;
    const lowStockProducts = memoryStore.products
      .filter(p => (p.stock || 0) <= 10)
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        stock: p.stock
      }));
    const lowStockCount = lowStockProducts.length;
    const pendingOrders = memoryStore.orders.filter(o => o.status === 'pending').length;
    const newComplaints = memoryStore.complaints.filter(c => c.status === 'new').length;

    return {
      totalOrders,
      totalRevenue,
      totalProducts,
      lowStockCount,
      lowStockProducts,
      pendingOrders,
      newComplaints,
      recentOrders: memoryStore.orders.slice(0, 5)
    };
  }
};

module.exports = db;
