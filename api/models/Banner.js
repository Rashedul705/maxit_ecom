const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, default: '#' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
