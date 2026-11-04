const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  action: { type: String, required: true },
  actor: {
    id: { type: String, default: '' },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    role: { type: String, default: '' }
  },
  target: {
    id: { type: String, default: '' },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    role: { type: String, default: '' }
  },
  details: { type: String, default: '' },
  oldPermissions: [{ type: String }],
  newPermissions: [{ type: String }],
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);

