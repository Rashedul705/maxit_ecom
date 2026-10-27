const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productSlug: { type: String, required: true, index: true },
  productId: { type: String, default: '' },
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, required: true },
  verifiedPurchase: { type: Boolean, default: true },
  helpfulCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
