require('dotenv').config();

const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

connectDB();

const server = http.createServer(app);

const allowedOrigins = [
  'https://recco-laundry-alpha.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// ✅ FIX: Force polling transport for Railway compatibility
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  // ✅ FIX: Railway ke liye important settings
  transports: ['polling', 'websocket'], // Polling pehle try kare
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true
});

global.io = io;

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    logger.info(`User joined room: ${userId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`RECCO Server running on port ${PORT}`);
});