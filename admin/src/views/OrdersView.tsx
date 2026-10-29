import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { adminApi } from '../api';
import { Search, Printer, ChevronLeft, ChevronRight, CheckCircle2, Truck, Download, CheckSquare, Square, X, AlertCircle } from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';

export const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [courierDispatchingId, setCourierDispatchingId] = useState<string | null>(null);

  // Bulk Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [actionNotification, setActionNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOrders({
        status: statusFilter,
        search,
        page,
        limit: 15
      });
      setOrders(data.items);
      setTotal(data.total);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    setSelectedOrderIds([]); // Clear selections on page / filter change
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
        <div style={{ display: 'flex', gap: '8px' }}>
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
      <div className="table-card">
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
              <th>Order #</th>
              <th>Customer Details</th>
              <th>Ordered Items</th>
              <th>Amount (BDT)</th>
              <th>Status</th>
              <th>Courier &amp; Tracking</th>
              <th>Status Action</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading orders...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map(order => {
                const isSelected = selectedOrderIds.includes(order.id);
                const courier = order.courier?.provider || (order as any).courier;
                const trackingCode = order.courier?.trackingCode || (order as any).trackingCode;

                return (
                  <tr key={order.id} style={{ background: isSelected ? '#fff7ed' : 'inherit' }}>
                    <td style={{ textAlign: 'center' }}>
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

                    <td>
                      <div style={{ fontWeight: 700, color: '#ff6600', fontSize: '14px' }}>
                        {order.orderNumber}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customer.name}</div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>📞 {order.customer.phone}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '200px' }}>
                        📍 {[order.customer.address, order.customer.thana, order.customer.district].filter(Boolean).join(', ')}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '12px', color: '#334155' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ marginBottom: '3px' }}>
                            • <strong>{item.quantity}x</strong> {item.title.substring(0, 28)}...
                          </div>
                        ))}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 800, fontSize: '15px' }}>৳{order.total.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                        {order.paymentMethod} • <span style={{ color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>{order.paymentStatus || 'unpaid'}</span>
                      </div>
                    </td>

                    <td>
                      <span className={`badge badge-${order.status}`}>{order.status}</span>
                    </td>

                    <td>
                      {courier && trackingCode ? (
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Truck size={12} color="#ff6600" />
                            <span>{courier}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                            {trackingCode}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={courierDispatchingId === order.id}
                          onClick={() => handleDispatchCourier(order, 'Steadfast')}
                          className="btn btn-sm"
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            background: '#ff6600',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Truck size={11} />
                          <span>{courierDispatchingId === order.id ? 'Sending...' : 'Send Steadfast'}</span>
                        </button>
                      )}
                    </td>

                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '4px 8px', fontSize: '12px', width: '115px' }}
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedOrder(order)}
                        title="Print Invoice"
                      >
                        <Printer size={14} /> Print
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
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

      <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};
