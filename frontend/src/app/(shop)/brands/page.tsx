import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BrandsDirectoryClient } from '@/components/shop/BrandsDirectoryClient';
import { Home, ChevronRight, Tag, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Brands | MaxiTShop Bangladesh',
  description: 'Explore all official brands and manufacturers available at MaxiTShop Bangladesh.',
};

export default async function BrandsDirectoryPage() {
  const brands = await api.getAllBrands().catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 mb-5 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">All Brands</span>
      </nav>

      {/* Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#FF6600] text-xs font-bold mb-3">
            <Tag className="w-3.5 h-3.5" />
            <span>Official Brand Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Shop by Brand
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Browse all certified manufacturers, solar equipment brands, industrial automation suppliers, and electronics brands available in our catalog.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700">
          <Sparkles className="w-4 h-4 text-[#FF6600]" />
          <div>
            <p className="font-bold text-slate-900">{brands.length.toLocaleString()} Active Brands</p>
            <p className="text-[11px] text-slate-500">100% Authentic Products</p>
          </div>
        </div>
      </div>

      <BrandsDirectoryClient brands={brands} />
    </div>
  );
}
