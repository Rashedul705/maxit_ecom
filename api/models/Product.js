const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true, default: 0 },
  oldPrice: { type: Number, default: 0 },
  category: { type: String, required: true },
  brand: { type: String, default: 'General' },
  stock: { type: Number, default: 10 },
  images: [{ type: String }],
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  specs: { type: Map, of: String, default: {} },
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 12 },
  isNewItem: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isDeal: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
