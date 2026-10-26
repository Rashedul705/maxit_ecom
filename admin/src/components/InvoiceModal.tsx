import React from 'react';
import { Order } from '../types';
import { Printer, X } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header no-print">
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Tax Invoice - {order.orderNumber}</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={16} /> Print Invoice
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="modal-body printable-invoice" style={{ padding: '36px', background: '#fff' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ff6600', letterSpacing: '-0.5px' }}>maxitshop</h1>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Solar & Engineering Solutions Bangladesh</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Level 4, House 12, Road 4, Dhanmondi, Dhaka - 1205</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Phone: +880 1733-115391 | support@maxitshop.com</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'inline-block', background: '#0f172a', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
                RETAIL INVOICE
              </span>
              <p style={{ fontSize: '14px', fontWeight: 700, marginTop: '8px' }}>#{order.orderNumber}</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Date: {new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Payment: {order.paymentMethod.toUpperCase()} (COD)</p>
            </div>
          </div>

          {/* Customer & Shipping info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Billed / Delivered To:</p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{order.customer.name}</p>
              <p style={{ fontSize: '13px', color: '#334155', marginTop: '2px' }}>Phone: <strong>{order.customer.phone}</strong></p>
              <p style={{ fontSize: '13px', color: '#334155' }}>Address: {order.customer.address}</p>
              <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>Area: {order.customer.area.replace('_', ' ')}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>Order Status:</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: order.status === 'delivered' ? '#10b981' : '#f59e0b', textTransform: 'uppercase' }}>
                {order.status}
              </p>
              {order.customer.notes && (
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Note: <em>"{order.customer.notes}"</em></p>
              )}
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left', fontSize: '12px', color: '#475569' }}>
                <th style={{ padding: '10px 12px' }}>#</th>
                <th style={{ padding: '10px 12px' }}>Item Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total (BDT)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <td style={{ padding: '12px' }}>{idx + 1}</td>
                  <td style={{ padding: '12px', fontWeight: 500 }}>{item.title}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>৳{item.price.toLocaleString()}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>৳{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculation */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
            <div style={{ width: '280px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Delivery Charge:</span>
                <span style={{ fontWeight: 600 }}>৳{order.deliveryCharge.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', color: '#10b981' }}>
                  <span>Coupon Discount:</span>
                  <span style={{ fontWeight: 600 }}>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #0f172a', marginTop: '6px', fontSize: '16px' }}>
                <span style={{ fontWeight: 800 }}>Grand Total:</span>
                <span style={{ fontWeight: 800, color: '#ff6600' }}>৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', height: '30px', marginBottom: '6px' }}></div>
              <p style={{ fontSize: '11px', color: '#64748b' }}>Customer Signature</p>
            </div>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', height: '30px', marginBottom: '6px' }}></div>
              <p style={{ fontSize: '11px', color: '#64748b' }}>Authorized Seal & Signature</p>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '24px' }}>
            Thank you for ordering genuine energy equipment from maxitshop.com!
          </p>
        </div>
      </div>
    </div>
  );
};
