const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');
const { requireAdminAuth } = require('../middleware/auth');

// POST /api/v1/newsletter/subscribe
router.post('/subscribe', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 'Email is required', 400);
    const sub = await db.addSubscriber(email);
    return successResponse(res, sub, 'Subscribed successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});

// GET /api/v1/newsletter/subscribers - Admin only
router.get('/subscribers', requireAdminAuth, async (req, res, next) => {
  try {
    const list = await db.getSubscribers();
    return successResponse(res, list);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
