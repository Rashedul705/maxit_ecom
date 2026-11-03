import React, { useEffect, useState } from 'react';
import { DashboardStats, Order } from '../types';
import { adminApi } from '../api';
import { DollarSign, ShoppingBag, Package, AlertTriangle, Clock, MessageSquare, Eye, Printer, RefreshCw } from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';

export const DashboardView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchStats = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const data = await adminApi.getStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-poll stats every 10 seconds so new customer orders appear in real time
    const interval = setInterval(() => {
      fetchStats(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading dashboard data...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Overview Dashboard</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Real-time summary of sales, orders, and inventory metrics. 
            <span style={{ marginLeft: '8px', fontSize: '11px', color: '#94a3b8' }}>
              • Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => fetchStats(false)} 
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
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
              stats.recentOrders.map(order => {
                const orderKey = order.id || (order as any)._id || order.orderNumber;
                const cust = order.customer || ({} as any);
                const areaText = cust.area ? String(cust.area).replace(/_/g, ' ') : (cust.district || cust.thana || 'Standard Delivery');
                const itemsCount = (order.items || []).length;
                const totalBDT = Number(order.total || 0);

                return (
                  <tr key={orderKey}>
                    <td style={{ fontWeight: 600, color: '#ff6600' }}>{order.orderNumber}</td>
                    <td>{cust.name || 'Anonymous Customer'}</td>
                    <td>{cust.phone || 'N/A'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{areaText}</td>
                    <td>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</td>
                    <td style={{ fontWeight: 700 }}>৳{totalBDT.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${order.status || 'pending'}`}>{order.status || 'pending'}</span>
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
                );
              })
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
