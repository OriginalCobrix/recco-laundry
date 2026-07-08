const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const { createNotification } = require('../utils/notificationService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    let finalRole = role || 'Customer';
    let finalApprovalStatus = 'Active';

    if (email === process.env.ADMIN_EMAIL) {
      finalRole = 'Admin';
      finalApprovalStatus = 'Active';
    } else if (finalRole === 'Washerman') {
      finalApprovalStatus = 'Pending Approval';
    }

    const user = await User.create({ name, email, phone, password, role: finalRole, approvalStatus: finalApprovalStatus });

    if (finalRole === 'Washerman') {
      const admin = await User.findOne({ role: 'Admin' });
      if (admin) await createNotification(admin._id, `New Washerman Registration: ${user.name} requires approval.`, 'Approval', user._id);
      await sendEmail(user.email, 'RECCO - Registration Pending', `<h3>Hello ${user.name},</h3><p>Your washerman account is pending admin approval.</p>`);
    } else if (finalRole === 'Admin') {
      await sendEmail(user.email, 'RECCO - Admin Account Created', `<h3>Hello ${user.name},</h3><p>Your Administrator account has been created successfully.</p>`);
    } else {
      await sendEmail(user.email, 'Welcome to RECCO Laundry', `<h3>Hello ${user.name},</h3><p>Welcome to RECCO!</p>`);
    }

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role, approvalStatus: user.approvalStatus,
      token: generateToken(user._id), refreshToken: generateRefreshToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role === 'Washerman' && user.approvalStatus === 'Pending Approval') return res.status(403).json({ message: 'Your account is pending Admin approval.' });
    if (user.role === 'Washerman' && user.approvalStatus === 'Rejected') return res.status(403).json({ message: `Your account was rejected. Reason: ${user.rejectionReason}` });

    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role, approvalStatus: user.approvalStatus,
      token: generateToken(user._id), refreshToken: generateRefreshToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    res.json({ token: generateToken(user._id), refreshToken: generateRefreshToken(user._id) });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};