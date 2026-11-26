const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
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
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Wishlist = require('../models/Wishlist');
const ActivityLog = require('../models/ActivityLog');
const { isAssignablePermissionKey } = require('../lib/permissions');

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
  reviews: [],
  coupons: [
    {
      id: "cp-1",
      code: "RONG10",
      description: "10% off storewide",
      discountType: "percent",
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscountAmount: 500,
      isActive: true,
      usedCount: 0,
      usageLimit: 500
    },
    {
      id: "cp-2",
      code: "FIRSTORDER",
      description: "৳100 off on first purchase",
      discountType: "fixed",
      discountValue: 100,
      minOrderAmount: 1000,
      maxDiscountAmount: 0,
      isActive: true,
      usedCount: 0,
      usageLimit: 200
    },
    {
      id: "cp-3",
      code: "FREE60",
      description: "৳60 off on orders over ৳500",
      discountType: "fixed",
      discountValue: 60,
      minOrderAmount: 500,
      maxDiscountAmount: 0,
      isActive: true,
      usedCount: 0,
      usageLimit: 300
    }
  ],
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

// Sync seed data to MongoDB if connected and empty per collection
const syncMongoSeeds = async () => {
  if (!isMongo()) return;
  try {
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      console.log('🌱 Seeding MongoDB Categories...');
      await Category.insertMany(seedData.categories);
    }

    const brandCount = await Brand.countDocuments();
    if (brandCount === 0) {
      console.log('🌱 Seeding MongoDB Brands...');
      await Brand.insertMany(seedData.brands);
    }

    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      console.log('🌱 Seeding MongoDB Banners...');
      await Banner.insertMany(seedData.banners);
    }

    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      console.log('🌱 Seeding MongoDB Products...');
      await Product.insertMany(seedData.products);
    }

    const pageCount = await Page.countDocuments();
    if (pageCount === 0) {
      console.log('🌱 Seeding MongoDB Pages...');
      await Page.insertMany(seedData.pages);
    }

    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      console.log('🌱 Seeding MongoDB Settings...');
      await Setting.create(seedData.settings);
    }

    const sellerCount = await Seller.countDocuments();
    if (sellerCount === 0) {
      console.log('🌱 Seeding MongoDB Sellers...');
      await Seller.insertMany(seedData.sellers);
    }

    const complaintCount = await Complaint.countDocuments();
    if (complaintCount === 0) {
      console.log('🌱 Seeding MongoDB Complaints...');
      await Complaint.insertMany(seedData.complaints);
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0 && memoryStore.orders.length > 0) {
      console.log('🌱 Seeding MongoDB Demo Order...');
      await Order.insertMany(memoryStore.orders);
    }

    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0 && memoryStore.coupons.length > 0) {
      console.log('🌱 Seeding MongoDB Coupons...');
      await Coupon.insertMany(memoryStore.coupons);
    }

    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('🌱 Seeding MongoDB Admin User...');
      await User.create({
        id: 'user-admin',
        name: 'MaxiTShop Administrator',
        email: ADMIN_EMAIL.toLowerCase().trim(),
        password: ADMIN_PASSWORD,
        phone: '+8801733115391',
        role: 'admin'
      });
    }

    console.log('✅ MongoDB collections verified and synchronized.');
  } catch (err) {
    console.warn('⚠️ Mongo sync warning:', err.message);
  }
};

mongoose.connection.on('connected', () => {
  syncMongoSeeds();
});

function normalizeModeratorPermissions(inputPermissions = []) {
  if (!Array.isArray(inputPermissions)) return [];
  const set = new Set();
  for (const key of inputPermissions) {
    if (typeof key === 'string' && isAssignablePermissionKey(key)) {
      set.add(key.trim());
    }
  }
  // Dependency rule: if an action is chosen, its view is automatically included
  if (set.has('products.create') || set.has('products.edit') || set.has('products.delete')) {
    set.add('products.view');
  }
  if (set.has('categories.manage')) {
    set.add('categories.view');
  }
  if (set.has('orders.update_status') || set.has('orders.cancel') || set.has('orders.refund')) {
    set.add('orders.view');
  }
  if (set.has('customers.edit')) {
    set.add('customers.view');
  }
  if (set.has('reviews.approve') || set.has('reviews.delete')) {
    set.add('reviews.view');
  }
  if (set.has('coupons.manage')) {
    set.add('coupons.view');
  }
  if (set.has('banners.manage')) {
    set.add('banners.view');
  }
  return Array.from(set);
}

const db = {
  // --- AUTHENTICATION ---
  async authenticateAdmin({ email, password }) {
    const adminEmail = (process.env.ADMIN_EMAIL || ADMIN_EMAIL).trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET || JWT_SECRET;

    if (!email || !password) return null;
    const inputEmail = email.trim().toLowerCase();

    // 1. Root Super Admin from environment
    if (inputEmail === adminEmail && password === adminPassword) {
      const jwtToken = jwt.sign(
        { id: 'user-admin', role: 'super_admin', email: inputEmail },
        jwtSecret,
        { expiresIn: '7d' }
      );
      return {
        token: jwtToken,
        user: {
          id: 'user-admin',
          name: 'MaxiTShop Administrator',
          email: inputEmail,
          role: 'super_admin',
          permissions: [],
          isActive: true
        }
      };
    }

    // 2. MongoDB Staff (Super Admin / Admin / Moderator)
    if (isMongo()) {
      try {
        const user = await User.findOne({
          email: inputEmail,
          role: { $in: ['super_admin', 'admin', 'moderator'] }
        }).lean();

        if (user) {
          if (user.isActive === false) {
            const err = new Error('Forbidden: Your moderator account has been deactivated. Please contact Super Admin.');
            err.statusCode = 403;
            throw err;
          }

          const isBcrypt = await bcrypt.compare(password, user.password).catch(() => false);
          if (isBcrypt || user.password === password) {
            const role = (user.role === 'admin' || user.role === 'super_admin') ? 'super_admin' : 'moderator';
            const permissions = role === 'super_admin' ? [] : (user.permissions || []);
            const jwtToken = jwt.sign(
              { id: user.id, role, email: user.email },
              jwtSecret,
              { expiresIn: '7d' }
            );
            return {
              token: jwtToken,
              user: {
                id: user.id,
                name: user.name || 'MaxiTShop Moderator',
                email: user.email,
                phone: user.phone || '',
                role,
                permissions,
                isActive: user.isActive !== false
              }
            };
          }
        }
      } catch (e) {
        if (e.statusCode === 403) throw e;
        console.warn('Admin DB auth check warning:', e.message);
      }
    }
    return null;
  },

  async registerCustomer({ name, email, phone, password, address }) {
    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMongo()) {
      const existing = await User.findOne({ email: cleanEmail }).lean();
      if (existing) {
        throw new Error('Email already registered');
      }
      const newUser = {
        id: `usr-${Date.now()}`,
        name,
        email: cleanEmail,
        phone: phone || '',
        password: hashedPassword,
        role: 'customer',
        addresses: address ? [{ name, phone, address, area: 'inside_dhaka', isDefault: true }] : []
      };
      await User.create(newUser);
      const token = jwt.sign({ id: newUser.id, role: 'customer', email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });
      return { token, user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role } };
    }

    const existing = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('Email already registered');
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email: cleanEmail,
      phone: phone || '',
      password: hashedPassword,
      role: 'customer',
      addresses: address ? [{ name, phone, address, isDefault: true }] : []
    };
    memoryStore.users.push(newUser);
    const token = jwt.sign({ id: newUser.id, role: 'customer', email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });
    return { token, user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role } };
  },

  async loginCustomer({ email, password }) {
    const cleanEmail = email.toLowerCase().trim();

    if (isMongo()) {
      const user = await User.findOne({ email: cleanEmail }).lean();
      if (!user) return null;
      const isMatch = await bcrypt.compare(password, user.password).catch(() => false) || (user.password === password);
      if (!isMatch) return null;
      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
      return { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } };
    }

    const user = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false) || (user.password === password);
    if (!isMatch) return null;
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    return { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } };
  },

  async getCustomerProfile(userId) {
    let user = null;
    if (isMongo()) {
      user = await User.findOne({ $or: [{ id: userId }, { _id: mongoose.isValidObjectId(userId) ? userId : null }] })
        .select('-password')
        .lean();
    }
    if (!user) {
      user = memoryStore.users.find(u => u.id === userId);
      if (user) {
        const { password, ...safeUser } = user;
        user = safeUser;
      }
    }
    if (!user) throw new Error('Customer profile not found');

    // Fetch customer past orders
    let customerOrders = [];
    if (isMongo()) {
      try {
        customerOrders = await Order.find({
          $or: [
            { 'customer.phone': user.phone },
            { 'customer.email': user.email }
          ]
        }).sort({ createdAt: -1 }).limit(20).lean();
      } catch (e) {}
    } else {
      customerOrders = memoryStore.orders.filter(o =>
        (user.phone && o.customer?.phone === user.phone) ||
        (user.email && o.customer?.email === user.email)
      );
    }

    return { user, orders: customerOrders };
  },

  async updateCustomerProfile(userId, { name, phone, addresses }) {
    const updateObj = {};
    if (name) updateObj.name = name.trim();
    if (phone) updateObj.phone = phone.trim();
    if (addresses && Array.isArray(addresses)) updateObj.addresses = addresses;

    if (isMongo()) {
      const updated = await User.findOneAndUpdate(
        { $or: [{ id: userId }, { _id: mongoose.isValidObjectId(userId) ? userId : null }] },
        { $set: updateObj },
        { new: true }
      ).select('-password').lean();
      if (updated) return updated;
    }

    const idx = memoryStore.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      memoryStore.users[idx] = { ...memoryStore.users[idx], ...updateObj };
      const { password, ...safeUser } = memoryStore.users[idx];
      return safeUser;
    }
    throw new Error('User not found');
  },

  // --- WISHLIST ---
  async getWishlist(userId) {
    let productIds = [];
    if (isMongo()) {
      const w = await Wishlist.findOne({ userId }).lean();
      if (w) productIds = w.products || [];
    } else {
      productIds = memoryStore.wishlists ? (memoryStore.wishlists[userId] || []) : [];
    }

    if (!productIds.length) return [];

    let items = [];
    if (isMongo()) {
      items = await Product.find({
        $or: [
          { id: { $in: productIds } },
          { slug: { $in: productIds } }
        ]
      }).lean();
    } else {
      items = memoryStore.products.filter(p => productIds.includes(p.id) || productIds.includes(p.slug));
    }
    return items;
  },

  async addToWishlist(userId, productId) {
    if (!productId) throw new Error('Product ID is required');

    if (isMongo()) {
      const w = await Wishlist.findOneAndUpdate(
        { userId },
        { $addToSet: { products: productId } },
        { upsert: true, new: true }
      ).lean();
      return (w && w.products) || [];
    }

    if (!memoryStore.wishlists) memoryStore.wishlists = {};
    if (!memoryStore.wishlists[userId]) memoryStore.wishlists[userId] = [];
    if (!memoryStore.wishlists[userId].includes(productId)) {
      memoryStore.wishlists[userId].push(productId);
    }
    return memoryStore.wishlists[userId];
  },

  async removeFromWishlist(userId, productId) {
    if (isMongo()) {
      const w = await Wishlist.findOneAndUpdate(
        { userId },
        { $pull: { products: productId } },
        { new: true }
      ).lean();
      return (w && w.products) || [];
    }

    if (memoryStore.wishlists && memoryStore.wishlists[userId]) {
      memoryStore.wishlists[userId] = memoryStore.wishlists[userId].filter(id => id !== productId);
      return memoryStore.wishlists[userId];
    }
    return [];
  },

  // --- CATEGORIES ---
  async getCategories(options = {}) {
    const normalizeMedia = (c) => ({
      ...c,
      image: typeof c.image === 'string' ? c.image.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i, '$3') : c.image,
      icon: typeof c.icon === 'string' ? c.icon.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i, '$3') : c.icon,
    });

    const sortByOrder = (list) => {
      return [...list].map(normalizeMedia).sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    if (isMongo()) {
      // If flat list of all categories is explicitly requested
      if (options.all === true || options.all === 'true') {
        const docs = await Category.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean();
        return sortByOrder(docs);
      }

      // Default or tree: return mother categories with children nested and product counts
      const allDocs = await Category.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean();
      const mothers = allDocs.filter(c => !c.parent);
      const children = allDocs.filter(c => !!c.parent);

      // Fast single aggregation for product counts
      let countMap = {};
      try {
        const countsAgg = await Product.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        countsAgg.forEach(item => {
          if (item._id) {
            const raw = String(item._id).toLowerCase();
            const clean = raw.replace(/^cat-/, '');
            countMap[raw] = (countMap[raw] || 0) + item.count;
            if (clean !== raw) {
              countMap[clean] = (countMap[clean] || 0) + item.count;
            }
          }
        });
      } catch (e) {
        console.warn('Product count aggregation error:', e.message);
      }

      const getCatCount = (slug) => {
        if (!slug) return 0;
        const sLower = slug.toLowerCase();
        const clean = sLower.replace(/^cat-/, '');
        return (countMap[sLower] || 0) + (clean !== sLower && countMap[clean] ? countMap[clean] : 0);
      };

      const result = mothers.map(mother => {
        const normMother = normalizeMedia(mother);
        const motherChildren = children
          .filter(c => c.parent === mother.slug || c.parent === mother.id)
          .map(c => {
            const normChild = normalizeMedia(c);
            normChild.productCount = getCatCount(c.slug);
            return normChild;
          })
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const totalChildrenCount = motherChildren.reduce((sum, c) => sum + (c.productCount || 0), 0);
        const directMotherCount = getCatCount(mother.slug);

        normMother.children = motherChildren;
        normMother.subcategories = motherChildren.map(c => ({ id: c.id, name: c.name, slug: c.slug }));
        normMother.productCount = directMotherCount + totalChildrenCount;
        normMother.isMother = true;
        return normMother;
      });

      return sortByOrder(result);
    }
    return sortByOrder(memoryStore.categories.filter(c => c.isActive !== false));
  },

  async getCategoryTree() {
    return this.getCategories({ tree: true });
  },

  async getCategoryBySlug(slug) {
    if (!slug) return null;
    const normalizeMedia = (c) => c ? ({
      ...c,
      image: typeof c.image === 'string' ? c.image.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i, '$3') : c.image,
      icon: typeof c.icon === 'string' ? c.icon.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i, '$3') : c.icon,
    }) : null;

    if (isMongo()) {
      const doc = await Category.findOne({ $or: [{ slug }, { id: slug }] }).lean();
      if (!doc) return null;
      const normalized = normalizeMedia(doc);

      if (!doc.parent) {
        // Mother Category
        const children = await Category.find({ parent: doc.slug, isActive: { $ne: false } }).sort({ order: 1 }).lean();
        const normChildren = children.map(normalizeMedia);

        const allSlugs = [doc.slug, ...children.map(c => c.slug)];
        const catRegexes = allSlugs.flatMap(s => {
          const clean = s.replace(/^cat-/, '');
          return [
            new RegExp(`^(cat-)?${clean}$`, 'i'),
            new RegExp(`^${clean.replace(/-/g, ' ')}$`, 'i')
          ];
        });

        const productCount = await Product.countDocuments({
          $or: [
            { category: { $in: catRegexes } },
            { categoryName: { $in: catRegexes } }
          ]
        });

        // Compute counts per child
        try {
          const childCountsAgg = await Product.aggregate([
            { $match: { $or: [{ category: { $in: catRegexes } }, { categoryName: { $in: catRegexes } }] } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ]);
          const countMap = {};
          childCountsAgg.forEach(item => {
            if (item._id) {
              const raw = String(item._id).toLowerCase();
              countMap[raw.replace(/^cat-/, '')] = item.count;
            }
          });
          normChildren.forEach(c => {
            const clean = c.slug.replace(/^cat-/, '').toLowerCase();
            c.productCount = countMap[clean] || 0;
          });
        } catch (e) {}

        normalized.isMother = true;
        normalized.children = normChildren;
        normalized.subcategories = normChildren.map(c => ({ id: c.id, name: c.name, slug: c.slug }));
        normalized.productCount = productCount;
        return normalized;
      } else {
        // Child Category
        const motherDoc = await Category.findOne({ slug: doc.parent }).lean();
        const siblings = await Category.find({ parent: doc.parent, isActive: { $ne: false } }).sort({ order: 1 }).lean();
        const cleanSlug = doc.slug.replace(/^cat-/, '');
        const productCount = await Product.countDocuments({
          $or: [
            { category: { $regex: new RegExp(`^(cat-)?${cleanSlug}$`, 'i') } },
            { categoryName: { $regex: new RegExp(`^${doc.name}$`, 'i') } }
          ]
        });

        // Compute product count per subcategory
        if (Array.isArray(normalized.subcategories) && normalized.subcategories.length > 0) {
          try {
            const subAgg = await Product.aggregate([
              {
                $match: {
                  $or: [
                    { category: { $regex: new RegExp(`^(cat-)?${cleanSlug}$`, 'i') } },
                    { categoryName: { $regex: new RegExp(`^${doc.name}$`, 'i') } }
                  ]
                }
              },
              { $group: { _id: '$subcategory', count: { $sum: 1 } } }
            ]);
            const subMap = {};
            subAgg.forEach(item => {
              if (item._id) {
                const sRaw = String(item._id).toLowerCase();
                subMap[sRaw] = item.count;
                subMap[sRaw.replace(/^sub-/, '')] = item.count;
              }
            });
            normalized.subcategories = normalized.subcategories.map(s => {
              const sClean = (s.slug || '').toLowerCase().replace(/^sub-/, '');
              return {
                ...s,
                productCount: subMap[sClean] || 0
              };
            });
          } catch (e) {}
        }

        normalized.isMother = false;
        normalized.parentCategory = motherDoc ? normalizeMedia(motherDoc) : null;
        normalized.siblings = siblings.map(normalizeMedia);
        normalized.productCount = productCount;
        return normalized;
      }
    }
    const found = memoryStore.categories.find(c => c.slug === slug || c.id === slug) || null;
    return normalizeMedia(found);
  },

  async createCategory(data) {
    const cleanData = { ...data };
    if (typeof cleanData.image === 'string') {
      cleanData.image = cleanData.image.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i, '$3');
    }
    if (typeof cleanData.icon === 'string') {
      cleanData.icon = cleanData.icon.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i, '$3');
    }

    const orderCount = isMongo() ? await Category.countDocuments() : memoryStore.categories.length;
    const cat = {
      id: `cat-${Date.now()}`,
      slug: cleanData.slug || cleanData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      isActive: true,
      parent: cleanData.parent || null,
      order: cleanData.order || (orderCount + 1),
      ...cleanData
    };
    if (isMongo()) {
      try {
        const created = await Category.create(cat);
        memoryStore.categories.push(cat);
        return created.toObject ? created.toObject() : cat;
      } catch (e) {
        console.warn('Category.create error:', e.message);
      }
    }
    memoryStore.categories.push(cat);
    return cat;
  },

  async updateCategory(id, data) {
    const cleanData = { ...data };
    if (typeof cleanData.image === 'string') {
      cleanData.image = cleanData.image.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i, '$3');
    }
    if (typeof cleanData.icon === 'string') {
      cleanData.icon = cleanData.icon.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i, '$3');
    }
    if (cleanData.parent === '' || cleanData.parent === 'none') {
      cleanData.parent = null;
    }

    if (isMongo()) {
      const updated = await Category.findOneAndUpdate(
        { $or: [{ id }, { slug: id }] },
        cleanData,
        { new: true }
      ).lean();
      if (updated) {
        const idx = memoryStore.categories.findIndex(c => c.id === id || c.slug === id);
        if (idx !== -1) memoryStore.categories[idx] = { ...memoryStore.categories[idx], ...cleanData };
        return updated;
      }
    }
    const idx = memoryStore.categories.findIndex(c => c.id === id || c.slug === id);
    if (idx === -1) return null;
    memoryStore.categories[idx] = { ...memoryStore.categories[idx], ...cleanData };
    return memoryStore.categories[idx];
  },

  async deleteCategory(id) {
    if (isMongo()) {
      const cat = await Category.findOne({ $or: [{ id }, { slug: id }] }).lean();
      if (!cat) return false;

      // 1. Prevent deleting mother category that still has subcategories
      const childCount = await Category.countDocuments({ parent: cat.slug });
      if (childCount > 0) {
        const err = new Error(`Cannot delete mother category "${cat.name}" because it still contains ${childCount} subcategories. Please reassign or delete the subcategories first.`);
        err.statusCode = 400;
        throw err;
      }

      // 2. Prevent deleting category that contains products
      const cleanSlug = cat.slug.replace(/^cat-/, '');
      const prodCount = await Product.countDocuments({
        $or: [
          { category: { $regex: new RegExp(`^(cat-)?${cleanSlug}$`, 'i') } },
          { categoryName: { $regex: new RegExp(`^${cat.name}$`, 'i') } }
        ]
      });
      if (prodCount > 0) {
        const err = new Error(`Cannot delete category "${cat.name}" because it still contains ${prodCount} products. Please reassign or delete the products first.`);
        err.statusCode = 400;
        throw err;
      }

      await Category.findOneAndDelete({ _id: cat._id });
    }
    const idx = memoryStore.categories.findIndex(c => c.id === id || c.slug === id);
    if (idx !== -1) memoryStore.categories.splice(idx, 1);
    return true;
  },

  async bulkDeleteCategories(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return { deletedCount: 0 };
    let deletedCount = 0;
    if (isMongo()) {
      for (const id of ids) {
        try {
          const ok = await this.deleteCategory(id);
          if (ok) deletedCount++;
        } catch (e) {
          console.warn(`Bulk delete skipped category ${id}:`, e.message);
        }
      }
    }
    return { deletedCount };
  },

  // --- PRODUCTS ---
  async getProducts({ category, sub, subcategory, brand, search, minPrice, maxPrice, inStock, sort, page = 1, limit = 20, isDeal, isFeatured, isNewItem }) {
    if (isMongo()) {
      try {
        const filter = {};

        let targetCatSlugs = [];
        let isSolarMotherCategory = false;
        if (category) {
          const c = category.trim();
          const cleanSlug = c.replace(/^cat-/, '');
          if (cleanSlug === 'solar-renewable-energy' || cleanSlug === 'solar-wind-energy' || cleanSlug === 'solar-green-energy' || /solar.*renewable/i.test(c)) {
            isSolarMotherCategory = true;
          }

          // Check if this category has child categories in the DB
          try {
            const catDoc = await Category.findOne({
              $or: [
                { slug: { $regex: new RegExp(`^(cat-)?${cleanSlug}$`, 'i') } },
                { name: { $regex: new RegExp(`^${c}$`, 'i') } }
              ]
            }).lean();

            if (catDoc) {
              const docSlug = (catDoc.slug || '').replace(/^cat-/, '');
              if (docSlug === 'solar-renewable-energy' || docSlug === 'solar-wind-energy' || docSlug === 'solar-green-energy' || /solar.*renewable/i.test(catDoc.name)) {
                isSolarMotherCategory = true;
              }
              const childrenDocs = await Category.find({ parent: catDoc.slug, isActive: { $ne: false } }).lean();
              if (childrenDocs && childrenDocs.length > 0) {
                targetCatSlugs = [catDoc.slug, ...childrenDocs.map(ch => ch.slug)];
              } else {
                targetCatSlugs = [catDoc.slug];
              }
            } else {
              targetCatSlugs = [c];
            }
          } catch (e) {
            targetCatSlugs = [c];
          }
        }

        const subCat = (sub || subcategory || '').trim();
        if (subCat) {
          const cleanSub = subCat.replace(/^sub-/, '').replace(/^cat-/, '');
          let subCandidates = [cleanSub, `sub-${cleanSub}`, `cat-${cleanSub}`, subCat, cleanSub.replace(/-/g, ' ')];

          // Check if subCat is a registered Category doc (e.g. child category or mother category)
          let childDoc = null;
          try {
            childDoc = await Category.findOne({
              $or: [
                { slug: { $regex: new RegExp(`^(cat-)?${cleanSub}$`, 'i') } },
                { name: { $regex: new RegExp(`^${subCat}$`, 'i') } }
              ]
            }).lean();
          } catch (e) {}

          if (childDoc) {
            const cl = childDoc.slug.replace(/^cat-/, '');
            const catRegexes = [
              new RegExp(`^(cat-)?${cl}$`, 'i'),
              new RegExp(`^${cl.replace(/-/g, ' ')}$`, 'i')
            ];
            const childCondition = [
              { category: { $in: catRegexes } },
              { categoryName: { $regex: new RegExp(`^${childDoc.name}$`, 'i') } },
              { subcategory: { $regex: new RegExp(`^(sub-)?${cl}$`, 'i') } }
            ];

            if (targetCatSlugs.length > 0) {
              const parentRegexes = targetCatSlugs.flatMap(s => {
                const clParent = s.replace(/^cat-/, '');
                return [
                  new RegExp(`^(cat-)?${clParent}$`, 'i'),
                  new RegExp(`^${clParent.replace(/-/g, ' ')}$`, 'i')
                ];
              });
              filter.$and = (filter.$and || []).concat([
                { $or: [{ category: { $in: parentRegexes } }, { categoryName: { $in: parentRegexes } }] },
                { $or: childCondition }
              ]);
            } else {
              if (filter.$or) {
                filter.$and = (filter.$and || []).concat([
                  { $or: filter.$or },
                  { $or: childCondition }
                ]);
                delete filter.$or;
              } else {
                filter.$or = childCondition;
              }
            }
          } else {
            // subCat is a Level 3 subcategory (e.g. dc-protection-spd)
            // Also check if any category doc has this subcategory embedded
            if (category) {
              try {
                const cleanCat = category.replace(/^cat-/, '');
                const catDoc = await Category.findOne({
                  $or: [
                    { slug: { $regex: new RegExp(`^(cat-)?${cleanCat}$`, 'i') } },
                    { name: { $regex: new RegExp(`^${category}$`, 'i') } }
                  ]
                }).lean();

                if (catDoc && Array.isArray(catDoc.subcategories)) {
                  const targetSub = catDoc.subcategories.find(s =>
                    s.slug === subCat ||
                    s.slug === cleanSub ||
                    s.id === subCat ||
                    s.id === `sub-${subCat}` ||
                    (s.name && s.name.toLowerCase() === subCat.toLowerCase()) ||
                    (s.slug && s.slug.replace(/^sub-/, '') === cleanSub)
                  );
                  if (targetSub) {
                    const sClean = (targetSub.slug || '').replace(/^sub-/, '').replace(/^cat-/, '');
                    subCandidates.push(
                      targetSub.id,
                      targetSub.slug,
                      `sub-${sClean}`,
                      sClean,
                      targetSub.name,
                      sClean.replace(/-/g, ' ')
                    );
                  }
                }
              } catch (e) {}
            }

            const uniqueCandidates = [...new Set(subCandidates.filter(Boolean))];
            const subRegexList = uniqueCandidates.map(c => new RegExp(`^${c.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'));

            const subCondition = [
              { subcategory: { $in: subRegexList } },
              { subcategoryName: { $in: subRegexList } },
              { subCategoryId: { $in: uniqueCandidates } },
              { subCategory: { $in: uniqueCandidates } }
            ];

            if (targetCatSlugs.length > 0) {
              const catRegexes = targetCatSlugs.flatMap(s => {
                const cl = s.replace(/^cat-/, '');
                return [
                  new RegExp(`^(cat-)?${cl}$`, 'i'),
                  new RegExp(`^${cl.replace(/-/g, ' ')}$`, 'i')
                ];
              });
              filter.$and = (filter.$and || []).concat([
                { $or: [{ category: { $in: catRegexes } }, { categoryName: { $in: catRegexes } }] },
                { $or: subCondition }
              ]);
            } else {
              if (filter.$or) {
                filter.$and = (filter.$and || []).concat([
                  { $or: filter.$or },
                  { $or: subCondition }
                ]);
                delete filter.$or;
              } else {
                filter.$or = subCondition;
              }
            }
          }
        } else if (targetCatSlugs.length > 0) {
          const catRegexes = targetCatSlugs.flatMap(s => {
            const cl = s.replace(/^cat-/, '');
            return [
              new RegExp(`^(cat-)?${cl}$`, 'i'),
              new RegExp(`^${cl.replace(/-/g, ' ')}$`, 'i')
            ];
          });
          filter.$or = [
            { category: { $in: catRegexes } },
            { categoryName: { $in: catRegexes } }
          ];
        }

        if (brand) {
          const brandList = brand.split(',').map(b => b.trim()).filter(Boolean);
          if (brandList.length === 1) {
            filter.brand = { $regex: new RegExp(`^${brandList[0]}$`, 'i') };
          } else if (brandList.length > 1) {
            filter.brand = { $in: brandList.map(b => new RegExp(`^${b}$`, 'i')) };
          }
        }

        if (search) {
          const rawSearch = search.trim();
          // Escape special regex characters
          const escaped = rawSearch.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
          const textRegex = new RegExp(escaped, 'i');

          // Extract number part if user searched e.g. "18477", "BD-18477", or "MX-18477"
          const numPart = rawSearch.replace(/^(BD|MX)-?/i, '');
          const patterns = [
            rawSearch,
            ...(numPart && numPart !== rawSearch ? [numPart, `MX-${numPart}`, `BD-${numPart}`] : [`MX-${rawSearch}`])
          ];
          const codeRegexes = patterns.map(p => new RegExp(`^${p.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'));

          const searchConditions = [
            { productCode: { $in: codeRegexes } },
            { productCode: textRegex },
            { id: { $in: codeRegexes } },
            { id: textRegex },
            { title: textRegex },
            { brand: textRegex },
            { shortDescription: textRegex },
            { description: textRegex },
            { category: textRegex },
            { categoryName: textRegex }
          ];
          if (filter.$or) {
            filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
            delete filter.$or;
          } else {
            filter.$or = searchConditions;
          }
        }

        if (minPrice !== undefined && minPrice !== '') {
          filter.price = { ...(filter.price || {}), $gte: Number(minPrice) };
        }
        if (maxPrice !== undefined && maxPrice !== '') {
          filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) };
        }

        if (inStock === 'true' || inStock === true || inStock === '1') {
          filter.stock = { $gt: 0 };
        }

        if (isDeal) {
          const dealCondition = [{ isDeal: true }, { isHotDeal: true }];
          if (filter.$or) {
            filter.$and = [{ $or: filter.$or }, { $or: dealCondition }];
            delete filter.$or;
          } else {
            filter.$or = dealCondition;
          }
        }

        if (isFeatured) {
          filter.isFeatured = true;
        }

        if (isNewItem) {
          filter.isNewItem = true;
        }

        let sortObj = { _id: -1 };
        if (sort === 'price-asc') sortObj = isSolarMotherCategory ? { solarPriority: 1, price: 1, _id: -1 } : { price: 1 };
        else if (sort === 'price-desc') sortObj = isSolarMotherCategory ? { solarPriority: 1, price: -1, _id: -1 } : { price: -1 };
        else if (sort === 'popular') sortObj = isSolarMotherCategory ? { solarPriority: 1, reviewCount: -1, rating: -1, _id: -1 } : { reviewCount: -1, rating: -1 };
        else if (sort === 'rating') sortObj = isSolarMotherCategory ? { solarPriority: 1, rating: -1, reviewCount: -1, _id: -1 } : { rating: -1, reviewCount: -1 };
        else if (sort === 'newest') sortObj = isSolarMotherCategory ? { solarPriority: 1, createdAt: -1, _id: -1 } : { createdAt: -1, _id: -1 };
        else if (isSolarMotherCategory) sortObj = { solarPriority: 1, createdAt: -1, _id: -1 };

        const p = Math.max(1, Number(page));
        const l = Math.max(1, Number(limit));
        const skip = (p - 1) * l;

        let items, total;
        if (isSolarMotherCategory) {
          const solarPriorityStage = {
            $addFields: {
              solarPriority: {
                $switch: {
                  branches: [
                    // Priority 1: Solar PV Panels
                    {
                      case: {
                        $or: [
                          { $regexMatch: { input: { $ifNull: ["$subcategory", ""] }, regex: /^solar-pv(-panels)?$/i } },
                          { $regexMatch: { input: { $ifNull: ["$subcategory", ""] }, regex: /solar-pv|solar-panel/i } },
                          { $regexMatch: { input: { $ifNull: ["$subcategoryName", ""] }, regex: /solar.*panel|solar.*pv/i } },
                          {
                            $and: [
                              { $regexMatch: { input: "$title", regex: /solar panel|solar pv/i } },
                              { $not: { $regexMatch: { input: "$title", regex: /inverter|battery|connector|cable|clip|structure|breaker|fuse|distribution|busbar/i } } }
                            ]
                          }
                        ]
                      },
                      then: 1
                    },
                    // Priority 2: Solar Energy child category (charge controllers, accessories, protection, cables)
                    {
                      case: {
                        $or: [
                          { $regexMatch: { input: { $ifNull: ["$category", ""] }, regex: /^(cat-)?solar-energy$/i } },
                          { $regexMatch: { input: { $ifNull: ["$categoryName", ""] }, regex: /^SOLAR ENERGY$/i } }
                        ]
                      },
                      then: 2
                    },
                    // Priority 3: Solar Inverter
                    {
                      case: {
                        $or: [
                          { $regexMatch: { input: { $ifNull: ["$category", ""] }, regex: /^(cat-)?solar-inverter$/i } },
                          { $regexMatch: { input: { $ifNull: ["$categoryName", ""] }, regex: /SOLAR INVERTER/i } },
                          { $regexMatch: { input: { $ifNull: ["$subcategory", ""] }, regex: /solar-inverter/i } }
                        ]
                      },
                      then: 3
                    },
                    // Priority 4: Solar Battery
                    {
                      case: {
                        $or: [
                          { $regexMatch: { input: { $ifNull: ["$category", ""] }, regex: /^(cat-)?solar-battery$/i } },
                          { $regexMatch: { input: { $ifNull: ["$categoryName", ""] }, regex: /SOLAR BATTERY/i } },
                          { $regexMatch: { input: { $ifNull: ["$subcategory", ""] }, regex: /solar-battery/i } }
                        ]
                      },
                      then: 4
                    },
                    // Priority 5: Solar Package
                    {
                      case: {
                        $or: [
                          { $regexMatch: { input: { $ifNull: ["$category", ""] }, regex: /^(cat-)?solar-package$/i } },
                          { $regexMatch: { input: { $ifNull: ["$categoryName", ""] }, regex: /SOLAR PACKAGE/i } },
                          { $regexMatch: { input: { $ifNull: ["$subcategory", ""] }, regex: /solar-package/i } }
                        ]
                      },
                      then: 5
                    },
                    // Priority 6: Any other product mentioning solar
                    {
                      case: {
                        $or: [
                          { $regexMatch: { input: { $ifNull: ["$category", ""] }, regex: /solar/i } },
                          { $regexMatch: { input: { $ifNull: ["$subcategory", ""] }, regex: /solar/i } },
                          { $regexMatch: { input: "$title", regex: /solar/i } }
                        ]
                      },
                      then: 6
                    }
                  ],
                  default: 7
                }
              }
            }
          };

          const facetResult = await Product.aggregate([
            { $match: filter },
            solarPriorityStage,
            {
              $facet: {
                items: [
                  { $sort: sortObj },
                  { $skip: skip },
                  { $limit: l }
                ],
                totalCount: [
                  { $count: "count" }
                ]
              }
            }
          ]);

          items = facetResult[0]?.items || [];
          total = facetResult[0]?.totalCount[0]?.count || 0;
        } else {
          [items, total] = await Promise.all([
            Product.find(filter).sort(sortObj).skip(skip).limit(l).lean(),
            Product.countDocuments(filter)
          ]);
        }

        // Compute distinct brands for filter facet
        let availableBrands = [];
        try {
          const brandFilter = { ...filter };
          delete brandFilter.brand;
          availableBrands = await Product.distinct('brand', brandFilter);
        } catch (e) {}

        return {
          items,
          total,
          page: p,
          limit: l,
          totalPages: Math.ceil(total / l),
          filterMeta: {
            availableBrands: (availableBrands || []).filter(b => b && typeof b === 'string' && b.trim())
          }
        };
      } catch (err) {
        console.warn('⚠️ Product.find error (falling back to memory):', err.message);
      }
    }

    // Memory Store Fallback
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
    if (sub || subcategory) {
      const s = (sub || subcategory).toLowerCase().trim().replace(/^sub-/, '').replace(/^cat-/, '');
      list = list.filter(p => {
        const pSub = (p.subcategory || p.subCategory || p.subCategoryId || '').toLowerCase().trim().replace(/^sub-/, '');
        const pSubName = (p.subcategoryName || '').toLowerCase().trim();
        const pCat = (p.category || '').toLowerCase().trim().replace(/^cat-/, '');
        const pCatName = (p.categoryName || '').toLowerCase().trim();
        return pSub === s || pSub.replace(/[^a-z0-9]/g, '') === s.replace(/[^a-z0-9]/g, '') ||
               pSubName === s ||
               pCat === s || pCat.replace(/[^a-z0-9]/g, '') === s.replace(/[^a-z0-9]/g, '') ||
               pCatName === s;
      });
    }
    if (brand) {
      const brandList = brand.split(',').map(b => b.toLowerCase().trim()).filter(Boolean);
      list = list.filter(p => p.brand && brandList.includes(p.brand.toLowerCase().trim()));
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
    if (inStock === 'true' || inStock === true || inStock === '1') {
      list = list.filter(p => (p.stock || 0) > 0);
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
    const isSolarMotherFallback = category && (
      category.toLowerCase().includes('solar-renewable-energy') ||
      category.toLowerCase().includes('solar-wind-energy') ||
      category.toLowerCase().includes('solar-green-energy') ||
      /solar.*renewable/i.test(category)
    );

    const getSolarPriority = (p) => {
      const cat = (p.category || '').toLowerCase();
      const catName = (p.categoryName || '').toLowerCase();
      const sub = (p.subcategory || p.subCategory || '').toLowerCase();
      const subName = (p.subcategoryName || '').toLowerCase();
      const title = (p.title || '').toLowerCase();

      const isPureSolarPanelTitle = /solar panel|solar pv/i.test(title) && !/inverter|battery|connector|cable|clip|structure|breaker|fuse|distribution|busbar/i.test(title);
      if (/^solar-pv(-panels)?$/i.test(sub) || /solar-pv|solar-panel/i.test(sub) || /solar.*panel|solar.*pv/i.test(subName) || isPureSolarPanelTitle) return 1;
      if (/^(cat-)?solar-energy$/i.test(cat) || catName === 'solar energy') return 2;
      if (/^(cat-)?solar-inverter$/i.test(cat) || catName.includes('solar inverter') || /solar-inverter/i.test(sub)) return 3;
      if (/^(cat-)?solar-battery$/i.test(cat) || catName.includes('solar battery') || /solar-battery/i.test(sub)) return 4;
      if (/^(cat-)?solar-package$/i.test(cat) || catName.includes('solar package') || /solar-package/i.test(sub)) return 5;
      if (/solar/i.test(cat) || /solar/i.test(sub) || /solar/i.test(title)) return 6;
      return 7;
    };

    if (isSolarMotherFallback) {
      list.sort((a, b) => {
        const pA = getSolarPriority(a);
        const pB = getSolarPriority(b);
        if (pA !== pB) return pA - pB;
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'popular') return (b.reviewCount || 0) - (a.reviewCount || 0);
        if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
        return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime()) || String(b.id).localeCompare(String(a.id));
      });
    } else if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'popular') {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'newest') {
      list.sort((a, b) => (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime()));
    } else {
      list.sort((a, b) => (b.id > a.id ? 1 : -1));
    }

    const total = list.length;
    const p = Math.max(1, Number(page));
    const l = Math.max(1, Number(limit));
    const startIndex = (p - 1) * l;
    const paginatedItems = list.slice(startIndex, startIndex + l);

    const distinctBrands = Array.from(new Set(
      memoryStore.products
        .filter(p => !category || p.category === category)
        .map(p => p.brand)
        .filter(Boolean)
    ));

    return {
      items: paginatedItems,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
      filterMeta: {
        availableBrands: distinctBrands
      }
    };
  },

  async getProductBySlug(slug) {
    if (!slug) return null;
    const s = slug.trim();

    if (isMongo()) {
      try {
        const product = await Product.findOne({
          $or: [
            { slug: s },
            { id: s },
            { slug: { $regex: new RegExp(`^${s}$`, 'i') } },
            { id: { $regex: new RegExp(`^${s}$`, 'i') } }
          ]
        }).lean();

        if (product) {
          let related = await Product.find({
            category: product.category,
            id: { $ne: product.id }
          }).limit(4).lean();

          if (related.length < 4) {
            const more = await Product.find({
              id: { $ne: product.id, $nin: related.map(r => r.id) }
            }).limit(4 - related.length).lean();
            related = [...related, ...more];
          }

          return { ...product, related, relatedProducts: related };
        }
      } catch (err) {
        console.warn('⚠️ Product.findOne error:', err.message);
      }
    }

    // Memory Store Fallback
    const product = memoryStore.products.find(p => 
      p.slug === slug || 
      p.id === slug || 
      p.slug.toLowerCase() === s.toLowerCase() ||
      p.id.toLowerCase() === s.toLowerCase()
    );
    if (!product) return null;

    let related = memoryStore.products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    if (related.length < 4) {
      const more = memoryStore.products
        .filter(p => p.id !== product.id && !related.some(r => r.id === p.id))
        .slice(0, 4 - related.length);
      related = [...related, ...more];
    }

    return { ...product, related, relatedProducts: related };
  },

  async createProduct(data) {
    let code = data.productCode ? String(data.productCode).trim() : '';
    if (!code) {
      if (isMongo()) {
        try {
          const lastProd = await Product.findOne({ productCode: /^MX-\d+$/ }).sort({ productCode: -1 }).lean();
          if (lastProd && lastProd.productCode) {
            const num = parseInt(lastProd.productCode.replace('MX-', ''), 10);
            if (!isNaN(num)) code = `MX-${num + 1}`;
          }
        } catch (e) {}
      }
      if (!code) {
        code = `MX-${Math.floor(70000 + Math.random() * 20000)}`;
      }
    } else if (!code.startsWith('MX-')) {
      code = `MX-${code.replace(/^BD-/, '')}`;
    }

    const prod = {
      id: `prod-${Date.now()}`,
      productCode: code,
      slug: data.slug || (data.title || 'prod').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      stock: data.stock !== undefined ? Number(data.stock) : 10,
      price: Number(data.price || 0),
      oldPrice: Number(data.oldPrice || 0),
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.image || "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80"],
      specs: data.specs || {},
      rating: 5.0,
      reviewCount: 1,
      ...data,
      productCode: code
    };

    if (isMongo()) {
      try {
        const created = await Product.create(prod);
        memoryStore.products.unshift(prod);
        return created.toObject ? created.toObject() : prod;
      } catch (e) {
        console.warn('Product.create error:', e.message);
      }
    }
    memoryStore.products.unshift(prod);
    return prod;
  },

  async updateProduct(id, data) {
    if (isMongo()) {
      try {
        const updated = await Product.findOneAndUpdate(
          { $or: [{ id }, { slug: id }] },
          data,
          { new: true }
        ).lean();
        if (updated) {
          const idx = memoryStore.products.findIndex(p => p.id === id || p.slug === id);
          if (idx !== -1) memoryStore.products[idx] = { ...memoryStore.products[idx], ...data };
          return updated;
        }
      } catch (e) {
        console.warn('Product.findOneAndUpdate error:', e.message);
      }
    }
    const idx = memoryStore.products.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return null;
    memoryStore.products[idx] = { ...memoryStore.products[idx], ...data };
    return memoryStore.products[idx];
  },

  async deleteProduct(id) {
    if (isMongo()) {
      try {
        await Product.findOneAndDelete({ $or: [{ id }, { slug: id }] });
      } catch (e) {}
    }
    const idx = memoryStore.products.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return false;
    memoryStore.products.splice(idx, 1);
    return true;
  },

  async bulkDeleteProducts(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return { deletedCount: 0 };
    let deletedCount = 0;
    if (isMongo()) {
      try {
        const res = await Product.deleteMany({
          $or: [{ id: { $in: ids } }, { slug: { $in: ids } }]
        });
        deletedCount = res.deletedCount || 0;
      } catch (e) {
        console.warn('bulkDeleteProducts Mongo error:', e.message);
      }
    }
    const idSet = new Set(ids);
    const before = memoryStore.products.length;
    memoryStore.products = memoryStore.products.filter(p => !idSet.has(p.id) && !idSet.has(p.slug));
    if (!isMongo()) {
      deletedCount = before - memoryStore.products.length;
    }
    return { deletedCount };
  },

  // --- PRODUCT REVIEWS ---
  async getProductReviews(slug) {
    if (!slug) return { reviews: [], summary: { averageRating: 5.0, totalReviews: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } } };
    const s = slug.trim();

    let reviews = [];
    if (isMongo()) {
      try {
        reviews = await Review.find({ productSlug: s }).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn('Review.find error:', e.message);
      }
    }

    if (!reviews || reviews.length === 0) {
      if (memoryStore.reviews) {
        reviews = memoryStore.reviews.filter(r => r.productSlug === s);
      }
    }

    // If still no reviews for this product, provide realistic initial reviews
    if (!reviews || reviews.length === 0) {
      const prod = await this.getProductBySlug(s);
      if (prod) {
        const defaultReviews = [
          {
            id: `rev-${s}-1`,
            productSlug: s,
            productId: prod.id,
            author: 'Tanvir Hossain',
            rating: 5,
            title: 'Authentic Grade A & Fast Delivery',
            comment: 'Received the exact product as advertised. Packaged safely and works smoothly. Support was very helpful on WhatsApp.',
            verifiedPurchase: true,
            helpfulCount: 7,
            createdAt: new Date(Date.now() - 3 * 86400000)
          },
          {
            id: `rev-${s}-2`,
            productSlug: s,
            productId: prod.id,
            author: 'Engr. M. Farhan',
            rating: 5,
            title: 'High quality build, highly recommended',
            comment: 'Tested the specs in our setup. Authentic quality, proper ratings. Will purchase again.',
            verifiedPurchase: true,
            helpfulCount: 4,
            createdAt: new Date(Date.now() - 7 * 86400000)
          }
        ];

        if (isMongo()) {
          try {
            await Review.insertMany(defaultReviews);
            reviews = await Review.find({ productSlug: s }).sort({ createdAt: -1 }).lean();
          } catch (e) {
            reviews = defaultReviews;
          }
        } else {
          if (!memoryStore.reviews) memoryStore.reviews = [];
          memoryStore.reviews.push(...defaultReviews);
          reviews = defaultReviews;
        }
      }
    }

    const totalReviews = reviews ? reviews.length : 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumRating = 0;

    for (const r of (reviews || [])) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
      sumRating += Number(r.rating || 5);
    }

    const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 5.0;

    return {
      reviews: reviews || [],
      summary: {
        averageRating,
        totalReviews,
        distribution
      }
    };
  },

  async submitProductReview(slug, { author, rating, title, comment }) {
    const prod = await this.getProductBySlug(slug);
    const newReview = {
      id: `rev-${Date.now()}`,
      productSlug: slug,
      productId: prod ? prod.id : slug,
      author: (author || 'Customer').trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      title: (title || 'Recommended Product').trim(),
      comment: (comment || '').trim(),
      verifiedPurchase: true,
      helpfulCount: 0,
      createdAt: new Date()
    };

    if (isMongo()) {
      try {
        const created = await Review.create(newReview);
        return created.toObject ? created.toObject() : newReview;
      } catch (e) {
        console.warn('Review.create error:', e.message);
      }
    }

    if (!memoryStore.reviews) memoryStore.reviews = [];
    memoryStore.reviews.unshift(newReview);
    return newReview;
  },

  async voteReviewHelpful(reviewId) {
    if (isMongo()) {
      try {
        const updated = await Review.findOneAndUpdate(
          { id: reviewId },
          { $inc: { helpfulCount: 1 } },
          { new: true }
        ).lean();
        if (updated) {
          return { helpfulCount: updated.helpfulCount };
        }
      } catch (e) {}
    }

    if (memoryStore.reviews) {
      const rev = memoryStore.reviews.find(r => r.id === reviewId);
      if (rev) {
        rev.helpfulCount = (rev.helpfulCount || 0) + 1;
        return { helpfulCount: rev.helpfulCount };
      }
    }
    return { helpfulCount: 1 };
  },

  // --- SEARCH SUGGESTIONS ---
  async getSearchSuggestions(q) {
    if (!q || !q.trim()) return [];
    const term = q.trim();

    if (isMongo()) {
      try {
        const escaped = term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const textRegex = new RegExp(escaped, 'i');
        const numPart = term.replace(/^(BD|MX)-?/i, '');
        const patterns = [
          term,
          ...(numPart && numPart !== term ? [numPart, `MX-${numPart}`, `BD-${numPart}`] : [`MX-${term}`])
        ];
        const codeRegexes = patterns.map(p => new RegExp(`^${p.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i'));

        const docs = await Product.find({
          $or: [
            { productCode: { $in: codeRegexes } },
            { productCode: textRegex },
            { id: { $in: codeRegexes } },
            { id: textRegex },
            { title: textRegex },
            { brand: textRegex },
            { category: textRegex },
            { categoryName: textRegex }
          ]
        }).limit(8).lean();

        return docs.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: p.price,
          oldPrice: p.oldPrice,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || ''),
          category: p.category,
          categoryName: p.categoryName,
          brand: p.brand,
          productCode: p.productCode || ''
        }));
      } catch (err) {
        console.warn('Search suggestions Mongo error:', err.message);
      }
    }

    const tLower = term.toLowerCase();
    return memoryStore.products
      .filter(p =>
        p.title.toLowerCase().includes(tLower) ||
        (p.brand && p.brand.toLowerCase().includes(tLower)) ||
        (p.category && p.category.toLowerCase().includes(tLower))
      )
      .slice(0, 6)
      .map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        oldPrice: p.oldPrice,
        image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || ''),
        category: p.category,
        brand: p.brand
      }));
  },

  // --- BRANDS ---
  async getBrands() {
    if (isMongo()) {
      const docs = await Brand.find().sort({ name: 1 }).lean();
      if (docs && docs.length) return docs;
    }
    return memoryStore.brands;
  },

  async getBrandBySlug(slug) {
    if (!slug) return null;
    if (isMongo()) {
      const brand = await Brand.findOne({ $or: [{ slug }, { id: slug }] }).lean();
      if (brand) {
        const products = await Product.find({ brand: { $regex: new RegExp(`^${brand.name}$`, 'i') } }).lean();
        return { ...brand, products };
      }
    }
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
    if (isMongo()) {
      try {
        const created = await Brand.create(b);
        memoryStore.brands.push(b);
        return created.toObject ? created.toObject() : b;
      } catch (e) {}
    }
    memoryStore.brands.push(b);
    return b;
  },

  async updateBrand(id, data) {
    if (isMongo()) {
      const updated = await Brand.findOneAndUpdate({ $or: [{ id }, { slug: id }] }, data, { new: true }).lean();
      if (updated) {
        const idx = memoryStore.brands.findIndex(b => b.id === id || b.slug === id);
        if (idx !== -1) memoryStore.brands[idx] = { ...memoryStore.brands[idx], ...data };
        return updated;
      }
    }
    const idx = memoryStore.brands.findIndex(b => b.id === id || b.slug === id);
    if (idx === -1) return null;
    memoryStore.brands[idx] = { ...memoryStore.brands[idx], ...data };
    return memoryStore.brands[idx];
  },

  async deleteBrand(id) {
    if (isMongo()) {
      try { await Brand.findOneAndDelete({ $or: [{ id }, { slug: id }] }); } catch (e) {}
    }
    const idx = memoryStore.brands.findIndex(b => b.id === id || b.slug === id);
    if (idx === -1) return false;
    memoryStore.brands.splice(idx, 1);
    return true;
  },

  // --- BANNERS ---
  async getBanners() {
    if (isMongo()) {
      const docs = await Banner.find({ active: { $ne: false } }).sort({ order: 1 }).lean();
      if (docs && docs.length) return docs;
    }
    return memoryStore.banners.filter(b => b.active !== false).sort((a, b) => a.order - b.order);
  },

  async createBanner(data) {
    const count = isMongo() ? await Banner.countDocuments() : memoryStore.banners.length;
    const banner = {
      id: `banner-${Date.now()}`,
      order: count + 1,
      active: true,
      ...data
    };
    if (isMongo()) {
      try {
        const created = await Banner.create(banner);
        memoryStore.banners.push(banner);
        return created.toObject ? created.toObject() : banner;
      } catch (e) {}
    }
    memoryStore.banners.push(banner);
    return banner;
  },

  async updateBanner(id, data) {
    if (isMongo()) {
      const updated = await Banner.findOneAndUpdate({ id }, data, { new: true }).lean();
      if (updated) {
        const idx = memoryStore.banners.findIndex(b => b.id === id);
        if (idx !== -1) memoryStore.banners[idx] = { ...memoryStore.banners[idx], ...data };
        return updated;
      }
    }
    const idx = memoryStore.banners.findIndex(b => b.id === id);
    if (idx === -1) return null;
    memoryStore.banners[idx] = { ...memoryStore.banners[idx], ...data };
    return memoryStore.banners[idx];
  },

  async deleteBanner(id) {
    if (isMongo()) {
      try { await Banner.findOneAndDelete({ id }); } catch (e) {}
    }
    const idx = memoryStore.banners.findIndex(b => b.id === id);
    if (idx === -1) return false;
    memoryStore.banners.splice(idx, 1);
    return true;
  },

  // --- ORDERS & TRACKING ---
  async createOrder({ customer, items, paymentMethod = 'cod', couponCode = '' }) {
    if (!customer || !customer.name || !customer.phone || !customer.address) {
      throw new Error('Customer name, phone, and address are required');
    }
    if (!items || !items.length) {
      throw new Error('Order must contain at least one item');
    }

    // Resolve products from store/db
    const resolvedItems = [];
    for (const item of items) {
      const prodId = item.productId || item.id;
      let prod = null;
      if (isMongo()) {
        try {
          prod = await Product.findOne({ $or: [{ id: prodId }, { slug: prodId }] }).lean();
        } catch (e) {}
      }
      if (!prod) {
        prod = memoryStore.products.find(p => p.id === prodId || p.slug === prodId);
      }
      if (!prod) {
        throw new Error(`Product not found: ${prodId}`);
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      if (prod.stock !== undefined && prod.stock < qty) {
        throw new Error(`Insufficient stock for "${prod.title}". Only ${prod.stock} available.`);
      }

      // Strictly enforce verified server price to eliminate client price-tampering
      const verifiedPrice = Number(prod.price || 0);

      // Derive variation or variant information if present
      let variationStr = item.variation || item.variant || '';
      if (!variationStr && item.selectedVariation) {
        if (typeof item.selectedVariation === 'object') {
          variationStr = Object.entries(item.selectedVariation).map(([k, v]) => `${k}: ${v}`).join(', ');
        } else {
          variationStr = String(item.selectedVariation);
        }
      }
      if (!variationStr && prod.specs && typeof prod.specs === 'object') {
        const specEntries = Object.entries(prod.specs);
        if (specEntries.length > 0) {
          variationStr = specEntries.slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ');
        }
      }

      resolvedItems.push({
        productId: prod.id,
        title: prod.title,
        price: verifiedPrice,
        quantity: qty,
        image: (prod.images && prod.images[0]) || prod.image || '',
        variation: variationStr,
        variant: variationStr,
        specs: prod.specs || {}
      });
    }

    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const subtotal = resolvedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const isInsideDhaka = customer.area === 'inside_dhaka' ||
      (customer.division && (customer.division.toLowerCase() === 'dhaka' || customer.division.toLowerCase().includes('dhaka'))) ||
      (customer.district && customer.district.toLowerCase() === 'dhaka');

    // Live Delivery Rates & Free Shipping Calculation from Admin Settings
    let deliveryCharge = isInsideDhaka ? 70 : 130;
    let freeDeliveryThreshold = 0;
    try {
      const siteSettings = await this.getSettings();
      if (siteSettings?.deliveryRates) {
        const rates = siteSettings.deliveryRates;
        const insideRate = Number(rates.insideDhaka ?? 70);
        const outsideRate = Number(rates.outsideDhaka ?? 130);
        freeDeliveryThreshold = Number(rates.freeDeliveryThreshold ?? 0);
        const codAvailable = rates.codAvailable !== false;

        if (paymentMethod === 'cod' && !codAvailable) {
          throw new Error('Cash on Delivery (COD) is temporarily disabled. Please choose another payment method.');
        }

        deliveryCharge = isInsideDhaka ? insideRate : outsideRate;
        if (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold) {
          deliveryCharge = 0;
        }
      }
    } catch (e) {
      if (e.message && e.message.includes('Cash on Delivery')) throw e;
      // fallback to standard delivery rates if settings lookup fails
    }

    // Server-side Coupon verification
    let discount = 0;
    let verifiedCoupon = null;
    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      try {
        verifiedCoupon = await this.verifyCoupon({ code: couponCode, subtotal });
        discount = verifiedCoupon.discountAmount;
      } catch (couponErr) {
        console.warn('Coupon verification warning during order creation:', couponErr.message);
      }
    }

    const total = Math.max(0, subtotal + deliveryCharge - discount);

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        division: customer.division || '',
        district: customer.district || '',
        thana: customer.thana || customer.area || '',
        address: customer.address,
        area: customer.area || (isInsideDhaka ? 'inside_dhaka' : 'outside_dhaka'),
        notes: customer.notes || customer.note || ''
      },
      items: resolvedItems,
      subtotal,
      deliveryCharge,
      discount,
      total,
      paymentMethod,
      paymentStatus: 'unpaid',
      appliedCoupon: verifiedCoupon ? {
        code: verifiedCoupon.code,
        discountAmount: discount
      } : { code: '', discountAmount: 0 },
      courier: {
        provider: '',
        trackingCode: '',
        consignmentId: '',
        status: 'pending'
      },
      status: 'pending',
      timeline: [
        {
          status: 'pending',
          note: 'Order submitted by customer',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    };

    if (isMongo()) {
      try {
        const created = await Order.create(newOrder);
        // Decrement stock in MongoDB
        for (const item of resolvedItems) {
          await Product.findOneAndUpdate(
            { id: item.productId, stock: { $gt: 0 } },
            { $inc: { stock: -item.quantity } }
          );
        }
        if (verifiedCoupon) {
          await Coupon.updateOne({ code: verifiedCoupon.code }, { $inc: { usedCount: 1 } });
        }
        memoryStore.orders.unshift(newOrder);
        return created.toObject ? created.toObject() : newOrder;
      } catch (e) {
        console.warn('Order.create error:', e.message);
      }
    }

    memoryStore.orders.unshift(newOrder);
    for (const item of resolvedItems) {
      const prod = memoryStore.products.find(p => p.id === item.productId || p.slug === item.productId);
      if (prod && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }
    if (verifiedCoupon) {
      const memCp = memoryStore.coupons.find(c => c.code === verifiedCoupon.code);
      if (memCp) memCp.usedCount = (memCp.usedCount || 0) + 1;
    }
    return newOrder;
  },

  async getOrders({ status, search, page = 1, limit = 20 } = {}) {
    if (isMongo()) {
      try {
        const query = {};
        if (status) query.status = status;
        if (search) {
          const regex = { $regex: search.trim(), $options: 'i' };
          query.$or = [
            { orderNumber: regex },
            { 'customer.name': regex },
            { 'customer.phone': regex }
          ];
        }
        const p = Math.max(1, Number(page));
        const l = Math.max(1, Number(limit));
        const skip = (p - 1) * l;

        const [items, total] = await Promise.all([
          Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
          Order.countDocuments(query)
        ]);

        return {
          items,
          total,
          page: p,
          limit: l,
          totalPages: Math.ceil(total / l)
        };
      } catch (err) {
        console.warn('Order.find error:', err.message);
      }
    }

    let list = [...memoryStore.orders];
    if (status) {
      list = list.filter(o => o.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customer && o.customer.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.customer && o.customer.phone && o.customer.phone.includes(q))
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
    if (!id) return null;
    if (isMongo()) {
      try {
        const doc = await Order.findOne({ $or: [{ id }, { orderNumber: id }] }).lean();
        if (doc) return doc;
      } catch (e) {}
    }
    return memoryStore.orders.find(o => o.id === id || o.orderNumber === id) || null;
  },

  async trackOrder({ phone, orderNumber, invoiceId }) {
    // Normalize phone
    const cleanPhone = phone ? String(phone).replace(/[^0-9]/g, '') : '';
    const phoneSuffix = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;

    // Normalize order number
    const targetOrderNo = String(orderNumber || invoiceId || '').trim();
    const strippedOrderNo = targetOrderNo.replace(/^[#\s]+/, '').replace(/^ORD-?/i, '').trim();

    if (isMongo()) {
      try {
        const orConditions = [];

        // Exact or case-insensitive orderNumber
        if (targetOrderNo) {
          orConditions.push({ orderNumber: { $regex: new RegExp(`^${targetOrderNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
          orConditions.push({ id: { $regex: new RegExp(`^${targetOrderNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
          if (strippedOrderNo) {
            orConditions.push({ orderNumber: { $regex: new RegExp(`ORD-?${strippedOrderNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
          }
        }

        // Phone condition (matching last 10 digits to handle 01... vs +8801... vs 8801...)
        if (phoneSuffix) {
          orConditions.push({ 'customer.phone': { $regex: phoneSuffix } });
        }

        // If targetOrderNo looks like a phone number (e.g. 10-14 digits)
        const numericOnly = targetOrderNo.replace(/[^0-9]/g, '');
        if (numericOnly.length >= 10 && numericOnly.length <= 14) {
          orConditions.push({ 'customer.phone': { $regex: numericOnly.slice(-10) } });
        }

        // If phone looks like an order number (e.g. starts with ORD or has letters/hyphens)
        if (phone && /^ORD-/i.test(String(phone).trim())) {
          orConditions.push({ orderNumber: { $regex: new RegExp(`^${String(phone).trim()}$`, 'i') } });
        }

        if (orConditions.length > 0) {
          const docs = await Order.find({ $or: orConditions }).sort({ createdAt: -1 }).lean();
          if (docs && docs.length) return docs;
        }
      } catch (e) {
        console.error('Mongo trackOrder error:', e);
      }
    }

    const matched = memoryStore.orders.filter(o => {
      const custPhone = o.customer && o.customer.phone ? String(o.customer.phone).replace(/[^0-9]/g, '') : '';
      const oNum = o.orderNumber ? o.orderNumber.toLowerCase() : '';
      const oId = o.id ? o.id.toLowerCase() : '';

      const pMatch = phoneSuffix ? custPhone.includes(phoneSuffix) : false;
      const oMatch = targetOrderNo ? (oNum === targetOrderNo.toLowerCase() || oId === targetOrderNo.toLowerCase() || (strippedOrderNo && oNum.endsWith(strippedOrderNo.toLowerCase()))) : false;
      const fallbackPhoneInOrder = (targetOrderNo.replace(/[^0-9]/g, '').length >= 10) ? custPhone.includes(targetOrderNo.replace(/[^0-9]/g, '').slice(-10)) : false;

      return pMatch || oMatch || fallbackPhoneInOrder;
    });

    return matched;
  },

  async updateOrderStatus(id, { status, note }) {
    const newTimelineItem = {
      status,
      note: note || `Order marked as ${status}`,
      timestamp: new Date()
    };

    if (isMongo()) {
      try {
        const updated = await Order.findOneAndUpdate(
          { $or: [{ id }, { orderNumber: id }] },
          {
            status,
            $push: { timeline: newTimelineItem }
          },
          { new: true }
        ).lean();

        if (updated) {
          const order = memoryStore.orders.find(o => o.id === id || o.orderNumber === id);
          if (order) {
            order.status = status;
            order.timeline.push(newTimelineItem);
          }
          return updated;
        }
      } catch (e) {}
    }

    const order = memoryStore.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;
    order.status = status;
    order.timeline.push(newTimelineItem);
    return order;
  },

  async updateOrderAmount(id, { total, subtotal, deliveryCharge, discount, note }) {
    const updateFields = {};
    if (total !== undefined && total !== null && !isNaN(Number(total))) {
      updateFields.total = Math.max(0, Math.round(Number(total)));
    }
    if (subtotal !== undefined && subtotal !== null && !isNaN(Number(subtotal))) {
      updateFields.subtotal = Math.max(0, Math.round(Number(subtotal)));
    }
    if (deliveryCharge !== undefined && deliveryCharge !== null && !isNaN(Number(deliveryCharge))) {
      updateFields.deliveryCharge = Math.max(0, Math.round(Number(deliveryCharge)));
    }
    if (discount !== undefined && discount !== null && !isNaN(Number(discount))) {
      updateFields.discount = Math.max(0, Math.round(Number(discount)));
    }

    if (updateFields.total === undefined) {
      const currentOrder = isMongo()
        ? await Order.findOne({ $or: [{ id }, { orderNumber: id }] }).lean()
        : memoryStore.orders.find(o => o.id === id || o.orderNumber === id);
      if (currentOrder) {
        const s = updateFields.subtotal !== undefined ? updateFields.subtotal : (currentOrder.subtotal || 0);
        const d = updateFields.deliveryCharge !== undefined ? updateFields.deliveryCharge : (currentOrder.deliveryCharge || 0);
        const disc = updateFields.discount !== undefined ? updateFields.discount : (currentOrder.discount || 0);
        updateFields.total = Math.max(0, s + d - disc);
      }
    }

    const noteText = note || `Invoice amount edited by Admin. New Grand Total: ৳${updateFields.total?.toLocaleString() || 'updated'}`;
    const newTimelineItem = {
      status: 'confirmed',
      note: noteText,
      timestamp: new Date()
    };

    if (isMongo()) {
      try {
        const updated = await Order.findOneAndUpdate(
          { $or: [{ id }, { orderNumber: id }] },
          {
            $set: updateFields,
            $push: { timeline: newTimelineItem }
          },
          { new: true }
        ).lean();

        if (updated) {
          const mem = memoryStore.orders.find(o => o.id === id || o.orderNumber === id);
          if (mem) {
            Object.assign(mem, updateFields);
            if (!mem.timeline) mem.timeline = [];
            mem.timeline.push(newTimelineItem);
          }
          return updated;
        }
      } catch (e) {
        console.error('Mongo updateOrderAmount error:', e);
      }
    }

    const mem = memoryStore.orders.find(o => o.id === id || o.orderNumber === id);
    if (!mem) return null;
    Object.assign(mem, updateFields);
    if (!mem.timeline) mem.timeline = [];
    mem.timeline.push(newTimelineItem);
    return mem;
  },

  async bulkUpdateOrderStatus({ ids = [], status, note }) {
    if (!ids.length || !status) throw new Error('ids array and status are required');
    const newTimelineItem = {
      status,
      note: note || `Bulk status update to ${status}`,
      timestamp: new Date()
    };

    if (isMongo()) {
      try {
        await Order.updateMany(
          { $or: [{ id: { $in: ids } }, { orderNumber: { $in: ids } }] },
          {
            $set: { status },
            $push: { timeline: newTimelineItem }
          }
        );
      } catch (err) {
        console.warn('bulkUpdateOrderStatus Mongo error:', err.message);
      }
    }

    ids.forEach(id => {
      const order = memoryStore.orders.find(o => o.id === id || o.orderNumber === id);
      if (order) {
        order.status = status;
        if (!order.timeline) order.timeline = [];
        order.timeline.push(newTimelineItem);
      }
    });

    return { updatedCount: ids.length, status };
  },

  async dispatchToCourier({ orderId, courier = 'Steadfast' }) {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const prefix = courier.toUpperCase().substring(0, 3);
    const trackingCode = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    const consignmentId = `CN-${Date.now().toString().slice(-6)}`;

    const newTimelineItem = {
      status: 'shipped',
      note: `Dispatched to ${courier}. Consignment ID: ${consignmentId}, Tracking Code: ${trackingCode}`,
      timestamp: new Date()
    };

    const courierObj = {
      provider: courier,
      trackingCode,
      consignmentId,
      status: 'in_transit'
    };

    if (isMongo()) {
      try {
        await Order.updateOne(
          { $or: [{ id: orderId }, { orderNumber: orderId }] },
          {
            $set: {
              status: 'shipped',
              courier: courierObj
            },
            $push: { timeline: newTimelineItem }
          }
        );
      } catch (e) {}
    }

    const memOrder = memoryStore.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (memOrder) {
      memOrder.status = 'shipped';
      memOrder.courier = courierObj;
      if (!memOrder.timeline) memOrder.timeline = [];
      memOrder.timeline.push(newTimelineItem);
    }

    return {
      orderId,
      courier: courierObj,
      status: 'shipped',
      consignmentPayload: {
        recipient_name: order.customer?.name,
        recipient_phone: order.customer?.phone,
        recipient_address: [
          order.customer?.address,
          order.customer?.thana,
          order.customer?.district,
          order.customer?.division
        ].filter(Boolean).join(', '),
        cod_amount: order.paymentMethod === 'cod' ? order.total : 0,
        note: order.customer?.notes || `Order #${order.orderNumber}`
      }
    };
  },

  async getAllOrdersForExport({ status, search } = {}) {
    let query = {};
    if (status) query.status = status;
    if (search) {
      const q = search.trim();
      query.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { 'customer.name': { $regex: q, $options: 'i' } },
        { 'customer.phone': { $regex: q, $options: 'i' } }
      ];
    }

    if (isMongo()) {
      try {
        const docs = await Order.find(query).sort({ createdAt: -1 }).lean();
        if (docs && docs.length) return docs;
      } catch (e) {}
    }

    let list = [...memoryStore.orders];
    if (status) list = list.filter(o => o.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.includes(q))
      );
    }
    return list;
  },

  // --- COMPLAINTS & CUSTOMER CHAT MESSAGES ---
  async getComplaints() {
    const normalizeComplaint = (doc) => {
      if (!doc) return null;
      const c = { ...doc };
      
      // Extract email if not set
      if (!c.email && typeof c.description === 'string') {
        const emailMatch = c.description.match(/Email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        if (emailMatch) c.email = emailMatch[1];
      }
      // Extract subject if not set
      if (!c.subject && typeof c.description === 'string') {
        const subjMatch = c.description.match(/Subject:\s*([^\n\r]+)/i);
        if (subjMatch) c.subject = subjMatch[1].trim();
      }
      // isRead handling
      if (c.isRead === undefined) {
        c.isRead = c.status === 'resolved';
      }

      // Ensure messages array is populated with at least the initial inquiry
      if (!Array.isArray(c.messages) || c.messages.length === 0) {
        let initialText = c.description || '';
        const msgMatch = initialText.match(/Message:\s*([\s\S]+)$/i);
        const cleanText = msgMatch ? msgMatch[1].trim() : initialText;

        c.messages = [
          {
            id: `msg-${c.id}-init`,
            sender: 'customer',
            senderName: c.name || 'Customer',
            text: cleanText || c.description,
            attachments: c.image ? [c.image] : [],
            channel: 'web',
            deliveryStatus: 'delivered',
            createdAt: c.createdAt || new Date()
          }
        ];
      }

      c.lastMessageAt = c.lastMessageAt || c.updatedAt || c.createdAt || new Date();
      return c;
    };

    if (isMongo()) {
      const docs = await Complaint.find().sort({ createdAt: -1 }).lean();
      if (docs && docs.length) return docs.map(normalizeComplaint);
    }
    return memoryStore.complaints.map(normalizeComplaint);
  },

  async getComplaintById(id) {
    const compQuery = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
    const complaints = await this.getComplaints();
    return complaints.find(c => c.id === id || String(c._id) === id) || null;
  },

  async createComplaint({ name, customerName, phone, email, subject, orderId, orderNumber, description, message, image }) {
    const finalName = (name || customerName || '').trim();
    const finalPhone = (phone || '').trim();
    const finalDesc = (description || message || '').trim();

    if (!finalName || (!finalPhone && !email) || !finalDesc) {
      throw new Error('Name, contact info (phone/email), and message are required');
    }

    const compId = `comp-${Date.now()}`;
    let cleanText = message || finalDesc;
    const msgMatch = cleanText.match(/Message:\s*([\s\S]+)$/i);
    if (msgMatch) cleanText = msgMatch[1].trim();

    const comp = {
      id: compId,
      name: finalName,
      phone: finalPhone || email,
      email: email || '',
      subject: subject || '',
      orderId: orderId || orderNumber || '',
      description: finalDesc,
      image: image || '',
      status: 'new',
      isRead: false,
      adminNotes: '',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          senderName: finalName,
          text: cleanText,
          attachments: image ? [image] : [],
          channel: 'web',
          deliveryStatus: 'delivered',
          createdAt: new Date()
        }
      ],
      lastMessageAt: new Date(),
      createdAt: new Date()
    };

    if (isMongo()) {
      try {
        const created = await Complaint.create(comp);
        memoryStore.complaints.unshift(comp);
        const complaints = await this.getComplaints();
        return complaints.find(c => c.id === compId) || comp;
      } catch (e) {
        console.warn('Complaint.create error:', e.message);
      }
    }
    memoryStore.complaints.unshift(comp);
    return comp;
  },

  async addComplaintMessage(id, { sender = 'admin', senderName = 'MaxiTShop Support', text, attachments = [], channel = 'web', sendEmail = false, sendSms = false }) {
    if (!text || !text.trim()) {
      throw new Error('Message text is required');
    }

    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: sender || 'admin',
      senderName: senderName || (sender === 'admin' ? 'MaxiTShop Support' : 'Customer'),
      text: text.trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
      channel: channel || 'web',
      deliveryStatus: 'sent',
      createdAt: new Date()
    };

    let targetDoc = null;
    if (isMongo()) {
      const compFilter = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
      targetDoc = await Complaint.findOne(compFilter);
    }

    // Hydrate existing messages if empty
    let existingMessages = targetDoc ? (targetDoc.messages || []) : [];
    if (existingMessages.length === 0 && targetDoc) {
      let initialText = targetDoc.description || '';
      const msgMatch = initialText.match(/Message:\s*([\s\S]+)$/i);
      const cleanText = msgMatch ? msgMatch[1].trim() : initialText;
      existingMessages = [
        {
          id: `msg-${targetDoc.id}-init`,
          sender: 'customer',
          senderName: targetDoc.name || 'Customer',
          text: cleanText || targetDoc.description,
          attachments: targetDoc.image ? [targetDoc.image] : [],
          channel: 'web',
          deliveryStatus: 'delivered',
          createdAt: targetDoc.createdAt || new Date()
        }
      ];
    }

    const updatedMessages = [...existingMessages, newMsg];
    const updatePayload = {
      messages: updatedMessages,
      lastMessageAt: new Date(),
    };

    if (sender === 'admin') {
      updatePayload.isRead = true;
      if (targetDoc && targetDoc.status === 'new') {
        updatePayload.status = 'investigating';
      }
    } else {
      updatePayload.isRead = false;
    }

    let customerEmail = targetDoc?.email;
    let customerPhone = targetDoc?.phone;
    let ticketRef = targetDoc?.id || id;
    let customerName = targetDoc?.name || 'Customer';

    if (!customerEmail && targetDoc?.description) {
      const emailMatch = targetDoc.description.match(/Email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      if (emailMatch) customerEmail = emailMatch[1];
    }

    // Dispatch email notification if requested and email exists
    if (sendEmail && customerEmail && sender === 'admin') {
      try {
        const emailService = require('./emailService');
        await emailService.sendEmail({
          to: customerEmail,
          subject: `[MaxiTShop Support] Reply to your inquiry (${ticketRef})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
              <div style="background: #0B1528; padding: 20px 24px; border-radius: 8px 8px 0 0; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 20px;">MaxiTShop Support</h2>
                <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Ticket Reference: <strong>${ticketRef}</strong></p>
              </div>
              <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; background: #ffffff; border-radius: 0 0 8px 8px;">
                <p>Hello <strong>${customerName}</strong>,</p>
                <p>Our support team has responded to your inquiry:</p>
                <div style="background: #f8fafc; border-left: 4px solid #ff6600; padding: 14px 18px; margin: 16px 0; border-radius: 4px; font-size: 14px; white-space: pre-wrap; color: #0f172a;">${text.trim()}</div>
                <p style="font-size: 13px; color: #64748b;">If you have further questions or need additional assistance, reply to this email or call our official hotline at <strong>+8801733-272445</strong>.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center;">MaxiTShop - Solar Equipment & Electronics in Bangladesh<br/>Uposhohor Newmarket, Rajshahi</p>
              </div>
            </div>
          `,
          text: `Hello ${customerName},\n\nOur support team has responded to your inquiry (${ticketRef}):\n\n${text.trim()}\n\nHotline: +8801733-272445\nMaxiTShop`
        });
        newMsg.deliveryStatus = 'delivered';
      } catch (emailErr) {
        console.warn('Failed to send email reply:', emailErr.message);
      }
    }

    // Dispatch SMS notification if requested and phone exists
    if (sendSms && customerPhone && sender === 'admin') {
      try {
        const smsService = require('./smsService');
        const shortReply = text.trim().slice(0, 100);
        await smsService.sendSms(customerPhone, `MaxiTShop Support (${ticketRef}): ${shortReply}`);
      } catch (smsErr) {
        console.warn('Failed to send SMS reply:', smsErr.message);
      }
    }

    if (isMongo() && targetDoc) {
      Object.assign(targetDoc, updatePayload);
      await targetDoc.save();
      const complaints = await this.getComplaints();
      const updated = complaints.find(c => c.id === id || String(c._id) === id);
      const memIdx = memoryStore.complaints.findIndex(c => c.id === id);
      if (memIdx !== -1 && updated) memoryStore.complaints[memIdx] = updated;
      return updated;
    }

    const memComp = memoryStore.complaints.find(c => c.id === id);
    if (memComp) {
      Object.assign(memComp, updatePayload);
      const complaints = await this.getComplaints();
      return complaints.find(c => c.id === id) || memComp;
    }
    return null;
  },

  async markComplaintRead(id, isRead = true) {
    if (isMongo()) {
      try {
        const compFilter = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
        await Complaint.findOneAndUpdate(
          compFilter,
          { isRead },
          { new: true }
        );
      } catch (e) {}
    }
    const memComp = memoryStore.complaints.find(c => c.id === id);
    if (memComp) {
      memComp.isRead = isRead;
    }
    const complaints = await this.getComplaints();
    return complaints.find(c => c.id === id || String(c._id) === id) || null;
  },

  async updateComplaintStatus(id, { status, adminNotes }) {
    const updateFields = {};
    if (status) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
    if (status === 'resolved') updateFields.isRead = true;

    if (isMongo()) {
      try {
        const compFilter = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
        await Complaint.findOneAndUpdate(
          compFilter,
          updateFields,
          { new: true }
        );
      } catch (e) {}
    }

    const comp = memoryStore.complaints.find(c => c.id === id);
    if (comp) {
      if (status) comp.status = status;
      if (adminNotes !== undefined) comp.adminNotes = adminNotes;
      if (status === 'resolved') comp.isRead = true;
    }
    const complaints = await this.getComplaints();
    return complaints.find(c => c.id === id || String(c._id) === id) || null;
  },

  async addCustomerEmailReply(id, { senderName, text, attachments = [], emailMessageId, createdAt = new Date() }) {
    if (!text || !text.trim()) return null;

    let targetDoc = null;
    if (isMongo()) {
      const compFilter = mongoose.isValidObjectId(id) ? { $or: [{ id }, { _id: id }] } : { id };
      targetDoc = await Complaint.findOne(compFilter);
    }

    // Hydrate existing messages if empty
    let existingMessages = targetDoc ? (targetDoc.messages || []) : [];
    if (existingMessages.length === 0 && targetDoc) {
      let initialText = targetDoc.description || '';
      const msgMatch = initialText.match(/Message:\s*([\s\S]+)$/i);
      const cleanText = msgMatch ? msgMatch[1].trim() : initialText;
      existingMessages = [
        {
          id: `msg-${targetDoc.id}-init`,
          sender: 'customer',
          senderName: targetDoc.name || 'Customer',
          text: cleanText || targetDoc.description,
          attachments: targetDoc.image ? [targetDoc.image] : [],
          channel: 'web',
          deliveryStatus: 'delivered',
          createdAt: targetDoc.createdAt || new Date()
        }
      ];
    }

    // Avoid duplicate if emailMessageId matches
    if (emailMessageId && existingMessages.some(m => m.emailMessageId === emailMessageId)) {
      const complaints = await this.getComplaints();
      return complaints.find(c => c.id === id || String(c._id) === id) || null;
    }

    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: 'customer',
      senderName: senderName || targetDoc?.name || 'Customer',
      text: text.trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
      channel: 'email',
      emailMessageId: emailMessageId || '',
      deliveryStatus: 'delivered',
      createdAt: createdAt || new Date()
    };

    const updatedMessages = [...existingMessages, newMsg];
    const updatePayload = {
      messages: updatedMessages,
      lastMessageAt: createdAt || new Date(),
      isRead: false, // Mark as UNREAD so admin sees notification immediately!
      status: targetDoc?.status === 'resolved' ? 'investigating' : (targetDoc?.status || 'investigating')
    };

    if (isMongo() && targetDoc) {
      Object.assign(targetDoc, updatePayload);
      await targetDoc.save();
      const complaints = await this.getComplaints();
      const updated = complaints.find(c => c.id === id || String(c._id) === id);
      const memIdx = memoryStore.complaints.findIndex(c => c.id === id);
      if (memIdx !== -1 && updated) memoryStore.complaints[memIdx] = updated;
      return updated;
    }

    const memComp = memoryStore.complaints.find(c => c.id === id);
    if (memComp) {
      Object.assign(memComp, updatePayload);
      const complaints = await this.getComplaints();
      return complaints.find(c => c.id === id) || memComp;
    }
    return null;
  },

  // --- SELLERS ---
  async getSellers() {
    if (isMongo()) {
      const docs = await Seller.find().sort({ rating: -1 }).lean();
      if (docs && docs.length) return docs;
    }
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
    if (isMongo()) {
      try {
        const created = await Seller.create(seller);
        memoryStore.sellers.push(seller);
        return created.toObject ? created.toObject() : seller;
      } catch (e) {}
    }
    memoryStore.sellers.push(seller);
    return seller;
  },

  // --- STATIC PAGES ---
  async getPage(slug) {
    if (!slug) return null;
    if (isMongo()) {
      const page = await Page.findOne({ slug }).lean();
      if (page) return page;
    }
    return memoryStore.pages.find(p => p.slug === slug) || null;
  },

  async getAllPages() {
    if (isMongo()) {
      const pages = await Page.find({}, 'slug title metaTitle metaDescription').lean();
      if (pages && pages.length) return pages;
    }
    return memoryStore.pages.map(({ slug, title, metaTitle, metaDescription }) => ({ slug, title, metaTitle, metaDescription }));
  },

  async updatePage(slug, data) {
    if (isMongo()) {
      const updated = await Page.findOneAndUpdate(
        { slug },
        { ...data, updatedAt: new Date() },
        { new: true, upsert: true }
      ).lean();
      return updated;
    }
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
    if (isMongo()) {
      let s = await Setting.findOne().lean();
      if (!s) {
        s = await Setting.create(seedData.settings || {});
        s = s.toObject ? s.toObject() : s;
      }

      // Ensure defaults for all tabs
      s.deliveryRates = {
        insideDhaka: 70,
        outsideDhaka: 130,
        freeDeliveryThreshold: 0,
        insideDhakaTime: '24 - 48 Hours',
        outsideDhakaTime: '2 - 4 Days',
        codAvailable: true,
        codNote: 'Cash on delivery available across all 64 districts of Bangladesh.',
        ...(s.deliveryRates || {})
      };

      s.header = {
        showAnnouncement: true,
        announcementText: '⚡ Special Discount on LiFePO4 & Solar Inverters - Fast Delivery Across Bangladesh 🇧🇩',
        announcementLink: '/#deals',
        hotline: s.phone || '+880 1733-115391',
        supportHours: 'Sat - Thu: 9:00 AM - 8:00 PM',
        ...(s.header || {})
      };

      s.navLinks = Array.isArray(s.navLinks) && s.navLinks.length > 0 ? s.navLinks : [
        { label: 'Home', url: '/', isExternal: false },
        { label: 'Sellers', url: '/sellers', isExternal: false },
        { label: 'Contact', url: '/contact', isExternal: false },
        { label: 'Shop', url: '/shop', isExternal: false },
        { label: 'Hot Deals', url: '/#deals', isExternal: false },
        { label: 'Track Order', url: '/track-order', isExternal: false }
      ];

      s.hero = {
        badge: '🇧🇩 Premier Solar & LiFePO4 Energy Store in Bangladesh',
        headline: 'Powering Bangladesh With High-Performance Solar & Battery Systems',
        subheadline: 'Explore genuine Grade-A LiFePO4 cells, active balance smart BMS, MPPT solar controllers, pure sine wave inverters, and industrial equipment.',
        primaryBtnText: 'Shop Best Deals',
        primaryBtnUrl: '/#deals',
        secondaryBtnText: 'Track Your Order',
        secondaryBtnUrl: '/track-order',
        trustFeatures: [
          { title: '100% Genuine Cells', description: 'Tested Grade-A with guaranteed capacity', icon: 'ShieldCheck' },
          { title: 'Fast BD Delivery', description: 'Inside Dhaka in 24h, nationwide in 48h', icon: 'Truck' },
          { title: 'Technical Support', description: 'Expert engineering advice on WhatsApp', icon: 'Wrench' },
          { title: 'Official Warranty', description: 'Authentic manufacturer replacement backup', icon: 'Award' }
        ],
        ...(s.hero || {})
      };

      s.footer = {
        aboutText: 'MaxiTShop is Bangladesh\'s leading store for high-capacity LiFePO4 battery cells, solar inverters, smart BMS modules, and industrial electronics with authentic manufacturer warranties.',
        copyrightText: '© 2026 MaxiTShop. All rights reserved. Trusted Engineering & Green Energy Solutions.',
        newsletterTitle: 'Stay Updated On New Arrivals & Technical Guides',
        newsletterSubtitle: 'Subscribe to receive exclusive deals, technical data sheets, and battery building tutorials.',
        paymentBannerText: 'Cash on Delivery Available Nationwide • bKash • Nagad • Bank Transfer',
        ...(s.footer || {})
      };

      s.contact = {
        phone: s.phone || '+880 1733-115391',
        whatsapp: (s.socialLinks && s.socialLinks.whatsapp) || '+8801733115391',
        email: s.email || 'support@maxitshop.com',
        address: s.address || 'House 45, Road 7, Dhanmondi, Dhaka, Bangladesh',
        googleMapsUrl: 'https://maps.google.com',
        supportHours: 'Saturday - Thursday: 9:00 AM - 8:00 PM (Friday Closed)',
        ...(s.contact || {})
      };

      s.socialLinks = {
        facebook: 'https://facebook.com/maxitshop',
        instagram: 'https://instagram.com/maxitshop',
        youtube: 'https://youtube.com/@maxitshop',
        whatsapp: '+8801733115391',
        messenger: 'maxitshop',
        linkedin: 'https://linkedin.com/company/maxitshop',
        ...(s.socialLinks || {})
      };

      // Populate policies from Page collection if empty
      if (!s.policies || !s.policies.terms || !s.policies.privacy) {
        const pages = await Page.find().lean();
        const getP = (slug) => pages.find(p => p.slug === slug)?.content || '';
        s.policies = {
          terms: s.policies?.terms || getP('terms-conditions') || getP('terms') || getP('order-procedure'),
          privacy: s.policies?.privacy || getP('privacy-policy'),
          returnPolicy: s.policies?.returnPolicy || getP('return-policy'),
          warranty: s.policies?.warranty || getP('warranty-policy'),
          shipping: s.policies?.shipping || getP('shipping-info') || getP('delivery-rules'),
          ...(s.policies || {})
        };
      }

      return s;
    }
    return memoryStore.settings;
  },

  async updateSettings(data) {
    if (isMongo()) {
      const updated = await Setting.findOneAndUpdate(
        {},
        { ...data, updatedAt: new Date() },
        { new: true, upsert: true }
      ).lean();

      // Synchronize policies with MongoDB Page collection
      if (data.policies) {
        const policyMapping = [
          { slug: 'terms-conditions', title: 'Terms & Conditions', content: data.policies.terms },
          { slug: 'privacy-policy', title: 'Privacy Policy', content: data.policies.privacy },
          { slug: 'return-policy', title: 'Return & Refund Policy', content: data.policies.returnPolicy },
          { slug: 'warranty-policy', title: 'Warranty & Guarantee Policy', content: data.policies.warranty },
          { slug: 'shipping-info', title: 'Shipping & Delivery Info', content: data.policies.shipping }
        ];

        for (const item of policyMapping) {
          if (item.content !== undefined && item.content !== null) {
            await Page.findOneAndUpdate(
              { slug: item.slug },
              { title: item.title, content: item.content, updatedAt: new Date() },
              { upsert: true }
            );
          }
        }
      }

      memoryStore.settings = { ...memoryStore.settings, ...data };
      return updated;
    }
    memoryStore.settings = { ...memoryStore.settings, ...data, updatedAt: new Date().toISOString() };
    return memoryStore.settings;
  },

  // --- NEWSLETTER / SUBSCRIBERS ---
  async addSubscriber(email) {
    if (!email || !email.includes('@')) throw new Error('Valid email address is required');
    const clean = email.toLowerCase().trim();

    if (isMongo()) {
      try {
        const existing = await Subscriber.findOne({ email: clean }).lean();
        if (existing) return existing;
        const sub = await Subscriber.create({ email: clean, subscribedAt: new Date() });
        return sub.toObject ? sub.toObject() : sub;
      } catch (e) {
        console.warn('Subscriber.create error:', e.message);
      }
    }

    const existing = memoryStore.subscribers.find(s => s.email === clean);
    if (existing) return existing;
    const sub = { email: clean, subscribedAt: new Date().toISOString() };
    memoryStore.subscribers.unshift(sub);
    return sub;
  },

  async getSubscribers() {
    if (isMongo()) {
      const docs = await Subscriber.find().sort({ subscribedAt: -1 }).lean();
      if (docs && docs.length) return docs;
    }
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

        const lowStockProducts = (lowMongo || []).map(p => ({
          id: p.id || p._id.toString(),
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
          recentOrders: recentOrders || []
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
  },

  // --- COUPONS & VOUCHERS ---
  async verifyCoupon({ code, subtotal = 0 }) {
    if (!code || !code.trim()) {
      throw new Error('Coupon code is required');
    }
    const cleanCode = code.trim().toUpperCase();
    let coupon = null;

    if (isMongo()) {
      try {
        coupon = await Coupon.findOne({ code: cleanCode, isActive: true }).lean();
      } catch (err) {}
    }
    if (!coupon) {
      coupon = memoryStore.coupons.find(c => c.code === cleanCode && c.isActive);
    }

    if (!coupon) {
      throw new Error(`Invalid or inactive coupon code: ${cleanCode}`);
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      throw new Error('This coupon is not active yet');
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
      throw new Error('This coupon has expired');
    }
    if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw new Error('This coupon has reached its maximum usage limit');
    }

    const minSpend = Number(coupon.minOrderAmount || 0);
    if (subtotal < minSpend) {
      throw new Error(`Minimum order amount of ৳${minSpend.toLocaleString()} required for coupon ${cleanCode}`);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = Math.round(subtotal * (Number(coupon.discountValue) / 100));
      if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
      }
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), subtotal);
    }

    return {
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      message: `Coupon ${coupon.code} applied successfully!`
    };
  },

  async getCoupons() {
    if (isMongo()) {
      try {
        const list = await Coupon.find().sort({ createdAt: -1 }).lean();
        if (list && list.length) return list;
      } catch (err) {}
    }
    return memoryStore.coupons;
  },

  async createCoupon(data) {
    const cleanCode = (data.code || '').trim().toUpperCase();
    if (!cleanCode) throw new Error('Coupon code is required');

    const couponObj = {
      id: `cp-${Date.now()}`,
      code: cleanCode,
      description: data.description || '',
      discountType: data.discountType === 'fixed' ? 'fixed' : 'percent',
      discountValue: Number(data.discountValue || 0),
      minOrderAmount: Number(data.minOrderAmount || 0),
      maxDiscountAmount: Number(data.maxDiscountAmount || 0),
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      usageLimit: Number(data.usageLimit || 0),
      usedCount: 0,
      isActive: data.isActive !== false
    };

    if (isMongo()) {
      try {
        const created = await Coupon.create(couponObj);
        memoryStore.coupons.unshift(couponObj);
        return created.toObject ? created.toObject() : couponObj;
      } catch (err) {
        console.warn('Coupon.create fallback error:', err.message);
      }
    }
    memoryStore.coupons.unshift(couponObj);
    return couponObj;
  },

  async updateCoupon(id, data) {
    if (data.code) {
      data.code = data.code.trim().toUpperCase();
    }
    if (isMongo()) {
      try {
        const updated = await Coupon.findOneAndUpdate(
          { $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : null }] },
          { $set: data },
          { new: true }
        ).lean();
        if (updated) {
          const idx = memoryStore.coupons.findIndex(c => c.id === id);
          if (idx !== -1) memoryStore.coupons[idx] = { ...memoryStore.coupons[idx], ...data };
          return updated;
        }
      } catch (err) {}
    }
    const idx = memoryStore.coupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryStore.coupons[idx] = { ...memoryStore.coupons[idx], ...data };
      return memoryStore.coupons[idx];
    }
    return null;
  },

  async deleteCoupon(id) {
    if (isMongo()) {
      try {
        const res = await Coupon.findOneAndDelete({
          $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
        });
        const idx = memoryStore.coupons.findIndex(c => c.id === id);
        if (idx !== -1) memoryStore.coupons.splice(idx, 1);
        return !!res;
      } catch (err) {}
    }
    const idx = memoryStore.coupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryStore.coupons.splice(idx, 1);
      return true;
    }
    return false;
  },

  // --- MODERATOR & PERMISSION MANAGEMENT (Super Admin Only) ---
  async getModerators() {
    if (isMongo()) {
      const users = await User.find({
        role: { $in: ['moderator', 'admin', 'super_admin'] }
      })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

      return users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        role: (u.role === 'admin' || u.role === 'super_admin') ? 'super_admin' : 'moderator',
        permissions: (u.role === 'admin' || u.role === 'super_admin') ? [] : (u.permissions || []),
        isActive: u.isActive !== false,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }));
    }

    return (memoryStore.users || []).filter(u => ['moderator', 'admin', 'super_admin'].includes(u.role));
  },

  async getModeratorById(id) {
    if (isMongo()) {
      const u = await User.findOne({
        $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      })
      .select('-password')
      .lean();

      if (!u) return null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        role: (u.role === 'admin' || u.role === 'super_admin') ? 'super_admin' : 'moderator',
        permissions: (u.role === 'admin' || u.role === 'super_admin') ? [] : (u.permissions || []),
        isActive: u.isActive !== false,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      };
    }
    return null;
  },

  async createModerator({ name, email, phone, password, permissions = [], isActive = true }, actor) {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required to create a moderator');
    }

    const cleanEmail = email.toLowerCase().trim();
    if (isMongo()) {
      const existing = await User.findOne({ email: cleanEmail }).lean();
      if (existing) {
        throw new Error('An account with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const normalizedPermissions = normalizeModeratorPermissions(permissions);
      const modId = `mod-${Date.now()}`;

      const newMod = await User.create({
        id: modId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : '',
        password: hashedPassword,
        role: 'moderator',
        permissions: normalizedPermissions,
        isActive: isActive !== false
      });

      // Audit Log
      try {
        await ActivityLog.create({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          action: 'create_moderator',
          actor: {
            id: actor?.id || 'usr-superadmin',
            name: actor?.name || 'Super Admin',
            email: actor?.email || 'admin@maxitshop.com',
            role: actor?.role || 'super_admin'
          },
          target: {
            id: newMod.id,
            name: newMod.name,
            email: newMod.email,
            role: 'moderator'
          },
          details: `Created moderator ${newMod.name} (${newMod.email}) with ${normalizedPermissions.length} permissions`,
          oldPermissions: [],
          newPermissions: normalizedPermissions,
          metadata: { isActive: newMod.isActive }
        });
      } catch (logErr) {
        console.warn('Failed to record create_moderator log:', logErr.message);
      }

      return {
        id: newMod.id,
        name: newMod.name,
        email: newMod.email,
        phone: newMod.phone,
        role: 'moderator',
        permissions: newMod.permissions,
        isActive: newMod.isActive,
        createdAt: newMod.createdAt
      };
    }

    throw new Error('Database connection required');
  },

  async updateModerator(id, updateData, actor) {
    if (isMongo()) {
      const mod = await User.findOne({
        $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });

      if (!mod) {
        throw new Error('Moderator not found');
      }

      if (mod.role === 'super_admin' || mod.role === 'admin') {
        throw new Error('Super Admin access permissions cannot be restricted or modified');
      }

      const oldPermissions = [...(mod.permissions || [])];
      const oldActive = mod.isActive !== false;

      if (updateData.name) mod.name = updateData.name.trim();
      if (updateData.phone !== undefined) mod.phone = updateData.phone.trim();
      if (updateData.email && updateData.email.trim().toLowerCase() !== mod.email) {
        const emailCheck = await User.findOne({ email: updateData.email.trim().toLowerCase() });
        if (emailCheck && emailCheck.id !== mod.id) {
          throw new Error('Email is already in use by another user');
        }
        mod.email = updateData.email.trim().toLowerCase();
      }

      if (updateData.password && updateData.password.trim().length > 0) {
        mod.password = await bcrypt.hash(updateData.password.trim(), 10);
      }

      let permissionsChanged = false;
      let newPermissions = oldPermissions;
      if (updateData.permissions !== undefined) {
        newPermissions = normalizeModeratorPermissions(updateData.permissions);
        const sortedOld = [...oldPermissions].sort().join(',');
        const sortedNew = [...newPermissions].sort().join(',');
        if (sortedOld !== sortedNew) {
          permissionsChanged = true;
          mod.permissions = newPermissions;
        }
      }

      let statusChanged = false;
      if (updateData.isActive !== undefined) {
        const nextActive = Boolean(updateData.isActive);
        if (nextActive !== oldActive) {
          statusChanged = true;
          mod.isActive = nextActive;
        }
      }

      await mod.save();

      // Audit Log for Permission or Status changes
      if (permissionsChanged || statusChanged) {
        try {
          const action = permissionsChanged && statusChanged
            ? 'update_moderator_all'
            : permissionsChanged
            ? 'update_permissions'
            : 'update_status';

          const details = permissionsChanged
            ? `Changed permissions from [${oldPermissions.join(', ')}] to [${newPermissions.join(', ')}]`
            : `Changed status to ${mod.isActive ? 'Active' : 'Inactive'}`;

          await ActivityLog.create({
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            action,
            actor: {
              id: actor?.id || 'usr-superadmin',
              name: actor?.name || 'Super Admin',
              email: actor?.email || 'admin@maxitshop.com',
              role: actor?.role || 'super_admin'
            },
            target: {
              id: mod.id,
              name: mod.name,
              email: mod.email,
              role: 'moderator'
            },
            details,
            oldPermissions,
            newPermissions,
            metadata: { isActive: mod.isActive }
          });
        } catch (logErr) {
          console.warn('Failed to record update_moderator log:', logErr.message);
        }
      }

      return {
        id: mod.id,
        name: mod.name,
        email: mod.email,
        phone: mod.phone,
        role: 'moderator',
        permissions: mod.permissions,
        isActive: mod.isActive,
        updatedAt: mod.updatedAt
      };
    }

    throw new Error('Database connection required');
  },

  async deleteModerator(id, actor) {
    if (isMongo()) {
      const mod = await User.findOne({
        $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
      });

      if (!mod) {
        throw new Error('Moderator not found');
      }

      if (mod.role === 'super_admin' || mod.role === 'admin') {
        throw new Error('Super Admin accounts cannot be deleted');
      }

      if (actor && actor.id === mod.id) {
        throw new Error('You cannot delete your own account');
      }

      await User.deleteOne({ _id: mod._id });

      try {
        await ActivityLog.create({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          action: 'delete_moderator',
          actor: {
            id: actor?.id || 'usr-superadmin',
            name: actor?.name || 'Super Admin',
            email: actor?.email || 'admin@maxitshop.com',
            role: actor?.role || 'super_admin'
          },
          target: {
            id: mod.id,
            name: mod.name,
            email: mod.email,
            role: 'moderator'
          },
          details: `Deleted moderator account ${mod.name} (${mod.email})`,
          oldPermissions: mod.permissions || [],
          newPermissions: []
        });
      } catch (logErr) {
        console.warn('Failed to record delete_moderator log:', logErr.message);
      }

      return { success: true };
    }

    throw new Error('Database connection required');
  },

  async getModeratorLogs({ limit = 50, moderatorId } = {}) {
    if (isMongo()) {
      const filter = {};
      if (moderatorId) {
        filter.$or = [{ 'target.id': moderatorId }, { 'actor.id': moderatorId }];
      }
      const logs = await ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(Math.min(Number(limit) || 50, 200))
        .lean();
      return logs;
    }
    return [];
  }
};

module.exports = db;
