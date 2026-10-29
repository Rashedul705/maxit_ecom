const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');
const { requireAdminAuth } = require('../middleware/auth');

// POST /api/v1/orders - Place order (Public for customers)
router.post('/', async (req, res, next) => {
  try {
    let { customer, customerName, phone, address, division, district, area, items, paymentMethod = 'cod', note } = req.body;
    
    // Normalize customer object
    if (!customer) {
      customer = {
        name: customerName || req.body.name,
        phone,
        address,
        division,
        district,
        area,
        note
      };
    }

    const order = await db.createOrder({ customer, items, paymentMethod });
    return successResponse(res, order, 'Order placed successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});

// GET /api/v1/orders/track - Track order by phone or orderNumber (Public)
router.get('/track', async (req, res, next) => {
  try {
    const { phone, orderNumber, invoiceId } = req.query;
    if (!phone && !orderNumber && !invoiceId) {
      return errorResponse(res, 'Phone number or Order Number is required to track order', 400);
    }
    const orders = await db.trackOrder({ phone, orderNumber, invoiceId });
    return successResponse(res, orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/orders - Admin list with filtering
router.get('/', requireAdminAuth, async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const result = await db.getOrders({ status, search, page, limit });
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/orders/:id - Order details
router.get('/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const order = await db.getOrderById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found', 404);
    return successResponse(res, order);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/orders/:id/status - Update order status
router.patch('/:id/status', requireAdminAuth, async (req, res, next) => {
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

module.exports = router;
