const User = require('../models/User');
const Order = require('../models/Order');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationService');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    const totalWashermen = await User.countDocuments({ role: 'Washerman' });
    const pendingWashermen = await User.countDocuments({ role: 'Washerman', approvalStatus: 'Pending Approval' });
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } });
    const activeOrders = await Order.countDocuments({ status: { $nin: ['Completed', 'Cancelled'] } });
    const completedOrders = await Order.countDocuments({ status: 'Completed' });

    const receivedPayments = await Order.aggregate([
      { $match: { paymentStatus: 'Received' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'Received', createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    res.json({
      totalCustomers, totalWashermen, pendingWashermen, todayOrders, activeOrders, completedOrders,
      totalRevenue: receivedPayments[0]?.total || 0, monthlyRevenue: monthlyRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.handleWashermanApproval = async (req, res) => {
  try {
    const { washermanId, action, rejectionReason } = req.body;
    const washerman = await User.findById(washermanId);
    if (!washerman || washerman.role !== 'Washerman') return res.status(404).json({ message: 'Washerman not found' });

    if (action === 'Approve') {
      washerman.approvalStatus = 'Active';
      washerman.rejectionReason = '';
      await sendEmail(washerman.email, 'RECCO - Account Approved', `<h3>Congratulations!</h3><p>Your washerman account has been approved. You can now login.</p>`);
    } else {
      washerman.approvalStatus = 'Rejected';
      washerman.rejectionReason = rejectionReason || 'Did not meet requirements';
      await sendEmail(washerman.email, 'RECCO - Account Rejected', `<h3>Application Update</h3><p>Your washerman account was rejected. Reason: ${washerman.rejectionReason}</p>`);
    }

    await washerman.save();
    await createNotification(washerman._id, `Your account approval status is now: ${washerman.approvalStatus}`, 'Approval');
    res.json({ message: `Washerman ${action}ed successfully`, washerman });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignOrderToWasherman = async (req, res) => {
  try {
    const { orderId, washermanId } = req.body;
    const order = await Order.findById(orderId);
    const washerman = await User.findById(washermanId);
    if (!order || !washerman || washerman.role !== 'Washerman' || washerman.approvalStatus !== 'Active') {
      return res.status(400).json({ message: 'Invalid assignment data' });
    }

    order.washerman = washermanId;
    if (order.status === 'Pending') {
      order.statusHistory.push({ status: 'Assigned to Washerman', updatedBy: req.user._id });
    }
    await order.save();

    await createNotification(washermanId, `New Order Assigned: #${order._id.toString().slice(-6)} — Please accept.`, 'Order', order._id);
    await createNotification(order.customer, `Your order has been assigned to a washerman.`, 'Order', order._id);
    res.json({ message: 'Order assigned successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};