const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { requireAdminAuth, requirePermission, requireSuperAdmin } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');

// POST /api/v1/admin/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }
    const auth = await db.authenticateAdmin({ email, password });
    if (!auth) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    return successResponse(res, auth, 'Admin authenticated successfully');
  } catch (err) {
    if (err.statusCode === 403) {
      return errorResponse(res, err.message, 403);
    }
    next(err);
  }
});

// Enforce admin/moderator authentication for all routes below
router.use(requireAdminAuth);

// GET /api/v1/admin/verify
router.get('/verify', (req, res) => {
  return successResponse(res, { valid: true, user: req.admin });
});

// GET /api/v1/admin/dashboard
router.get('/dashboard', requirePermission('reports.view'), async (req, res, next) => {
  try {
    const stats = await db.getDashboardStats();
    return successResponse(res, stats);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/orders
router.get('/orders', requirePermission('orders.view'), async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const result = await db.getOrders({ status, search, page, limit });
    return successResponse(res, result.items || result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/orders/:id/status
router.patch('/orders/:id/status', requirePermission('orders.update_status'), async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!status) return errorResponse(res, 'Status is required', 400);
    const order = await db.updateOrderStatus(req.params.id, { status, note });
    if (!order) return errorResponse(res, 'Order not found', 404);
    return successResponse(res, order, 'Order status updated successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/products
router.post('/products', requirePermission('products.create'), async (req, res, next) => {
  try {
    const { title, price } = req.body;
    if (!title || price === undefined) {
      return errorResponse(res, 'Title and price are required', 400);
    }
    const product = await db.createProduct(req.body);
    return successResponse(res, product, 'Product created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/admin/products/:id
router.put('/products/:id', requirePermission('products.edit'), async (req, res, next) => {
  try {
    const product = await db.updateProduct(req.params.id, req.body);
    if (!product) return errorResponse(res, 'Product not found', 404);
    return successResponse(res, product, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/admin/products/:id
router.delete('/products/:id', requirePermission('products.delete'), async (req, res, next) => {
  try {
    const ok = await db.deleteProduct(req.params.id);
    if (!ok) return errorResponse(res, 'Product not found', 404);
    return successResponse(res, { deleted: true }, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
});

// ==========================================
// MODERATOR MANAGEMENT ROUTES (Super Admin Only)
// ==========================================

// GET /api/v1/admin/moderators/logs
router.get('/moderators/logs', requireSuperAdmin, async (req, res, next) => {
  try {
    const logs = await db.getModeratorLogs(req.query);
    return successResponse(res, logs);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/moderators
router.get('/moderators', requireSuperAdmin, async (req, res, next) => {
  try {
    const list = await db.getModerators();
    return successResponse(res, list);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/moderators/:id
router.get('/moderators/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    const mod = await db.getModeratorById(req.params.id);
    if (!mod) return errorResponse(res, 'Moderator not found', 404);
    return successResponse(res, mod);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/moderators
router.post('/moderators', requireSuperAdmin, async (req, res, next) => {
  try {
    const { name, email, phone, password, permissions, isActive } = req.body;
    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }
    const created = await db.createModerator({ name, email, phone, password, permissions, isActive }, req.admin);
    return successResponse(res, created, 'Moderator account created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});

// PUT /api/v1/admin/moderators/:id
router.put('/moderators/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    const updated = await db.updateModerator(req.params.id, req.body, req.admin);
    return successResponse(res, updated, 'Moderator account updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});

// DELETE /api/v1/admin/moderators/:id
router.delete('/moderators/:id', requireSuperAdmin, async (req, res, next) => {
  try {
    await db.deleteModerator(req.params.id, req.admin);
    return successResponse(res, { deleted: true }, 'Moderator deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});

module.exports = router;
