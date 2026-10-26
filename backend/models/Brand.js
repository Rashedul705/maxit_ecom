const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String, required: true },
  website: { type: String, default: '' },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
