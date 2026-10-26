const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  addresses: [{
    name: String,
    phone: String,
    address: String,
    area: String,
    isDefault: Boolean
  }]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
