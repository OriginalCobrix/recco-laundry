const Notification = require('../models/Notification');

exports.createNotification = async (userId, message, type, linkId = null) => {
  try {
    const notification = await Notification.create({ user: userId, message, type, linkId });
    if (global.io) {
      global.io.to(userId.toString()).emit('new_notification', notification);
    }
    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
  }
};