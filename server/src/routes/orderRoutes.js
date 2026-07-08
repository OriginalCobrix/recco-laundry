const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { placeOrder, getMyOrders, updateOrderStatus, getAllOrders, acceptOrder } = require('../controllers/orderController');
const router = express.Router();

router.post('/', protect, authorize('Customer'), placeOrder);
router.get('/my-orders', protect, authorize('Customer', 'Washerman'), getMyOrders);
router.get('/all', protect, authorize('Admin'), getAllOrders);
router.put('/status', protect, authorize('Washerman', 'Admin'), updateOrderStatus);
router.put('/accept', protect, authorize('Washerman'), acceptOrder);

module.exports = router;