const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Get or initialize the nodemailer transporter instance
 */
function getTransporter() {
  if (transporter) return transporter;

  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    console.warn('⚠️ [SMTP] SMTP_USER or SMTP_PASS is missing. Email delivery is disabled.');
    return null;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });

  return transporter;
}

/**
 * Verify SMTP connection on startup
 */
async function verifyConnection() {
  try {
    const t = getTransporter();
    if (!t) return false;
    await t.verify();
    console.log(`✉️ [SMTP] Connected to ${process.env.SMTP_HOST || 'smtp.gmail.com'} as ${process.env.SMTP_USER}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ [SMTP] Connection check failed: ${err.message}`);
    return false;
  }
}

/**
 * Send an email with error safety
 */
async function sendEmail({ to, subject, html, text }) {
  try {
    const t = getTransporter();
    if (!t) {
      console.warn(`⚠️ [SMTP] Email not sent to <${to}>: SMTP is not configured.`);
      return { success: false, message: 'SMTP not configured' };
    }

    const from = process.env.SMTP_FROM || `"MaxiTShop" <${process.env.SMTP_USER || 'm4xit.bd@gmail.com'}>`;
    const info = await t.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      html
    });

    console.log(`✉️ [SMTP] Email sent to <${to}> [MessageId: ${info.messageId}]`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [SMTP] Error sending email to <${to}>:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Format currency with BDT symbol ৳
 */
const formatBDT = (amount) => `৳${Number(amount || 0).toLocaleString()}`;

/**
 * Order Confirmation email sent to the customer
 */
async function sendOrderConfirmation(order) {
  const customerEmail = order?.customer?.email || order?.customerEmail;
  if (!customerEmail || !customerEmail.includes('@')) {
    return { success: false, message: 'No valid customer email for order' };
  }

  const customerName = order?.customer?.name || 'Valued Customer';
  const orderNumber = order?.orderNumber || order?.id || 'N/A';
  const orderTotal = formatBDT(order?.total);
  const items = order?.items || [];
  const address = [
    order?.customer?.address,
    order?.customer?.thana,
    order?.customer?.district,
    order?.customer?.division
  ].filter(Boolean).join(', ') || 'N/A';
  const phone = order?.customer?.phone || 'N/A';
  const paymentMethod = (order?.paymentMethod || 'COD').toUpperCase();
  const dateStr = new Date(order?.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #0f172a;">
        <strong>${item.title || item.name || 'Product'}</strong>
        ${item.variation ? `<div style="font-size: 11px; color: #ea580c; margin-top: 2px;">🏷️ ${item.variation}</div>` : ''}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: center; color: #475569;">
        ${item.quantity || 1}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; color: #0f172a; font-weight: 600;">
        ${formatBDT(item.price)}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; color: #ff6600; font-weight: 700;">
        ${formatBDT((item.price || 0) * (item.quantity || 1))}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - MaxiTShop</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 26px 30px; text-align: left;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                    <span style="color: #ff6600;">MaxiT</span>Shop
                  </h1>
                  <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">Official Order Confirmation &amp; Invoice</p>
                </td>
              </tr>

              <!-- Greeting & Status Badge -->
              <tr>
                <td style="padding: 30px 30px 20px;">
                  <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 14px;">
                    ✓ Order Received Successfully
                  </div>
                  <h2 style="margin: 0 0 10px; font-size: 20px; color: #0f172a;">Thank you for your order, ${customerName}!</h2>
                  <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.6;">
                    We have received your order <strong>#${orderNumber}</strong> placed on ${dateStr}. We are preparing your package for fast courier dispatch.
                  </p>
                </td>
              </tr>

              <!-- Order Summary Table -->
              <tr>
                <td style="padding: 0 30px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 10px;">
                    <thead>
                      <tr style="background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                        <th align="left" style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Item</th>
                        <th align="center" style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Qty</th>
                        <th align="right" style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Price</th>
                        <th align="right" style="padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- Totals Breakdown -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 14px;">
                    <tr>
                      <td align="right" style="padding: 4px 12px; font-size: 13px; color: #64748b;">Subtotal:</td>
                      <td align="right" width="100" style="padding: 4px 12px; font-size: 13px; color: #0f172a; font-weight: 600;">
                        ${formatBDT(order?.subtotal || order?.total)}
                      </td>
                    </tr>
                    <tr>
                      <td align="right" style="padding: 4px 12px; font-size: 13px; color: #64748b;">Delivery Charge:</td>
                      <td align="right" style="padding: 4px 12px; font-size: 13px; color: #0f172a; font-weight: 600;">
                        ${formatBDT(order?.deliveryCharge || 0)}
                      </td>
                    </tr>
                    ${order?.discount ? `
                    <tr>
                      <td align="right" style="padding: 4px 12px; font-size: 13px; color: #16a34a;">Discount:</td>
                      <td align="right" style="padding: 4px 12px; font-size: 13px; color: #16a34a; font-weight: 600;">
                        -${formatBDT(order?.discount)}
                      </td>
                    </tr>` : ''}
                    <tr style="border-top: 2px solid #e2e8f0;">
                      <td align="right" style="padding: 10px 12px 4px; font-size: 15px; color: #0f172a; font-weight: 800;">Grand Total (BDT):</td>
                      <td align="right" style="padding: 10px 12px 4px; font-size: 17px; color: #ff6600; font-weight: 800;">
                        ${orderTotal}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Delivery & Payment Information -->
              <tr>
                <td style="padding: 0 30px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px;">
                    <tr>
                      <td width="50%" valign="top" style="padding: 8px 12px;">
                        <h4 style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Delivery Address</h4>
                        <div style="font-size: 13px; color: #0f172a; font-weight: 600;">${customerName}</div>
                        <div style="font-size: 12px; color: #475569; margin-top: 2px;">📞 ${phone}</div>
                        <div style="font-size: 12px; color: #475569; margin-top: 2px; line-height: 1.4;">📍 ${address}</div>
                      </td>
                      <td width="50%" valign="top" style="padding: 8px 12px; border-left: 1px solid #e2e8f0;">
                        <h4 style="margin: 0 0 6px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Payment &amp; Logistics</h4>
                        <div style="font-size: 13px; color: #0f172a;">Method: <strong>${paymentMethod}</strong></div>
                        <div style="font-size: 13px; color: #0f172a; margin-top: 3px;">Payment Status: <strong style="color: ${order?.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'}; text-transform: uppercase;">${order?.paymentStatus || 'UNPAID'}</strong></div>
                        <div style="font-size: 13px; color: #ff6600; font-weight: 700; margin-top: 4px;">Collection at Delivery: ${orderTotal}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">
                    Need help with your order? Contact us at <a href="mailto:m4xit.bd@gmail.com" style="color: #ff6600; text-decoration: none;">m4xit.bd@gmail.com</a> or call <strong>+880 1733-272445</strong>
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                    © ${new Date().getFullYear()} MaxiTShop Bangladesh. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmed: #${orderNumber} (${orderTotal}) - MaxiTShop`,
    html
  });
}

/**
 * Instant notification sent to Admin when a new order is received
 */
async function sendNewOrderAdminAlert(order) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || 'm4xit.bd@gmail.com';
  if (!adminEmail) return { success: false, message: 'No admin email configured' };

  const customerName = order?.customer?.name || 'Customer';
  const phone = order?.customer?.phone || 'N/A';
  const orderNumber = order?.orderNumber || order?.id || 'N/A';
  const totalStr = formatBDT(order?.total);
  const itemsCount = (order?.items || []).length;
  const address = [
    order?.customer?.address,
    order?.customer?.thana,
    order?.customer?.district
  ].filter(Boolean).join(', ') || 'N/A';

  const itemsList = (order?.items || []).map(i => `• ${i.quantity || 1}x ${i.title || i.name} (${formatBDT(i.price)})`).join('<br>');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background: #f8fafc; padding: 20px; color: #0f172a;">
      <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; padding: 24px;">
        <div style="font-size: 18px; font-weight: 800; color: #ff6600; margin-bottom: 4px;">MaxiTShop Admin Alert</div>
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">🚨 New Order Placed: #${orderNumber}</h2>

        <div style="background: #fff7ed; border-left: 4px solid #ff6600; padding: 12px 16px; margin-bottom: 18px;">
          <div style="font-size: 15px; font-weight: 700; color: #c2410c;">Grand Total: ${totalStr}</div>
          <div style="font-size: 12px; color: #9a3412;">Payment: ${(order?.paymentMethod || 'COD').toUpperCase()} (${(order?.paymentStatus || 'UNPAID').toUpperCase()})</div>
        </div>

        <h4 style="margin: 0 0 6px; font-size: 13px; text-transform: uppercase; color: #64748b;">Customer Information</h4>
        <div style="font-size: 13px; line-height: 1.5; margin-bottom: 16px;">
          <strong>Name:</strong> ${customerName}<br>
          <strong>Phone:</strong> <a href="tel:${phone}" style="color: #ff6600; text-decoration: none;">${phone}</a><br>
          <strong>Email:</strong> ${order?.customer?.email || 'N/A'}<br>
          <strong>Address:</strong> ${address}
        </div>

        <h4 style="margin: 0 0 6px; font-size: 13px; text-transform: uppercase; color: #64748b;">Ordered Items (${itemsCount})</h4>
        <div style="font-size: 13px; line-height: 1.6; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          ${itemsList}
        </div>

        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/orders" style="display: inline-block; background: #ff6600; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 10px 22px; border-radius: 6px;">
            Open Orders Management
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `🚨 [New Order] #${orderNumber} - ${totalStr} from ${customerName}`,
    html
  });
}

/**
 * Order Status Update Notification (e.g. Shipped, Delivered)
 */
async function sendOrderStatusUpdate(order, newStatus, note = '') {
  const customerEmail = order?.customer?.email || order?.customerEmail;
  if (!customerEmail || !customerEmail.includes('@')) {
    return { success: false, message: 'No valid customer email' };
  }

  const customerName = order?.customer?.name || 'Customer';
  const orderNumber = order?.orderNumber || order?.id || 'N/A';
  const courier = order?.courier?.provider || order?.courier || 'Steadfast';
  const trackingCode = order?.courier?.trackingCode || order?.trackingCode || '';

  const statusDescriptions = {
    confirmed: 'Your order has been verified and confirmed by our logistics team.',
    shipped: `Your package has been dispatched via ${courier} Courier.${trackingCode ? ` Tracking Code: <strong>${trackingCode}</strong>` : ''}`,
    delivered: 'Your order has been marked as successfully delivered. Thank you for shopping with MaxiTShop!',
    cancelled: 'Your order has been cancelled. If you have questions, please reach out to our support.'
  };

  const statusText = statusDescriptions[newStatus] || `Your order status is now ${newStatus}.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background: #f8fafc; padding: 25px; color: #0f172a;">
      <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 28px;">
        <div style="font-size: 20px; font-weight: 800; color: #ff6600; margin-bottom: 6px;">MaxiTShop</div>
        <h2 style="margin: 0 0 12px; font-size: 20px; color: #0f172a;">Order Update: #${orderNumber}</h2>
        <div style="display: inline-block; background: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 12px; text-transform: uppercase; padding: 3px 10px; border-radius: 12px; margin-bottom: 16px;">
          Status: ${newStatus}
        </div>

        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 16px;">
          Hello ${customerName},<br><br>
          ${statusText}
        </p>

        ${note ? `<div style="font-size: 12px; color: #64748b; background: #f8fafc; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #e2e8f0;">Note: ${note}</div>` : ''}

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b;">
          If you have any questions, contact us at <a href="mailto:m4xit.bd@gmail.com" style="color: #ff6600;">m4xit.bd@gmail.com</a>.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order #${orderNumber} Status: ${newStatus.toUpperCase()} - MaxiTShop`,
    html
  });
}

/**
 * Send a quick test email to verify SMTP configuration
 */
async function sendTestEmail(toEmail) {
  const target = toEmail || process.env.SMTP_USER || 'm4xit.bd@gmail.com';
  const timeStr = new Date().toLocaleString();

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background: #f8fafc; padding: 30px; color: #0f172a;">
      <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; padding: 24px; text-align: center;">
        <h1 style="color: #ff6600; margin: 0 0 10px;">MaxiTShop</h1>
        <h2 style="color: #10b981; margin: 0 0 16px;">✓ SMTP Setup Successful!</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
          This is a test email confirming that your Gmail SMTP credentials (<code>${process.env.SMTP_USER}</code>) are working properly with MaxiTShop.
        </p>
        <div style="font-size: 12px; color: #64748b; background: #f1f5f9; padding: 8px 14px; border-radius: 6px;">
          Timestamp: ${timeStr}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: target,
    subject: '✓ MaxiTShop SMTP Connection Test - Success',
    html
  });
}

module.exports = {
  getTransporter,
  verifyConnection,
  sendEmail,
  sendOrderConfirmation,
  sendNewOrderAdminAlert,
  sendOrderStatusUpdate,
  sendTestEmail
};

