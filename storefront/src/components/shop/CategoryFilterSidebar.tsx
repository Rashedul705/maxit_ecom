'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, RotateCcw, Check, Tag } from 'lucide-react';

interface CategoryFilterSidebarProps {
  availableBrands?: string[];
  currentCategory?: string;
}

const quickPriceRanges = [
  { label: 'Under ৳1,000', min: '', max: '1000' },
  { label: '৳1k - ৳5k', min: '1000', max: '5000' },
  { label: '৳5k - ৳15k', min: '5000', max: '15000' },
  { label: 'Above ৳15k', min: '15000', max: '' }
];

export const CategoryFilterSidebar: React.FC<CategoryFilterSidebarProps> = ({
  availableBrands = [],
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentBrand = searchParams.get('brand') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentInStock = searchParams.get('inStock') === 'true';

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  useEffect(() => {
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const applyFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset to page 1 on filter change
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBrandToggle = (brand: string) => {
    const brands = currentBrand ? currentBrand.split(',') : [];
    const index = brands.indexOf(brand);
    if (index > -1) {
      brands.splice(index, 1);
    } else {
      brands.push(brand);
    }
    applyFilters({ brand: brands.length > 0 ? brands.join(',') : null });
  };

  const handleInStockToggle = () => {
    applyFilters({ inStock: currentInStock ? null : 'true' });
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null
    });
  };

  const handleQuickPrice = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    applyFilters({
      minPrice: min || null,
      maxPrice: max || null
    });
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('brand');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('inStock');
    params.delete('page');
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const hasActiveFilters = Boolean(currentBrand || currentMinPrice || currentMaxPrice || currentInStock);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-6 shadow-xs">
      
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#FF6600]" />
          <h3 className="text-sm font-black text-gray-900 tracking-tight">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-bold text-[#FF6600] hover:text-[#e55c00] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Availability / In Stock Toggle */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">
          Availability
        </h4>
        <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 hover:text-gray-900 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={handleInStockToggle}
            className="rounded border-gray-300 text-[#FF6600] focus:ring-[#FF6600] h-4 w-4 cursor-pointer"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Price Range Filter */}
      <div className="pt-2 border-t border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">
          Price Range (৳)
        </h4>

        {/* Quick Range Pills */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {quickPriceRanges.map((range, idx) => {
            const isActive = currentMinPrice === range.min && currentMaxPrice === range.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrice(range.min, range.max)}
                className={`py-1 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer text-center ${
                  isActive
                    ? 'bg-orange-50 border-[#FF6600] text-[#FF6600]'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max Inputs */}
        <form onSubmit={handlePriceApply} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min ৳"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#FF6600] focus:bg-white transition-colors"
            />
            <span className="text-xs text-gray-400 font-bold">-</span>
            <input
              type="number"
              placeholder="Max ৳"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#FF6600] focus:bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Brand Checklist */}
      {availableBrands.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Brands</span>
            <span className="text-gray-400 font-normal">({availableBrands.length})</span>
          </h4>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {availableBrands.map((brand) => {
              const isChecked = currentBrand.split(',').includes(brand);
              return (
                <label
                  key={brand}
                  className="flex items-center gap-2.5 text-xs text-gray-700 hover:text-gray-900 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandToggle(brand)}
                    className="rounded border-gray-300 text-[#FF6600] focus:ring-[#FF6600] h-3.5 w-3.5 cursor-pointer"
                  />
                  <span className="font-medium">{brand}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
