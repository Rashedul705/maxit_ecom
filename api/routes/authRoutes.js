const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');
const { requireCustomerAuth } = require('../middleware/auth');

// POST /api/v1/auth/admin/login
router.post('/admin/login', async (req, res, next) => {
  try {
    const { email, password, token } = req.body;
    const auth = await db.authenticateAdmin({ email, password, token });
    if (!auth) {
      return errorResponse(res, 'Invalid admin email or password', 401);
    }
    return successResponse(res, auth, 'Admin authenticated successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/customer/register
router.post('/customer/register', async (req, res, next) => {
  try {
    const { name, email, phone, password, address } = req.body;
    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }
    const result = await db.registerCustomer({ name, email, phone, password, address });
    return successResponse(res, result, 'Registration successful', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});

// POST /api/v1/auth/customer/login
router.post('/customer/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await db.loginCustomer({ email, password });
    if (!result) {
      return errorResponse(res, 'Invalid email or password', 401);
    }
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/customer/profile
router.get('/customer/profile', requireCustomerAuth, async (req, res, next) => {
  try {
    const data = await db.getCustomerProfile(req.user.id);
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message, 404);
  }
});

// PUT /api/v1/auth/customer/profile
router.put('/customer/profile', requireCustomerAuth, async (req, res, next) => {
  try {
    const updated = await db.updateCustomerProfile(req.user.id, req.body);
    return successResponse(res, updated, 'Profile updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});

module.exports = router;
