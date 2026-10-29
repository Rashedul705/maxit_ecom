const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');
const { requireAdminAuth } = require('../middleware/auth');

// POST /api/v1/coupons/verify - Verify coupon code (Public)
router.post('/verify', async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) {
      return errorResponse(res, 'Coupon code is required', 400);
    }
    const result = await db.verifyCoupon({ code, subtotal: Number(subtotal) || 0 });
    return successResponse(res, result, result.message);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});

// GET /api/v1/coupons - List all coupons (Admin)
router.get('/', requireAdminAuth, async (req, res, next) => {
  try {
    const coupons = await db.getCoupons();
    return successResponse(res, coupons);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/coupons - Create coupon (Admin)
router.post('/', requireAdminAuth, async (req, res, next) => {
  try {
    const { code, discountValue } = req.body;
    if (!code || discountValue === undefined) {
      return errorResponse(res, 'Coupon code and discount value are required', 400);
    }
    const coupon = await db.createCoupon(req.body);
    return successResponse(res, coupon, 'Coupon created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});

// PUT /api/v1/coupons/:id - Update coupon (Admin)
router.put('/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const coupon = await db.updateCoupon(req.params.id, req.body);
    if (!coupon) return errorResponse(res, 'Coupon not found', 404);
    return successResponse(res, coupon, 'Coupon updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/coupons/:id - Delete coupon (Admin)
router.delete('/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const ok = await db.deleteCoupon(req.params.id);
    if (!ok) return errorResponse(res, 'Coupon not found', 404);
    return successResponse(res, { deleted: true }, 'Coupon deleted successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
