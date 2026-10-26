const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  siteName: { type: String, default: 'maxitshop' },
  tagline: { type: String, default: 'Your Trusted Solar & Energy Solutions Partner in Bangladesh' },
  logo: { type: String, default: '' },
  footerLogo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  phone: { type: String, default: '+880 1733-115391' },
  email: { type: String, default: 'support@maxitshop.com' },
  address: { type: String, default: 'Dhaka, Bangladesh' },
  socialLinks: {
    facebook: { type: String, default: 'https://facebook.com' },
    instagram: { type: String, default: 'https://instagram.com' },
    youtube: { type: String, default: 'https://youtube.com' },
    whatsapp: { type: String, default: '+8801733115391' },
    messenger: { type: String, default: 'maxitshop' }
  },
  deliveryRates: {
    insideDhaka: { type: Number, default: 60 },
    outsideDhaka: { type: Number, default: 120 }
  },
  metaTags: {
    title: { type: String, default: 'maxitshop - Solar & Engineering Store Bangladesh' },
    description: { type: String, default: 'Buy solar panels, batteries, BMS, inverters, power tools and electronics parts in Bangladesh with Cash on Delivery.' }
  }
}, { timestamps: true });

module.exports = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
