const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse } = require('../utils/response');

// GET /api/v1/settings
router.get('/', async (req, res, next) => {
  try {
    const settings = await db.getSettings();
    return successResponse(res, settings);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/settings
router.put('/', async (req, res, next) => {
  try {
    const settings = await db.updateSettings(req.body);
    return successResponse(res, settings, 'Settings updated successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
