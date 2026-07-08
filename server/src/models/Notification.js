const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Order', 'Payment', 'Approval', 'System'], default: 'System' },
  isRead: { type: Boolean, default: false },
  linkId: { type: mongoose.Schema.Types.ObjectId } // Optional: Order ID or User ID
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);