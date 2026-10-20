import React from 'react';
import { ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'About Us | maxitshop Bangladesh',
  description: 'Learn about maxitshop, the leading online e-commerce destination in Bangladesh for green energy, solar, laptops, and gadgets.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <h1 className="text-3xl font-black text-slate-900 mb-4">About maxitshop</h1>
        <p className="text-slate-600 leading-relaxed text-sm mb-4">
          maxitshop is a modern, high-tech e-commerce platform founded with a mission to deliver top-tier consumer electronics, genuine flagship laptops, mobile smartphones, and renewable solar power solutions to consumers and businesses across Bangladesh.
        </p>
        <p className="text-slate-600 leading-relaxed text-sm mb-6">
          Inspired by the best practices of Bangladesh&apos;s leading retailers like BDShop, we focus on 100% genuine sourcing, honest warranty support, cash on delivery convenience, and swift fulfillment across all 64 districts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">100% Authentic Guarantee</h3>
              <p className="text-xs text-slate-500">Every product comes with official distributor verification.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Doorstep Cash on Delivery</h3>
              <p className="text-xs text-slate-500">Inspect the packaging before completing payment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
