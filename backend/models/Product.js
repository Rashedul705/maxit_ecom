const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true, default: 0 },
  oldPrice: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  category: { type: String, required: true },
  categoryName: { type: String, default: '' },
  brand: { type: String, default: 'General' },
  stock: { type: Number, default: 10 },
  image: { type: String, default: '' },
  images: [{ type: String }],
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  productCode: { type: String, default: '' },
  keyFeatures: { type: [String], default: [] },
  warranty: { type: String, default: '' },
  specs: { type: mongoose.Schema.Types.Mixed, default: {} },
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 12 },
  reviewsCount: { type: Number, default: 12 },
  isNewItem: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isDeal: { type: Boolean, default: false },
  isHotDeal: { type: Boolean, default: false },
  sourceUrl: { type: String, default: '' }
}, { timestamps: true });

ProductSchema.index({ category: 1, brand: 1, price: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({
  title: 'text',
  shortDescription: 'text',
  description: 'text',
  brand: 'text'
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
