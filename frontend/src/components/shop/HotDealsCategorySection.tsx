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

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {products.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
