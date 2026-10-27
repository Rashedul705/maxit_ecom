const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  // General & Brand
  siteName: { type: String, default: 'maxitshop' },
  tagline: { type: String, default: 'Your Trusted Solar & Energy Solutions Partner in Bangladesh' },
  logo: { type: String, default: '' },
  footerLogo: { type: String, default: '' },
  favicon: { type: String, default: '' },

  // Delivery & Shipping
  deliveryRates: {
    insideDhaka: { type: Number, default: 70 },
    outsideDhaka: { type: Number, default: 130 },
    freeDeliveryThreshold: { type: Number, default: 0 },
    insideDhakaTime: { type: String, default: '24 - 48 Hours' },
    outsideDhakaTime: { type: String, default: '2 - 4 Days' },
    codAvailable: { type: Boolean, default: true },
    codNote: { type: String, default: 'Cash on delivery available across all 64 districts of Bangladesh.' }
  },

  // Header & Navigation
  header: {
    showAnnouncement: { type: Boolean, default: true },
    announcementText: { type: String, default: '⚡ Special Discount on LiFePO4 & Solar Inverters - Fast Delivery Across Bangladesh 🇧🇩' },
    announcementLink: { type: String, default: '/#deals' },
    hotline: { type: String, default: '+880 1733-115391' },
    supportHours: { type: String, default: 'Sat - Thu: 9:00 AM - 8:00 PM' }
  },
  navLinks: [{
    label: { type: String, required: true },
    url: { type: String, required: true },
    isExternal: { type: Boolean, default: false }
  }],

  // Hero Section
  hero: {
    badge: { type: String, default: '🇧🇩 Premier Solar & LiFePO4 Energy Store in Bangladesh' },
    headline: { type: String, default: 'Powering Bangladesh With High-Performance Solar & Battery Systems' },
    subheadline: { type: String, default: 'Explore genuine Grade-A LiFePO4 cells, active balance smart BMS, MPPT solar controllers, pure sine wave inverters, and industrial equipment.' },
    primaryBtnText: { type: String, default: 'Shop Best Deals' },
    primaryBtnUrl: { type: String, default: '/#deals' },
    secondaryBtnText: { type: String, default: 'Track Your Order' },
    secondaryBtnUrl: { type: String, default: '/track-order' },
    trustFeatures: [{
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      icon: { type: String, default: '' }
    }]
  },

  // Footer & Branding
  footer: {
    aboutText: { type: String, default: 'MaxiTShop is Bangladesh\'s leading store for high-capacity LiFePO4 battery cells, solar inverters, smart BMS modules, and industrial electronics with authentic manufacturer warranties.' },
    copyrightText: { type: String, default: '© 2026 MaxiTShop. All rights reserved. Trusted Engineering & Green Energy Solutions.' },
    newsletterTitle: { type: String, default: 'Stay Updated On New Arrivals & Technical Guides' },
    newsletterSubtitle: { type: String, default: 'Subscribe to receive exclusive deals, technical data sheets, and battery building tutorials.' },
    paymentBannerText: { type: String, default: 'Cash on Delivery Available Nationwide • bKash • Nagad • Bank Transfer' }
  },

  // Contact Information
  contact: {
    phone: { type: String, default: '+880 1733-115391' },
    whatsapp: { type: String, default: '+8801733115391' },
    email: { type: String, default: 'support@maxitshop.com' },
    address: { type: String, default: 'House 45, Road 7, Dhanmondi, Dhaka, Bangladesh' },
    googleMapsUrl: { type: String, default: 'https://maps.google.com' },
    supportHours: { type: String, default: 'Saturday - Thursday: 9:00 AM - 8:00 PM (Friday Closed)' }
  },

  // Contact Info (legacy top-level compatibility)
  phone: { type: String, default: '+880 1733-115391' },
  email: { type: String, default: 'support@maxitshop.com' },
  address: { type: String, default: 'Dhaka, Bangladesh' },

  // Social Links
  socialLinks: {
    facebook: { type: String, default: 'https://facebook.com/maxitshop' },
    instagram: { type: String, default: 'https://instagram.com/maxitshop' },
    youtube: { type: String, default: 'https://youtube.com/@maxitshop' },
    whatsapp: { type: String, default: '+8801733115391' },
    messenger: { type: String, default: 'maxitshop' },
    linkedin: { type: String, default: 'https://linkedin.com/company/maxitshop' }
  },

  // Policy Pages Content
  policies: {
    terms: { type: String, default: '' },
    privacy: { type: String, default: '' },
    returnPolicy: { type: String, default: '' },
    warranty: { type: String, default: '' },
    shipping: { type: String, default: '' }
  },

  // SEO Meta
  metaTags: {
    title: { type: String, default: 'maxitshop - Solar & Engineering Store Bangladesh' },
    description: { type: String, default: 'Buy solar panels, batteries, BMS, inverters, power tools and electronics parts in Bangladesh with Cash on Delivery.' },
    keywords: { type: String, default: 'solar panels, lifepo4 battery, bms, inverter, bangladesh, engineering' }
  }
}, { timestamps: true, strict: false });

module.exports = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
