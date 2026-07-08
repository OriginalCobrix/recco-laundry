const { sendEmail } = require('../utils/emailService');

exports.submitContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Yeh email aapke .env wale EMAIL_USER par jayegi
    const adminEmail = process.env.EMAIL_USER;
    const emailSubject = `RECCO Contact: ${subject}`;
    const emailHtml = `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${firstName} ${lastName || ''}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail(adminEmail, emailSubject, emailHtml);

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};