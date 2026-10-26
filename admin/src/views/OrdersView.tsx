import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { adminApi } from '../api';
import { Search, Printer, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
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
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await adminApi.updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus} from admin panel`);
      fetchOrders();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Orders Management</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Review customer orders, update tracking status, and generate tax invoices.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
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
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px', maxWidth: '450px' }}>
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

      {/* Orders Table */}
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer Details</th>
              <th>Ordered Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Status Action</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading orders...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map(order => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#ff6600', fontSize: '14px' }}>{order.orderNumber}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customer.name}</div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>📞 {order.customer.phone}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '220px' }}>
                      📍 {order.customer.address}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: '#334155' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '3px' }}>
                          • <strong>{item.quantity}x</strong> {item.title.substring(0, 32)}...
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>৳{order.total.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: '12px', width: '130px' }}
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
                    >
                      <Printer size={14} /> Print
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No orders found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
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
