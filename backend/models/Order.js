const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String, default: '' }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderNumber: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    division: { type: String, default: '' },
    district: { type: String, default: '' },
    thana: { type: String, default: '' },
    address: { type: String, required: true },
    area: { type: String, required: true },
    notes: { type: String, default: '' }
  },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'cod' },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'partially_paid', 'refunded'],
    default: 'unpaid'
  },
  courier: {
    provider: { type: String, default: '' },
    trackingCode: { type: String, default: '' },
    consignmentId: { type: String, default: '' },
    status: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  timeline: [{
    status: { type: String, required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
