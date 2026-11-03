const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/response');
const { requireAdminAuth } = require('../middleware/auth');

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
router.post('/', requireAdminAuth, async (req, res, next) => {
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
router.put('/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const cat = await db.updateCategory(req.params.id, req.body);
    if (!cat) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, cat, 'Category updated successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/categories/bulk-delete
router.post('/bulk-delete', requireAdminAuth, async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'ids must be a non-empty array of category IDs or slugs', 400);
    }
    const result = await db.bulkDeleteCategories(ids);
    return successResponse(res, result, `Successfully deleted ${result.deletedCount} categories`);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/categories/:id
router.delete('/:id', requireAdminAuth, async (req, res, next) => {
  try {
    const ok = await db.deleteCategory(req.params.id);
    if (!ok) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, { deleted: true }, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
});

// ─── Subcategory Routes ────────────────────────────────────────────────────

// GET /api/v1/categories/:categoryId/subcategories
router.get('/:categoryId/subcategories', async (req, res, next) => {
  try {
    const cat = await db.getCategoryBySlug(req.params.categoryId);
    if (!cat) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, cat.subcategories || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/categories/:categoryId/subcategories
router.post('/:categoryId/subcategories', requireAdminAuth, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return errorResponse(res, 'Subcategory name is required', 400);
    const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sub = { id: `sub-${Date.now()}`, name: name.trim(), slug };

    const cat = await Category.findOneAndUpdate(
      { $or: [{ id: req.params.categoryId }, { slug: req.params.categoryId }] },
      { $push: { subcategories: sub } },
      { new: true }
    ).lean();
    if (!cat) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, sub, 'Subcategory created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/categories/:categoryId/subcategories/:subId
router.put('/:categoryId/subcategories/:subId', requireAdminAuth, async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const updateFields = {};
    if (name) updateFields['subcategories.$.name'] = name.trim();
    if (slug) updateFields['subcategories.$.slug'] = slug;
    else if (name) updateFields['subcategories.$.slug'] = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const cat = await Category.findOneAndUpdate(
      {
        $or: [{ id: req.params.categoryId }, { slug: req.params.categoryId }],
        'subcategories.id': req.params.subId
      },
      { $set: updateFields },
      { new: true }
    ).lean();
    if (!cat) return errorResponse(res, 'Category or subcategory not found', 404);
    const updated = (cat.subcategories || []).find(s => s.id === req.params.subId);
    return successResponse(res, updated, 'Subcategory updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/categories/:categoryId/subcategories/:subId
router.delete('/:categoryId/subcategories/:subId', requireAdminAuth, async (req, res, next) => {
  try {
    const cat = await Category.findOneAndUpdate(
      { $or: [{ id: req.params.categoryId }, { slug: req.params.categoryId }] },
      { $pull: { subcategories: { id: req.params.subId } } },
      { new: true }
    ).lean();
    if (!cat) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, { deleted: true }, 'Subcategory deleted successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/categories/:categoryId/subcategories/bulk-delete
router.post('/:categoryId/subcategories/bulk-delete', requireAdminAuth, async (req, res, next) => {
  try {
    const { subIds } = req.body;
    if (!subIds || !Array.isArray(subIds) || subIds.length === 0) {
      return errorResponse(res, 'subIds must be a non-empty array of subcategory IDs', 400);
    }
    const cat = await Category.findOneAndUpdate(
      { $or: [{ id: req.params.categoryId }, { slug: req.params.categoryId }] },
      { $pull: { subcategories: { id: { $in: subIds } } } },
      { new: true }
    ).lean();
    if (!cat) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, { deletedCount: subIds.length }, `Successfully removed ${subIds.length} subcategories`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
