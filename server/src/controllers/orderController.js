const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');

exports.placeOrder = async (req, res) => {
  try {
    const { serviceType, pickupDate, deliveryDate, pickupAddress, phone, paymentMethod, deliveryType, specialInstructions, laundryWeight, quantity } = req.body;
    const service = await Service.findById(serviceType);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const order = await Order.create({
      customer: req.user._id, serviceType: service._id, pickupAddress, phone, pickupDate, deliveryDate, paymentMethod, deliveryType,
      specialInstructions, laundryWeight, quantity, status: 'Pending', progress: 0, price: service.price,
      statusHistory: [{ status: 'Pending', updatedBy: req.user._id }]
    });

    const activeWashermen = await User.find({ role: 'Washerman', approvalStatus: 'Active' });
    activeWashermen.forEach(async (wm) => {
      await createNotification(wm._id, `New Order Available: #${order._id.toString().slice(-6)}`, 'Order', order._id);
    });

    await sendEmail(req.user.email, 'RECCO - Order Placed', `<h3>Order Placed Successfully</h3><p>Your order ID is ${order._id}.</p>`);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'Customer') query = { customer: req.user._id };
    else if (req.user.role === 'Washerman') {
      query = { $or: [{ washerman: req.user._id }, { status: 'Pending', washerman: null }] };
    }
    const orders = await Order.find(query)
      .populate('serviceType', 'name price priceType')
      .populate('customer', 'name phone email')
      .populate('washerman', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('serviceType', 'name price')
      .populate('customer', 'name phone')
      .populate('washerman', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'Pending') return res.status(400).json({ message: 'Order is already taken by another washerman' });

    order.washerman = req.user._id;
    order.status = 'Accepted';
    order.progress = 10;
    order.statusHistory.push({ status: 'Accepted', updatedBy: req.user._id });
    await order.save();

    await createNotification(order.customer, `Your order #${order._id.toString().slice(-6)} has been accepted by a washerman.`, 'Order', order._id);
    const customer = await User.findById(order.customer);
    if (customer) await sendEmail(customer.email, 'RECCO - Order Accepted', `<p>Your order has been accepted and is now being processed.</p>`);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, progress } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (req.user.role === 'Washerman' && (!order.washerman || order.washerman.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (status) {
      order.status = status;
      order.statusHistory.push({ status, updatedBy: req.user._id });
    }
    if (typeof progress === 'number') {
      order.progress = Math.min(100, Math.max(0, progress));
    }
    if (order.status === 'Completed' || order.progress >= 100) {
      order.status = 'Completed';
      order.progress = 100;
    }

    await order.save();
    await createNotification(order.customer, `Your order #${order._id.toString().slice(-6)} is now: ${order.status} (${order.progress}%)`, 'Order', order._id);
    const customer = await User.findById(order.customer);
    if (customer) await sendEmail(customer.email, 'RECCO - Order Update', `<p>Your order status is now: <strong>${order.status}</strong> — Progress: ${order.progress}%</p>`);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};