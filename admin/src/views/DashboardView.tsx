import React, { useEffect, useState } from 'react';
import { DashboardStats, Order } from '../types';
import { adminApi } from '../api';
import { DollarSign, ShoppingBag, Package, AlertTriangle, Clock, MessageSquare, Eye, Printer } from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';

export const DashboardView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading dashboard data...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Overview Dashboard</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Real-time summary of sales, orders, and inventory metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchStats}>Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('products')}>+ Add Product</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <DollarSign />
          </div>
          <div>
            <div className="stat-val">৳{(stats?.totalRevenue || 0).toLocaleString()}</div>
            <div className="stat-label">Total Revenue (BDT)</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('orders')}>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <ShoppingBag />
          </div>
          <div>
            <div className="stat-val">{stats?.totalOrders || 0}</div>
            <div className="stat-label">Total Orders Placed</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('orders')}>
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Clock />
          </div>
          <div>
            <div className="stat-val">{stats?.pendingOrders || 0}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('products')}>
          <div className="stat-icon" style={{ background: '#f8fafc', color: '#475569' }}>
            <Package />
          </div>
          <div>
            <div className="stat-val">{stats?.totalProducts || 0}</div>
            <div className="stat-label">Active Catalog Products</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('products')}>
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <AlertTriangle />
          </div>
          <div>
            <div className="stat-val">{stats?.lowStockCount || 0}</div>
            <div className="stat-label">Low Stock Alerts (&le;5)</div>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('complaints')}>
          <div className="stat-icon" style={{ background: '#faf5ff', color: '#a855f7' }}>
            <MessageSquare />
          </div>
          <div>
            <div className="stat-val">{stats?.newComplaints || 0}</div>
            <div className="stat-label">Customer Complaints</div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="table-card">
        <div className="table-header">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Customer Orders</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Latest orders placed via cash on delivery</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('orders')}>
            View All Orders &rarr;
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Delivery Area</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: '#ff6600' }}>{order.orderNumber}</td>
                  <td>{order.customer.name}</td>
                  <td>{order.customer.phone}</td>
                  <td style={{ textTransform: 'capitalize' }}>{order.customer.area.replace('_', ' ')}</td>
                  <td>{order.items.length} items</td>
                  <td style={{ fontWeight: 700 }}>৳{order.total.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      title="Print Invoice"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Printer size={14} /> Invoice
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No orders recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice modal */}
      <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};
