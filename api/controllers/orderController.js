const orderService = require('../services/orderService');
const { successResponse } = require('../utils/response');

const createOrder = async (req, res, next) => {
  try {
    const orderData = req.body;
    const order = await orderService.createOrder(orderData);
    return successResponse(res, order, 'Order placed successfully', 201);
  } catch (error) {
    next(error);
  }
};

const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber, phone } = req.query;
    const orders = await orderService.trackOrder({ orderNumber, phone });
    return successResponse(res, orders, 'Orders found successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  trackOrder
};
