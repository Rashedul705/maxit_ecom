import React from 'react';
import { Truck, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Shipping and Returns | MaxiTShop Bangladesh',
  description: 'Shipping rates, delivery schedules, and 7-day return guidelines for MaxiTShop customers in Bangladesh.',
};

export default function ShippingReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Shipping & Returns Policy</h1>
          <p className="text-xs text-slate-500">Last updated: October 2026</p>
        </div>

        {/* Shipping Rates */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
            <Truck className="w-5 h-5" />
            <h2>Delivery Charges & Timelines</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Inside Dhaka City</span>
              <p className="text-lg font-black text-blue-600 mt-1">৳80 BDT</p>
              <p className="text-xs text-slate-600 mt-1">Delivered within 24 to 48 hours to your home or office address.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Outside Dhaka (All BD Districts)</span>
              <p className="text-lg font-black text-blue-600 mt-1">৳130 BDT</p>
              <p className="text-xs text-slate-600 mt-1">Delivered within 48 to 72 hours via reputed courier partners (Pathao, Steadfast, RedX).</p>
            </div>
          </div>
        </div>

        {/* Returns */}
        <div id="returns" className="pt-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-orange-600 font-bold text-base">
            <RotateCcw className="w-5 h-5" />
            <h2>7-Day Replacement Guarantee</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Customers have the right to request a replacement within 7 calendar days of delivery if:
          </p>
          <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
            <li>The product received has a hardware defect or technical malfunction.</li>
            <li>The product physically arrived damaged or broken.</li>
            <li>The item delivered is completely different from what was ordered.</li>
            <li>Key accessories or parts listed on the product specifications are missing.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
