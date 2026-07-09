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

// ✅ FIX: Railway/Vercel proxy ko trust karein (express-rate-limit error fix)
app.set('trust proxy', 1);

// ✅ FIX: Explicitly allow Vercel domain instead of '*'
const allowedOrigins = [
  'https://recco-laundry-alpha.vercel.app', // Aapki live Vercel URL
  'http://localhost:5173',                  // Local development (Vite)
  'http://localhost:3000'                   // Local development (React)
];

app.use(helmet());
app.use(cors({ 
  origin: allowedOrigins, // '*' ki jagah exact array of domains
  credentials: true 
})); 

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
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