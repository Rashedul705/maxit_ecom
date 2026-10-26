const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/v1/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await db.getCategories();
    return successResponse(res, categories);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/categories/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const category = await db.getCategoryBySlug(req.params.slug);
    if (!category) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, category);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/categories
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return errorResponse(res, 'Category name is required', 400);
    const cat = await db.createCategory(req.body);
    return successResponse(res, cat, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/categories/:id
router.put('/:id', async (req, res, next) => {
  try {
    const cat = await db.updateCategory(req.params.id, req.body);
    if (!cat) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, cat, 'Category updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/categories/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const ok = await db.deleteCategory(req.params.id);
    if (!ok) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, { deleted: true }, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
