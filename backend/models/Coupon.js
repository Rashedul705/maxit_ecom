const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  discountType: {
    type: String,
    enum: ['percent', 'fixed'],
    default: 'percent'
  },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0, min: 0 },
  maxDiscountAmount: { type: Number, default: 0, min: 0 }, // 0 = unlimited cap
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, default: null },
  usageLimit: { type: Number, default: 0, min: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

