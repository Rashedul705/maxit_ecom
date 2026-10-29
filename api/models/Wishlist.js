const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  products: [{ type: String, required: true }] // Product IDs or slugs
}, { timestamps: true });

module.exports = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);

