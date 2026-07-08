const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  priceType: { type: String, enum: ['Per Item', 'Per Kg', 'Fixed'], default: 'Fixed' },
  category: { type: String, enum: ['Wash & Fold', 'Dry Cleaning', 'Premium', 'Custom'], default: 'Wash & Fold' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);