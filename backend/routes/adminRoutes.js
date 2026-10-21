const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdminAuth } = require('../middleware/auth');

// Public Admin Auth Route
router.post('/login', adminController.login);

// All subsequent admin routes require ADMIN_TOKEN authorization
router.use(requireAdminAuth);

router.get('/verify', adminController.verifySession);
router.get('/me', adminController.verifySession);
router.get('/dashboard', adminController.getDashboard);
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

module.exports = router;
