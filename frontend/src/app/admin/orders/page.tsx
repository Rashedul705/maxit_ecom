'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { InvoiceModal } from '@/components/admin/InvoiceModal';
import { Search, Printer, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const getToken = () => localStorage.getItem('maxitshop_admin_token') || 'admin_secret_token_123';

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await api.getAdminOrders(token);
      setOrders(res);
    } catch (err: unknown) {
      console.error('Failed to load admin orders:', err);
      const message = err instanceof Error ? err.message : 'Error fetching orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = getToken();
      const updated = await api.updateOrderStatus(orderId, newStatus, token);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
    } catch (err: unknown) {
      console.error('Failed to update status:', err);
      const message = err instanceof Error ? err.message : 'Status update failed';
      alert(message);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  const statuses = ['All', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Orders Fulfillment"
        description="Review customer orders, update delivery status, and generate tax invoices"
      />

      <div className="p-6 space-y-4">
        
        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedStatus === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by Order # or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-600" />
              <span className="text-xs">Fetching orders data...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-xs text-red-600">{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No orders match your filter criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total (৳)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {o.orderNumber}
                        <div className="text-[10px] text-slate-400 font-sans">
                          {new Date(o.createdAt).toLocaleDateString('en-GB')}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{o.customerName}</span>
                        <span className="text-[11px] text-slate-500 block">{o.phone}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        <span className="font-medium">{o.area}, {o.district}</span>
                        <span className="text-[10px] text-slate-400 block">{o.division}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[11px]">
                          {o.items.reduce((s, it) => s + it.quantity, 0)} units ({o.items.length} skus)
                        </span>
                      </td>

                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        ৳{o.total.toLocaleString()}
                        <div className="text-[10px] text-slate-400 font-normal">
                          (incl. ৳{o.deliveryCharge} delivery)
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors ${
                            o.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : o.status === 'Cancelled'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : o.status === 'Shipped'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedInvoiceOrder(o)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                          title="View Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Invoice Modal Component */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

    </div>
  );
}
