import React from 'react';

export const metadata = {
  title: 'Terms and Conditions | MaxiTShop Bangladesh',
  description: 'Terms of service, warranty conditions, and purchase guidelines for MaxiTShop customers in Bangladesh.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Terms and Conditions</h1>
        <p className="text-xs text-slate-500 mb-6">Effective Date: October 2026</p>

        <h3 className="text-sm font-bold text-slate-900">1. Acceptance of Terms</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          By accessing maxitshop.com or submitting an order through our checkout, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.
        </p>

        <h3 className="text-sm font-bold text-slate-900">2. Cash on Delivery (COD) Commitment</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          When placing a COD order, you agree to receive the parcel from the courier rider and pay the specified invoice amount in Bangladeshi Taka (৳). Fraudulent or arbitrary order refusals cause severe logistics penalties.
        </p>

        <h3 className="text-sm font-bold text-slate-900">3. Warranty & Defect Claims</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Official manufacturer warranties apply to all eligible solar equipment, laptops, smartphones, and branded accessories. Claims must be submitted with original packaging and invoice.
        </p>
      </div>
    </div>
  );
}
