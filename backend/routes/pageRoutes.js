const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/v1/pages
router.get('/', async (req, res, next) => {
  try {
    const pages = await db.getAllPages();
    return successResponse(res, pages);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/pages/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const page = await db.getPage(req.params.slug);
    if (!page) return errorResponse(res, 'Page not found', 404);
    return successResponse(res, page);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/pages/:slug
router.put('/:slug', async (req, res, next) => {
  try {
    const page = await db.updatePage(req.params.slug, req.body);
    return successResponse(res, page, 'Page updated successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
