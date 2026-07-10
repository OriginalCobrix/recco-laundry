const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { 
  createOrderForCustomer,
  getMyOrders, 
  updateOrderStatus, 
  getAllOrders, 
  updatePayment,
  getPaymentDetails
} = require('../controllers/orderController');

const router = express.Router();

// Admin routes
router.post('/create', protect, authorize('Admin'), createOrderForCustomer);
router.get('/all', protect, authorize('Admin'), getAllOrders);
router.put('/status', protect, authorize('Admin'), updateOrderStatus);
router.put('/payment', protect, authorize('Admin'), updatePayment);

// Customer routes
router.get('/my-orders', protect, authorize('Customer', 'Admin'), getMyOrders);
router.get('/payment/:orderId', protect, authorize('Customer', 'Admin'), getPaymentDetails);

module.exports = router;