'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronRight, ChevronDown, Phone, MapPin, ShoppingBag, Truck, Sparkles, Sun } from 'lucide-react';
import { Category, SiteSetting } from '@/lib/types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  settings?: SiteSetting | null;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, categories, settings }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleCategory = (slug: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-2xl flex flex-col z-50">
        
        {/* Drawer Header */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center select-none bg-white px-2.5 py-1 rounded-md">
            <Image
              src="/images/logo.png"
              alt="MAXIT"
              width={110}
              height={25}
              className="h-6 w-auto object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2 text-xs font-semibold">
          <Link
            href="/solar-system-builder"
            onClick={onClose}
            className="col-span-2 flex items-center justify-center gap-2 p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold shadow-xs transition-colors"
          >
            <Sun className="w-4 h-4 text-white" />
            <span>⚡ Solar System Builder</span>
          </Link>
          <Link
            href="/shop"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 p-2 bg-white text-slate-800 rounded-lg border border-slate-200 hover:text-[#FF6600] transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-[#FF6600]" />
            <span>Shop All</span>
          </Link>
          <Link
            href="/track-order"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 p-2 bg-white text-slate-800 rounded-lg border border-slate-200 hover:text-[#FF6600] transition-colors"
          >
            <Truck className="w-4 h-4 text-[#FF6600]" />
            <span>Track Order</span>
          </Link>
        </div>

        {/* Category Accordion */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          <div className="px-4 py-2.5 bg-slate-100/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
            All Categories
          </div>

          {categories.map((cat) => {
            const subItems = (cat.children && cat.children.length > 0) ? cat.children : (cat.subcategories || []);
            const hasSub = subItems.length > 0;
            const isExpanded = expandedCategories[cat.slug];

            return (
              <div key={cat.id || cat.slug} className="text-sm">
                <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="font-medium text-slate-800 hover:text-[#FF6600] flex-1"
                  >
                    {cat.name}
                  </Link>

                  {hasSub && (
                    <button
                      onClick={() => toggleCategory(cat.slug)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                      aria-label="Toggle subcategories"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#FF6600]" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Subcategories list */}
                {hasSub && isExpanded && (
                  <div className="bg-slate-50/80 px-6 py-2 space-y-1.5 border-t border-slate-100">
                    {subItems.map((sub: any) => (
                      <Link
                        key={sub.id || sub.slug}
                        href={`/category/${sub.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between py-1 text-xs text-slate-600 hover:text-[#FF6600]"
                      >
                        <span className="truncate">• {sub.name}</span>
                        {sub.productCount !== undefined && (
                          <span className="text-[10px] text-gray-400 font-normal shrink-0 ml-2">
                            ({sub.productCount})
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="px-4 py-2.5 bg-slate-100/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Information
          </div>
          <div className="p-4 space-y-3 text-sm text-slate-600">
            <Link href="/about" onClick={onClose} className="block hover:text-blue-600">About MaxiTShop</Link>
            <Link href="/contact" onClick={onClose} className="block hover:text-blue-600">Contact Us</Link>
            <Link href="/shop" onClick={onClose} className="block font-medium text-[#0468D3] hover:text-blue-700">Shop Catalog</Link>
            <Link href="/faq" onClick={onClose} className="block hover:text-blue-600">FAQ</Link>
            <Link href="/shipping-returns" onClick={onClose} className="block hover:text-blue-600">Shipping & Returns</Link>
            <Link href="/terms" onClick={onClose} className="block hover:text-blue-600">Terms & Conditions</Link>
          </div>
        </div>

        {/* Drawer Footer with Hotline */}
        <div className="p-4 bg-slate-900 text-white border-t border-slate-800">
          <a
            href={`tel:${(settings?.header?.hotline || settings?.phone || '01733272445').replace(/[^0-9+]/g, '')}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FF6600] hover:bg-[#e55c00] rounded-lg text-sm font-semibold transition-colors shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>Call Hotline: {settings?.header?.hotline || settings?.phone || '01733272445'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
