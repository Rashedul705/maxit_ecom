import React from 'react';
import { Order } from '../types';

interface InvoiceDocumentProps {
  order: Order;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ order }) => {
  const customer = order.customer || ({} as any);
  const items = order.items || [];
  const courier = order.courier?.provider || (order as any).courier;
  const consignmentId = order.courier?.consignmentId || '';
  const trackingCode = order.courier?.trackingCode || (order as any).trackingCode || '';

  return (
    <div
      className="printable-invoice"
      style={{
        padding: '32px',
        background: '#ffffff',
        color: '#0f172a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #0f172a',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ff6600', margin: 0, letterSpacing: '-0.5px' }}>
            MaxiTShop
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 500 }}>
            Solar, Industrial &amp; Electronics Engineering Solutions
          </p>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
            2nd Floor, Afroza Tower, Uposhohor New Market, Rajshahi-6000
          </p>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
            Phone: +880 1733-272445 | Email: support@maxitshop.com
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'inline-block',
              background: '#0f172a',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1px'
            }}
          >
            RETAIL TAX INVOICE
          </span>
          <p style={{ fontSize: '15px', fontWeight: 800, margin: '8px 0 0 0', color: '#0f172a' }}>
            #{order.orderNumber}
          </p>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0' }}>
            Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
            Payment: <strong>{(order.paymentMethod || 'cod').toUpperCase()}</strong> (
            <span style={{ color: order.paymentStatus === 'paid' ? '#059669' : '#d97706', fontWeight: 600 }}>
              {(order.paymentStatus || 'unpaid').toUpperCase()}
            </span>)
          </p>
          {consignmentId && (
            <p style={{ fontSize: '11px', color: '#ff6600', margin: '2px 0 0 0', fontWeight: 700 }}>
              Consignment: {consignmentId}
            </p>
          )}
        </div>
      </div>

      {/* Customer & Shipping info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '16px',
          background: '#f8fafc',
          padding: '14px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', margin: '0 0 4px 0' }}>
            Delivered / Billed To:
          </p>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
            {customer.name || 'Valued Customer'}
          </p>
          <p style={{ fontSize: '12px', color: '#334155', margin: '0 0 2px 0' }}>
            Phone: <strong>{customer.phone || 'N/A'}</strong>
          </p>
          <p style={{ fontSize: '12px', color: '#334155', margin: '0 0 2px 0' }}>
            Address: {[customer.address, customer.thana, customer.district, customer.division].filter(Boolean).join(', ') || 'N/A'}
          </p>
          {customer.notes && (
            <p style={{ fontSize: '11px', color: '#b45309', margin: '4px 0 0 0', fontStyle: 'italic' }}>
              Special Note: "{customer.notes}"
            </p>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', margin: '0 0 4px 0' }}>
            Logistics &amp; Status:
          </p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: order.status === 'delivered' ? '#059669' : '#d97706', textTransform: 'uppercase', margin: '0 0 3px 0' }}>
            Status: {order.status}
          </p>
          {courier && (
            <p style={{ fontSize: '12px', color: '#334155', margin: '0 0 2px 0' }}>
              Courier: <strong>{courier}</strong>
            </p>
          )}
          {trackingCode && (
            <p style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', margin: '0 0 2px 0' }}>
              Tracking: {trackingCode}
            </p>
          )}
          <p style={{ fontSize: '11px', color: '#64748b', margin: '0' }}>
            Area: {customer.area ? String(customer.area).replace(/_/g, ' ') : (customer.district || 'Standard Delivery')}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', fontSize: '11px', color: '#475569', textTransform: 'uppercase' }}>
            <th style={{ padding: '8px 10px', width: '32px' }}>#</th>
            <th style={{ padding: '8px 10px' }}>Item Description &amp; Variation</th>
            <th style={{ padding: '8px 10px', textAlign: 'right', width: '100px' }}>Unit Price</th>
            <th style={{ padding: '8px 10px', textAlign: 'center', width: '60px' }}>Qty</th>
            <th style={{ padding: '8px 10px', textAlign: 'right', width: '110px' }}>Total (BDT)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const variation = item.variation || item.variant || (item.specs && Object.keys(item.specs).length > 0
              ? Object.entries(item.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ')
              : null);

            return (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '12px' }}>
                <td style={{ padding: '10px', color: '#64748b', verticalAlign: 'top' }}>{idx + 1}</td>
                <td style={{ padding: '10px', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                    {item.title}
                  </div>
                  {variation && (
                    <div style={{
                      display: 'inline-block',
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      color: '#c2410c',
                      fontSize: '11px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      marginTop: '2px'
                    }}>
                      Variation: {variation}
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#334155', verticalAlign: 'top' }}>
                  ৳{Number(item.price || 0).toLocaleString()}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600, verticalAlign: 'top' }}>
                  {item.quantity}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#0f172a', verticalAlign: 'top' }}>
                  ৳{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Financial Calculation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div style={{ width: '48%', fontSize: '11px', color: '#64748b' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#334155' }}>Terms &amp; Warranty Conditions:</p>
          <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.5' }}>
            <li>Original invoice is required for warranty claims.</li>
            <li>Physical, liquid or electrical burnout damages are not covered.</li>
            <li>Inspect product condition at time of delivery before cash payment.</li>
          </ul>
        </div>

        <div style={{ width: '280px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Subtotal:</span>
            <span style={{ fontWeight: 600 }}>৳{(order.subtotal || order.total).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Delivery Charge:</span>
            <span style={{ fontWeight: 600 }}>৳{(order.deliveryCharge || 80).toLocaleString()}</span>
          </div>
          {!!order.discount && order.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f1f5f9', color: '#059669' }}>
              <span>Discount:</span>
              <span style={{ fontWeight: 600 }}>-৳{order.discount.toLocaleString()}</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderTop: '2px solid #0f172a',
              marginTop: '4px',
              fontSize: '15px'
            }}
          >
            <span style={{ fontWeight: 800 }}>Total BDT:</span>
            <span style={{ fontWeight: 800, color: '#ff6600' }}>৳{(order.total || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Signature & Stamp Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingTop: '24px',
          borderTop: '1px dashed #cbd5e1',
          fontSize: '11px',
          color: '#64748b'
        }}
      >
        <div style={{ textAlign: 'center', width: '160px' }}>
          <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px' }}>Customer Signature</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 2px 0', fontWeight: 600, color: '#0f172a' }}>Thank you for choosing MaxiTShop!</p>
          <p style={{ margin: 0 }}>www.maxitshop.com</p>
        </div>
        <div style={{ textAlign: 'center', width: '160px' }}>
          <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px' }}>Authorized Signature</div>
        </div>
      </div>
    </div>
  );
};

