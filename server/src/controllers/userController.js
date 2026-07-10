const User = require('../models/User');
const Order = require('../models/Order');
const { sendEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, phone, role, approvalStatus, rejectionReason } = req.body;
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (approvalStatus) user.approvalStatus = approvalStatus;
    if (rejectionReason !== undefined) user.rejectionReason = rejectionReason;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: Delete User Function
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Admin khud ko delete nahi kar sakta
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Customer ke saare orders bhi delete kar do (optional - ya sirf mark as cancelled)
    const deletedOrders = await Order.deleteMany({ customer: user._id });
    logger.info(`🗑️ Deleted ${deletedOrders.deletedCount} orders for user ${user.name}`);

    // User delete karo
    await User.findByIdAndDelete(req.params.id);
    
    logger.info(`🗑️ User deleted: ${user.name} (${user.email})`);

    // Email notification (optional)
    try {
      await sendEmail(
        user.email,
        'RECO - Account Deleted',
        `<h3>Hello ${user.name},</h3><p>Your account has been deleted by the admin.</p><p>If you have any questions, please contact us.</p>`
      );
    } catch (emailError) {
      logger.warn('⚠️ Email failed:', emailError.message);
    }

    res.json({ 
      message: 'User and associated orders deleted successfully',
      deletedOrders: deletedOrders.deletedCount
    });
  } catch (error) {
    logger.error('❌ Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
};