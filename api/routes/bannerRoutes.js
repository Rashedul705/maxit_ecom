const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/v1/banners
router.get('/', async (req, res, next) => {
  try {
    const banners = await db.getBanners();
    return successResponse(res, banners);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/banners
router.post('/', async (req, res, next) => {
  try {
    const { title, image } = req.body;
    if (!title || !image) return errorResponse(res, 'Title and image are required', 400);
    const banner = await db.createBanner(req.body);
    return successResponse(res, banner, 'Banner created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/banners/:id
router.put('/:id', async (req, res, next) => {
  try {
    const banner = await db.updateBanner(req.params.id, req.body);
    if (!banner) return errorResponse(res, 'Banner not found', 404);
    return successResponse(res, banner, 'Banner updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/banners/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const ok = await db.deleteBanner(req.params.id);
    if (!ok) return errorResponse(res, 'Banner not found', 404);
    return successResponse(res, { deleted: true }, 'Banner deleted successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
