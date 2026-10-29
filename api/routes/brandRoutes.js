const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');
const { requireAdminAuth } = require('../middleware/auth');

// GET /api/v1/brands
router.get('/', async (req, res, next) => {
  try {
    const brands = await db.getBrands();
    return successResponse(res, brands);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/brands/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const brand = await db.getBrandBySlug(req.params.slug);
    if (!brand) return errorResponse(res, 'Brand not found', 404);
    return successResponse(res, brand);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/brands
router.post('/', requireAdminAuth, async (req, res, next) => {
  try {
    const { name, logo } = req.body;
    if (!name) return errorResponse(res, 'Brand name is required', 400);
    const b = await db.createBrand(req.body);
    return successResponse(res, b, 'Brand created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/brands/:id
router.put('/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const b = await db.updateBrand(req.params.id, req.body);
    if (!b) return errorResponse(res, 'Brand not found', 404);
    return successResponse(res, b, 'Brand updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/brands/:id
router.delete('/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const ok = await db.deleteBrand(req.params.id);
    if (!ok) return errorResponse(res, 'Brand not found', 404);
    return successResponse(res, { deleted: true }, 'Brand deleted successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
