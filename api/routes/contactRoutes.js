const express = require('express');
const router = express.Router();
const db = require('../services/dbStore');
const smsService = require('../services/smsService');
const emailService = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/response');

// POST /api/v1/contact - Customer contact form submission
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || (!phone && !email) || !message) {
      return errorResponse(res, 'Name, message, and at least a phone number or email are required', 400);
    }

    // Save inquiry to database (using complaints/inquiries store)
    try {
      await db.createComplaint({
        name,
        phone: phone || email,
        email: email || '',
        subject: subject || 'General Inquiry',
        orderId: subject ? `INQUIRY: ${subject.slice(0, 30)}` : 'GENERAL-INQUIRY',
        description: `[Contact Form Inquiry]\nEmail: ${email || 'N/A'}\nSubject: ${subject || 'General'}\nMessage:\n${message}`,
        message,
        image: ''
      });
    } catch (dbErr) {
      console.warn('⚠️ [Contact] Could not persist complaint to DB:', dbErr.message);
    }

    // 1. Asynchronously send SMS notifications to Customer and Admin
    smsService.sendContactNotification({
      contact: { name, email, phone, subject, message }
    }).catch(err => {
      console.error('❌ [Contact] SMS Notification error:', err.message);
    });

    // 2. Asynchronously send Email notification to Admin if configured
    if (process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER) {
      emailService.sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER,
        subject: `📬 [New Contact Inquiry] from ${name}: ${subject || 'General'}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #0f172a;">
            <h2 style="color: #ff6600;">MaxiTShop Website Contact Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Email:</strong> ${email || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject || 'General'}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f8fafc; padding: 14px; border-left: 4px solid #ff6600; border-radius: 4px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
        `
      }).catch(err => {
        console.error('❌ [Contact] Admin Email Notification error:', err.message);
      });
    }

    return successResponse(res, {
      received: true,
      name,
      phone
    }, 'Thank you! Your message has been sent successfully. Confirmation SMS sent.', 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

