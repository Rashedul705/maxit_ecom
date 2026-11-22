const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, default: '' },
  icon: { type: String, default: '' },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  parent: { type: String, default: null }, // Slug of mother category; null for mother categories
  subcategories: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true }
  }]
}, { timestamps: true });

CategorySchema.index({ parent: 1 });
CategorySchema.index({ order: 1 });
CategorySchema.index({ slug: 1 });

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
