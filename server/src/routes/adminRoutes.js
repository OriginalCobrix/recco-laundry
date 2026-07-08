const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { getDashboardStats, handleWashermanApproval, assignOrderToWasherman } = require('../controllers/adminController');
const router = express.Router();

router.get('/stats', protect, authorize('Admin'), getDashboardStats);
router.put('/washerman-approval', protect, authorize('Admin'), handleWashermanApproval);
router.put('/assign-order', protect, authorize('Admin'), assignOrderToWasherman);

module.exports = router;