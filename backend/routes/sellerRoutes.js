const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/v1/sellers
router.get('/', async (req, res, next) => {
  try {
    const sellers = await db.getSellers();
    return successResponse(res, sellers);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sellers
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return errorResponse(res, 'Seller name is required', 400);
    const seller = await db.createSeller(req.body);
    return successResponse(res, seller, 'Seller registered successfully', 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
