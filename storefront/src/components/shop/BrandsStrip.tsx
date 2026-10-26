'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Brand } from '@/lib/types';
import { Tag } from 'lucide-react';

interface BrandsStripProps {
  brands: Brand[];
}

export const BrandsStrip: React.FC<BrandsStripProps> = ({ brands }) => {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
        <div className="w-1.5 h-5 bg-[#FF6600] rounded-full" />
        <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">
          Brands
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brand/${brand.slug}`}
            className="group flex flex-col items-center justify-center p-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#FF6600] hover:shadow-md transition-all text-center aspect-square"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 mb-1.5 flex items-center justify-center">
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1 group-hover:scale-105 transition-transform"
                />
              ) : (
                <Tag className="w-6 h-6 text-gray-400 group-hover:text-[#FF6600]" />
              )}
            </div>
            <span className="text-[11px] font-bold text-gray-700 group-hover:text-[#FF6600] line-clamp-1 transition-colors">
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
