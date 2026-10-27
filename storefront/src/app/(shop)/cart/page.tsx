'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cartContext';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Tag,
  CheckCircle2,
  ShieldCheck,
  Percent
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

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal, totalItems } = useCart();

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AvailableCoupon | null>(null);
  const [couponError, setCouponError] = useState('');

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

  // Discount computation
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round(subtotal * (appliedCoupon.value / 100))
      : Math.min(appliedCoupon.value, subtotal)
    : 0;

  const finalPayable = Math.max(0, subtotal - discount);

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
            You haven't added any products to your shopping cart yet. Browse our top electronics, solar gear, and gadgets to start shopping!
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

  return (
    <div className="min-h-screen bg-[#f8f7f4] py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-900">Shopping Cart</span>
        </nav>

        {/* Header row */}
        <div className="flex items-center justify-between pb-6 mb-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Your Cart <span className="text-gray-500 font-semibold text-lg sm:text-2xl">({totalItems} {totalItems === 1 ? 'Item' : 'Items'})</span>
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-600 transition-colors group"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Main Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Left Column: Items List (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-sm">
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="py-5 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Product Image & Details */}
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-50/40 border border-amber-100/70 overflow-hidden shrink-0 flex items-center justify-center p-1.5">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="96px"
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-sm sm:text-base font-bold text-gray-900 hover:text-red-600 line-clamp-2 transition-colors leading-snug"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-rose-500 font-medium mt-1">
                          Standard Pack × {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          ৳{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Stepper, Trash, Line Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                      {/* Quantity Stepper Pill */}
                      <div className="inline-flex items-center border border-gray-200 rounded-full bg-white px-1 py-0.5 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right min-w-[90px]">
                        <span className="text-base sm:text-lg font-black text-red-600">
                          ৳{lineTotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Trash Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear Cart Button */}
            <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Items</span>
              </button>
            </div>
          </div>

          {/* Right Column: Coupon & Order Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Card 1: Coupon & Discount Code */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-red-500" />
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Coupon & Discount Code
                </h2>
              </div>

              {/* Coupon Input + Apply Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="e.g. RONG10 or FREE60"
                  className="bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm uppercase placeholder:normal-case placeholder:text-gray-400 focus:bg-white focus:border-red-500 outline-none flex-1 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-2xs"
                >
                  Apply
                </button>
              </div>

              {/* Coupon Error */}
              {couponError && (
                <p className="text-xs text-red-500 font-medium mt-2">
                  {couponError}
                </p>
              )}

              {/* Applied Coupon Info */}
              {appliedCoupon && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">
                        {appliedCoupon.code} applied ({appliedCoupon.label})
                      </p>
                      <p className="text-[11px] text-emerald-600">
                        You saved ৳{discount.toLocaleString()}!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Popular Coupons Row */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium">Popular Coupons:</p>
                <div className="flex flex-wrap items-center gap-2">
                  {Object.values(AVAILABLE_COUPONS).map((coupon) => (
                    <button
                      key={coupon.code}
                      type="button"
                      onClick={() => handleApplyCoupon(coupon.code)}
                      className="px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors cursor-pointer"
                    >
                      {coupon.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2: Order Summary */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 pb-4 border-b border-gray-100 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                {/* Items Total */}
                <div className="flex items-center justify-between text-gray-600">
                  <span>Items Total:</span>
                  <span className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</span>
                </div>

                {/* Coupon Discount */}
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      Coupon Discount ({appliedCoupon.code}):
                    </span>
                    <span className="font-bold">-৳{discount.toLocaleString()}</span>
                  </div>
                )}

                {/* Delivery Charge */}
                <div className="flex items-center justify-between text-gray-600">
                  <span>Delivery Charge:</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
                    Calculated at checkout
                  </span>
                </div>

                {/* Divider */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-base sm:text-lg font-extrabold text-gray-900 block leading-tight">
                        Total Payable:
                      </span>
                      <span className="text-xs text-gray-400 mt-0.5 block">
                        (Delivery charge calculated at checkout)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-black text-red-600 leading-none">
                        ৳{finalPayable.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <Link
                href="/checkout"
                className="w-full bg-[#d9383a] hover:bg-[#c32f31] active:scale-[0.99] text-white py-3.5 rounded-2xl font-bold text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2.5 transition-all mt-6"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Proceed to Checkout</span>
              </Link>

              {/* Reassurance Badge */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-600 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Complete order without any advance payment</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
