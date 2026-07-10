const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.get('/', protect, authorize('Admin'), getUsers);
router.get('/:id', protect, authorize('Admin'), getUserById);
router.put('/:id', protect, authorize('Admin'), updateUser);

// ✅ NEW: Delete user route
router.delete('/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;