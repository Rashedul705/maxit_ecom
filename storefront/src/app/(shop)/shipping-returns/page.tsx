import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Truck, RotateCcw, Home, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const revalidate = 0;

export const metadata = {
  title: 'Shipping and Returns | MaxiTShop Bangladesh',
  description: 'Shipping rates, delivery schedules, and 7-day return guidelines for MaxiTShop customers in Bangladesh.',
};

export default async function ShippingReturnsPage() {
  let insideDhaka = 70;
  let outsideDhaka = 130;
  let insideTime = '24 - 48 Hours';
  let outsideTime = '48 - 72 Hours';
  let freeThreshold = 0;

  try {
    const settings = await api.getSettings();
    if (settings?.deliveryRates) {
      insideDhaka = Number(settings.deliveryRates.insideDhaka ?? insideDhaka);
      outsideDhaka = Number(settings.deliveryRates.outsideDhaka ?? outsideDhaka);
      insideTime = settings.deliveryRates.insideDhakaTime || insideTime;
      outsideTime = settings.deliveryRates.outsideDhakaTime || outsideTime;
      freeThreshold = Number(settings.deliveryRates.freeDeliveryThreshold ?? 0);
    }
  } catch (e) {
    // Keep defaults
  }

  let returnContent = `### 7-Day Replacement Guarantee
Customers have the right to request a replacement within 7 calendar days of delivery if:
- The product received has a hardware defect or technical malfunction.
- The product physically arrived damaged or broken.
- The item delivered is completely different from what was ordered.
- Key accessories or parts listed on the product specifications are missing.`;

  try {
    const returnPage = await api.getPage('return-policy');
    if (returnPage && returnPage.content && returnPage.content.trim()) {
      returnContent = returnPage.content;
    }
  } catch (e) {
    // Keep default
  }

  const isReturnHtml = returnContent.includes('<') && returnContent.includes('>');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">Shipping & Returns</span>
      </nav>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Shipping & Returns Policy</h1>
          <p className="text-xs text-slate-500">Official MaxiTShop Logistics and After-Sales Guidelines</p>
        </div>

        {/* Free Shipping Alert if configured */}
        {freeThreshold > 0 && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-semibold">
            <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Nationwide Free Delivery available on all orders over ৳{freeThreshold.toLocaleString()}!</span>
          </div>
        )}

        {/* Dynamic Delivery Rates & Timelines */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
            <Truck className="w-5 h-5" />
            <h2>Delivery Charges & Timelines</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inside Dhaka City</span>
              <p className="text-2xl font-black text-blue-600 mt-1.5">৳{insideDhaka}</p>
              <p className="text-xs text-slate-600 mt-1 font-medium">Delivered within {insideTime} to your doorstep.</p>
            </div>

            <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outside Dhaka (All 64 Districts)</span>
              <p className="text-2xl font-black text-blue-600 mt-1.5">৳{outsideDhaka}</p>
              <p className="text-xs text-slate-600 mt-1 font-medium">Delivered within {outsideTime} via Steadfast, Sundarban, or SA Paribahan.</p>
            </div>
          </div>
        </div>

        {/* Returns */}
        <div id="returns" className="pt-8 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2 text-orange-600 font-bold text-base">
            <RotateCcw className="w-5 h-5" />
            <h2>Return & Replacement Policy</h2>
          </div>

          <div className="prose prose-sm sm:prose max-w-none text-slate-700 leading-relaxed font-normal">
            {isReturnHtml ? (
              <div dangerouslySetInnerHTML={{ __html: returnContent }} />
            ) : (
              <div className="whitespace-pre-line space-y-2">{returnContent}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
