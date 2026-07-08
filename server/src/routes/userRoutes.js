const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { getUsers, getUserById, updateProfile, changePassword } = require('../controllers/userController');
const router = express.Router();

router.route('/').get(protect, authorize('Admin'), getUsers);
router.route('/:id').get(protect, getUserById);
router.route('/profile').put(protect, updateProfile);
router.route('/password').put(protect, changePassword);

module.exports = router;