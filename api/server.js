require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
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
const couponRoutes = require('./routes/couponRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { successResponse } = require('./utils/response');
const db = require('./services/dbStore');

const app = express();
const PORT = process.env.PORT || 5002;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5173';

// MongoDB Connection
let mongoConnError = null;
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      mongoConnError = null;
      console.log('🍃 MongoDB connected successfully via MONGODB_URI');
    })
    .catch(err => {
      mongoConnError = err.message;
      console.warn('⚠️ MongoDB connection error (falling back to memory):', err.message);
    });
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
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token']
}));

// Rate limiting — must be after CORS, before routes
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 300,                   // 300 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' }
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,                    // 20 login attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});
app.use('/api/v1/admin/login', loginLimiter);
app.use('/api/v1/', globalLimiter);

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
  const mongoStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return successResponse(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    db: {
      hasUri: !!process.env.MONGODB_URI,
      state: mongoStates[mongoose.connection.readyState] || 'unknown',
      readyState: mongoose.connection.readyState,
      error: mongoConnError
    }
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
apiRouter.use('/subscribers', subscriberRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/coupons', couponRoutes);
apiRouter.use('/wishlist', wishlistRoutes);

// Search suggestions
apiRouter.get('/search/suggestions', async (req, res, next) => {
  try {
    const suggestions = await db.getSearchSuggestions(req.query.q);
    return successResponse(res, suggestions);
  } catch (err) {
    next(err);
  }
});

// Mount under /api/v1
app.use('/api/v1', apiRouter);

// Admin Dashboard SPA
const adminDistPath = path.join(__dirname, 'admin-dist');
app.use('/admin', express.static(adminDistPath, { redirect: false }));
app.get(['/admin', '/admin/*'], (req, res) => {
  res.sendFile(path.join(adminDistPath, 'index.html'));
});

// Root fallback
app.get('/', (req, res) => {
  return successResponse(res, {
    name: 'MaxiTShop API Server',
    version: '1.0.0',
    adminDashboard: '/admin',
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
