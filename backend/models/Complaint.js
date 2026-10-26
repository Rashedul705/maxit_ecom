const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  orderId: { type: String, default: '' },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  status: {
    type: String,
    enum: ['new', 'investigating', 'resolved'],
    default: 'new'
  },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
