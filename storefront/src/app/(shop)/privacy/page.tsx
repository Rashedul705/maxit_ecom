import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Home, ChevronRight, FileText, ShieldCheck, Clock } from 'lucide-react';

export const revalidate = 0;

export const metadata = {
  title: 'Privacy Policy | MaxiTShop Bangladesh',
  description: 'How MaxiTShop collects, protects, and respects customer personal information.',
};

export default async function PrivacyPage() {
  let title = 'Privacy Policy';
  let content = `### 1. Information We Collect
When placing an order with MaxiTShop, we collect your name, phone number, shipping address, and delivery instructions. This information is strictly used for order fulfillment, courier delivery, and customer service.

### 2. Data Security & Protection
We use industry-standard encryption protocols. We will never sell, rent, or lease customer contact lists or transaction histories to third-party advertisers.

### 3. Cookies & Session Storage
We store items placed in your shopping cart locally on your web browser (via localStorage) to ensure an uninterrupted guest browsing and shopping experience.`;

  try {
    const page = await api.getPage('privacy-policy');
    if (page && page.content && page.content.trim()) {
      title = page.title || title;
      content = page.content;
    } else {
      const settings = await api.getSettings();
      if (settings?.policies?.privacy) {
        content = settings.policies.privacy;
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
