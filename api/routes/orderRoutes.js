const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');
const { requireAdminAuth } = require('../middleware/auth');

// POST /api/v1/orders - Place order (Public for customers)
router.post('/', async (req, res, next) => {
  try {
    let { customer, customerName, phone, address, division, district, area, items, paymentMethod = 'cod', note, couponCode, coupon } = req.body;
    
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

    const resolvedCoupon = (couponCode || coupon || '').trim();
    const order = await db.createOrder({ customer, items, paymentMethod, couponCode: resolvedCoupon });
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

// GET /api/v1/orders/export - Export orders list for warehouse fulfillment
router.get('/export', requireAdminAuth, async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const orders = await db.getAllOrdersForExport({ status, search });
    return successResponse(res, orders);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/orders/bulk-status - Bulk update orders status
router.post('/bulk-status', requireAdminAuth, async (req, res, next) => {
  try {
    const { ids, status, note } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'ids must be a non-empty array of order IDs', 400);
    }
    if (!status) {
      return errorResponse(res, 'status is required', 400);
    }
    const result = await db.bulkUpdateOrderStatus({ ids, status, note });
    return successResponse(res, result, `Updated ${result.updatedCount} orders to ${status}`);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/orders/:id/courier-dispatch - Dispatch order via Steadfast / Pathao
router.post('/:id/courier-dispatch', requireAdminAuth, async (req, res, next) => {
  try {
    const { courier = 'Steadfast' } = req.body;
    const result = await db.dispatchToCourier({ orderId: req.params.id, courier });
    return successResponse(res, result, `Order dispatched via ${courier}`);
  } catch (err) {
    return errorResponse(res, err.message, 400);
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
