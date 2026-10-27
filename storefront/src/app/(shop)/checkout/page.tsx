'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cartContext';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { BANGLADESH_DISTRICTS, ALL_DISTRICT_NAMES } from '@/lib/geoData';
import {
  Truck,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Tag,
  AlertCircle,
  Loader2,
  Percent,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface AvailableCoupon {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  label: string;
}

const AVAILABLE_COUPONS: Record<string, AvailableCoupon> = {
  RONG10: { code: 'RONG10', type: 'percent', value: 10, label: '10% OFF' },
  FREE60: { code: 'FREE60', type: 'flat', value: 60, label: '৳60 OFF' },
  FIRSTORDER: { code: 'FIRSTORDER', type: 'flat', value: 100, label: '৳100 OFF' }
};

export default function CheckoutPage() {
  const { items, subtotal, totalItems, clearCart } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [customThana, setCustomThana] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'sslcommerz'>('cod');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AvailableCoupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Delivery calculation based on selected district
  const selectedDistrictData = district ? BANGLADESH_DISTRICTS[district] : null;
  const isDhaka = selectedDistrictData?.isDhaka ?? false;
  const deliveryCharge = district ? (isDhaka ? 80 : 130) : 0;

  // Coupon discount
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round(subtotal * (appliedCoupon.value / 100))
      : Math.min(appliedCoupon.value, subtotal)
    : 0;

  const totalPayable = Math.max(0, subtotal - discount + deliveryCharge);

  // Handle District Change
  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setThana('');
    setCustomThana('');
  };

  // Handle Coupon Apply
  const handleApplyCoupon = (codeToApply?: string) => {
    const rawCode = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError('');

    if (!rawCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const found = AVAILABLE_COUPONS[rawCode];
    if (found) {
      setAppliedCoupon(found);
      setCouponInput(found.code);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try RONG10, FREE60, or FIRSTORDER.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  // Form Submission
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/(^(?:\+?88)?01[3-9]\d{8}$)/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    if (!district) {
      setErrorMessage('Please select your District to calculate delivery charge.');
      return;
    }

    const resolvedThana = thana === 'Other' && customThana.trim() ? customThana.trim() : thana;
    if (!resolvedThana) {
      setErrorMessage('Please select your Thana / Upazila.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please enter your full delivery address.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add products before checking out.');
      return;
    }

    try {
      setIsSubmitting(true);
      const divisionName = isDhaka ? 'Dhaka' : 'Outside Dhaka';

      const orderPayload = {
        customerName: customerName.trim(),
        phone: cleanPhone,
        address: address.trim(),
        division: divisionName,
        district: district.trim(),
        area: resolvedThana.trim(),
        items: items.map(item => ({ id: item.id, quantity: item.quantity })),
        paymentMethod,
        note: note.trim()
      };

      const result = await api.createOrder(orderPayload);
      setConfirmedOrder(result);
      clearCart();
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const message = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 shadow-sm text-center max-w-xl w-full">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
            Order Placed Successfully!
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-4 mb-2">
            Thank you, {confirmedOrder.customerName}!
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6">
            Your order has been confirmed. Our team will contact your phone (<span className="font-semibold text-gray-900">{confirmedOrder.phone}</span>) before dispatching your package.
          </p>

          {/* Order Details Card */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 text-left space-y-3 mb-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500">Order Number</span>
              <span className="text-sm font-extrabold text-red-600 font-mono">{confirmedOrder.orderNumber}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500">Payment Method</span>
              <span className="text-xs font-bold text-gray-900 uppercase">
                {confirmedOrder.paymentMethod === 'bkash'
                  ? 'bKash Online Payment'
                  : confirmedOrder.paymentMethod === 'sslcommerz'
                  ? 'SSLCommerz (Cards & Online Banking)'
                  : 'Cash on Delivery (COD)'}
              </span>
            </div>

            <div className="flex justify-between items-start pb-2 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500 shrink-0">Delivery Address</span>
              <span className="text-xs font-medium text-gray-800 text-right max-w-[240px]">
                {confirmedOrder.address}, {confirmedOrder.area}, {confirmedOrder.district}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 text-sm font-black text-gray-900">
              <span>Total Payable Amount</span>
              <span className="text-red-600 text-lg">৳{confirmedOrder.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/track-order?orderNumber=${confirmedOrder.orderNumber}&phone=${confirmedOrder.phone}`}
              className="w-full sm:w-auto px-6 py-3 bg-[#d9383a] hover:bg-[#c32f31] text-white font-bold text-sm rounded-xl transition-all shadow-sm"
            >
              Track Order
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART VIEW
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#f8f7f4] flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm text-center max-w-lg w-full">
          <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
            Please add at least one product to your cart before proceeding to checkout.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#d9383a] hover:bg-[#c32f31] text-white font-bold text-sm rounded-2xl transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  // AVAILABLE THANAS FOR SELECTED DISTRICT
  const availableThanas = selectedDistrictData ? selectedDistrictData.thanas : [];

  return (
    <div className="min-h-screen bg-[#f8f7f4] py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/cart" className="hover:text-gray-900 transition-colors">
            Cart
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-900">Checkout</span>
        </nav>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Checkout Form & Order Summary Grid */}
        <form onSubmit={handleOrderSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* Left Column: Delivery Info & Payment Method (7 cols) */}
            <div className="lg:col-span-7 space-y-6">

              {/* CARD 1: 1. Delivery Information */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-gray-900">
                    1. Delivery Information
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Name & Phone in 2 cols on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Farhana Rahman"
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-red-500 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX (11 digits)"
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-red-500 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* District & Thana in 2 cols on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">
                        Select District <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-red-500 outline-none transition-all text-gray-800"
                      >
                        <option value="">-- Select District (64 Districts) --</option>
                        {ALL_DISTRICT_NAMES.map((name) => (
                          <option key={name} value={name}>
                            {name} {name === 'Dhaka' ? '(Inside Dhaka)' : ''}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Select district to view delivery charge
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1.5">
                        Thana / Upazila <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        disabled={!district}
                        value={thana}
                        onChange={(e) => setThana(e.target.value)}
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-red-500 outline-none transition-all disabled:opacity-50 text-gray-800"
                      >
                        <option value="">
                          {district ? '-- Select Thana / Upazila --' : '-- Select District First --'}
                        </option>
                        {availableThanas.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>

                      {thana === 'Other' && (
                        <input
                          type="text"
                          required
                          value={customThana}
                          onChange={(e) => setCustomThana(e.target.value)}
                          placeholder="Type your Thana / Upazila name"
                          className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-red-500 outline-none transition-all mt-2 placeholder:text-gray-400"
                        />
                      )}
                    </div>
                  </div>

                  {/* Full Delivery Address */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Full Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House number, road number, area or street details in full..."
                      className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-red-500 outline-none transition-all resize-none placeholder:text-gray-400"
                    />
                  </div>

                  {/* Special Note (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      Special Note or Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Deliver in the afternoon..."
                      className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-red-500 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: 2. Select Payment Method */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-gray-900">
                    2. Select Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-2 border-red-500 bg-red-50/20 shadow-2xs'
                        : 'border border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            paymentMethod === 'cod'
                              ? 'border-red-500 bg-red-500'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {paymentMethod === 'cod' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-bold text-gray-900">
                          Cash on Delivery (Cash on Delivery)
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Pay with cash after checking the product upon delivery.
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                      Popular
                    </span>
                  </label>

                  {/* bKash Payment */}
                  <label
                    onClick={() => setPaymentMethod('bkash')}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-2 border-pink-500 bg-pink-50/20 shadow-2xs'
                        : 'border border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            paymentMethod === 'bkash'
                              ? 'border-pink-500 bg-pink-500'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {paymentMethod === 'bkash' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-bold text-gray-900">
                          bKash Online Payment (bKash Payment)
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Pay securely and directly via official bKash gateway.
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full">
                      bKash
                    </span>
                  </label>

                  {/* SSLCommerz Payment (Cards, MFS & Net Banking) */}
                  <div
                    onClick={() => setPaymentMethod('sslcommerz')}
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${
                      paymentMethod === 'sslcommerz'
                        ? 'border-2 border-blue-600 bg-blue-50/25 shadow-2xs'
                        : 'border border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="pt-0.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              paymentMethod === 'sslcommerz'
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {paymentMethod === 'sslcommerz' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-bold text-gray-900">
                            SSLCommerz (Cards & Online Banking)
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Visa, MasterCard, Amex, Nagad, Rocket, Upay & Net Banking.
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                        SSLCommerz
                      </span>
                    </div>

                    {/* Channel Badges & Security Tag */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold tracking-wider">
                          VISA
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold tracking-wider">
                          MasterCard
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold tracking-wider">
                          AMEX
                        </span>
                        <span className="px-2 py-0.5 bg-[#f7941d]/15 text-[#f7941d] rounded text-[10px] font-bold">
                          Nagad
                        </span>
                        <span className="px-2 py-0.5 bg-[#8c3494]/15 text-[#8c3494] rounded text-[10px] font-bold">
                          Rocket
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">
                          Net Banking
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>128-bit SSL Secure</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Items & Order Summary (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-sm sticky top-24 space-y-5">

                {/* Header: Order Items (count) */}
                <div className="pb-3 border-b border-gray-100">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Order Items ({totalItems})
                  </h3>
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-50">
                  {items.map((item) => (
                    <div key={item.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Standard Pack × {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 shrink-0">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon & Discount Code Section */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Tag className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-bold text-gray-800">
                      Coupon & Discount Code
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. RONG10 or FREE60"
                      className="bg-gray-50/80 border border-gray-200 rounded-xl px-3 py-2 text-xs uppercase placeholder:normal-case placeholder:text-gray-400 focus:bg-white focus:border-red-500 outline-none flex-1 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-2xs"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[11px] text-red-500 font-medium mt-1.5">
                      {couponError}
                    </p>
                  )}

                  {appliedCoupon && (
                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-emerald-800">
                          {appliedCoupon.code} applied (-৳{discount.toLocaleString()})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Popular Coupons Row */}
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-gray-400 font-medium">Popular:</span>
                    {Object.values(AVAILABLE_COUPONS).map((coupon) => (
                      <button
                        key={coupon.code}
                        type="button"
                        onClick={() => handleApplyCoupon(coupon.code)}
                        className="px-2 py-0.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-md transition-colors"
                      >
                        {coupon.code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtotal, Delivery Fee & Grand Total */}
                <div className="pt-3 border-t border-gray-100 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-emerald-600 font-medium">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span className="font-bold">-৳{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Delivery Charge:</span>
                    {district ? (
                      <span className="font-bold text-gray-900">৳{deliveryCharge}</span>
                    ) : (
                      <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                        Select District
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-base sm:text-lg font-extrabold text-gray-900 block leading-tight">
                          Total Payable:
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">
                          {district
                            ? `(Estimated delivery: ${isDhaka ? '24-48 Hours' : '2-3 Business Days'})`
                            : '(Delivery charge will be added after selecting district)'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-black text-red-600 leading-none">
                          ৳{totalPayable.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big Order Now Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#d9383a] hover:bg-[#c32f31] disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-base sm:text-lg shadow-sm hover:shadow-md flex items-center justify-center gap-2.5 transition-all mt-6 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>
                        {paymentMethod === 'bkash'
                          ? 'Pay with bKash'
                          : paymentMethod === 'sslcommerz'
                          ? 'Pay via SSLCommerz'
                          : 'Order Now'}
                      </span>
                    </>
                  )}
                </button>

                {/* Reassurance Footer */}
                <div className="pt-2 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {paymentMethod === 'cod'
                        ? 'No advance payment required'
                        : '100% Safe & Encrypted Payment'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {paymentMethod === 'cod'
                      ? 'Pay only after receiving and checking your product with the delivery agent.'
                      : 'Your transaction is processed through PCI-DSS compliant secure servers.'}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
