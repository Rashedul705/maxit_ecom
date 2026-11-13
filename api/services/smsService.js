/**
 * BulkSMSBD SMS Notification Service
 * Provider: bulksmsbd.net
 */

const BULKSMSBD_URL = 'https://bulksmsbd.net/api/smsapi';

/**
 * Normalizes any Bangladeshi mobile number into standard 8801XXXXXXXXX format
 */
function normalizeBDPhone(phone) {
  if (!phone) return null;
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('880')) {
    return cleaned.length === 13 ? cleaned : null;
  }
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return '88' + cleaned;
  }
  if (cleaned.startsWith('1') && cleaned.length === 10) {
    return '880' + cleaned;
  }
  return cleaned.length === 13 ? cleaned : null;
}

/**
 * Send an SMS via BulkSMSBD API
 */
async function sendSms(rawPhone, message) {
  try {
    if (process.env.SMS_ENABLED === 'false') {
      console.log('📱 [SMS] SMS sending is disabled via SMS_ENABLED=false');
      return { success: false, message: 'SMS disabled' };
    }

    const apiKey = (process.env.BULKSMSBD_API_KEY || '').trim();
    const senderId = (process.env.BULKSMSBD_SENDER_ID || '').trim();

    if (!apiKey) {
      console.warn('⚠️ [SMS] BULKSMSBD_API_KEY is not configured');
      return { success: false, message: 'API key not configured' };
    }

    const recipient = normalizeBDPhone(rawPhone);
    if (!recipient) {
      console.warn(`⚠️ [SMS] Invalid Bangladeshi phone number: "${rawPhone}"`);
      return { success: false, message: 'Invalid phone number' };
    }

    const bodyParams = new URLSearchParams();
    bodyParams.append('api_key', apiKey);
    bodyParams.append('senderid', senderId || apiKey);
    bodyParams.append('number', recipient);
    bodyParams.append('message', message);

    const res = await fetch(BULKSMSBD_URL, {
      method: 'POST',
      body: bodyParams
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (data.response_code === 202 || data.success_message) {
      console.log(`📱 [SMS] Successfully sent to ${recipient}: "${message.slice(0, 40)}..."`);
      return { success: true, data };
    } else {
      console.warn(`⚠️ [SMS] BulkSMSBD Response for ${recipient}:`, data.error_message || text);
      return { success: false, error: data.error_message || text, data };
    }
  } catch (err) {
    console.error(`❌ [SMS] Failed sending SMS to ${rawPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Check BulkSMSBD balance
 */
async function getBalance() {
  try {
    const apiKey = (process.env.BULKSMSBD_API_KEY || '').trim();
    if (!apiKey) return { success: false, message: 'No API key' };

    const res = await fetch(`https://bulksmsbd.net/api/getBalanceApi?api_key=${apiKey}`);
    const data = await res.json();
    return { success: true, balance: data.balance, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send order notifications to customer and owner/admin
 */
async function sendOrderNotification({ order }) {
  const customerPhone = order?.customer?.phone;
  const adminPhone = process.env.ADMIN_PHONE || '8801733272445';
  const orderNumber = order?.orderNumber || order?.id || 'N/A';
  const total = Number(order?.total || 0).toLocaleString();
  const customerName = order?.customer?.name || 'Customer';

  // 1. Customer Notification SMS
  if (customerPhone) {
    const customerMsg = `MaxiTShop: Order #${orderNumber} placed successfully! Total: ৳${total}. We will verify & call you before delivery. Hotline: 01733272445`;
    sendSms(customerPhone, customerMsg).catch(err => {
      console.error('[SMS] Customer order SMS error:', err.message);
    });
  }

  // 2. Admin / Owner Notification SMS
  if (adminPhone) {
    const area = order?.customer?.district || order?.customer?.division || 'BD';
    const adminMsg = `[New Order] #${orderNumber} - ৳${total} from ${customerName} (${customerPhone || 'No Phone'}). Area: ${area}.`;
    sendSms(adminPhone, adminMsg).catch(err => {
      console.error('[SMS] Admin order SMS error:', err.message);
    });
  }
}

/**
 * Send contact inquiry notifications to customer and owner/admin
 */
async function sendContactNotification({ contact }) {
  const customerPhone = contact?.phone;
  const adminPhone = process.env.ADMIN_PHONE || '8801733272445';
  const name = contact?.name || 'Customer';
  const subject = contact?.subject || 'Inquiry';
  const message = (contact?.message || '').replace(/\s+/g, ' ').slice(0, 60);

  // 1. Customer Confirmation SMS
  if (customerPhone) {
    const customerMsg = `Thank you for contacting MaxiTShop, ${name}! We received your inquiry regarding "${subject}" and our team will get back to you shortly. Hotline: 01733272445`;
    sendSms(customerPhone, customerMsg).catch(err => {
      console.error('[SMS] Customer contact SMS error:', err.message);
    });
  }

  // 2. Admin / Owner Notification SMS
  if (adminPhone) {
    const adminMsg = `[New Inquiry] From: ${name} (${customerPhone || contact?.email || 'N/A'}). Subject: ${subject}. "${message}"`;
    sendSms(adminPhone, adminMsg).catch(err => {
      console.error('[SMS] Admin contact SMS error:', err.message);
    });
  }
}

/**
 * Send order status update SMS to customer
 */
async function sendOrderStatusNotification({ order, newStatus }) {
  const customerPhone = order?.customer?.phone;
  if (!customerPhone) return;

  const orderNumber = order?.orderNumber || order?.id || 'N/A';
  const courier = order?.courier?.provider || 'Steadfast';
  const trackingCode = order?.courier?.trackingCode || '';

  let msg = '';
  if (newStatus === 'shipped') {
    msg = `MaxiTShop: Your order #${orderNumber} is SHIPPED via ${courier} Courier.${trackingCode ? ` Tracking: ${trackingCode}.` : ''} Hotline: 01733272445`;
  } else if (newStatus === 'delivered') {
    msg = `MaxiTShop: Your order #${orderNumber} has been DELIVERED. Thank you for choosing MaxiTShop! Hotline: 01733272445`;
  } else if (newStatus === 'confirmed') {
    msg = `MaxiTShop: Your order #${orderNumber} is CONFIRMED and is being prepared for dispatch. Hotline: 01733272445`;
  } else if (newStatus === 'cancelled') {
    msg = `MaxiTShop: Your order #${orderNumber} has been CANCELLED. For questions, call 01733272445.`;
  }

  if (msg) {
    sendSms(customerPhone, msg).catch(err => {
      console.error('[SMS] Status update SMS error:', err.message);
    });
  }
}

module.exports = {
  sendSms,
  getBalance,
  normalizeBDPhone,
  sendOrderNotification,
  sendContactNotification,
  sendOrderStatusNotification
};

