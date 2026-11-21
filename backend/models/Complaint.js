const mongoose = require('mongoose');

const MessageItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sender: { type: String, enum: ['customer', 'admin', 'system'], default: 'customer' },
  senderName: { type: String, default: '' },
  text: { type: String, required: true },
  attachments: [{ type: String }],
  channel: { type: String, enum: ['web', 'email', 'sms'], default: 'web' },
  deliveryStatus: { type: String, enum: ['sent', 'delivered', 'failed'], default: 'sent' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const ComplaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  orderId: { type: String, default: '' },
  subject: { type: String, default: '' },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  status: {
    type: String,
    enum: ['new', 'investigating', 'resolved'],
    default: 'new'
  },
  isRead: { type: Boolean, default: false },
  messages: [MessageItemSchema],
  adminNotes: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
