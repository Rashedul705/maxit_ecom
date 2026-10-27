const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/v1/products
router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const result = await db.getProducts({
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      sort,
      page,
      limit
    });

    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/products/deals
router.get('/deals', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 12;
    const result = await db.getProducts({ isDeal: true, limit });
    return successResponse(res, result.items);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/products/featured
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 12;
    const result = await db.getProducts({ isFeatured: true, limit });
    return successResponse(res, result.items);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/products/new
router.get('/new', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 12;
    const result = await db.getProducts({ isNewItem: true, limit });
    return successResponse(res, result.items);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/products/search/suggestions
router.get('/search/suggestions', async (req, res, next) => {
  try {
    const suggestions = await db.getSearchSuggestions(req.query.q);
    return successResponse(res, suggestions);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/products/reviews/:id/helpful
router.post('/reviews/:id/helpful', async (req, res, next) => {
  try {
    const result = await db.voteReviewHelpful(req.params.id);
    return successResponse(res, result, 'Vote recorded');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/products/:slug/reviews
router.get('/:slug/reviews', async (req, res, next) => {
  try {
    const data = await db.getProductReviews(req.params.slug);
    return successResponse(res, data);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/products/:slug/reviews
router.post('/:slug/reviews', async (req, res, next) => {
  try {
    const { author, rating, title, comment } = req.body;
    if (!comment) {
      return errorResponse(res, 'Review comment is required', 400);
    }
    const review = await db.submitProductReview(req.params.slug, { author, rating, title, comment });
    return successResponse(res, review, 'Review submitted successfully', 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/products/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await db.getProductBySlug(req.params.slug);
    if (!product) return errorResponse(res, 'Product not found', 404);
    return successResponse(res, product);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/products
router.post('/', async (req, res, next) => {
  try {
    const { title, price } = req.body;
    if (!title || price === undefined) {
      return errorResponse(res, 'Title and price are required', 400);
    }
    const product = await db.createProduct(req.body);
    return successResponse(res, product, 'Product created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/products/:id
router.put('/:id', async (req, res, next) => {
  try {
    const product = await db.updateProduct(req.params.id, req.body);
    if (!product) return errorResponse(res, 'Product not found', 404);
    return successResponse(res, product, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const ok = await db.deleteProduct(req.params.id);
    if (!ok) return errorResponse(res, 'Product not found', 404);
    return successResponse(res, { deleted: true }, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
