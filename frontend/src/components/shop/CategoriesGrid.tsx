'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/lib/types';
import { Layers } from 'lucide-react';

interface CategoriesGridProps {
  categories: Category[];
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
        <div className="w-1.5 h-5 bg-[#FF6600] rounded-full" />
        <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">
          Categories
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-[#FF6600] hover:shadow-md transition-all text-center"
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-2.5 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <Layers className="w-8 h-8 text-[#FF6600]" />
              )}
            </div>
            <span className="text-xs sm:text-[13px] font-bold text-gray-800 group-hover:text-[#FF6600] line-clamp-1 transition-colors">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
