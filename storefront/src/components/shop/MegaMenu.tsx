'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, ChevronRight, Home, Flame, Truck, Sparkles, Folder } from 'lucide-react';
import { Category } from '@/lib/types';

interface MegaMenuProps {
  categories: Category[];
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    categories[0]?.id || null
  );

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];

  return (
    <nav className="hidden lg:block bg-[#1B429B] text-white shadow-md relative z-30">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        
        {/* Left: Shop by Category Trigger & Full Mega Menu */}
        <div
          className="relative"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 px-5 py-3 bg-[#112F75] hover:bg-[#0E2660] text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Shop by Category</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Full-featured Mega Menu Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 w-[920px] bg-white text-gray-800 rounded-b-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 grid grid-cols-12 max-h-[500px]">
              {/* Left Categories List */}
              <div className="col-span-4 bg-gray-50 border-r border-gray-100 py-2 overflow-y-auto max-h-[500px]">
                <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  All Categories ({categories.length})
                </div>
                {categories.map((cat) => {
                  const isActive = (activeCategory?.id === cat.id);
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setActiveCategoryId(cat.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all ${
                        isActive
                          ? 'bg-white text-blue-600 shadow-xs border-l-4 border-blue-600 font-bold'
                          : 'text-gray-700 hover:bg-gray-100/70 hover:text-blue-600'
                      }`}
                    >
                      <Link
                        href={`/category/${cat.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex-1 flex items-center gap-2"
                      >
                        <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </Link>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                    </div>
                  );
                })}
              </div>

              {/* Right Subcategories Grid */}
              <div className="col-span-8 p-5 bg-white overflow-y-auto max-h-[500px]">
                {activeCategory && (
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span>{activeCategory.name}</span>
                        <span className="text-xs text-blue-600 font-normal">
                          ({activeCategory.subcategories?.length || 0} subcategories)
                        </span>
                      </h4>
                      <Link
                        href={`/category/${activeCategory.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
                        activeCategory.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/category/${activeCategory.slug}?sub=${sub.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 p-2 rounded-lg text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors group"
                          >
                            <ChevronRight className="w-3 h-3 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        ))
                      ) : (
                        <div className="col-span-2 py-8 text-center bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
                          <p className="text-xs text-gray-500 mb-2.5">Browse all products in this category</p>
                          <Link
                            href={`/category/${activeCategory.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            <span>Explore {activeCategory.name}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Center / Right: Horizontal Navigation Links matching the screenshot */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-sm font-semibold">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-3 text-white hover:bg-[#112F75] transition-colors"
          >
            <Home className="w-4 h-4 text-white/90" />
            <span>Home</span>
          </Link>

          <Link
            href="/search?deal=true"
            className="flex items-center gap-1.5 px-3.5 py-3 text-yellow-300 hover:text-yellow-200 hover:bg-[#112F75] transition-colors"
          >
            <Flame className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>Hot Deals</span>
          </Link>

          <Link
            href="/search"
            className="px-3.5 py-3 text-white hover:bg-[#112F75] transition-colors"
          >
            All Products
          </Link>

          <Link
            href="/about"
            className="px-3.5 py-3 text-white hover:bg-[#112F75] transition-colors"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="px-3.5 py-3 text-white hover:bg-[#112F75] transition-colors"
          >
            Contact
          </Link>

          <Link
            href="/track-order"
            className="flex items-center gap-1.5 px-3.5 py-3 text-white hover:bg-[#112F75] transition-colors"
          >
            <Truck className="w-4 h-4 text-white/90" />
            <span>Track Order</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
