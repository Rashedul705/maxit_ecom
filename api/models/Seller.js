const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  rating: { type: Number, default: 4.9 },
  totalProducts: { type: Number, default: 15 },
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.Seller || mongoose.model('Seller', SellerSchema);
