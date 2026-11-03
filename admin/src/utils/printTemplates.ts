import { Order } from '../types';

/**
 * Generate SVG Barcode string
 */
export const generateBarcodeSvgHtml = (code: string, height = 40): string => {
  const cleanCode = code || 'STEADFAST';
  let sum = 0;
  for (let i = 0; i < cleanCode.length; i++) {
    sum += cleanCode.charCodeAt(i) * (i + 1);
  }

  const bars: { width: number; space: number }[] = [];
  for (let i = 0; i < 32; i++) {
    const val = (sum * (i + 17) + i * 3) % 11;
    const width = val < 4 ? 2 : (val < 8 ? 3 : 4);
    const space = val % 4 === 0 ? 3 : (val % 2 === 0 ? 2 : 1.5);
    bars.push({ width, space });
  }

  let currentX = 6;
  const rects: string[] = [];
  bars.forEach(b => {
    rects.push(`<rect x="${currentX}" y="0" width="${b.width}" height="${height}" fill="#000000" />`);
    currentX += b.width + b.space;
  });

  return `
    <div style="display:flex;flex-direction:column;align-items:center;margin:3px 0;">
      <svg width="${currentX + 6}" height="${height}" style="display:block;max-width:100%;">
        ${rects.join('')}
      </svg>
      <span style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:800;letter-spacing:2px;color:#000;margin-top:2px;">
        *${cleanCode}*
      </span>
    </div>
  `;
};

/**
 * Generate Single or Multiple Invoices HTML (A4 Format)
 */
export const generateInvoicesHtml = (orders: Order[]): { html: string; pageStyle: string } => {
  const pageStyle = `
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
  `;

  const html = orders.map((order, idx) => {
    const customer = order.customer || ({} as any);
    const items = order.items || [];
    const courier = order.courier?.provider || (order as any).courier || '';
    const consignmentId = order.courier?.consignmentId || '';
    const trackingCode = order.courier?.trackingCode || (order as any).trackingCode || '';
    const isLast = idx === orders.length - 1;

    const rowsHtml = items.map((item, itemIdx) => {
      const variation = item.variation || item.variant || (item.specs && Object.keys(item.specs).length > 0
        ? Object.entries(item.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ')
        : '');

      return `
        <tr style="border-bottom:1px solid #e2e8f0;font-size:12px;">
          <td style="padding:9px;color:#64748b;vertical-align:top;">${itemIdx + 1}</td>
          <td style="padding:9px;vertical-align:top;">
            <div style="font-weight:600;color:#0f172a;">${item.title}</div>
            ${variation ? `<div style="display:inline-block;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-size:11px;padding:1px 6px;border-radius:4px;font-weight:700;margin-top:3px;">Variation: ${variation}</div>` : ''}
          </td>
          <td style="padding:9px;text-align:right;color:#334155;vertical-align:top;">৳${Number(item.price || 0).toLocaleString()}</td>
          <td style="padding:9px;text-align:center;font-weight:700;vertical-align:top;">${item.quantity}</td>
          <td style="padding:9px;text-align:right;font-weight:700;color:#0f172a;vertical-align:top;">৳${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="${isLast ? '' : 'page-break'}" style="padding:24px;background:#ffffff;color:#0f172a;max-width:800px;margin:0 auto;box-sizing:border-box;">
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f172a;padding-bottom:14px;margin-bottom:18px;">
          <div>
            <h1 style="font-size:24px;font-weight:900;color:#ff6600;margin:0;letter-spacing:-0.5px;">MaxiTShop</h1>
            <p style="font-size:11px;color:#475569;margin:3px 0 0 0;font-weight:600;">Solar, Industrial &amp; Electronics Solutions Bangladesh</p>
            <p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">2nd Floor, Afroza Tower, Uposhohor New Market, Rajshahi-6000</p>
            <p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">Phone: +880 1733-272445 | Email: support@maxitshop.com</p>
          </div>
          <div style="text-align:right;">
            <span style="display:inline-block;background:#0f172a;color:#ffffff;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:800;letter-spacing:1px;">RETAIL TAX INVOICE</span>
            <p style="font-size:15px;font-weight:900;margin:6px 0 0 0;color:#0f172a;">#${order.orderNumber}</p>
            <p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
            <p style="font-size:11px;color:#64748b;margin:2px 0 0 0;">Payment: <strong>${(order.paymentMethod || 'cod').toUpperCase()}</strong> (${order.paymentStatus || 'unpaid'})</p>
            ${consignmentId ? `<p style="font-size:11px;color:#ff6600;margin:2px 0 0 0;font-weight:700;">Consignment: ${consignmentId}</p>` : ''}
          </div>
        </div>

        <!-- Customer & Logistics Box -->
        <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:14px;background:#f8fafc;padding:12px 14px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:18px;">
          <div>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:2px;">Delivered / Billed To:</div>
            <div style="font-size:14px;font-weight:800;color:#0f172a;">${customer.name || 'Valued Customer'}</div>
            <div style="font-size:12px;color:#334155;">Phone: <strong>${customer.phone || 'N/A'}</strong></div>
            <div style="font-size:12px;color:#334155;">Address: ${[customer.address, customer.thana, customer.district, customer.division].filter(Boolean).join(', ') || 'N/A'}</div>
            ${customer.notes ? `<div style="font-size:11px;color:#b45309;margin-top:3px;font-style:italic;">Note: "${customer.notes}"</div>` : ''}
          </div>
          <div style="text-align:right;">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:2px;">Order Status:</div>
            <div style="font-size:13px;font-weight:800;color:${order.status === 'delivered' ? '#059669' : '#d97706'};text-transform:uppercase;">${order.status}</div>
            ${courier ? `<div style="font-size:11px;color:#334155;margin-top:2px;">Courier: <strong>${courier}</strong></div>` : ''}
            ${trackingCode ? `<div style="font-size:11px;color:#64748b;font-family:monospace;">Tracking: ${trackingCode}</div>` : ''}
            <div style="font-size:11px;color:#64748b;margin-top:2px;">Area: ${customer.area ? String(customer.area).replace(/_/g, ' ') : (customer.district || 'Standard Delivery')}</div>
          </div>
        </div>

        <!-- Table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
          <thead>
            <tr style="background:#f1f5f9;border-bottom:1.5px solid #cbd5e1;text-align:left;font-size:11px;color:#475569;text-transform:uppercase;">
              <th style="padding:8px;width:30px;">#</th>
              <th style="padding:8px;">Item Description &amp; Variation</th>
              <th style="padding:8px;text-align:right;width:100px;">Unit Price</th>
              <th style="padding:8px;text-align:center;width:50px;">Qty</th>
              <th style="padding:8px;text-align:right;width:110px;">Total (BDT)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- Calculations -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
          <div style="width:48%;font-size:11px;color:#64748b;">
            <div style="font-weight:700;color:#334155;margin-bottom:3px;">Terms &amp; Warranty Conditions:</div>
            <ul style="margin:0;padding-left:14px;line-height:1.4;">
              <li>Original invoice is required for warranty claims.</li>
              <li>Physical, liquid or electrical burnout damages are not covered.</li>
              <li>Inspect product condition at time of delivery before cash payment.</li>
            </ul>
          </div>
          <div style="width:260px;font-size:12px;">
            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#64748b;">Subtotal:</span>
              <span style="font-weight:600;">৳${(order.subtotal || order.total).toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9;">
              <span style="color:#64748b;">Delivery Charge:</span>
              <span style="font-weight:600;">৳${(order.deliveryCharge || 80).toLocaleString()}</span>
            </div>
            ${order.discount ? `
            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f1f5f9;color:#059669;">
              <span>Discount:</span>
              <span style="font-weight:600;">-৳${order.discount.toLocaleString()}</span>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #0f172a;margin-top:4px;font-size:15px;">
              <span style="font-weight:900;">Total BDT:</span>
              <span style="font-weight:900;color:#ff6600;">৳${(order.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex;justify-content:space-between;align-items:flex-end;padding-top:20px;border-top:1px dashed #cbd5e1;font-size:11px;color:#64748b;">
          <div style="text-align:center;width:150px;">
            <div style="border-top:1px solid #94a3b8;padding-top:3px;">Customer Signature</div>
          </div>
          <div style="text-align:center;">
            <div style="font-weight:700;color:#0f172a;">Thank you for choosing MaxiTShop!</div>
            <div>www.maxitshop.com</div>
          </div>
          <div style="text-align:center;width:150px;">
            <div style="border-top:1px solid #94a3b8;padding-top:3px;">Authorized Signature</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return { html, pageStyle };
};

export type StickerLayout = 'thermal_100x150' | 'a4_4_stickers' | 'a4_8_stickers' | 'thermal_75x50';

/**
 * Generate HTML for a single sticker content block
 * Contains ONLY: Shop Name & Phone, Consignment ID (main object, big), and Customer Detail.
 * No extra information.
 */
const renderStickerBlock = (order: Order, compact = false, ultraCompact = false): string => {
  const customer = order.customer || ({} as any);
  const consignmentCode = order.courier?.consignmentId ||
    order.courier?.trackingCode ||
    `CN-${order.orderNumber.replace(/[^0-9]/g, '') || '7490923'}`;
  const isPrepaid = order.paymentStatus === 'paid';
  const totalAmount = order.total || 0;

  const headerPad = ultraCompact ? '6px 8px' : (compact ? '8px 12px' : '12px 16px');
  const shopSize = ultraCompact ? '15px' : (compact ? '18px' : '22px');
  const phoneSize = ultraCompact ? '10px' : (compact ? '11px' : '13px');
  const consignPad = ultraCompact ? '6px' : (compact ? '10px 8px' : '14px 10px');
  const consignSize = ultraCompact ? '20px' : (compact ? '26px' : '36px');
  const detailsPad = ultraCompact ? '6px 8px' : (compact ? '10px 12px' : '12px 16px');
  const codPad = ultraCompact ? '6px 8px' : (compact ? '8px 12px' : '10px 16px');
  const codSize = ultraCompact ? '14px' : (compact ? '18px' : '22px');

  return `
    <div style="width:100%;height:100%;border:2.5px solid #000000;border-radius:8px;overflow:hidden;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#000000;background:#ffffff;display:flex;flex-direction:column;justify-content:space-between;">
      <!-- 1. Header: Shop Name & Delivery Badge -->
      <div style="padding:${headerPad};border-bottom:2px solid #000000;display:flex;justify-content:space-between;align-items:center;background:#ffffff;">
        <div>
          <div style="font-size:${shopSize};font-weight:900;letter-spacing:-0.5px;color:#000000;text-transform:uppercase;line-height:1.1;">
            MaxiTShop
          </div>
          <div style="font-size:${phoneSize};font-weight:800;color:#111111;margin-top:2px;">
            Phone: +880 1733-272445
          </div>
        </div>
        <div style="border:1.5px solid #000000;border-radius:4px;padding:2px 6px;text-align:center;font-size:9px;font-weight:800;text-transform:uppercase;line-height:1.2;">
          <div>STANDARD</div>
          <div>DELIVERY &#128666;</div>
        </div>
      </div>

      <!-- 2. Consignment ID Header Bar -->
      <div style="background:#000000;color:#ffffff;text-align:center;padding:3px 0;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
        CONSIGNMENT ID
      </div>

      <!-- 3. Consignment ID Code -->
      <div style="padding:${consignPad};text-align:center;border-bottom:2px solid #000000;background:#f8fafc;">
        <div style="font-size:${consignSize};font-weight:900;letter-spacing:2px;color:#000000;font-family:'Courier New',Courier,monospace;line-height:1.1;">
          ${consignmentCode}
        </div>
      </div>

      <!-- 4. Customer Details -->
      <div style="padding:${detailsPad};border-bottom:2px solid #000000;flex:1;font-size:${compact ? '11px' : '13px'};line-height:1.45;background:#ffffff;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#555555;margin-bottom:4px;">
          DELIVER TO (CUSTOMER DETAILS)
        </div>
        <div>
          <span style="color:#475569;font-weight:600;">NAME: </span>
          <strong style="color:#000000;font-weight:800;">${customer.name || 'N/A'}</strong>
        </div>
        <div style="margin-top:2px;">
          <span style="color:#475569;font-weight:600;">PHONE: </span>
          <strong style="color:#000000;font-weight:900;font-size:${compact ? '12px' : '15px'};">${customer.phone || 'N/A'}</strong>
        </div>
        <div style="margin-top:2px;">
          <span style="color:#475569;font-weight:600;">ADDRESS: </span>
          <span style="color:#000000;font-weight:600;">${[customer.address, customer.thana].filter(Boolean).join(', ') || 'N/A'}</span>
        </div>
        ${customer.district ? `
        <div style="margin-top:2px;">
          <span style="color:#475569;font-weight:600;">DISTRICT: </span>
          <strong style="color:#000000;font-weight:800;">${customer.district}</strong>
        </div>` : ''}
      </div>

      <!-- 5. COD Amount Footer -->
      <div style="padding:${codPad};display:flex;justify-content:space-between;align-items:center;background:#ffffff;">
        <span style="font-size:${compact ? '11px' : '13px'};font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:#000000;">
          COD AMOUNT:
        </span>
        <span style="font-size:${codSize};font-weight:900;color:#000000;">
          ${isPrepaid ? 'PREPAID (৳0)' : `৳${totalAmount.toLocaleString()}`}
        </span>
      </div>
    </div>
  `;
};

/**
 * Generate Stickers HTML based on selected layout (100x150, A4 4, A4 8, 75x50)
 */
export const generateStickersHtml = (
  orders: Order[],
  layout: StickerLayout
): { html: string; pageStyle: string } => {
  if (layout === 'thermal_100x150') {
    const pageStyle = `
      @page {
        size: 100mm 150mm;
        margin: 2mm;
      }
      body {
        width: 100mm;
        margin: 0 auto;
      }
    `;

    const html = orders.map((order, idx) => `
      <div class="${idx < orders.length - 1 ? 'page-break' : ''}" style="width:96mm;height:146mm;margin:0 auto;box-sizing:border-box;">
        ${renderStickerBlock(order, false, false)}
      </div>
    `).join('');

    return { html, pageStyle };
  }

  if (layout === 'thermal_75x50') {
    const pageStyle = `
      @page {
        size: 75mm 50mm;
        margin: 2mm;
      }
      body {
        width: 75mm;
        margin: 0 auto;
      }
    `;

    const html = orders.map((order, idx) => `
      <div class="${idx < orders.length - 1 ? 'page-break' : ''}" style="width:71mm;height:46mm;margin:0 auto;box-sizing:border-box;">
        ${renderStickerBlock(order, true, true)}
      </div>
    `).join('');

    return { html, pageStyle };
  }

  if (layout === 'a4_4_stickers') {
    const pageStyle = `
      @page {
        size: A4 portrait;
        margin: 6mm;
      }
      .sticker-a4-4-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        height: 280mm;
        gap: 6mm;
        box-sizing: border-box;
      }
    `;

    // Group into chunks of 4
    const chunks: Order[][] = [];
    for (let i = 0; i < orders.length; i += 4) {
      chunks.push(orders.slice(i, i + 4));
    }

    const html = chunks.map((chunk, chunkIdx) => `
      <div class="${chunkIdx < chunks.length - 1 ? 'page-break' : ''} sticker-a4-4-grid">
        ${chunk.map(order => `
          <div style="position:relative;border:1.5px dashed #64748b;border-radius:6px;padding:3px;box-sizing:border-box;height:136mm;">
            <div style="position:absolute;top:-8px;left:10px;background:#fff;padding:0 4px;font-size:9px;color:#64748b;">✂ Cut</div>
            ${renderStickerBlock(order, true, false)}
          </div>
        `).join('')}
      </div>
    `).join('');

    return { html, pageStyle };
  }

  // A4 Sheet: 8 Stickers (2x4)
  const pageStyle = `
    @page {
      size: A4 portrait;
      margin: 4mm;
    }
    .sticker-a4-8-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: repeat(4, 1fr);
      height: 285mm;
      gap: 3mm;
      box-sizing: border-box;
    }
  `;

  // Group into chunks of 8
  const chunks: Order[][] = [];
  for (let i = 0; i < orders.length; i += 8) {
    chunks.push(orders.slice(i, i + 8));
  }

  const html = chunks.map((chunk, chunkIdx) => `
    <div class="${chunkIdx < chunks.length - 1 ? 'page-break' : ''} sticker-a4-8-grid">
      ${chunk.map(order => `
        <div style="border:1px dashed #94a3b8;border-radius:4px;padding:2px;box-sizing:border-box;height:68mm;">
          ${renderStickerBlock(order, true, false)}
        </div>
      `).join('')}
    </div>
  `).join('');

  return { html, pageStyle };
};

/**
 * Generate Alignment Test Print HTML
 */
export const generateAlignmentTestHtml = (layout: StickerLayout): { html: string; pageStyle: string } => {
  const dummyOrder: Order = {
    id: 'test-alignment',
    orderNumber: 'ORD-TEST-999',
    customer: {
      name: 'ALIGNMENT TEST CUSTOMER',
      phone: '+880 1733-000000',
      address: 'Plot #12, Road #4, Test Sector',
      thana: 'Uttara',
      district: 'Dhaka',
      division: 'Dhaka',
      area: 'Inside Dhaka',
      notes: 'Test calibration label - check all 4 borders & barcode alignment'
    },
    items: [
      {
        productId: 'prod-test',
        title: 'Printer Margin Calibration Test Item',
        quantity: 1,
        price: 2500,
        image: '',
        variation: 'Standard Test Spec'
      }
    ],
    subtotal: 2500,
    deliveryCharge: 80,
    discount: 0,
    total: 2580,
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    courier: {
      provider: 'Steadfast',
      consignmentId: 'CN-TEST-ALIGN',
      trackingCode: 'STE-TEST-ALIGN',
      status: 'test'
    },
    status: 'shipped',
    timeline: [],
    createdAt: new Date().toISOString()
  };

  return generateStickersHtml([dummyOrder], layout);
};

