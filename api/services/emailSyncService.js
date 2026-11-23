const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const path = require('path');
const fs = require('fs');
const db = require('./dbStore');

let isSyncing = false;
let syncInterval = null;

// Ensure upload directory exists for email attachments
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Strips email thread history (e.g., "On ... wrote:", "> ...") leaving only customer's fresh message
 */
function cleanReplyBody(text) {
  if (!text) return '';
  const lines = text.split(/\r?\n/);
  const cleanLines = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    // Stop at common quoted reply headers
    if (/^On\s+.+wrote:?$/i.test(line)) break;
    if (/^-{2,}\s*Original Message\s*-{2,}/i.test(line)) break;
    if (/^_{2,}/i.test(line)) break;
    if (/^From:\s+/i.test(line)) break;
    // Skip inline blockquote lines
    if (line.startsWith('>')) continue;
    cleanLines.push(rawLine);
  }

  const result = cleanLines.join('\n').trim();
  return result || text.trim();
}

/**
 * Extracts ticket ID from email subject or body (e.g. comp-1795283837374)
 */
function extractTicketId(subject, text) {
  if (subject) {
    const match = subject.match(/comp-\d+/i);
    if (match) return match[0].toLowerCase();
  }
  if (text) {
    const match = text.match(/Ticket\s*Reference:?\s*\*?(comp-\d+)\*?/i) || text.match(/comp-\d+/i);
    if (match) return (match[1] || match[0]).toLowerCase();
  }
  return null;
}

/**
 * Perform IMAP synchronization for customer email replies
 */
async function syncTicketReplies() {
  if (isSyncing) {
    return { success: true, message: 'Sync already in progress' };
  }

  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    return { success: false, message: 'SMTP/IMAP credentials not configured' };
  }

  isSyncing = true;
  let connection = null;
  let syncedCount = 0;
  const processedTickets = [];

  try {
    const host = process.env.IMAP_HOST || (process.env.SMTP_HOST?.includes('gmail') ? 'imap.gmail.com' : 'imap.gmail.com');
    const port = parseInt(process.env.IMAP_PORT, 10) || 993;

    const config = {
      imap: {
        user,
        password: pass,
        host,
        port,
        tls: true,
        authTimeout: 12000,
        tlsOptions: { rejectUnauthorized: false }
      }
    };

    connection = await imaps.connect(config);

    // Prevent unhandled 'error' events on the IMAP wrapper from crashing the Node.js process
    connection.on('error', (err) => {
      console.warn('[EmailSync] IMAP connection warning:', err?.message || err);
    });

    if (connection.imap) {
      connection.imap.on('error', (err) => {
        console.warn('[EmailSync] Underlying IMAP socket warning:', err?.message || err);
      });
    }

    await connection.openBox('INBOX');

    // Search for ticket reference in subject or recent unread emails
    const searchCriteria = [
      ['OR', ['HEADER', 'SUBJECT', 'comp-'], ['HEADER', 'SUBJECT', 'MaxiTShop']]
    ];
    const fetchOptions = {
      bodies: ['HEADER', ''],
      markSeen: false
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    for (const item of messages) {
      try {
        const fullPart = item.parts.find(p => p.which === '');
        if (!fullPart) continue;

        const parsed = await simpleParser(fullPart.body);
        const senderEmail = parsed.from?.value?.[0]?.address?.toLowerCase() || '';

        // Ignore emails sent by our own store system
        if (senderEmail === user.toLowerCase()) continue;

        const ticketId = extractTicketId(parsed.subject, parsed.text);
        if (!ticketId) continue;

        const ticket = await db.getComplaintById(ticketId);
        if (!ticket) continue;

        const cleanText = cleanReplyBody(parsed.text);
        if (!cleanText) continue;

        // Process attachments if customer uploaded images/files with email
        const savedAttachments = [];
        if (Array.isArray(parsed.attachments)) {
          for (const att of parsed.attachments) {
            if (att.content) {
              const safeName = `att-${Date.now()}-${(att.filename || 'file.png').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
              const filePath = path.join(uploadDir, safeName);
              fs.writeFileSync(filePath, att.content);
              savedAttachments.push(`/uploads/${safeName}`);
            }
          }
        }

        const senderName = parsed.from?.value?.[0]?.name || parsed.from?.text || ticket.name;

        // Save incoming reply into complaint conversation
        const updated = await db.addCustomerEmailReply(ticketId, {
          senderName,
          text: cleanText,
          attachments: savedAttachments,
          emailMessageId: parsed.messageId || `${item.attributes.uid}-${parsed.date?.getTime()}`,
          createdAt: parsed.date || new Date()
        });

        if (updated) {
          syncedCount++;
          if (!processedTickets.includes(ticketId)) {
            processedTickets.push(ticketId);
          }
          // Mark email as read in Gmail
          try {
            await connection.addFlags(item.attributes.uid, '\\Seen');
          } catch (e) {}
        }
      } catch (itemErr) {
        console.warn(`[EmailSync] Error parsing message UID ${item.attributes.uid}:`, itemErr.message);
      }
    }

    if (syncedCount > 0) {
      console.log(`📬 [EmailSync] Synced ${syncedCount} incoming customer email reply(s) for tickets: ${processedTickets.join(', ')}`);
    }

    return {
      success: true,
      syncedCount,
      processedTickets
    };
  } catch (err) {
    console.warn('[EmailSync] Sync error:', err.message);
    return { success: false, message: err.message };
  } finally {
    isSyncing = false;
    if (connection) {
      try {
        const noopErr = (err) => {
          console.warn('[EmailSync] Suppressed teardown socket error:', err?.message || err);
        };
        if (connection.imap) {
          connection.imap.on('error', noopErr);
        }
        connection.on('error', noopErr);
        connection.end();
      } catch (e) {}
    }
  }
}

/**
 * Start background automatic email sync
 */
function startAutoSync(intervalMs = 30000) {
  if (syncInterval) clearInterval(syncInterval);

  // Initial sync after 3 seconds
  setTimeout(() => {
    syncTicketReplies().catch(() => {});
  }, 3000);

  syncInterval = setInterval(() => {
    syncTicketReplies().catch(() => {});
  }, intervalMs);

  console.log(`📬 [EmailSync] Auto email sync activated (polling every ${intervalMs / 1000}s)`);
}

module.exports = {
  syncTicketReplies,
  startAutoSync,
  cleanReplyBody,
  extractTicketId
};
