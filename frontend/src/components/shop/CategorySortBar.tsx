'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

interface CategorySortBarProps {
  total: number;
}

export const CategorySortBar: React.FC<CategorySortBarProps> = ({ total }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="text-xs sm:text-sm text-gray-600 font-medium">
        Showing <span className="font-extrabold text-gray-900">{total}</span> items found
      </div>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-3.5 h-3.5 text-[#FF6600]" />
        <label htmlFor="sort-select" className="text-xs font-semibold text-gray-600">
          Sort by:
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleSortChange}
          className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-gray-800 focus:outline-hidden focus:border-[#FF6600] focus:bg-white transition-colors cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="popular">Popular / Best Selling</option>
          <option value="rating">Top Rated</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};
