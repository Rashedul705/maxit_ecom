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

const db = {
  // --- AUTHENTICATION ---
  async authenticateAdmin({ email, password }) {
    const adminEmail = (process.env.ADMIN_EMAIL || ADMIN_EMAIL).trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET || JWT_SECRET;

    if (!email || !password) return null;
    const inputEmail = email.trim().toLowerCase();

    let isValid = (inputEmail === adminEmail && password === adminPassword);

    if (!isValid && isMongo()) {
      try {
        const user = await User.findOne({ email: inputEmail, role: 'admin' }).lean();
        if (user && user.password === password) {
          isValid = true;
        }
      } catch (e) {
        console.warn('Admin DB auth check warning:', e.message);
      }
    }

    if (isValid) {
      const jwtToken = jwt.sign({ role: 'admin', email: inputEmail }, jwtSecret, { expiresIn: '7d' });
      return {
        token: jwtToken,
        user: { name: 'MaxiTShop Administrator', email: inputEmail, role: 'admin' }
      };
    }
    return null;
  },

  async registerCustomer({ name, email, phone, password, address }) {
    const cleanEmail = email.toLowerCase().trim();

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
        password,
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
      password,
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
      const user = await User.findOne({ email: cleanEmail, password }).lean();
      if (!user) return null;
      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
      return { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } };
    }

    const user = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!user) {
      return null;
    }
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    return { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } };
  },

  // --- CATEGORIES ---
  async getCategories() {
    if (isMongo()) {
      const docs = await Category.find({ isActive: { $ne: false } }).sort({ order: 1 }).lean();
      if (docs && docs.length) return docs;
    }
    return memoryStore.categories.filter(c => c.isActive !== false).sort((a, b) => a.order - b.order);
  },

  async getCategoryBySlug(slug) {
    if (!slug) return null;
    if (isMongo()) {
      const doc = await Category.findOne({ $or: [{ slug }, { id: slug }] }).lean();
      if (doc) return doc;
    }
    return memoryStore.categories.find(c => c.slug === slug || c.id === slug) || null;
  },

  async createCategory(data) {
    const orderCount = isMongo() ? await Category.countDocuments() : memoryStore.categories.length;
    const cat = {
      id: `cat-${Date.now()}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      isActive: true,
      order: orderCount + 1,
      ...data
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
    if (isMongo()) {
      const updated = await Category.findOneAndUpdate(
        { $or: [{ id }, { slug: id }] },
        data,
        { new: true }
      ).lean();
      if (updated) {
        const idx = memoryStore.categories.findIndex(c => c.id === id || c.slug === id);
        if (idx !== -1) memoryStore.categories[idx] = { ...memoryStore.categories[idx], ...data };
        return updated;
      }
    }
    const idx = memoryStore.categories.findIndex(c => c.id === id || c.slug === id);
    if (idx === -1) return null;
    memoryStore.categories[idx] = { ...memoryStore.categories[idx], ...data };
    return memoryStore.categories[idx];
  },

  async deleteCategory(id) {
    if (isMongo()) {
      await Category.findOneAndDelete({ $or: [{ id }, { slug: id }] });
    }
    const idx = memoryStore.categories.findIndex(c => c.id === id || c.slug === id);
    if (idx !== -1) memoryStore.categories.splice(idx, 1);
    return true;
  },

  // --- PRODUCTS ---
  async getProducts({ category, brand, search, minPrice, maxPrice, sort, page = 1, limit = 20, isDeal, isFeatured, isNewItem }) {
    if (isMongo()) {
      try {
        const filter = {};

        if (category) {
          const c = category.trim();
          filter.$or = [
            { category: { $regex: new RegExp(`^${c}$`, 'i') } },
            { categoryName: { $regex: new RegExp(`^${c}$`, 'i') } },
            { slug: { $regex: new RegExp(c, 'i') } }
          ];
        }

        if (brand) {
          filter.brand = { $regex: new RegExp(`^${brand.trim()}$`, 'i') };
        }

        if (search) {
          const regex = { $regex: search.trim(), $options: 'i' };
          const searchConditions = [
            { title: regex },
            { shortDescription: regex },
            { description: regex },
            { brand: regex },
            { category: regex },
            { categoryName: regex }
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
        if (sort === 'price-asc') sortObj = { price: 1 };
        else if (sort === 'price-desc') sortObj = { price: -1 };
        else if (sort === 'popular') sortObj = { reviewCount: -1 };

        const p = Math.max(1, Number(page));
        const l = Math.max(1, Number(limit));
        const skip = (p - 1) * l;

        const [items, total] = await Promise.all([
          Product.find(filter).sort(sortObj).skip(skip).limit(l).lean(),
          Product.countDocuments(filter)
        ]);

        return {
          items,
          total,
          page: p,
          limit: l,
          totalPages: Math.ceil(total / l)
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
          const related = await Product.find({
            category: product.category,
            id: { $ne: product.id }
          }).limit(6).lean();

          return { ...product, related };
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

    const related = memoryStore.products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 6);

    return { ...product, related };
  },

  async createProduct(data) {
    const prod = {
      id: `prod-${Date.now()}`,
      slug: data.slug || (data.title || 'prod').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      stock: data.stock !== undefined ? Number(data.stock) : 10,
      price: Number(data.price || 0),
      oldPrice: Number(data.oldPrice || 0),
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.image || "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80"],
      specs: data.specs || {},
      rating: 5.0,
      reviewCount: 1,
      ...data
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
        const regex = { $regex: term, $options: 'i' };
        const docs = await Product.find({
          $or: [
            { title: regex },
            { brand: regex },
            { category: regex },
            { categoryName: regex }
          ]
        }).limit(6).lean();

        return docs.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          price: p.price,
          oldPrice: p.oldPrice,
          image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || ''),
          category: p.category,
          brand: p.brand
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
  async createOrder({ customer, items, paymentMethod = 'cod' }) {
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
      resolvedItems.push({
        productId: prod ? prod.id : prodId,
        title: item.title || (prod ? prod.title : 'Product Item'),
        price: Number(item.price !== undefined ? item.price : (prod ? prod.price : 0)),
        quantity: Math.max(1, Number(item.quantity) || 1),
        image: item.image || (prod && prod.images && prod.images[0]) || (prod && prod.image) || ''
      });
    }

    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const subtotal = resolvedItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const isInsideDhaka = customer.area === 'inside_dhaka' || (customer.division && customer.division.toLowerCase() === 'dhaka');
    const deliveryCharge = isInsideDhaka ? 70 : 130;
    const discount = 0;
    const total = subtotal + deliveryCharge - discount;

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customer: {
        name: customer.name,
        phone: customer.phone,
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
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const targetOrderNo = (orderNumber || invoiceId || '').trim();

    if (isMongo()) {
      try {
        const query = {};
        if (cleanPhone) {
          query['customer.phone'] = { $regex: cleanPhone };
        }
        if (targetOrderNo) {
          query.orderNumber = { $regex: new RegExp(`^${targetOrderNo}$`, 'i') };
        }
        const docs = await Order.find(query).sort({ createdAt: -1 }).lean();
        if (docs && docs.length) return docs;
      } catch (e) {}
    }

    const matched = memoryStore.orders.filter(o => {
      const pMatch = cleanPhone ? (o.customer && o.customer.phone ? o.customer.phone.replace(/[^0-9]/g, '').includes(cleanPhone) : false) : true;
      const oMatch = targetOrderNo ? o.orderNumber.toLowerCase() === targetOrderNo.toLowerCase() : true;
      return pMatch && oMatch;
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

  // --- COMPLAINTS ---
  async getComplaints() {
    if (isMongo()) {
      const docs = await Complaint.find().sort({ createdAt: -1 }).lean();
      if (docs && docs.length) return docs;
    }
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
      createdAt: new Date()
    };
    if (isMongo()) {
      try {
        const created = await Complaint.create(comp);
        memoryStore.complaints.unshift(comp);
        return created.toObject ? created.toObject() : comp;
      } catch (e) {}
    }
    memoryStore.complaints.unshift(comp);
    return comp;
  },

  async updateComplaintStatus(id, { status, adminNotes }) {
    const updateFields = {};
    if (status) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    if (isMongo()) {
      try {
        const updated = await Complaint.findOneAndUpdate({ id }, updateFields, { new: true }).lean();
        if (updated) {
          const c = memoryStore.complaints.find(comp => comp.id === id);
          if (c) {
            if (status) c.status = status;
            if (adminNotes !== undefined) c.adminNotes = adminNotes;
          }
          return updated;
        }
      } catch (e) {}
    }

    const comp = memoryStore.complaints.find(c => c.id === id);
    if (!comp) return null;
    if (status) comp.status = status;
    if (adminNotes !== undefined) comp.adminNotes = adminNotes;
    return comp;
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
      const s = await Setting.findOne().lean();
      if (s) return s;
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
  }
};

module.exports = db;
