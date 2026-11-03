import React from 'react';
import { Order } from '../types';

interface SteadfastStickerProps {
  order: Order;
}

export const SteadfastSticker: React.FC<SteadfastStickerProps> = ({ order }) => {
  const customer = order.customer || ({} as any);
  const consignmentCode = order.courier?.consignmentId ||
    order.courier?.trackingCode ||
    `CN-${order.orderNumber.replace(/[^0-9]/g, '') || '7490923'}`;
  const isPrepaid = order.paymentStatus === 'paid';
  const totalAmount = order.total || 0;

  return (
    <div
      className="printable-sticker"
      style={{
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        background: '#ffffff',
        color: '#000000',
        border: '2.5px solid #000000',
        borderRadius: '10px',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header: Shop Name, Phone & Delivery Badge */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '2px solid #000000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff'
        }}
      >
        <div>
          <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', color: '#000000', textTransform: 'uppercase', lineHeight: 1.1 }}>
            MaxiTShop
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#111111', marginTop: '3px' }}>
            Phone: +880 1733-272445
          </div>
        </div>

        <div
          style={{
            border: '1.5px solid #000000',
            borderRadius: '6px',
            padding: '4px 8px',
            textAlign: 'center',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            lineHeight: 1.2
          }}
        >
          <div>STANDARD</div>
          <div>DELIVERY 🚚</div>
        </div>
      </div>

      {/* 2. Consignment ID Title Bar (Solid Black Header) */}
      <div
        style={{
          background: '#000000',
          color: '#ffffff',
          textAlign: 'center',
          padding: '4px 0',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}
      >
        CONSIGNMENT ID
      </div>

      {/* 3. Consignment ID Code (Prominent Main Object) */}
      <div
        style={{
          padding: '14px 10px',
          textAlign: 'center',
          borderBottom: '2px solid #000000',
          background: '#f8fafc'
        }}
      >
        <div
          style={{
            fontSize: '36px',
            fontWeight: 900,
            letterSpacing: '2px',
            color: '#000000',
            fontFamily: 'Courier New, Courier, monospace',
            lineHeight: 1.1
          }}
        >
          {consignmentCode}
        </div>
      </div>

      {/* 4. Customer Details */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '2px solid #000000',
          fontSize: '13px',
          lineHeight: '1.5',
          background: '#ffffff'
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#555555',
            marginBottom: '6px'
          }}
        >
          DELIVER TO (CUSTOMER DETAILS)
        </div>

        <div>
          <span style={{ color: '#475569', fontWeight: 600 }}>NAME: </span>
          <strong style={{ color: '#000000', fontWeight: 800 }}>{customer.name || 'N/A'}</strong>
        </div>

        <div style={{ marginTop: '3px' }}>
          <span style={{ color: '#475569', fontWeight: 600 }}>PHONE: </span>
          <strong style={{ color: '#000000', fontWeight: 900, fontSize: '15px' }}>{customer.phone || 'N/A'}</strong>
        </div>

        <div style={{ marginTop: '3px' }}>
          <span style={{ color: '#475569', fontWeight: 600 }}>ADDRESS: </span>
          <span style={{ color: '#000000', fontWeight: 600 }}>
            {[customer.address, customer.thana].filter(Boolean).join(', ') || 'N/A'}
          </span>
        </div>

        {customer.district && (
          <div style={{ marginTop: '3px' }}>
            <span style={{ color: '#475569', fontWeight: 600 }}>DISTRICT: </span>
            <strong style={{ color: '#000000', fontWeight: 800 }}>{customer.district}</strong>
          </div>
        )}
      </div>

      {/* 5. COD Amount Footer Row */}
      <div
        style={{
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff'
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#000000' }}>
          COD AMOUNT:
        </span>
        <span style={{ fontSize: '22px', fontWeight: 900, color: '#000000' }}>
          {isPrepaid ? 'PREPAID (৳0)' : `৳${totalAmount.toLocaleString()}`}
        </span>
      </div>
    </div>
  );
};
