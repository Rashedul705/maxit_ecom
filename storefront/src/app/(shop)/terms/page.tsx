import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Home, ChevronRight, FileText, ShieldCheck, Clock } from 'lucide-react';

export const revalidate = 0;

export const metadata = {
  title: 'Terms and Conditions | MaxiTShop Bangladesh',
  description: 'Terms of service, warranty conditions, and purchase guidelines for MaxiTShop customers in Bangladesh.',
};

export default async function TermsPage() {
  let title = 'Terms and Conditions';
  let content = `### 1. Acceptance of Terms
By accessing maxitshop.com or submitting an order through our checkout, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.

### 2. Cash on Delivery (COD) Commitment
When placing a COD order, you agree to receive the parcel from the courier rider and pay the specified invoice amount in Bangladeshi Taka (৳). Fraudulent or arbitrary order refusals cause severe logistics penalties.

### 3. Warranty & Defect Claims
Official manufacturer warranties apply to all eligible solar equipment, batteries, inverters, and branded accessories. Claims must be submitted with original packaging and invoice.`;

  try {
    const page = await api.getPage('terms-conditions');
    if (page && page.content && page.content.trim()) {
      title = page.title || title;
      content = page.content;
    } else {
      const settings = await api.getSettings();
      if (settings?.policies?.terms) {
        content = settings.policies.terms;
      }
    }
  } catch (err) {
    // Keep default content
  }

  const isHtml = content.includes('<') && content.includes('>');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 mb-6 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">{title}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-4">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6600] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{title}</h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Official MaxiTShop Policy</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Updated 2026
              </span>
            </div>
          </div>
        </div>

        <div className="prose prose-sm sm:prose max-w-none text-slate-700 leading-relaxed font-normal">
          {isHtml ? (
            <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <div className="whitespace-pre-line space-y-3">{content}</div>
          )}
        </div>
      </div>
    </div>
  );
}
