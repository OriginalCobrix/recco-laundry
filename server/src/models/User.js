const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['Admin', 'Customer', 'Washerman'], default: 'Customer' },
  profilePicture: { type: String, default: '' },
  approvalStatus: { type: String, enum: ['Active', 'Pending Approval', 'Rejected'], default: 'Active' },
  rejectionReason: { type: String, default: '' },
  addresses: [{
    street: String, city: String, state: String, zipCode: String
  }],
  emailVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);