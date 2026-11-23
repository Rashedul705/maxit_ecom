'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, RotateCcw, Check, Tag, X, ChevronRight, SlidersHorizontal } from 'lucide-react';

export interface SubcategoryItem {
  id?: string;
  name: string;
  slug: string;
  productCount?: number;
}

interface CategoryFilterSidebarProps {
  availableBrands?: string[];
  currentCategory?: string;
  subcategories?: SubcategoryItem[];
  isMother?: boolean;
  categoryName?: string;
}

const quickPriceRanges = [
  { label: 'Under ৳1,000', min: '', max: '1000' },
  { label: '৳1k - ৳5k', min: '1000', max: '5000' },
  { label: '৳5k - ৳15k', min: '5000', max: '15000' },
  { label: 'Above ৳15k', min: '15000', max: '' }
];

export const CategoryFilterSidebar: React.FC<CategoryFilterSidebarProps> = ({
  availableBrands = [],
  currentCategory = '',
  subcategories = [],
  isMother = false,
  categoryName = ''
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentBrand = searchParams.get('brand') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentInStock = searchParams.get('inStock') === 'true';
  const currentSub = searchParams.get('sub') || '';

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [subSearch, setSubSearch] = useState('');

  useEffect(() => {
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

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

  const handleSubToggle = (subSlug: string) => {
    if (isMother) {
      setMobileDrawerOpen(false);
      router.push(`/category/${subSlug}`);
      return;
    }
    if (currentSub === subSlug) {
      applyFilters({ sub: null });
    } else {
      applyFilters({ sub: subSlug });
    }
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
    params.delete('sub');
    params.delete('page');
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const activeSubItem = subcategories.find(s => s.slug === currentSub || s.id === currentSub);

  let activeFilterCount = 0;
  if (currentSub) activeFilterCount += 1;
  if (currentBrand) activeFilterCount += currentBrand.split(',').length;
  if (currentMinPrice || currentMaxPrice) activeFilterCount += 1;
  if (currentInStock) activeFilterCount += 1;

  const hasActiveFilters = activeFilterCount > 0;

  // Filter subcategories list by search if long
  const filteredSubcategories = subSearch.trim()
    ? subcategories.filter(s => s.name.toLowerCase().includes(subSearch.trim().toLowerCase()))
    : subcategories;

  // Reusable Sidebar Content (used in both desktop sidebar and mobile drawer)
  const FilterContent = (
    <div className="space-y-6">
      
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#FF6600]" />
          <h3 className="text-sm font-black text-gray-900 tracking-tight">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-[#FF6600] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
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

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-gray-100">
          {currentSub && activeSubItem && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-50 text-[#FF6600] border border-orange-200 px-2 py-0.5 rounded-md">
              <span>Sub: {activeSubItem.name}</span>
              <button
                type="button"
                onClick={() => applyFilters({ sub: null })}
                className="hover:text-[#c44d00] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentInStock && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-50 text-emerald-700 border border-green-200 px-2 py-0.5 rounded-md">
              <span>In Stock Only</span>
              <button
                type="button"
                onClick={handleInStockToggle}
                className="hover:text-emerald-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(currentMinPrice || currentMaxPrice) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
              <span>৳{currentMinPrice || '0'} - ৳{currentMaxPrice || '∞'}</span>
              <button
                type="button"
                onClick={() => { setMinPrice(''); setMaxPrice(''); applyFilters({ minPrice: null, maxPrice: null }); }}
                className="hover:text-slate-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentBrand && currentBrand.split(',').map(b => (
            <span key={b} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
              <span>{b}</span>
              <button
                type="button"
                onClick={() => handleBrandToggle(b)}
                className="hover:text-blue-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ─── 1. SUBCATEGORIES SECTION (Prominent at top) ─── */}
      {subcategories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#FF6600]" />
              <span>{isMother ? 'Categories' : 'Subcategories'}</span>
            </h4>
            <span className="text-[11px] font-semibold text-gray-400">
              ({subcategories.length})
            </span>
          </div>

          {/* Quick Filter Input if > 6 subcategories */}
          {subcategories.length > 6 && (
            <div className="mb-2">
              <input
                type="text"
                placeholder="Filter subcategory..."
                value={subSearch}
                onChange={e => setSubSearch(e.target.value)}
                className="w-full px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-hidden focus:border-[#FF6600] focus:bg-white transition-colors"
              />
            </div>
          )}

          <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {/* "All" Reset Option */}
            <button
              type="button"
              onClick={() => { applyFilters({ sub: null }); }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                !currentSub
                  ? 'bg-orange-50 text-[#FF6600] border border-orange-200/80 font-bold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${!currentSub ? 'bg-[#FF6600]' : 'bg-gray-300'}`} />
                <span>All {isMother ? 'Categories' : (categoryName || 'Subcategories')}</span>
              </div>
            </button>

            {/* Subcategory List Items */}
            {filteredSubcategories.map((sub) => {
              const isActive = currentSub === sub.slug || currentSub === sub.id;

              return (
                <button
                  key={sub.id || sub.slug}
                  type="button"
                  onClick={() => handleSubToggle(sub.slug)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-orange-50 text-[#FF6600] border border-orange-200/80 font-bold shadow-2xs'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-[#FF6600]' : 'bg-gray-300'}`} />
                    <span className="truncate">{sub.name}</span>
                  </div>
                  {sub.productCount !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ml-1.5 ${
                      isActive ? 'bg-orange-200/80 text-[#FF6600] font-bold' : 'text-gray-400 bg-gray-100'
                    }`}>
                      {sub.productCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 2. AVAILABILITY ─── */}
      <div className={subcategories.length > 0 ? 'pt-3 border-t border-gray-100' : ''}>
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

      {/* ─── 3. PRICE RANGE ─── */}
      <div className="pt-3 border-t border-gray-100">
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

      {/* ─── 4. BRANDS ─── */}
      {availableBrands.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Brands</span>
            <span className="text-gray-400 font-normal">({availableBrands.length})</span>
          </h4>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
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

  return (
    <>
      {/* Mobile Floating / In-page Filter & Subcategories Trigger */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-xs text-gray-800 text-xs font-bold hover:border-[#FF6600] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#FF6600]" />
            <span>Filter &amp; Subcategories</span>
            {activeFilterCount > 0 && (
              <span className="bg-[#FF6600] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {activeFilterCount} Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[#FF6600] text-xs font-semibold">
            {activeSubItem ? (
              <span className="truncate max-w-[140px] text-gray-600">{activeSubItem.name}</span>
            ) : (
              <span>Tap to filter</span>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      </div>

      {/* Desktop Left Sidebar Card */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 p-5 shadow-xs sticky top-24">
        {FilterContent}
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col">
              
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF6600]" />
                  <h3 className="text-sm font-black text-gray-900">Filters &amp; Subcategories</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-5 overflow-y-auto flex-1">
                {FilterContent}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100 bg-white flex gap-3 shadow-lg">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => { clearAllFilters(); }}
                    className="flex-1 py-2.5 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Reset All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  View Products
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
