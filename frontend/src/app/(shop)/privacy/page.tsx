import React from 'react';

export const metadata = {
  title: 'Privacy Policy | MaxiTShop Bangladesh',
  description: 'How MaxiTShop collects, protects, and respects customer personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mb-6">Effective Date: October 2026</p>

        <h3 className="text-sm font-bold text-slate-900">1. Information We Collect</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          When placing an order with maxitshop, we collect your name, phone number, shipping address, and delivery instructions. This information is strictly used for order fulfillment, courier delivery, and customer service.
        </p>

        <h3 className="text-sm font-bold text-slate-900">2. Data Security & Protection</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          We use industry-standard encryption protocols. We will never sell, rent, or lease customer contact lists or transaction histories to third-party advertisers.
        </p>

        <h3 className="text-sm font-bold text-slate-900">3. Cookies & Session Storage</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          We store items placed in your shopping cart locally on your web browser (via localStorage) to ensure an uninterrupted guest browsing and shopping experience.
        </p>
      </div>
    </div>
  );
}
