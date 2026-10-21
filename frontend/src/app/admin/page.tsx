'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ShoppingCart, DollarSign, Package, AlertTriangle, ArrowRight, Loader2, Plus } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('maxitshop_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    api.getAdminDashboard(token)
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load admin dashboard:', err);
        if (err?.status === 401 || err?.message?.toLowerCase().includes('unauthorized')) {
          document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
          localStorage.removeItem('maxitshop_admin_token');
          localStorage.removeItem('maxitshop_admin_user');
          router.push('/admin/login');
        } else {
          setError('Failed to load dashboard statistics. Please verify admin session.');
          setLoading(false);
        }
      });
  }, [router]);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Admin Overview Dashboard"
        description="Key performance indicators, inventory alerts, and sales volume"
      />

      <div className="p-6 space-y-6">
        
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-600" />
            <span className="text-xs">Loading analytics...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</h3>
                  <Link href="/admin/orders" className="text-[11px] font-bold text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1">
                    <span>Manage Orders</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">৳{stats.totalRevenue.toLocaleString()}</h3>
                  <span className="text-[11px] text-slate-400">From delivered/placed orders</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Catalog</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalProducts}</h3>
                  <Link href="/admin/products" className="text-[11px] font-bold text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1">
                    <span>Manage Products</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</span>
                  <h3 className="text-2xl font-black text-red-600 mt-1">{stats.lowStockCount}</h3>
                  <span className="text-[11px] text-slate-400">&lt; 10 units in stock</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Low Stock Warning Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-sm font-bold text-slate-900">Low Stock Inventory Alerts</h2>
                </div>
                <Link
                  href="/admin/products"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  View All Products →
                </Link>
              </div>

              {stats.lowStockProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  All items are adequately stocked (&gt;= 10 units).
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Product Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Unit Price</th>
                        <th className="py-3 px-4">Stock Left</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.lowStockProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-semibold text-slate-800">{p.title}</td>
                          <td className="py-3 px-4 text-slate-500 capitalize">{p.category.replace(/-/g, ' ')}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">৳{p.price.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-[11px]">
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href={`/admin/products`}
                              className="text-blue-600 hover:underline font-bold"
                            >
                              Restock
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}

      </div>
    </div>
  );
}
