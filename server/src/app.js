const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const contactRoutes = require('./routes/contactRoutes'); 
const errorMiddleware = require('./middlewares/errorMiddleware');
const sanitizeMiddleware = require('./middlewares/sanitizeMiddleware');

const app = express();

app.use(helmet());
// FIX: origin ko 'true' kar dein taake Vercel ki domain automatically allow ho jaye
app.use(cors({ origin: true, credentials: true })); 

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000 // Thora increase kar dein kyunke sockets bhi count hote hain
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(sanitizeMiddleware);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);

app.use(errorMiddleware);

module.exports = app;