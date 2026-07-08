const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `RECCO Laundry <${process.env.EMAIL_USER}>`,
      to, subject, html
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
  }
};