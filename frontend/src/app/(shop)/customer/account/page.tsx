'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { User, Package, LogOut, Home, ChevronRight, Phone, MapPin, Truck } from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<{ name: string; phone: string; email: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('maxitshop_customer');
      if (stored) {
        const u = JSON.parse(stored);
        setCustomer(u);
        // Fetch orders by phone
        api.trackOrder(undefined, u.phone).then(res => {
          setOrders(res || []);
        }).catch(() => {
          setOrders([]);
        }).finally(() => {
          setIsLoading(false);
        });
      } else {
        // Mock default for demo viewing
        setCustomer({
          name: 'Arif Hossain',
          phone: '01711000000',
          email: 'arif@example.com'
        });
        api.trackOrder(undefined, '01711000000').then(res => {
          setOrders(res || []);
        }).catch(() => {
          setOrders([]);
        }).finally(() => {
          setIsLoading(false);
        });
      }
    } catch {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('maxitshop_customer');
    router.push('/customer/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 mb-6 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">My Account</span>
      </nav>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-[#FF6600] flex items-center justify-center font-black text-2xl shrink-0">
            {customer?.name ? customer.name[0] : 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              {customer?.name || 'Customer Profile'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {customer?.phone}
              </span>
              <span>•</span>
              <span>{customer?.email}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Orders History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#FF6600]" />
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              My Order History
            </h2>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {orders.length} orders placed
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading order records...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-gray-500">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-[#FF6600] text-white text-xs font-bold rounded-lg hover:bg-[#e55c00] transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((ord) => (
              <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#FF6600]">{ord.orderNumber}</span>
                    <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • {ord.items.length} items
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-gray-900">
                    ৳{ord.total.toLocaleString()}
                  </span>
                  <Link
                    href={`/customer/order-track?q=${ord.orderNumber}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-[#FF6600] hover:text-white text-gray-800 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
