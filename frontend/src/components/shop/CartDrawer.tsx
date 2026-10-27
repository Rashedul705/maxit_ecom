'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeCart}
      />

      {/* Centered Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                Shopping Cart
              </h2>
              <p className="text-xs text-gray-400">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-gray-400 hover:text-red-500 font-medium px-2 py-1 rounded transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">
                Your cart is empty
              </h3>
              <p className="text-xs text-gray-500 mb-5 max-w-xs">
                You haven&apos;t added any products to your shopping cart yet.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="px-6 py-2.5 bg-[#d9383a] hover:bg-[#c32f31] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3">
                {/* Thumbnail */}
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-amber-50/40 border border-amber-100/70 overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="72px"
                    className="object-contain p-1"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="text-xs sm:text-sm font-bold text-gray-900 hover:text-red-600 line-clamp-1 transition-colors"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Unit: <span className="font-semibold text-gray-700">৳{item.price.toLocaleString()}</span>
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Stepper */}
                    <div className="inline-flex items-center border border-gray-200 rounded-full bg-white px-1 py-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Total & Delete */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-red-600">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer with Actions */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-gray-50/80 border-t border-gray-100 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-bold text-gray-900">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span className="text-gray-500 font-medium">Calculated at checkout</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-gray-900">
                <span>Total Amount:</span>
                <span className="text-red-600 text-base">৳{subtotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Two Action Buttons: View Full Cart & Directly Proceed to Dedicated Checkout */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl text-center transition-colors shadow-2xs flex items-center justify-center"
              >
                View Full Cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3 bg-[#d9383a] hover:bg-[#c32f31] text-white font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash on delivery available nationwide</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
