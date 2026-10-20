'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, Flame, Sparkles } from 'lucide-react';
import { Category } from '@/lib/types';

interface MegaMenuProps {
  categories: Category[];
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ categories }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="hidden lg:block bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        
        {/* Categories Dropdown Trigger */}
        <div 
          className="relative"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-3 transition-colors"
          >
            <Menu className="w-4 h-4" />
            <span>Shop By Category</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mega Menu Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 w-80 bg-white text-slate-800 rounded-b-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {categories.map((cat) => (
                <div key={cat.id} className="group/item relative px-3 py-2 hover:bg-blue-50 transition-colors">
                  <Link
                    href={`/category/${cat.slug}`}
                    className="flex items-center justify-between font-medium text-sm text-slate-800 group-hover/item:text-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{cat.name}</span>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <span className="text-slate-400 group-hover/item:text-blue-600 text-xs">›</span>
                    )}
                  </Link>

                  {/* Subcategories Flyout */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="hidden group-hover/item:block absolute left-full top-0 w-64 bg-white rounded-r-xl shadow-2xl border border-slate-200 py-2 ml-0 z-50">
                      <div className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                        {cat.name}
                      </div>
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${cat.slug}?sub=${sub.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Primary Navigation Links */}
        <div className="flex items-center space-x-1 text-sm font-medium">
          <Link
            href="/"
            className="px-3 py-3 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
          >
            Home
          </Link>
          <Link
            href="/category/solar-green-energy"
            className="px-3 py-3 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
          >
            Solar Energy
          </Link>
          <Link
            href="/category/mobile-phones"
            className="px-3 py-3 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
          >
            Phones
          </Link>
          <Link
            href="/category/laptops"
            className="px-3 py-3 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
          >
            Laptops
          </Link>
          <Link
            href="/category/smart-watches"
            className="px-3 py-3 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
          >
            Watches
          </Link>
          <Link
            href="/category/home-appliances"
            className="px-3 py-3 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
          >
            Home Appliances
          </Link>
          <Link
            href="/category/accessories"
            className="px-3 py-3 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
          >
            Accessories
          </Link>
        </div>

        {/* Highlight Deals & New Badges */}
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <Link
            href="/#deals"
            className="flex items-center gap-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white px-2.5 py-1.5 rounded-full border border-orange-500/30 transition-all"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Flash Deals</span>
          </Link>
          <Link
            href="/#new-arrivals"
            className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white px-2.5 py-1.5 rounded-full border border-emerald-500/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>New In</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
