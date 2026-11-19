'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Home,
  AlertCircle,
  Loader2,
  ChevronRight,
  Phone,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery =
    searchParams.get('q') ||
    searchParams.get('orderNumber') ||
    searchParams.get('ord') ||
    searchParams.get('phone') ||
    '';

  const [searchVal, setSearchVal] = useState(initialQuery);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTracking = async (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) {
      setError('Please provide an Order Number (e.g. ORD-29548) or Phone Number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);

      const isPhone = /^[0-9+\s-]{8,15}$/.test(cleanTerm);
      const results = await api.trackOrder(
        isPhone ? undefined : cleanTerm,
        isPhone ? cleanTerm.replace(/[\s-]/g, '') : undefined
      );

      setOrders(results || []);
      if (!results || results.length === 0) {
        setError(`No orders found matching "${cleanTerm}". Please double check your order number or phone number.`);
      }
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
    if (initialQuery) {
      fetchTracking(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(searchVal);
  };

  const handleCopy = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const getStatusStepIndex = (rawStatus: string = '') => {
    const s = rawStatus.toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'shipped') return 2;
    if (s === 'processing' || s === 'confirmed') return 1;
    if (s === 'cancelled') return -1;
    return 0; // pending / placed
  };

  const steps = [
    { title: 'Order Placed', desc: 'Received & Queued', icon: Package },
    { title: 'Processing', desc: 'Packing & Quality Check', icon: Clock },
    { title: 'Shipped', desc: 'Dispatched with Courier', icon: Truck },
    { title: 'Delivered', desc: 'Package Handed to You', icon: CheckCircle2 }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 mb-6 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">Track Order</span>
      </nav>

      {/* Tracking Search Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6600] flex items-center justify-center shrink-0 border border-orange-100">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              Track Your Order Status
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Enter your Order Number (e.g. ORD-29548) or customer phone number to view live shipping progress.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Order Number (ORD-XXXX) or Phone (017...)"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-[#FF6600] transition-colors"
                autoComplete="off"
              />
              {searchVal && (
                <button
                  type="button"
                  onClick={() => setSearchVal('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 bg-[#FF6600] hover:bg-[#e55c00] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 pt-1">
            <span className="font-medium text-gray-600">Quick suggestions:</span>
            <button
              type="button"
              onClick={() => {
                setSearchVal('ORD-29548');
                fetchTracking('ORD-29548');
              }}
              className="px-2 py-0.5 bg-gray-100 hover:bg-orange-50 hover:text-[#FF6600] rounded text-gray-600 font-mono transition-colors"
            >
              ORD-29548
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchVal('01812345678');
                fetchTracking('01812345678');
              }}
              className="px-2 py-0.5 bg-gray-100 hover:bg-orange-50 hover:text-[#FF6600] rounded text-gray-600 font-mono transition-colors"
            >
              01812345678
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium">{error}</span>
              <p className="text-[11px] text-red-600/80 mt-1">
                Need help? Call our customer helpline at{' '}
                <a href="tel:+8801733272445" className="font-bold underline hover:text-red-900">
                  +880 1733-272445
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tracking Results View */}
      {hasSearched && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((ord) => {
            const statusKey = (ord.status || '').toLowerCase();
            const stepIdx = getStatusStepIndex(ord.status);
            const isCancelled = statusKey === 'cancelled';
            const isDelivered = statusKey === 'delivered';

            const customerName = ord.customer?.name || ord.customerName || 'Valued Customer';
            const customerPhone = ord.customer?.phone || ord.phone || 'N/A';
            const addressParts = [
              ord.customer?.address || ord.address,
              ord.customer?.thana,
              ord.customer?.area || ord.area,
              ord.customer?.district || ord.district,
              ord.customer?.division || ord.division
            ].filter(Boolean);
            const fullAddress = addressParts.join(', ') || 'Address on file';

            const courierCode = ord.courier?.trackingCode || '';
            const courierProvider = ord.courier?.provider || 'Courier Partner';
            const consignmentId = ord.courier?.consignmentId || '';

            return (
              <div
                key={ord.id || ord._id || ord.orderNumber}
                className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Order ID:
                      </span>
                      <span className="text-base sm:text-lg font-black font-mono text-[#FF6600]">
                        {ord.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(ord.orderNumber, ord.orderNumber)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                        title="Copy Order ID"
                      >
                        {copiedId === ord.orderNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Placed on{' '}
                      {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-gray-400 block uppercase">
                        Total Amount
                      </span>
                      <span className="text-lg font-black text-gray-900">
                        ৳{ord.total.toLocaleString()}
                      </span>
                    </div>

                    <div className="pl-3 border-l border-gray-200">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          isCancelled
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : statusKey === 'shipped'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-orange-50 text-[#FF6600] border-orange-200'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Timeline Stepper */}
                {!isCancelled ? (
                  <div className="py-2">
                    <div className="grid grid-cols-4 relative">
                      {/* Connecting Line */}
                      <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200 -z-0">
                        <div
                          className="h-full bg-[#FF6600] transition-all duration-500"
                          style={{
                            width: `${(Math.max(0, stepIdx) / 3) * 100}%`
                          }}
                        />
                      </div>

                      {steps.map((st, i) => {
                        const isDone = i <= stepIdx;
                        const isCurrent = i === stepIdx;
                        const Icon = st.icon;

                        return (
                          <div key={i} className="flex flex-col items-center text-center relative z-10 px-1">
                            <div
                              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                isCurrent
                                  ? 'bg-[#FF6600] text-white ring-4 ring-orange-100 shadow-sm'
                                  : isDone
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-400 border border-gray-200'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span
                              className={`text-xs font-bold mt-2 ${
                                isDone ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            >
                              {st.title}
                            </span>
                            <span className="text-[10px] text-gray-400 hidden sm:inline mt-0.5">
                              {st.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-medium">
                    This order was cancelled. Please contact our helpline if you need help re-ordering.
                  </div>
                )}

                {/* Real-Time Courier Tracking Card */}
                {ord.courier && (courierCode || consignmentId) && (
                  <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-sky-900 uppercase">
                            Courier Partner: {courierProvider}
                          </span>
                          {ord.courier.status && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-200/80 text-sky-800 uppercase">
                              {ord.courier.status.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-sky-700 mt-1 font-mono">
                          {courierCode && (
                            <span>
                              <strong>Tracking Code:</strong> {courierCode}
                            </span>
                          )}
                          {consignmentId && (
                            <span className="border-l border-sky-300 pl-3">
                              <strong>Consignment ID:</strong> {consignmentId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {courierCode && (
                      <a
                        href={
                          courierProvider.toLowerCase().includes('steadfast') || courierCode.startsWith('STE')
                            ? `https://steadfast.com.bd/t/${courierCode}`
                            : `https://www.google.com/search?q=${encodeURIComponent(`${courierProvider} tracking ${courierCode}`)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                      >
                        <span>Live Courier Tracking</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Customer & Delivery Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                      <span>Customer Information</span>
                    </h3>
                    <p className="text-gray-900 font-semibold">{customerName}</p>
                    <p className="text-gray-600 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>{customerPhone}</span>
                    </p>
                    {ord.customer?.email && (
                      <p className="text-gray-500 text-[11px] mt-0.5">{ord.customer.email}</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6600]" />
                      <span>Delivery Address</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{fullAddress}</p>
                    {ord.note && (
                      <p className="text-gray-500 italic mt-1 text-[11px] border-t border-gray-200/80 pt-1">
                        Note: &quot;{ord.note}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Ordered Items List */}
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Items in this Package ({ord.items?.length || 0})
                  </h3>
                  <div className="divide-y divide-gray-100">
                    {ord.items?.map((it, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                            {it.image ? (
                              <Image
                                src={it.image}
                                alt={it.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                              {it.title}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                              <span>Qty: {it.quantity}</span>
                              <span>•</span>
                              <span>৳{it.price.toLocaleString()} each</span>
                              {it.variant && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#FF6600] font-medium">{it.variant}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-gray-900 shrink-0">
                          ৳{(it.price * it.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing Summary & Payment Info */}
                <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-gray-700 block">Payment Method</span>
                    <span className="text-gray-900 uppercase font-semibold">
                      {ord.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : ord.paymentMethod}
                    </span>
                    <span
                      className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  <div className="space-y-1 text-right">
                    <div className="text-gray-500">
                      Subtotal: <span className="font-semibold text-gray-700">৳{ord.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="text-gray-500">
                      Delivery Charge: <span className="font-semibold text-gray-700">৳{ord.deliveryCharge}</span>
                    </div>
                    {ord.discount ? (
                      <div className="text-emerald-600">
                        Discount: <span className="font-semibold">-৳{ord.discount.toLocaleString()}</span>
                      </div>
                    ) : null}
                    <div className="text-sm font-black text-gray-900 pt-1 border-t border-gray-200">
                      Grand Total: <span className="text-[#FF6600]">৳{ord.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Order Timeline History (if available) */}
                {ord.timeline && ord.timeline.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Activity Log</span>
                    </h4>
                    <div className="space-y-2">
                      {ord.timeline.map((item, tIdx) => (
                        <div key={item._id || tIdx} className="flex items-start gap-2.5 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#FF6600] mt-1.5 shrink-0" />
                          <div className="flex-1">
                            <span className="font-semibold text-gray-800 capitalize">
                              {item.status}:{' '}
                            </span>
                            <span className="text-gray-600">{item.note}</span>
                            <span className="text-gray-400 text-[10px] block mt-0.5">
                              {new Date(item.timestamp).toLocaleString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Need Help Banner */}
      <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-5 text-center text-xs text-gray-600 shadow-xs">
        <p className="font-semibold text-gray-800">Have questions about your delivery?</p>
        <p className="text-gray-500 mt-0.5">
          Reach our dedicated support team directly at{' '}
          <a href="tel:+8801733272445" className="font-bold text-[#FF6600] hover:underline">
            +880 1733-272445
          </a>{' '}
          or email{' '}
          <a href="mailto:support@maxit.com.bd" className="font-bold text-[#FF6600] hover:underline">
            support@maxit.com.bd
          </a>
        </p>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF6600] mb-2" />
          <span>Loading order tracker...</span>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
