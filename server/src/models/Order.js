const mongoose = require('mongoose');

const orderStatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

const paymentHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, default: 'Cash' },
  note: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Admin ne assign kiya
  serviceType: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  pickupAddress: { street: String, city: String, state: String, zipCode: String },
  pickupDate: { type: Date, required: true },
  deliveryDate: { type: Date, required: true },
  phone: { type: String, required: true },
  laundryWeight: { type: Number },
  quantity: { type: Number },
  specialInstructions: { type: String },
  images: [String],
  deliveryType: { type: String, enum: ['Express', 'Normal'], default: 'Normal' },
  paymentMethod: { type: String, enum: ['Pay At Office', 'WhatsApp Payment', 'Cash', 'Bank Transfer'], default: 'Pay At Office' },
  
  // ✅ Payment Tracking
  price: { type: Number, default: 0 }, // Total amount
  paidAmount: { type: Number, default: 0 }, // Kitna pay hua
  paymentStatus: { 
    type: String, 
    enum: ['Unpaid', 'Partial', 'Paid', 'Refunded'], 
    default: 'Unpaid' 
  },
  paymentHistory: [paymentHistorySchema], // Payment updates ka record
  
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Picked Up', 'Sorting', 'Washing', 'Drying', 'Ironing', 'Packaging', 'Quality Check', 'Ready For Pickup', 'Completed', 'Cancelled'], 
    default: 'Pending', 
    index: true 
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  statusHistory: [orderStatusHistorySchema],
  estimatedCompletion: { type: Date },
  notes: [{ 
    note: String, 
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    timestamp: { type: Date, default: Date.now } 
  }]
}, { timestamps: true });

orderSchema.index({ customer: 1, status: 1, createdAt: -1 });
orderSchema.index({ assignedBy: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);