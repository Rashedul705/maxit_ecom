import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { adminApi } from '../api';
import {
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Truck,
  Download,
  CheckSquare,
  Square,
  X,
  AlertCircle,
  RefreshCw,
  FileText,
  Tag,
  Eye,
  Edit2,
  MoreVertical
} from 'lucide-react';
import { OrderPopupModal } from '../components/OrderPopupModal';
import { BulkPrintModal } from '../components/BulkPrintModal';
import { ParcelStickerPrintModal } from '../components/ParcelStickerPrintModal';
import { EditOrderAmountModal } from '../components/EditOrderAmountModal';
import { printHtmlContent } from '../utils/printService';
import { generateInvoicesHtml } from '../utils/printTemplates';
import { Can } from '../components/Can';
import { usePermission } from '../context/PermissionContext';

export const getItemVariationText = (item: any): string | null => {
  const sanitize = (str: any) => typeof str === 'string' && !str.includes('[object Object]') && str.trim().length > 0;
  if (sanitize(item?.variation)) return item.variation.trim();
  if (sanitize(item?.variant)) return item.variant.trim();
  if (sanitize(item?.selectedVariation)) return item.selectedVariation.trim();
  if (item?.specs && typeof item.specs === 'object') {
    const pairs: string[] = [];
    for (const [k, v] of Object.entries(item.specs)) {
      if (typeof v === 'string' || typeof v === 'number') {
        pairs.push(`${k}: ${v}`);
        if (pairs.length >= 2) break;
      } else if (v && typeof v === 'object') {
        for (const [subK, subV] of Object.entries(v as Record<string, any>)) {
          if (typeof subV === 'string' || typeof subV === 'number') {
            pairs.push(`${subK}: ${subV}`);
            if (pairs.length >= 2) break;
          }
        }
        if (pairs.length >= 2) break;
      }
    }
    if (pairs.length > 0) return pairs.join(', ');
  }
  return null;
};

const getStatusSelectStyle = (status: string): React.CSSProperties => {
  switch (status) {
    case 'pending':
      return { background: '#fff7ed', color: '#c2410c', borderColor: '#fdba74' };
    case 'confirmed':
      return { background: '#eff6ff', color: '#1d4ed8', borderColor: '#93c5fd' };
    case 'shipped':
      return { background: '#f5f3ff', color: '#6d28d9', borderColor: '#c4b5fd' };
    case 'delivered':
      return { background: '#f0fdf4', color: '#15803d', borderColor: '#86efac' };
    case 'cancelled':
      return { background: '#fef2f2', color: '#b91c1c', borderColor: '#fca5a5' };
    default:
      return { background: '#f8fafc', color: '#334155', borderColor: '#e2e8f0' };
  }
};

const menuItemStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '7px 10px',
  border: 'none',
  background: 'none',
  fontSize: '12.5px',
  color: '#334155',
  borderRadius: '5px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background-color 0.1s ease',
  fontWeight: 500
};

export const OrdersView: React.FC = () => {
  const { hasPermission } = usePermission();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderPopupOpen, setIsOrderPopupOpen] = useState(false);
  const [isBulkStickerModalOpen, setIsBulkStickerModalOpen] = useState(false);
  const [bulkPrintModal, setBulkPrintModal] = useState<{ isOpen: boolean; type: 'invoice' | 'sticker' }>({
    isOpen: false,
    type: 'invoice'
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [courierDispatchingId, setCourierDispatchingId] = useState<string | null>(null);
  const [editingAmountOrder, setEditingAmountOrder] = useState<Order | null>(null);
  const [activeMenuOrderId, setActiveMenuOrderId] = useState<string | null>(null);
  const [singleStickerOrder, setSingleStickerOrder] = useState<Order | null>(null);

  // Bulk Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [actionNotification, setActionNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setFetchError(null);
      const data: any = await adminApi.getOrders({
        status: statusFilter,
        search,
        page,
        limit: 15
      });
      const orderList = Array.isArray(data) ? data : (data?.items || []);
      const totalCount = Array.isArray(data) ? data.length : (data?.total || orderList.length);
      setOrders(orderList);
      setTotal(totalCount);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setFetchError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    setSelectedOrderIds([]); // Clear selections on page / filter change
    // Auto-refresh orders every 10 seconds for real-time visibility
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [page, statusFilter]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setActionNotification({ type, message });
    setTimeout(() => setActionNotification(null), 4000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await adminApi.updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus} from admin panel`);
      showNotification('success', `Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err: any) {
      showNotification('error', 'Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAmountUpdated = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    if (selectedOrder && selectedOrder.id === updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
    showNotification('success', `Invoice amount updated for Order #${updatedOrder.orderNumber}! New Total: ৳${(updatedOrder.total || 0).toLocaleString()}`);
  };

  // Dispatch to Steadfast / Pathao Courier
  const handleDispatchCourier = async (order: Order, courierName = 'Steadfast') => {
    if (!window.confirm(`Dispatch Order #${order.orderNumber} to ${courierName} Courier?`)) return;
    try {
      setCourierDispatchingId(order.id);
      const res = await adminApi.dispatchToCourier(order.id, courierName);
      showNotification('success', `Consignment created with ${courierName}! Tracking Code: ${res.courier.trackingCode}`);
      fetchOrders();
    } catch (err: any) {
      showNotification('error', `Courier dispatch failed: ${err.message}`);
    } finally {
      setCourierDispatchingId(null);
    }
  };

  // Bulk Status Update
  const handleBulkStatus = async (status: string) => {
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`Update status of ${selectedOrderIds.length} orders to "${status}"?`)) return;

    try {
      setBulkActionLoading(true);
      const res = await adminApi.bulkUpdateOrderStatus(selectedOrderIds, status, `Bulk updated by Admin`);
      showNotification('success', `Successfully marked ${res.updatedCount} orders as ${status}`);
      setSelectedOrderIds([]);
      fetchOrders();
    } catch (err: any) {
      showNotification('error', `Bulk update failed: ${err.message}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk Dispatch to Steadfast Courier
  const handleBulkCourierDispatch = async () => {
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`Dispatch all ${selectedOrderIds.length} selected orders to Steadfast Courier?`)) return;

    try {
      setBulkActionLoading(true);
      let successCount = 0;
      for (const id of selectedOrderIds) {
        try {
          await adminApi.dispatchToCourier(id, 'Steadfast');
          successCount++;
        } catch (e) {}
      }
      showNotification('success', `Dispatched ${successCount} of ${selectedOrderIds.length} orders to Steadfast Courier`);
      setSelectedOrderIds([]);
      fetchOrders();
    } catch (err: any) {
      showNotification('error', `Courier dispatch error: ${err.message}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // CSV Export for Warehouse & Logistics
  const handleExportCSV = async () => {
    try {
      setBulkActionLoading(true);
      // Fetch full order dataset for export matching current query
      const exportList = await adminApi.exportOrders({ status: statusFilter, search });
      const ordersToExport = selectedOrderIds.length > 0
        ? exportList.filter(o => selectedOrderIds.includes(o.id))
        : exportList;

      if (!ordersToExport || ordersToExport.length === 0) {
        alert('No orders to export.');
        return;
      }

      // Generate CSV string
      const headers = [
        'Order Number',
        'Date',
        'Customer Name',
        'Customer Phone',
        'Delivery Address',
        'Thana',
        'District',
        'Division',
        'Ordered Items',
        'Subtotal BDT',
        'Delivery Charge BDT',
        'Total BDT',
        'Payment Method',
        'Payment Status',
        'Order Status',
        'Courier',
        'Tracking Code'
      ];

      const csvRows = [headers.join(',')];

      ordersToExport.forEach(o => {
        const itemsSummary = o.items.map(i => `${i.quantity}x ${i.title}`).join(' | ');
        const row = [
          `"${o.orderNumber}"`,
          `"${new Date(o.createdAt).toLocaleDateString()}"`,
          `"${(o.customer?.name || '').replace(/"/g, '""')}"`,
          `"${(o.customer?.phone || '').replace(/"/g, '""')}"`,
          `"${(o.customer?.address || '').replace(/"/g, '""')}"`,
          `"${(o.customer?.thana || '').replace(/"/g, '""')}"`,
          `"${(o.customer?.district || '').replace(/"/g, '""')}"`,
          `"${(o.customer?.division || '').replace(/"/g, '""')}"`,
          `"${itemsSummary.replace(/"/g, '""')}"`,
          o.subtotal || o.total,
          o.deliveryCharge || 80,
          o.total,
          `"${o.paymentMethod || 'cod'}"`,
          `"${o.paymentStatus || 'unpaid'}"`,
          `"${o.status}"`,
          `"${o.courier?.provider || (o as any).courier || ''}"`,
          `"${o.courier?.trackingCode || (o as any).trackingCode || ''}"`
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `maxitshop_orders_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('success', `Exported ${ordersToExport.length} orders to CSV successfully!`);
    } catch (err: any) {
      showNotification('error', `Failed to export CSV: ${err.message}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Dedicated Print Single Order Invoice (Isolated iframe, NO background page leak)
  const handlePrintSingleOrderInvoice = (order: Order) => {
    const { html, pageStyle } = generateInvoicesHtml([order]);
    printHtmlContent(html, {
      title: `Invoice_${order.orderNumber}`,
      pageStyle
    });
  };

  // Dedicated Bulk Print Invoices
  const handleBulkPrintInvoices = () => {
    const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
    if (selectedOrders.length === 0) return;
    const { html, pageStyle } = generateInvoicesHtml(selectedOrders);
    printHtmlContent(html, {
      title: `MaxiTShop_Invoices_${selectedOrders.length}_Orders`,
      pageStyle
    });
  };

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedOrderIds.length === orders.length && orders.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map(o => o.id));
    }
  };

  const handleToggleSelectOrder = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter(i => i !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const selectedTotalBDT = orders
    .filter(o => selectedOrderIds.includes(o.id))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const statuses = [
    { label: 'All Orders', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Orders &amp; Logistics Management</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Process customer orders, automate Steadfast courier consignments, and export logistics spreadsheets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => fetchOrders(false)}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Refresh orders list"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            title="Export CSV of current orders"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {actionNotification && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: '8px',
          background: actionNotification.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${actionNotification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: actionNotification.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {actionNotification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionNotification.message}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', overflowX: 'auto' }}>
        {statuses.map(s => (
          <button
            key={s.value}
            className={`btn btn-sm ${statusFilter === s.value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '16px', maxWidth: '480px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by Order #, Customer Name, or Phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          <Search size={16} /> Search
        </button>
      </form>

      {/* Sticky Bulk Action Toolbar */}
      {selectedOrderIds.length > 0 && (
        <div style={{
          background: '#0f172a',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '10px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              {selectedOrderIds.length} orders selected
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              (Total: ৳{selectedTotalBDT.toLocaleString()})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Bulk Actions:
            </span>

            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkStatus('confirmed')}
              className="btn btn-sm"
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '12px' }}
            >
              Mark Confirmed
            </button>

            <button
              disabled={bulkActionLoading}
              onClick={handleBulkCourierDispatch}
              className="btn btn-sm"
              style={{ background: '#ff6600', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Truck size={13} /> Dispatch Courier
            </button>

            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkStatus('delivered')}
              className="btn btn-sm"
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '12px' }}
            >
              Mark Delivered
            </button>

            <button
              disabled={bulkActionLoading}
              onClick={() => handleBulkStatus('cancelled')}
              className="btn btn-sm"
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '12px' }}
            >
              Cancel
            </button>

            {/* Bulk Print Invoices */}
            <button
              disabled={bulkActionLoading}
              onClick={handleBulkPrintInvoices}
              className="btn btn-sm"
              style={{ background: '#334155', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Bulk print invoices for selected orders (isolated A4 tax invoices)"
            >
              <FileText size={13} /> Bulk Invoices
            </button>

            {/* Bulk Print Steadfast Stickers (Opens Image 2 Layout Choice Modal) */}
            <button
              disabled={bulkActionLoading}
              onClick={() => setIsBulkStickerModalOpen(true)}
              className="btn btn-sm"
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Bulk print Steadfast parcel shipping stickers (100x150mm, A4 4/8, 75x50mm)"
            >
              <Tag size={13} /> Bulk Stickers
            </button>

            <button
              disabled={bulkActionLoading}
              onClick={handleExportCSV}
              className="btn btn-sm btn-secondary"
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              <Download size={13} /> Export Selected
            </button>

            <button
              onClick={() => setSelectedOrderIds([])}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              title="Deselect All"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="table-card" style={{ overflow: 'visible' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Select all"
                >
                  {selectedOrderIds.length > 0 && selectedOrderIds.length === orders.length ? (
                    <CheckSquare size={16} color="#ff6600" />
                  ) : (
                    <Square size={16} color="#94a3b8" />
                  )}
                </button>
              </th>
              <th style={{ width: '130px' }}>Order #</th>
              <th style={{ width: '190px' }}>Customer</th>
              <th>Items &amp; Amount</th>
              <th style={{ width: '150px' }}>Status Action</th>
              <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading orders...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order, index) => {
                const isSelected = selectedOrderIds.includes(order.id);
                const courier = order.courier?.provider || (order as any).courier;
                const trackingCode = order.courier?.trackingCode || (order as any).trackingCode;
                const consignmentId = order.courier?.consignmentId || (order as any).consignmentId;
                const items = order.items || [];
                const firstItem = items[0];
                const firstVariation = firstItem ? getItemVariationText(firstItem) : null;
                const hasMultiple = items.length > 1;
                const isNearBottom = index >= orders.length - 2 && orders.length > 2;

                return (
                  <tr
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsOrderPopupOpen(true);
                    }}
                    style={{
                      background: isSelected ? '#fff7ed' : 'inherit',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    title="Click anywhere on the order to view full details"
                  >
                    {/* Checkbox */}
                    <td
                      style={{ textAlign: 'center' }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSelectOrder(order.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {isSelected ? (
                          <CheckSquare size={16} color="#ff6600" />
                        ) : (
                          <Square size={16} color="#cbd5e1" />
                        )}
                      </button>
                    </td>

                    {/* Order # & Date */}
                    <td>
                      <div style={{ fontWeight: 700, color: '#ff6600', fontSize: '13.5px' }}>
                        {order.orderNumber}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Customer Name & Phone */}
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '190px' }}>
                        {order.customer?.name || 'Customer'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px' }}>📞</span>
                        <span>{order.customer?.phone || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Ordered Items (in short) with Amount */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {/* Line 1: Items overview in short */}
                        {items.length === 0 ? (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>No items</span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', lineHeight: 1.3 }}>
                            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '12.5px' }}>
                              • {firstItem.quantity}x {firstItem.title}
                            </span>
                            {firstVariation && (
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#c2410c',
                                background: '#ffedd5',
                                borderRadius: '3px',
                                padding: '1px 5px',
                                whiteSpace: 'nowrap'
                              }}>
                                🏷️ {firstVariation}
                              </span>
                            )}
                            {hasMultiple && (
                              <span style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: '#ea580c',
                                background: '#fff7ed',
                                border: '1px solid #fed7aa',
                                borderRadius: '4px',
                                padding: '1px 6px',
                                whiteSpace: 'nowrap'
                              }}>
                                📦 +{items.length - 1} item{items.length - 1 > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Line 2: Order Total & Payment status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                          <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                            ৳{(order.total || 0).toLocaleString()}
                          </span>
                          <span>•</span>
                          <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 600 }}>
                            {order.paymentMethod || 'cod'}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b',
                            background: order.paymentStatus === 'paid' ? '#ecfdf5' : '#fffbeb',
                            padding: '1px 5px',
                            borderRadius: '3px'
                          }}>
                            {order.paymentStatus || 'unpaid'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Action */}
                    <td onClick={(e) => e.stopPropagation()} style={{ width: '150px' }}>
                      <select
                        className="form-select"
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          width: '130px',
                          ...getStatusSelectStyle(order.status)
                        }}
                        value={order.status}
                        disabled={updatingId === order.id || !hasPermission('orders.update_status')}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Three-Dot Action Menu */}
                    <td
                      style={{ textAlign: 'center', position: 'relative' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveMenuOrderId(activeMenuOrderId === order.id ? null : order.id)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          padding: '5px 7px',
                          borderRadius: '6px',
                          background: activeMenuOrderId === order.id ? '#ffedd5' : '#f8fafc',
                          borderColor: activeMenuOrderId === order.id ? '#fdba74' : '#e2e8f0',
                          color: activeMenuOrderId === order.id ? '#ea580c' : '#475569',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="More options"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuOrderId === order.id && (
                        <>
                          <div
                            onClick={() => setActiveMenuOrderId(null)}
                            style={{
                              position: 'fixed',
                              inset: 0,
                              zIndex: 40,
                              cursor: 'default'
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              right: '8px',
                              ...(isNearBottom ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }),
                              zIndex: 50,
                              background: '#ffffff',
                              borderRadius: '8px',
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #e2e8f0',
                              minWidth: '215px',
                              padding: '6px',
                              textAlign: 'left'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuOrderId(null);
                                setSelectedOrder(order);
                                setIsOrderPopupOpen(true);
                              }}
                              style={menuItemStyle}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Eye size={14} color="#0f172a" />
                              <span>View Order Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuOrderId(null);
                                handlePrintSingleOrderInvoice(order);
                              }}
                              style={menuItemStyle}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Printer size={14} color="#0284c7" />
                              <span>Print Retail Invoice (A4)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuOrderId(null);
                                setSingleStickerOrder(order);
                              }}
                              style={menuItemStyle}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Tag size={14} color="#ff6600" />
                              <span>Print Courier Sticker</span>
                            </button>

                            <Can permission="orders.update_status">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuOrderId(null);
                                  setEditingAmountOrder(order);
                                }}
                                style={menuItemStyle}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                              >
                                <Edit2 size={14} color="#d97706" />
                                <span>Edit Invoice Amount</span>
                              </button>
                            </Can>

                            <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

                            {courier && (trackingCode || consignmentId) ? (
                              <div style={{ padding: '6px 10px', fontSize: '11px', color: '#475569', background: '#f8fafc', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a' }}>
                                  <Truck size={12} color="#ff6600" />
                                  <span>{courier}</span>
                                </div>
                                <div style={{ fontFamily: 'monospace', fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                                  {trackingCode || consignmentId}
                                </div>
                              </div>
                            ) : (
                              <Can permission="orders.update_status">
                                <button
                                  type="button"
                                  disabled={courierDispatchingId === order.id}
                                  onClick={() => {
                                    setActiveMenuOrderId(null);
                                    handleDispatchCourier(order, 'Steadfast');
                                  }}
                                  style={{
                                    ...menuItemStyle,
                                    color: '#ff6600',
                                    fontWeight: 600
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fff7ed'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                  <Truck size={14} color="#ff6600" />
                                  <span>{courierDispatchingId === order.id ? 'Dispatching...' : 'Dispatch Steadfast'}</span>
                                </button>
                              </Can>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : fetchError ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                  <div style={{ marginBottom: '10px', fontWeight: 600 }}>⚠️ {fetchError}</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => fetchOrders(false)}>
                    Retry Loading Orders
                  </button>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No orders found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Showing {orders.length} of {total} orders
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={orders.length < 15}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <OrderPopupModal
        order={selectedOrder}
        isOpen={isOrderPopupOpen}
        onClose={() => {
          setIsOrderPopupOpen(false);
          setSelectedOrder(null);
        }}
        onOrderUpdated={(updated) => {
          setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
          setSelectedOrder(updated);
        }}
      />

      <BulkPrintModal
        orders={orders.filter(o => selectedOrderIds.includes(o.id))}
        isOpen={bulkPrintModal.isOpen}
        initialType={bulkPrintModal.type}
        onClose={() => setBulkPrintModal({ isOpen: false, type: 'invoice' })}
      />

      <ParcelStickerPrintModal
        orders={singleStickerOrder ? [singleStickerOrder] : orders.filter(o => selectedOrderIds.includes(o.id))}
        isOpen={isBulkStickerModalOpen || !!singleStickerOrder}
        onClose={() => {
          setIsBulkStickerModalOpen(false);
          setSingleStickerOrder(null);
        }}
      />

      <EditOrderAmountModal
        order={editingAmountOrder}
        isOpen={!!editingAmountOrder}
        onClose={() => setEditingAmountOrder(null)}
        onSuccess={handleAmountUpdated}
      />
    </div>
  );
};
