'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
    cartView,
    setCartView
  } = useCart();

  // Express Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryRegion, setDeliveryRegion] = useState<'dhaka' | 'outside'>('dhaka');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isCartOpen) return null;

  const deliveryCharge = deliveryRegion === 'dhaka' ? 80 : 130;
  const grandTotal = subtotal + deliveryCharge;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('Please provide your name, phone number, and delivery address.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!/(^(?:\+?88)?01[3-9]\d{8}$)/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        customerName: customerName.trim(),
        phone: cleanPhone,
        address: address.trim(),
        division: deliveryRegion === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
        district: deliveryRegion === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
        area: deliveryRegion === 'dhaka' ? 'Dhaka City' : 'Nationwide',
        items: items.map(item => ({ id: item.id, quantity: item.quantity })),
        paymentMethod: 'cod',
        note: note.trim()
      };

      const result = await api.createOrder(payload);
      setConfirmedOrder(result);
      clearCart();
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to submit order. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetModal = () => {
    setConfirmedOrder(null);
    setCartView('cart');
    closeCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={handleResetModal}
      />

      {/* Centered Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* ================= SUCCESS CONFIRMATION VIEW ================= */}
        {confirmedOrder ? (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Order Placed Successfully!
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 mb-1">
              Thank you, {confirmedOrder.customerName}!
            </h2>

            <p className="text-xs text-slate-500 mb-5 max-w-sm">
              Your order has been recorded. Our team will call you at{' '}
              <span className="font-semibold text-slate-800">{confirmedOrder.phone}</span> to verify delivery.
            </p>

            <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Order Number</span>
                <span className="font-mono font-bold text-blue-600">{confirmedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Payment Method</span>
                <span className="font-semibold text-slate-800">Cash on Delivery (COD)</span>
              </div>
              <div className="flex justify-between items-center pt-1 font-bold">
                <span className="text-slate-700">Total Payable</span>
                <span className="text-sm font-black text-slate-900">৳{confirmedOrder.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetModal}
              className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm rounded-xl transition-colors shadow-md cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : cartView === 'checkout' ? (
          /* ================= EXPRESS CHECKOUT VIEW (CENTERED) ================= */
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCartView('cart')}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Back to Cart"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-bold leading-tight">Express Checkout</h2>
                  <p className="text-[11px] text-slate-400">Cash on Delivery</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCheckoutSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              {/* Delivery Region Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Delivery Location <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryRegion('dhaka')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryRegion === 'dhaka'
                        ? 'border-[#DC2626] bg-red-50/50 text-[#DC2626] shadow-2xs font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span>Inside Dhaka</span>
                      <span className="font-extrabold">৳80</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">24-48 Hours</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryRegion('outside')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryRegion === 'outside'
                        ? 'border-[#DC2626] bg-red-50/50 text-[#DC2626] shadow-2xs font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span>Outside Dhaka</span>
                      <span className="font-extrabold">৳130</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">2-3 Business Days</p>
                  </button>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House #, Road #, Area, District"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#DC2626]"
                />
              </div>

              {/* Optional Order Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Order Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Any special instructions..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Order Summary Box */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items ({totalItems})</span>
                  <span className="font-semibold text-slate-800">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-slate-800">৳{deliveryCharge}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Payable (COD)</span>
                  <span className="text-[#DC2626]">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Order (৳{grandTotal.toLocaleString()})</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  Or open full dedicated checkout page →
                </Link>
              </div>
            </form>
          </div>
        ) : (
          /* ================= SHOPPING CART VIEW (CENTERED) ================= */
          <div className="flex flex-col h-full max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold">Shopping Cart ({totalItems})</h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close cart modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base mb-1">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-xs">
                    You haven&apos;t added any products to your order yet.
                  </p>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="py-3 flex gap-3 group items-center">
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-200">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-1">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-xs font-bold text-slate-800 line-clamp-2 hover:text-[#DC2626] transition-colors"
                        >
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-extrabold text-[#DC2626]">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </span>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-slate-400 font-medium">
                              ৳{item.price.toLocaleString()} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer with Actions */}
            {items.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charge</span>
                    <span className="text-slate-500 font-medium">৳80 (Dhaka) / ৳130 (Outside)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Est. Subtotal</span>
                    <span className="text-[#DC2626]">৳{subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl text-center transition-colors shadow-2xs"
                  >
                    View Full Cart
                  </Link>
                  <button
                    type="button"
                    onClick={() => setCartView('checkout')}
                    className="w-full py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
