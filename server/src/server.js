require('dotenv').config();

const app = require('./app');
const http = require('http');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

connectDB();

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// ✅ Vercel serverless compatibility
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    logger.info(`🚀 RECO Server running on port ${PORT}`);
  });
}

// ✅ Export for Vercel
module.exports = app;