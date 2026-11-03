import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { adminApi } from '../api';
import { X, DollarSign, Calculator, Check, AlertCircle, Save } from 'lucide-react';

interface EditOrderAmountModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

export const EditOrderAmountModal: React.FC<EditOrderAmountModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen || !order) return null;

  const [subtotal, setSubtotal] = useState<number>(order.subtotal || order.total || 0);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(order.deliveryCharge || 80);
  const [discount, setDiscount] = useState<number>(order.discount || 0);
  const [total, setTotal] = useState<number>(order.total || 0);
  const [autoCalc, setAutoCalc] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize values when order opens
  useEffect(() => {
    if (order) {
      setSubtotal(order.subtotal || order.total || 0);
      setDeliveryCharge(order.deliveryCharge || 80);
      setDiscount(order.discount || 0);
      setTotal(order.total || 0);
      setAutoCalc(true);
      setNote('');
      setError(null);
    }
  }, [order, isOpen]);

  // Handle auto-calc change
  useEffect(() => {
    if (autoCalc) {
      const computed = Math.max(0, Number(subtotal || 0) + Number(deliveryCharge || 0) - Number(discount || 0));
      setTotal(computed);
    }
  }, [subtotal, deliveryCharge, discount, autoCalc]);

  const handleSubtotalChange = (val: number) => {
    setSubtotal(val);
  };

  const handleDeliveryChange = (val: number) => {
    setDeliveryCharge(val);
  };

  const handleDiscountChange = (val: number) => {
    setDiscount(val);
  };

  const handleTotalChange = (val: number) => {
    setAutoCalc(false);
    setTotal(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (isNaN(total) || total < 0) {
      setError('Grand total must be a valid non-negative number.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updated = await adminApi.updateOrderAmount(order.id, {
        subtotal: Math.max(0, Math.round(Number(subtotal))),
        deliveryCharge: Math.max(0, Math.round(Number(deliveryCharge))),
        discount: Math.max(0, Math.round(Number(discount))),
        total: Math.max(0, Math.round(Number(total))),
        note: note.trim() || undefined
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error('Failed to update order amount:', err);
      setError(err.message || 'Failed to update invoice amount.');
    } finally {
      setLoading(false);
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
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="modal-content"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c'
              }}
            >
              <DollarSign size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Edit Invoice Amount
              </h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                Order #{order.orderNumber} • {order.customer?.name || 'Customer'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
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
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Current vs New Notice */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#475569'
            }}
          >
            Any amount changes made here will immediately update the <strong>Retail Tax Invoice</strong> and the <strong>Courier COD collection amount</strong>.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            {/* Subtotal */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Items Subtotal (BDT)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700 }}>
                  ৳
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={subtotal}
                  onChange={(e) => handleSubtotalChange(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
            </div>

            {/* Delivery Charge */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Delivery Charge (BDT)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700 }}>
                  ৳
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={deliveryCharge}
                  onChange={(e) => handleDeliveryChange(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 24px',
                    fontSize: '14px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery quick presets */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Quick Delivery:</span>
            <button
              type="button"
              onClick={() => handleDeliveryChange(0)}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                border: deliveryCharge === 0 ? '1px solid #ea580c' : '1px solid #cbd5e1',
                background: deliveryCharge === 0 ? '#fff7ed' : '#ffffff',
                color: deliveryCharge === 0 ? '#c2410c' : '#475569',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ৳0 (Free)
            </button>
            <button
              type="button"
              onClick={() => handleDeliveryChange(70)}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                border: deliveryCharge === 70 ? '1px solid #ea580c' : '1px solid #cbd5e1',
                background: deliveryCharge === 70 ? '#fff7ed' : '#ffffff',
                color: deliveryCharge === 70 ? '#c2410c' : '#475569',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ৳70 (Dhaka)
            </button>
            <button
              type="button"
              onClick={() => handleDeliveryChange(130)}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                border: deliveryCharge === 130 ? '1px solid #ea580c' : '1px solid #cbd5e1',
                background: deliveryCharge === 130 ? '#fff7ed' : '#ffffff',
                color: deliveryCharge === 130 ? '#c2410c' : '#475569',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ৳130 (Outside)
            </button>
          </div>

          {/* Discount */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Special Discount / Adjustment (BDT)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#059669', fontWeight: 700 }}>
                -৳
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={discount}
                onChange={(e) => handleDiscountChange(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 30px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Auto Calculate Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <input
              type="checkbox"
              id="autoCalcCheck"
              checked={autoCalc}
              onChange={(e) => {
                setAutoCalc(e.target.checked);
                if (e.target.checked) {
                  setTotal(Math.max(0, Number(subtotal || 0) + Number(deliveryCharge || 0) - Number(discount || 0)));
                }
              }}
              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#ff6600' }}
            />
            <label htmlFor="autoCalcCheck" style={{ fontSize: '12px', color: '#475569', cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}>
              Auto-calculate Total: Subtotal (৳{subtotal.toLocaleString()}) + Delivery (৳{deliveryCharge.toLocaleString()}) - Discount (৳{discount.toLocaleString()})
            </label>
          </div>

          {/* Grand Total Box (Highlighted) */}
          <div
            style={{
              background: '#fff7ed',
              border: '2px solid #fdba74',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Invoice Grand Total (COD Amount)
              </span>
              {!autoCalc && (
                <span style={{ fontSize: '10px', background: '#fed7aa', color: '#9a3412', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  Manual Override
                </span>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ea580c', fontSize: '20px', fontWeight: 900 }}>
                ৳
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={total}
                onChange={(e) => handleTotalChange(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 32px',
                  fontSize: '22px',
                  fontWeight: 900,
                  borderRadius: '8px',
                  border: '1.5px solid #ea580c',
                  color: '#0f172a',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
            <p style={{ fontSize: '11px', color: '#9a3412', margin: '6px 0 0 0' }}>
              This final amount will be printed on the invoice and sent to Steadfast Courier.
            </p>
          </div>

          {/* Admin Note / Reason */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Reason / Admin Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Free shipping approved, discount agreed with customer..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              <Save size={15} />
              <span>{loading ? 'Saving Changes...' : 'Save & Update Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

