const adminService = require('../services/adminService');
const { successResponse } = require('../utils/response');

const getOrders = async (req, res, next) => {
  try {
    const orders = await adminService.getAdminOrders();
    return successResponse(res, orders, 'All orders retrieved');
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await adminService.updateOrderStatus(id, status);
    return successResponse(res, updated, `Order status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await adminService.createProduct(req.body);
    return successResponse(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await adminService.updateProduct(id, req.body);
    return successResponse(res, updated, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await adminService.deleteProduct(id);
    return successResponse(res, deleted, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return successResponse(res, stats, 'Dashboard metrics retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboard
};
