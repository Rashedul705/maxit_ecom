'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { Search, Package, CheckCircle2, Clock, Truck, Home, AlertCircle, Loader2 } from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchTracking = async (ordNo: string, ph: string) => {
    if (!ordNo.trim() && !ph.trim()) {
      setError('Please provide an order number or customer phone number.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setHasSearched(true);
      const results = await api.trackOrder(ordNo.trim() || undefined, ph.trim() || undefined);
      setOrders(results);
    } catch (err: unknown) {
      console.error('Track order error:', err);
      const message = err instanceof Error ? err.message : 'No order found with the provided details.';
      setError(message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber || initialPhone) {
      fetchTracking(initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumber, phone);
  };

  const getStatusStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'Placed': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const steps = [
    { title: 'Order Placed', desc: 'Received & Queued', icon: Package },
    { title: 'Processing', desc: 'Packing & Quality Check', icon: Clock },
    { title: 'Shipped', desc: 'Dispatched with Courier', icon: Truck },
    { title: 'Delivered', desc: 'Package Handed to You', icon: Home }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your Order Number or Registered Mobile Phone to see real-time courier shipping progress.
        </p>
      </div>

      {/* Tracking Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Order Number
              </label>
              <input
                type="text"
                placeholder="e.g. ORD-2026-1001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Phone
              </label>
              <input
                type="tel"
                placeholder="e.g. 01712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching Records...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Order Now</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Results View */}
      {hasSearched && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((ord) => {
            const stepIdx = getStatusStepIndex(ord.status);
            const isCancelled = ord.status === 'Cancelled';

            return (
              <div key={ord.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Order ID</span>
                    <h2 className="text-base font-extrabold text-blue-600 font-mono">{ord.orderNumber}</h2>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-400">Status</span>
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                {!isCancelled ? (
                  <div className="py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {steps.map((st, i) => {
                        const isDone = i <= stepIdx;
                        const isCurrent = i === stepIdx;
                        const Icon = st.icon;

                        return (
                          <div key={i} className="flex flex-col items-center text-center relative">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                              isCurrent
                                ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                : isDone
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {isDone && !isCurrent ? (
                                <CheckCircle2 className="w-6 h-6" />
                              ) : (
                                <Icon className="w-5 h-5" />
                              )}
                            </div>
                            <span className={`text-xs font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                              {st.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{st.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl text-center font-bold">
                    This order was cancelled. Please contact customer support for further assistance.
                  </div>
                )}

                {/* Recipient & Shipping Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Customer & Delivery Info</h3>
                    <p className="text-slate-600"><strong>Name:</strong> {ord.customerName}</p>
                    <p className="text-slate-600"><strong>Phone:</strong> {ord.phone}</p>
                    <p className="text-slate-600"><strong>Address:</strong> {ord.address}, {ord.area}, {ord.district}, {ord.division}</p>
                    {ord.note && <p className="text-slate-500 italic mt-1">&quot;{ord.note}&quot;</p>}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Billing Summary</h3>
                    <p className="text-slate-600"><strong>Subtotal:</strong> ৳{ord.subtotal.toLocaleString()}</p>
                    <p className="text-slate-600"><strong>Delivery Charge:</strong> ৳{ord.deliveryCharge}</p>
                    <p className="text-slate-900 font-bold text-sm mt-1">
                      <strong>Total Amount:</strong> <span className="text-blue-600">৳{ord.total.toLocaleString()}</span> (COD)
                    </p>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 mb-3">Items in this Package</h3>
                  <div className="space-y-2">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                          <Image src={it.image} alt={it.title} fill sizes="40px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 line-clamp-1">{it.title}</p>
                          <p className="text-[10px] text-slate-400">Qty: {it.quantity} × ৳{it.price.toLocaleString()}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          ৳{(it.price * it.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading order tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
