const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const { successResponse, errorResponse } = require('../utils/response');
const { requireAdminAuth, requirePermission } = require('../middleware/auth');

// GET /api/v1/complaints - Admin only
router.get('/', requireAdminAuth, requirePermission('reviews.view'), async (req, res, next) => {
  try {
    const complaints = await db.getComplaints();
    return successResponse(res, complaints);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/complaints/sync-emails - Manually trigger IMAP sync for customer replies
router.post('/sync-emails', requireAdminAuth, requirePermission('reviews.view'), async (req, res, next) => {
  try {
    const emailSyncService = require('../services/emailSyncService');
    const result = await emailSyncService.syncTicketReplies();
    const complaints = await db.getComplaints();
    return successResponse(res, { syncResult: result, complaints }, 'Email sync completed');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/complaints/:id - Admin only (or single lookup)
router.get('/:id', requireAdminAuth, requirePermission('reviews.view'), async (req, res, next) => {
  try {
    const complaint = await db.getComplaintById(req.params.id);
    if (!complaint) return errorResponse(res, 'Complaint not found', 404);
    return successResponse(res, complaint);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/complaints - Public for customers
router.post('/', async (req, res, next) => {
  try {
    const { name, customerName, phone, email, subject, orderId, orderNumber, description, message, image } = req.body;
    const complaint = await db.createComplaint({
      name: name || customerName,
      phone,
      email,
      subject,
      orderId: orderId || orderNumber,
      description: description || message,
      message,
      image
    });
    return successResponse(res, complaint, 'Complaint submitted successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
});

// POST /api/v1/complaints/:id/messages - Admin chat reply to customer
router.post('/:id/messages', requireAdminAuth, requirePermission('reviews.approve'), async (req, res, next) => {
  try {
    const { text, channel, sendEmail, sendSms, attachments } = req.body;
    if (!text || !text.trim()) {
      return errorResponse(res, 'Reply message text is required', 400);
    }
    const adminName = req.adminUser?.name || 'MaxiTShop Support';
    const updated = await db.addComplaintMessage(req.params.id, {
      sender: 'admin',
      senderName: adminName,
      text,
      attachments,
      channel: channel || (sendEmail ? 'email' : sendSms ? 'sms' : 'web'),
      sendEmail: !!sendEmail,
      sendSms: !!sendSms
    });
    if (!updated) return errorResponse(res, 'Complaint not found', 404);
    return successResponse(res, updated, 'Reply sent successfully');
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/complaints/:id/read - Mark as read / unread
router.patch('/:id/read', requireAdminAuth, requirePermission('reviews.view'), async (req, res, next) => {
  try {
    const { isRead = true } = req.body;
    const complaint = await db.markComplaintRead(req.params.id, isRead);
    if (!complaint) return errorResponse(res, 'Complaint not found', 404);
    return successResponse(res, complaint, isRead ? 'Marked as read' : 'Marked as unread');
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/complaints/:id/status - Admin only
router.patch('/:id/status', requireAdminAuth, requirePermission('reviews.approve'), async (req, res, next) => {
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
