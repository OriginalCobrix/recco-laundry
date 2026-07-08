const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const router = express.Router();

router.route('/').get(getServices).post(protect, authorize('Admin'), createService);
router.route('/:id').put(protect, authorize('Admin'), updateService).delete(protect, authorize('Admin'), deleteService);

module.exports = router;