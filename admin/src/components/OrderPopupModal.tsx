import React, { useState } from 'react';
import { Order } from '../types';
import { adminApi } from '../api';
import { InvoiceDocument } from './InvoiceDocument';
import { SteadfastSticker } from './SteadfastSticker';
import { ParcelStickerPrintModal } from './ParcelStickerPrintModal';
import { EditOrderAmountModal } from './EditOrderAmountModal';
import { printHtmlContent } from '../utils/printService';
import { generateInvoicesHtml } from '../utils/printTemplates';
import {
  X,
  Printer,
  Truck,
  User,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  Package,
  Layers,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  Edit2
} from 'lucide-react';

interface OrderPopupModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: (order: Order) => void;
}

type ModalView = 'details' | 'invoice' | 'sticker';

export const OrderPopupModal: React.FC<OrderPopupModalProps> = ({
  order: initialOrder,
  isOpen,
  onClose,
  onOrderUpdated
}) => {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [currentView, setCurrentView] = useState<ModalView>('details');
  const [isStickerPrintOpen, setIsStickerPrintOpen] = useState(false);
  const [isEditAmountOpen, setIsEditAmountOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAmountUpdated = (updatedOrder: Order) => {
    setOrder(updatedOrder);
    if (onOrderUpdated) onOrderUpdated(updatedOrder);
    showToast('success', `Invoice amount updated! New Grand Total: ৳${(updatedOrder.total || 0).toLocaleString()}`);
  };

  // Sync state if initialOrder changes
  React.useEffect(() => {
    setOrder(initialOrder);
    setCurrentView('details');
    setNotification(null);
  }, [initialOrder]);

  if (!isOpen || !order) return null;

  const customer = order.customer || ({} as any);
  const items = order.items || [];
  const courier = order.courier?.provider || (order as any).courier;
  const consignmentId = order.courier?.consignmentId || (order as any).consignmentId || '';
  const trackingCode = order.courier?.trackingCode || (order as any).trackingCode || '';
  const isDispatched = !!(consignmentId || trackingCode);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Dispatch to Steadfast courier
  const handleDispatchSteadfast = async () => {
    try {
      setDispatching(true);
      const res = await adminApi.dispatchToCourier(order.id, 'Steadfast');
      const updatedOrder: Order = {
        ...order,
        status: 'shipped',
        courier: res.courier || {
          provider: 'Steadfast',
          consignmentId: res.consignmentPayload?.consignment_id || `CN-${Date.now().toString().slice(-6)}`,
          trackingCode: `STE-${Date.now().toString().slice(-6)}`,
          status: 'in_transit'
        }
      };
      setOrder(updatedOrder);
      if (onOrderUpdated) onOrderUpdated(updatedOrder);
      showToast('success', 'Successfully dispatched to Steadfast Courier! Consignment ID and sticker ready.');
    } catch (err: any) {
      showToast('error', `Steadfast dispatch failed: ${err.message}`);
    } finally {
      setDispatching(false);
    }
  };

  // Update status directly from modal
  const handleStatusChange = async (newStatus: any) => {
    try {
      setStatusUpdating(true);
      const updated = await adminApi.updateOrderStatus(order.id, newStatus, `Status updated via Order Details Modal to ${newStatus}`);
      const updatedOrder: Order = { ...order, status: updated.status || newStatus };
      setOrder(updatedOrder);
      if (onOrderUpdated) onOrderUpdated(updatedOrder);
      showToast('success', `Order status updated to ${newStatus}`);
    } catch (err: any) {
      showToast('error', `Failed to update status: ${err.message}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Dedicated isolated invoice print (NEVER prints background order management)
  const handlePrintInvoice = () => {
    if (!order) return;
    const { html, pageStyle } = generateInvoicesHtml([order]);
    printHtmlContent(html, {
      title: `Invoice_${order.orderNumber}`,
      pageStyle
    });
  };

  // Open sticker print dialog
  const handleOpenStickerPrint = () => {
    setIsStickerPrintOpen(true);
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
          maxWidth: currentView === 'details' ? '860px' : (currentView === 'sticker' ? '520px' : '880px'),
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          transition: 'max-width 0.2s ease',
          boxSizing: 'border-box'
        }}
      >
        {/* Modal Top Header (Always Hidden in Print) */}
        <div
          className="no-print"
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentView !== 'details' && (
              <button
                type="button"
                onClick={() => setCurrentView('details')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '12px' }}
                title="Back to Order Details"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Order #{order.orderNumber}
                </h3>
                <span className={`badge badge-${order.status}`} style={{ textTransform: 'uppercase', fontSize: '11px', padding: '2px 8px' }}>
                  {order.status}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {currentView === 'details' ? (
              <>
                {isDispatched && (
                  <button
                    type="button"
                    onClick={handleOpenStickerPrint}
                    className="btn btn-sm"
                    style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      padding: '6px 12px'
                    }}
                  >
                    <Tag size={13} /> Steadfast Sticker
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '6px 12px' }}
                >
                  <FileText size={13} /> Print Invoice
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={currentView === 'invoice' ? handlePrintInvoice : handleOpenStickerPrint}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', padding: '6px 16px', fontWeight: 700 }}
              >
                <Printer size={15} /> Print {currentView === 'invoice' ? 'Invoice' : 'Sticker'}
              </button>
            )}

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
              title="Close popup"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div
            className="no-print"
            style={{
              padding: '10px 16px',
              margin: '12px 20px 0 20px',
              borderRadius: '8px',
              background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              color: notification.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {notification.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Modal Body Area */}
        <div
          style={{
            padding: currentView === 'details' ? '20px 22px' : '16px',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {/* VIEW 1: ORDER DETAILS POPUP */}
          {currentView === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Row 1: Customer Details & Order Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {/* Customer Details Box */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <User size={16} color="#ff6600" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Customer Details
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                      {customer.name || 'Valued Customer'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Phone size={13} color="#64748b" />
                      <a href={`tel:${customer.phone}`} style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
                        {customer.phone || 'N/A'}
                      </a>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '6px' }}>
                      <MapPin size={14} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div><strong>Address:</strong> {customer.address || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Thana: <strong>{customer.thana || 'N/A'}</strong> | District: <strong>{customer.district || 'N/A'}</strong>
                          {customer.division && ` | Division: ${customer.division}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <span
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#475569'
                        }}
                      >
                        Area: {customer.area ? String(customer.area).replace(/_/g, ' ') : (customer.district || 'Standard Delivery')}
                      </span>
                    </div>

                    {customer.notes && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '8px 10px',
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#92400e'
                        }}
                      >
                        <strong>Customer Note:</strong> "{customer.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details & Summary Box */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={16} color="#ff6600" />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Order Summary
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setIsEditAmountOpen(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#c2410c',
                          background: '#fff7ed',
                          border: '1px solid #fed7aa',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Edit amount on invoice"
                      >
                        <Edit2 size={12} /> Edit Amount
                      </button>

                      <span style={{ fontSize: '11px', color: '#64748b' }}>Status:</span>
                      <select
                        value={order.status}
                        disabled={statusUpdating}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        style={{
                          padding: '3px 8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#fff'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Payment Method:</span>
                      <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{order.paymentMethod || 'COD'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Payment Status:</span>
                      <span style={{ fontWeight: 700, color: order.paymentStatus === 'paid' ? '#059669' : '#d97706', textTransform: 'uppercase' }}>
                        {order.paymentStatus || 'unpaid'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Subtotal:</span>
                      <span style={{ fontWeight: 600 }}>৳{(order.subtotal || order.total).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Delivery Charge:</span>
                      <span style={{ fontWeight: 600 }}>৳{(order.deliveryCharge || 80).toLocaleString()}</span>
                    </div>
                    {!!order.discount && order.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9', color: '#059669' }}>
                        <span>Discount:</span>
                        <span style={{ fontWeight: 600 }}>-৳{order.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0 2px 0',
                        fontSize: '16px',
                        borderTop: '2px solid #cbd5e1',
                        marginTop: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>Grand Total:</span>
                        <button
                          type="button"
                          onClick={() => setIsEditAmountOpen(true)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ea580c',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Edit Amount on Invoice"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                      <span style={{ fontWeight: 800, color: '#ff6600' }}>৳{(order.total || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Product Items Table with Variation Details */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Package size={16} color="#ff6600" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Product Items ({items.length})
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px 12px', width: '50px' }}>Item</th>
                        <th style={{ padding: '8px 12px' }}>Product Title &amp; Variation</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', width: '100px' }}>Unit Price</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', width: '60px' }}>Qty</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', width: '110px' }}>Total (BDT)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const variation = item.variation || item.variant || (item.specs && Object.keys(item.specs).length > 0
                          ? Object.entries(item.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ')
                          : null);

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                              <div
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '8px',
                                  background: '#f1f5f9',
                                  border: '1px solid #e2e8f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden'
                                }}
                              >
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                ) : (
                                  <Package size={20} color="#94a3b8" />
                                )}
                              </div>
                            </td>

                            <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                                {item.title}
                              </div>

                              {/* Variation Badge */}
                              {variation ? (
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#fff7ed',
                                    border: '1px solid #fed7aa',
                                    color: '#c2410c',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700
                                  }}
                                >
                                  <Layers size={11} />
                                  <span>Variation: {variation}</span>
                                </div>
                              ) : (
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                  Standard Specification
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#334155', verticalAlign: 'middle' }}>
                              ৳{Number(item.price || 0).toLocaleString()}
                            </td>

                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, verticalAlign: 'middle' }}>
                              {item.quantity}
                            </td>

                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#0f172a', verticalAlign: 'middle' }}>
                              ৳{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Row 3: Steadfast Courier & Logistics Section */}
              <div
                style={{
                  background: isDispatched ? '#f0fdf4' : '#fff7ed',
                  border: `1.5px solid ${isDispatched ? '#86efac' : '#fdba74'}`,
                  borderRadius: '12px',
                  padding: '16px 18px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={20} color={isDispatched ? '#16a34a' : '#ea580c'} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: isDispatched ? '#166534' : '#9a3412' }}>
                        Steadfast Courier Integration
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: isDispatched ? '#15803d' : '#c2410c' }}>
                        {isDispatched
                          ? 'This order has been dispatched via Steadfast Courier.'
                          : 'Dispatch this order directly to Steadfast Courier to generate consignment ID and tracking code.'}
                      </p>
                    </div>
                  </div>

                  {!isDispatched && (
                    <button
                      type="button"
                      disabled={dispatching}
                      onClick={handleDispatchSteadfast}
                      className="btn btn-primary"
                      style={{
                        padding: '8px 18px',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(255, 102, 0, 0.3)'
                      }}
                    >
                      <Truck size={15} />
                      <span>{dispatching ? 'Sending to Steadfast...' : 'Send to Steadfast'}</span>
                    </button>
                  )}
                </div>

                {/* Once Dispatched: Show Consignment Details and the TWO Print Options */}
                {isDispatched && (
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
                        <div>
                          <span style={{ color: '#64748b' }}>Consignment ID: </span>
                          <strong style={{ fontFamily: 'monospace', fontSize: '13px', color: '#0f172a' }}>{consignmentId || 'CN-PENDING'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Tracking Code: </span>
                          <strong style={{ fontFamily: 'monospace', fontSize: '13px', color: '#0f172a' }}>{trackingCode || 'STE-PENDING'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Status: </span>
                          <span style={{ color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>In Transit</span>
                        </div>
                      </div>
                    </div>

                    {/* THE TWO PRINT OPTIONS */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handlePrintInvoice}
                        className="btn btn-secondary btn-sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        <FileText size={14} color="#0f172a" />
                        <span>Print Invoice</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenStickerPrint}
                        className="btn btn-primary btn-sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        <Tag size={14} />
                        <span>Print Steadfast Consignment ID (Sticker)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: INVOICE PRINT VIEW */}
          {currentView === 'invoice' && (
            <div style={{ padding: '10px 0' }}>
              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Printable Tax Invoice — Ready for standard A4 paper
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditAmountOpen(true)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 700,
                      color: '#c2410c',
                      background: '#fff7ed',
                      borderColor: '#fed7aa'
                    }}
                  >
                    <Edit2 size={13} /> Edit Amount
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintInvoice}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}
                  >
                    <Printer size={14} /> Print Invoice
                  </button>
                </div>
              </div>

              <InvoiceDocument order={order} />
            </div>
          )}

          {/* VIEW 3: STEADFAST STICKER PRINT VIEW */}
          {currentView === 'sticker' && (
            <div style={{ padding: '10px 0' }}>
              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Steadfast Courier Shipping Label Sticker (4"x6")
                </span>
                <button
                  type="button"
                  onClick={handleOpenStickerPrint}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}
                >
                  <Printer size={14} /> Print Sticker
                </button>
              </div>

              <SteadfastSticker order={order} />
            </div>
          )}
        </div>
      </div>

      {/* Parcel Sticker Print Modal (Layout Choices: 100x150mm, A4 4, A4 8, 75x50mm) */}
      <ParcelStickerPrintModal
        orders={[order]}
        isOpen={isStickerPrintOpen}
        onClose={() => setIsStickerPrintOpen(false)}
      />

      {/* Edit Invoice Amount Modal */}
      <EditOrderAmountModal
        order={order}
        isOpen={isEditAmountOpen}
        onClose={() => setIsEditAmountOpen(false)}
        onSuccess={handleAmountUpdated}
      />
    </div>
  );
};

