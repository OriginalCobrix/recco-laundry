const Order = require('../models/Order');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');

exports.markAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.customer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    order.paymentStatus = 'Pending Verification';
    await order.save();

    const admins = await User.find({ role: 'Admin' });
    admins.forEach(async (admin) => {
      await createNotification(admin._id, `Payment pending verification for Order #${order._id.toString().slice(-6)}`, 'Payment', order._id);
    });
    res.json({ message: 'Payment marked as paid. Awaiting admin verification.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { status } = req.body; 
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentStatus = status;
    await order.save();

    await createNotification(order.customer, `Your payment for Order #${order._id.toString().slice(-6)} is ${status}`, 'Payment', order._id);
    const customer = await User.findById(order.customer);
    if (customer) await sendEmail(customer.email, 'RECCO - Payment Update', `<p>Your payment status is now: <strong>${status}</strong></p>`);

    res.json({ message: `Payment ${status} successfully`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Order.find({ paymentMethod: 'WhatsApp Payment' })
      .populate('customer', 'name email')
      .select('paymentStatus paymentMethod price createdAt');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};