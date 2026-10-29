const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');
const { requireCustomerAuth } = require('../middleware/auth');

// GET /api/v1/wishlist
router.get('/', requireCustomerAuth, async (req, res, next) => {
  try {
    const items = await db.getWishlist(req.user.id);
    return successResponse(res, items);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/wishlist
router.post('/', requireCustomerAuth, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return errorResponse(res, 'productId is required', 400);
    }
    const list = await db.addToWishlist(req.user.id, productId);
    return successResponse(res, list, 'Added to wishlist');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/wishlist/:productId
router.delete('/:productId', requireCustomerAuth, async (req, res, next) => {
  try {
    const list = await db.removeFromWishlist(req.user.id, req.params.productId);
    return successResponse(res, list, 'Removed from wishlist');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
