'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import {
  Truck,
  Search,
  CheckCircle,
  Clock,
  Package,
  Home,
  ChevronRight,
  Phone,
  AlertCircle,
  MapPin
} from 'lucide-react';

function OrderTrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('orderNumber') || '';

  const [query, setQuery] = useState(initialQuery);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (searchVal = query) => {
    if (!searchVal.trim()) {
      setError('Please enter your Order Number (e.g. ORD-1001) or Phone Number');
      return;
    }
    setError(null);
    setIsLoading(true);
    setHasSearched(true);

    try {
      const isPhone = /^[0-9+\s-]{8,15}$/.test(searchVal.trim());
      const res = await api.trackOrder(
        isPhone ? undefined : searchVal.trim(),
        isPhone ? searchVal.trim().replace(/[\s-]/g, '') : undefined
      );
      setOrders(res || []);
    } catch (err: any) {
      console.error('Failed to track order:', err);
      setError(err.message || 'No order found with these credentials.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleTrack(initialQuery);
    }
  }, [initialQuery]);

  const getStatusStep = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'processing' || s === 'confirmed') return 2;
    if (s === 'cancelled') return -1;
    return 1; // Placed
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
        <span className="font-semibold text-gray-900">Track Order</span>
      </nav>

      {/* Track Box */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6600] flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              Track Your Order Status
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Enter your Order Number (e.g. ORD-1001) or mobile phone number to view live shipment progress.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Order Number (ORD-XXXX) or Phone (017...)"
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-[#FF6600]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Searching...' : 'Track Order'}</span>
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Results */}
      {hasSearched && (
        <div className="space-y-6">
          {orders.length === 0 && !isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800 mb-1">No Orders Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                We couldn&apos;t locate any order matching &quot;{query}&quot;. Please verify the phone number or order number.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <Phone className="w-3.5 h-3.5 text-[#FF6600]" />
                <span>Need help? Call our hotline: <strong>+880 1711-000000</strong></span>
              </div>
            </div>
          ) : (
            orders.map((order) => {
              const currentStep = getStatusStep(order.status);
              const isCancelled = order.status.toLowerCase() === 'cancelled';

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-gray-500 uppercase">Order ID</span>
                        <span className="text-base font-mono font-black text-[#FF6600]">{order.orderNumber}</span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isCancelled
                              ? 'bg-red-100 text-red-700'
                              : order.status.toLowerCase() === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-gray-400 block">Total Amount</span>
                      <span className="text-lg font-black text-gray-900">৳{order.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  {!isCancelled ? (
                    <div className="py-2">
                      <div className="grid grid-cols-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0">
                          <div
                            className="h-full bg-[#FF6600] transition-all duration-500"
                            style={{
                              width: `${((Math.max(1, currentStep) - 1) / 3) * 100}%`
                            }}
                          />
                        </div>

                        {/* Step 1: Placed */}
                        <div className="flex flex-col items-center text-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            currentStep >= 1 ? 'bg-[#FF6600] text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                          }`}>
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold mt-2 text-gray-800">Placed</span>
                        </div>

                        {/* Step 2: Processing */}
                        <div className="flex flex-col items-center text-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            currentStep >= 2 ? 'bg-[#FF6600] text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                          }`}>
                            <Clock className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold mt-2 text-gray-800">Processing</span>
                        </div>

                        {/* Step 3: Shipped */}
                        <div className="flex flex-col items-center text-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            currentStep >= 3 ? 'bg-[#FF6600] text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                          }`}>
                            <Truck className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold mt-2 text-gray-800">Shipped</span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="flex flex-col items-center text-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            currentStep >= 4 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                          }`}>
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold mt-2 text-gray-800">Delivered</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold">
                      This order has been cancelled. Please contact customer helpline for inquiries.
                    </div>
                  )}

                  {/* Customer & Address Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-gray-700 block mb-1">Customer Information</span>
                      <p className="text-gray-900 font-medium">{order.customerName}</p>
                      <p className="text-gray-500">{order.phone}</p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-700 block mb-1">Delivery Address</span>
                      <p className="text-gray-900 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>{order.address}, {order.area}, {order.district}, {order.division}</span>
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Order Items ({order.items.length})
                    </h4>
                    <div className="divide-y divide-gray-100">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                              {it.image && (
                                <Image src={it.image} alt={it.title} fill sizes="48px" className="object-cover" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800 line-clamp-1">{it.title}</p>
                              <p className="text-[11px] text-gray-400">Qty: {it.quantity} × ৳{it.price.toLocaleString()}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gray-900">
                            ৳{(it.price * it.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderTrackPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-gray-400">Loading order tracker...</div>}>
      <OrderTrackContent />
    </Suspense>
  );
}
