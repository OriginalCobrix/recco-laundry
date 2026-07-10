const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

// ✅ NEW: Admin customer ke liye order create kare
exports.createOrderForCustomer = async (req, res) => {
  try {
    const { customerId, serviceType, pickupDate, deliveryDate, pickupAddress, phone, paymentMethod, deliveryType, specialInstructions, laundryWeight, quantity, price } = req.body;

    // Customer verify karein
    const customer = await User.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    if (customer.role !== 'Customer') return res.status(400).json({ message: 'User is not a customer' });

    // Service verify karein
    const service = await Service.findById(serviceType);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Order create karein
    const order = await Order.create({
      customer: customerId,
      assignedBy: req.user._id,
      serviceType: service._id,
      pickupAddress,
      phone: phone || customer.phone,
      pickupDate,
      deliveryDate,
      paymentMethod: paymentMethod || 'Pay At Office',
      deliveryType: deliveryType || 'Normal',
      specialInstructions,
      laundryWeight,
      quantity,
      status: 'Accepted',
      progress: 10,
      price: price || service.price,
      paidAmount: 0,
      paymentStatus: 'Unpaid',
      statusHistory: [{ status: 'Accepted', updatedBy: req.user._id }]
    });

    logger.info(`📦 Admin created order ${order._id} for customer ${customerId}`);

    // Customer ko notification
    await createNotification(
      customerId,
      `New Order Assigned: #${order._id.toString().slice(-6)} - ${service.name}`,
      'Order',
      order._id
    );

    // Socket emit to customer
    if (global.io) {
      global.io.to(customerId.toString()).emit('orderAssigned', order);
      logger.info(`✅ Socket emit to customer: ${customerId}`);
    }

    // Email try karein
    try {
      await sendEmail(
        customer.email,
        'RECO - New Order Assigned',
        `<h3>Hello ${customer.name},</h3><p>A new order has been assigned to you: <strong>${service.name}</strong></p><p>Order ID: #${order._id.toString().slice(-6).toUpperCase()}</p><p>Total Amount: Rs. ${order.price}</p><p>Pickup Date: ${new Date(pickupDate).toLocaleDateString()}</p>`
      );
    } catch (emailError) {
      logger.warn('⚠️ Email failed:', emailError.message);
    }

    res.status(201).json(order);
  } catch (error) {
    logger.error('❌ Error in createOrderForCustomer:', error);
    res.status(500).json({ message: error.message });
  }
};

// Customer apne orders dekhe
exports.getMyOrders = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'Customer') {
      query = { customer: req.user._id };
    } else if (req.user.role === 'Admin') {
      query = {};
    }

    const orders = await Order.find(query)
      .populate('serviceType', 'name price priceType')
      .populate('customer', 'name phone email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin sab orders dekhe
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('serviceType', 'name price')
      .populate('customer', 'name phone email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin order status update kare
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, progress } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

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

    await createNotification(
      order.customer,
      `Your order #${order._id.toString().slice(-6)} is now: ${order.status} (${order.progress}%)`,
      'Order',
      order._id
    );

    if (global.io) {
      global.io.to(order.customer.toString()).emit('orderStatusUpdated', order);
    }

    const customer = await User.findById(order.customer);
    if (customer) {
      try {
        await sendEmail(
          customer.email,
          'RECO - Order Update',
          `<p>Your order status is now: <strong>${order.status}</strong> — Progress: ${order.progress}%</p>`
        );
      } catch (emailError) {
        logger.warn('⚠️ Email failed:', emailError.message);
      }
    }

    res.json(order);
  } catch (error) {
    logger.error('❌ Error in updateOrderStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin payment update kare
exports.updatePayment = async (req, res) => {
  try {
    const { orderId, amount, method, note } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.paymentHistory.push({
      amount,
      method: method || 'Cash',
      note: note || '',
      updatedBy: req.user._id
    });

    order.paidAmount = (order.paidAmount || 0) + amount;

    if (order.paidAmount >= order.price) {
      order.paymentStatus = 'Paid';
      order.paidAmount = order.price;
    } else if (order.paidAmount > 0) {
      order.paymentStatus = 'Partial';
    }

    await order.save();

    const paymentPercentage = Math.round((order.paidAmount / order.price) * 100);
    await createNotification(
      order.customer,
      `Payment update for order #${order._id.toString().slice(-6)}: Rs. ${amount} received. Total paid: Rs. ${order.paidAmount}/${order.price} (${paymentPercentage}%)`,
      'Payment',
      order._id
    );

    if (global.io) {
      global.io.to(order.customer.toString()).emit('paymentUpdated', order);
    }

    res.json(order);
  } catch (error) {
    logger.error('❌ Error in updatePayment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Customer apni payment details dekhe
exports.getPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('paymentHistory.updatedBy', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user.role === 'Customer' && order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      orderId: order._id,
      totalAmount: order.price,
      paidAmount: order.paidAmount,
      remainingAmount: order.price - order.paidAmount,
      paymentStatus: order.paymentStatus,
      paymentHistory: order.paymentHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};