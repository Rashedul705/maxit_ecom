require('dotenv').config();
const mongoose = require('mongoose');
const seedData = require('./data/seedData');

const Category = require('./models/Category');
const Product = require('./models/Product');
const Brand = require('./models/Brand');
const Banner = require('./models/Banner');
const Page = require('./models/Page');
const Setting = require('./models/Setting');
const Seller = require('./models/Seller');
const Complaint = require('./models/Complaint');
const User = require('./models/User');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️ MONGODB_URI not provided. In-memory data store is pre-loaded with full seed data.');
    process.exit(0);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('🍃 Connected to MongoDB. Clearing existing collections...');

    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Brand.deleteMany({}),
      Banner.deleteMany({}),
      Page.deleteMany({}),
      Setting.deleteMany({}),
      Seller.deleteMany({}),
      Complaint.deleteMany({}),
      User.deleteMany({})
    ]);

    console.log('Inserting seed collections...');
    await Category.insertMany(seedData.categories);
    await Product.insertMany(seedData.products);
    await Brand.insertMany(seedData.brands);
    await Banner.insertMany(seedData.banners);
    await Page.insertMany(seedData.pages);
    await Setting.create(seedData.settings);
    await Seller.insertMany(seedData.sellers);
    await Complaint.insertMany(seedData.complaints);
    await User.create({
      id: 'usr-admin',
      name: 'MaxiTShop Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@maxitshop.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      phone: '+8801733115391',
      role: 'admin'
    });

    console.log('✅ Successfully seeded MongoDB database with all maxitshop data!');
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB seed failed:', err.message);
    process.exit(1);
  }
}

seed();
