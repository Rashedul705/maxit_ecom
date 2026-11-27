'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Brand } from '@/lib/types';
import { Tag, Search, ArrowRight } from 'lucide-react';

interface BrandsDirectoryClientProps {
  brands: Brand[];
}

export const BrandsDirectoryClient: React.FC<BrandsDirectoryClientProps> = ({ brands }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter(b => b.name.toLowerCase().includes(q));
  }, [brands, query]);

  return (
    <div className="space-y-5">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand name (e.g. Oraimo, EcoFlow, Hikvision, TP-Link...)"
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#FF6600] focus:bg-white transition-colors"
          />
        </div>
        <div className="text-xs font-semibold text-gray-500">
          Showing <span className="font-extrabold text-gray-900">{filtered.length}</span> of{' '}
          <span className="font-extrabold text-gray-900">{brands.length}</span> brands
        </div>
      </div>

      {/* Brands Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-sm text-gray-500">
          No brands matching &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filtered.map((brand) => (
            <Link
              key={brand.id || brand.slug}
              href={`/brand/${encodeURIComponent(brand.slug)}`}
              className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-[#FF6600] hover:shadow-md transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      unoptimized
                      sizes="40px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <Tag className="w-4 h-4 text-gray-400 group-hover:text-[#FF6600] transition-colors" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#FF6600] truncate transition-colors">
                    {brand.name}
                  </h3>
                  {typeof brand.productCount === 'number' && (
                    <p className="text-[11px] text-gray-500">
                      {brand.productCount} {brand.productCount === 1 ? 'Product' : 'Products'}
                    </p>
                  )}
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#FF6600] shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
