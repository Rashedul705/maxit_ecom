import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ShieldCheck, Truck, Home, ChevronRight, Award, Zap } from 'lucide-react';

export const revalidate = 0;

export const metadata = {
  title: 'About Us | MaxiTShop Bangladesh',
  description: 'Learn about MaxiTShop, the leading online e-commerce destination in Bangladesh for green energy, solar, laptops, and gadgets.',
};

export default async function AboutPage() {
  let title = 'About MaxiTShop';
  let content = `MaxiTShop is a modern, high-tech e-commerce platform founded with a mission to deliver top-tier consumer electronics, genuine flagship laptops, mobile smartphones, and renewable solar power solutions to consumers and businesses across Bangladesh.

Inspired by the best practices of Bangladesh's leading retailers, we focus on 100% genuine sourcing, honest warranty support, cash on delivery convenience, and swift fulfillment across all 64 districts.`;

  try {
    const page = await api.getPage('about-us');
    if (page && page.content && page.content.trim()) {
      title = page.title || title;
      content = page.content;
    } else {
      const settings = await api.getSettings();
      if (settings?.footer?.aboutText) {
        content = settings.footer.aboutText;
      }
    }
  } catch (e) {
    // Keep defaults
  }

  const isHtml = content.includes('<') && content.includes('>');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">{title}</span>
      </nav>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
        <h1 className="text-3xl font-black text-slate-900 mb-2">{title}</h1>

        <div className="prose prose-sm sm:prose max-w-none text-slate-600 leading-relaxed font-normal">
          {isHtml ? (
            <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <div className="whitespace-pre-line space-y-4">{content}</div>
          )}
        </div>

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
