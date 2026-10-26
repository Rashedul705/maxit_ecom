import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Truck, ShoppingBag, Home, Phone } from 'lucide-react';

interface OrderSuccessPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderId } = await params;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 shadow-sm space-y-6">
        {/* Animated Check Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Order Placed Successfully
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3 mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
            Your order has been recorded. Our customer service team will call your mobile number to confirm parcel dispatch.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-w-sm mx-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Your Order Tracking ID
          </span>
          <span className="font-mono text-xl font-black text-[#FF6600]">
            {orderId}
          </span>
        </div>

        {/* Delivery Timeline info */}
        <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-3.5 text-xs text-left text-gray-700 space-y-1">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <Truck className="w-4 h-4 text-[#FF6600]" />
            <span>Estimated Delivery Schedule</span>
          </div>
          <p className="text-gray-600 pl-6">
            • Inside Dhaka: <strong>24 – 48 Hours</strong><br />
            • Outside Dhaka (All Districts): <strong>2 – 4 Days</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/customer/order-track?q=${orderId}`}
            className="flex-1 py-3 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Now</span>
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="pt-2 text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          <span>Hotline Support: +880 1711-000000 (9 AM - 10 PM)</span>
        </div>
      </div>
    </div>
  );
}
