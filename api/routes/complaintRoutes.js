const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/v1/complaints
router.get('/', async (req, res, next) => {
  try {
    const complaints = await db.getComplaints();
    return successResponse(res, complaints);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/complaints
router.post('/', async (req, res, next) => {
  try {
    const { name, phone, orderId, description, image } = req.body;
    const complaint = await db.createComplaint({ name, phone, orderId, description, image });
    return successResponse(res, complaint, 'Complaint submitted successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});

// PATCH /api/v1/complaints/:id/status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const complaint = await db.updateComplaintStatus(req.params.id, { status, adminNotes });
    if (!complaint) return errorResponse(res, 'Complaint not found', 404);
    return successResponse(res, complaint, 'Complaint updated');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
