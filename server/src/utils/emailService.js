const nodemailer = require('nodemailer');

// ✅ FIX: Force IPv4 connection to avoid ENETUNREACH error
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // ✅ CRITICAL FIX: Force IPv4 only
  family: 4,
  // ✅ Connection timeout
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000
});

const sendEmail = async (to, subject, html) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured, skipping email send');
      return { success: false, message: 'Email not configured' };
    }

    const info = await transporter.sendMail({
      from: `"RECCO Laundry" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    // ✅ Don't throw error, just return failure
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };