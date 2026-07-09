require('dotenv').config();

const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

connectDB();

const server = http.createServer(app);

// ✅ FIX: Socket.IO CORS ko bhi exact domains allow karein
const allowedOrigins = [
  'https://recco-laundry-alpha.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // '*' ki jagah exact array
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
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