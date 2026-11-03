import React, { useState } from 'react';
import { Order } from '../types';
import { InvoiceDocument } from './InvoiceDocument';
import { SteadfastSticker } from './SteadfastSticker';
import { ParcelStickerPrintModal } from './ParcelStickerPrintModal';
import { printHtmlContent } from '../utils/printService';
import { generateInvoicesHtml, generateStickersHtml } from '../utils/printTemplates';
import { Printer, X, FileText, Tag, ArrowLeft } from 'lucide-react';

interface BulkPrintModalProps {
  orders: Order[];
  isOpen: boolean;
  initialType?: 'invoice' | 'sticker';
  onClose: () => void;
}

export const BulkPrintModal: React.FC<BulkPrintModalProps> = ({
  orders,
  isOpen,
  initialType = 'invoice',
  onClose
}) => {
  const [printType, setPrintType] = useState<'invoice' | 'sticker'>(initialType);
  const [isStickerLayoutModalOpen, setIsStickerLayoutModalOpen] = useState(false);

  React.useEffect(() => {
    setPrintType(initialType);
  }, [initialType, isOpen]);

  if (!isOpen || orders.length === 0) return null;

  const handlePrint = () => {
    if (printType === 'invoice') {
      const { html, pageStyle } = generateInvoicesHtml(orders);
      printHtmlContent(html, {
        title: `MaxiTShop_Invoices_${orders.length}_Orders`,
        pageStyle
      });
    } else {
      setIsStickerLayoutModalOpen(true);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: printType === 'sticker' ? '560px' : '900px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Sticky Control Bar (Hidden on print) */}
        <div
          className="no-print"
          style={{
            padding: '14px 22px',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Bulk Print {printType === 'invoice' ? 'Invoices' : 'Steadfast Stickers'}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Printing {orders.length} selected orders with automatic page breaks
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Toggle print type */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setPrintType('invoice')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: printType === 'invoice' ? '#ffffff' : 'transparent',
                  color: printType === 'invoice' ? '#0f172a' : '#64748b',
                  boxShadow: printType === 'invoice' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <FileText size={13} /> Invoices
              </button>

              <button
                type="button"
                onClick={() => setPrintType('sticker')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: printType === 'sticker' ? '#ffffff' : 'transparent',
                  color: printType === 'sticker' ? '#0f172a' : '#64748b',
                  boxShadow: printType === 'sticker' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Tag size={13} /> Stickers
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              <Printer size={15} /> Print All ({orders.length})
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer'
              }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Documents Area */}
        <div
          style={{
            padding: '24px 20px',
            overflowY: 'auto',
            flex: 1,
            background: '#f8fafc'
          }}
        >
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="page-break"
              style={{
                marginBottom: index < orders.length - 1 ? '32px' : '0',
                paddingBottom: index < orders.length - 1 ? '32px' : '0',
                borderBottom: index < orders.length - 1 ? '2px dashed #cbd5e1' : 'none'
              }}
            >
              {printType === 'invoice' ? (
                <InvoiceDocument order={order} />
              ) : (
                <div style={{ padding: '8px 0' }}>
                  <SteadfastSticker order={order} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ParcelStickerPrintModal
        orders={orders}
        isOpen={isStickerLayoutModalOpen}
        onClose={() => setIsStickerLayoutModalOpen(false)}
      />
    </div>
  );
};

