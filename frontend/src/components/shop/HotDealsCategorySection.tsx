'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Flame } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Category, Product } from '@/lib/types';

interface CategoryProductsGroup {
  category: Category;
  products: Product[];
}

interface HotDealsCategorySectionProps {
  groups: CategoryProductsGroup[];
}

export const HotDealsCategorySection: React.FC<HotDealsCategorySectionProps> = ({ groups }) => {
  if (!groups || groups.length === 0) return null;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 py-2 sm:py-4">
      {groups.map(({ category, products }) => {
        if (!products || products.length === 0) return null;

        return (
          <section key={category.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-xs">
            {/* Section Header: Category Name + View More */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-5 bg-[#FF6600] rounded-full" />
                <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                  <span>{category.name}</span>
                </h2>
              </div>

              <Link
                href={`/category/${category.slug}`}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#FF6600] hover:text-[#e55c00] transition-colors"
              >
                <span>View More</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Products Grid: 4 per row on desktop, 3 on tablet, 2 on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Bottom View More Button */}
            <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-center">
              <Link
                href={`/category/${category.slug}`}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl border border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600] hover:text-white text-xs sm:text-sm font-bold transition-all shadow-2xs group"
              >
                <span>View More {category.name}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </section>
        );
      })}
    </div>
  );
};
