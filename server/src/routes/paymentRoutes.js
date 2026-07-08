const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { markAsPaid, verifyPayment, getPayments } = require('../controllers/paymentController');
const router = express.Router();

router.put('/whatsapp/:orderId', protect, authorize('Customer'), markAsPaid);
router.put('/verify/:orderId', protect, authorize('Admin'), verifyPayment);
router.get('/', protect, authorize('Admin'), getPayments);

module.exports = router;