require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const brandRoutes = require('./routes/brandRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const pageRoutes = require('./routes/pageRoutes');
const settingRoutes = require('./routes/settingRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { successResponse } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 5002;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5173';

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('🍃 MongoDB connected successfully via MONGODB_URI'))
    .catch(err => console.warn('⚠️ MongoDB connection error (falling back to memory):', err.message));
} else {
  console.log('ℹ️ MONGODB_URI not provided; running API in in-memory seed mode.');
}

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('esp32.site') ||
      origin === CLIENT_URL ||
      origin === ADMIN_URL
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger (Development)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
const apiRouter = express.Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  }, 'MaxiTShop API is operational');
});

// Mount Resource Routes under /api/v1
apiRouter.use('/auth', authRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/brands', brandRoutes);
apiRouter.use('/banners', bannerRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/complaints', complaintRoutes);
apiRouter.use('/sellers', sellerRoutes);
apiRouter.use('/pages', pageRoutes);
apiRouter.use('/settings', settingRoutes);
apiRouter.use('/newsletter', subscriberRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/admin', adminRoutes);

// Mount under /api/v1
app.use('/api/v1', apiRouter);

// Root fallback
app.get('/', (req, res) => {
  return successResponse(res, {
    name: 'MaxiTShop API Server',
    version: '1.0.0',
    documentation: '/api/v1/health'
  }, 'Welcome to MaxiTShop API Server');
});

// 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 MaxiTShop Express Server running on port ${PORT}`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api/v1`);
    console.log(`🔒 Admin Token Configured: ${process.env.ADMIN_TOKEN ? 'YES' : 'DEFAULT'}`);
  });
}

module.exports = app;
