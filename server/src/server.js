require('dotenv').config();

const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  transports: ['polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

global.io = io;

io.on('connection', (socket) => {
  logger.info(`✅ Socket connected: ${socket.id}`);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    logger.info(`✅ User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    logger.info(`❌ Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 RECCO Server running on port ${PORT}`);
});