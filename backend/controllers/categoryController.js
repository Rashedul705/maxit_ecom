const categoryService = require('../services/categoryService');
const { successResponse } = require('../utils/response');

const getCategoriesTree = async (req, res, next) => {
  try {
    const data = await categoryService.getCategoriesTree();
    return successResponse(res, data, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const data = await categoryService.getCategoryBySlug(slug);
    if (!data) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Category not found'
      });
    }
    return successResponse(res, data, 'Category details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategoriesTree,
  getCategoryBySlug
};
