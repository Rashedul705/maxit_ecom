const productService = require('../services/productService');
const { successResponse } = require('../utils/response');

const getProducts = async (req, res, next) => {
  try {
    const { category, search, brand, minPrice, maxPrice, sort, page, limit } = req.query;
    const result = await productService.getProducts({
      category,
      search,
      brand,
      minPrice,
      maxPrice,
      sort,
      page,
      limit
    });
    return successResponse(res, result, 'Products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getDeals = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const deals = await productService.getDeals(limit);
    return successResponse(res, deals, 'Deals retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getNew = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const items = await productService.getNewArrivals(limit);
    return successResponse(res, items, 'New arrivals retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getFeatured = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const items = await productService.getFeatured(limit);
    return successResponse(res, items, 'Featured products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Product not found'
      });
    }
    return successResponse(res, product, 'Product details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    const suggestions = await productService.getSearchSuggestions(q);
    return successResponse(res, suggestions, 'Search suggestions retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getDeals,
  getNew,
  getFeatured,
  getProductBySlug,
  getSearchSuggestions
};
