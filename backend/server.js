require('dotenv').config();
const express = require('express');
const cors = require('cors');

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bannerController = require('./controllers/bannerController');
const productController = require('./controllers/productController');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { successResponse } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Middlewares
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  }, 'maxitshop API is operational');
});

// Categories & Banners
apiRouter.use('/categories', categoryRoutes);
apiRouter.get('/banners', bannerController.getBanners);

// Search Suggestions
apiRouter.get('/search/suggestions', productController.getSearchSuggestions);

// Products & Orders
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);

// Admin Routes
apiRouter.use('/admin', adminRoutes);

// Mount under /api/v1
app.use('/api/v1', apiRouter);

// Root fallback
app.get('/', (req, res) => {
  return successResponse(res, {
    name: 'maxitshop API Server',
    version: '1.0.0',
    documentation: '/api/v1/health'
  }, 'Welcome to maxitshop API Server');
});

// 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 maxitshop Express Server running on port ${PORT}`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api/v1`);
    console.log(`🔒 Admin Token Configured: ${process.env.ADMIN_TOKEN ? 'YES' : 'DEFAULT'}`);
  });
}

module.exports = app;
