'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ChevronRight, ChevronDown, Phone, MapPin, Flame, Sparkles } from 'lucide-react';
import { Category } from '@/lib/types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, categories }) => {
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
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base">
              M
            </div>
            <span className="font-bold text-lg">maxit<span className="text-orange-500">shop</span></span>
          </div>
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
            href="/#deals"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 p-2 bg-orange-50 text-orange-600 rounded-lg border border-orange-200/60"
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Hot Deals</span>
          </Link>
          <Link
            href="/track-order"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200/60"
          >
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>Track Order</span>
          </Link>
        </div>

        {/* Category Accordion */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          <div className="px-4 py-2.5 bg-slate-100/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
            All Categories
          </div>

          {categories.map((cat) => {
            const hasSub = cat.subcategories && cat.subcategories.length > 0;
            const isExpanded = expandedCategories[cat.slug];

            return (
              <div key={cat.id} className="text-sm">
                <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="font-medium text-slate-800 hover:text-blue-600 flex-1"
                  >
                    {cat.name}
                  </Link>

                  {hasSub && (
                    <button
                      onClick={() => toggleCategory(cat.slug)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Subcategories list */}
                {hasSub && isExpanded && (
                  <div className="bg-slate-50/80 px-6 py-2 space-y-2 border-t border-slate-100">
                    {cat.subcategories!.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${cat.slug}?sub=${sub.slug}`}
                        onClick={onClose}
                        className="block py-1 text-xs text-slate-600 hover:text-blue-600"
                      >
                        • {sub.name}
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
            <Link href="/about" onClick={onClose} className="block hover:text-blue-600">About maxitshop</Link>
            <Link href="/contact" onClick={onClose} className="block hover:text-blue-600">Contact Us</Link>
            <Link href="/faq" onClick={onClose} className="block hover:text-blue-600">FAQ</Link>
            <Link href="/shipping-returns" onClick={onClose} className="block hover:text-blue-600">Shipping & Returns</Link>
            <Link href="/terms" onClick={onClose} className="block hover:text-blue-600">Terms & Conditions</Link>
          </div>
        </div>

        {/* Drawer Footer with Hotline */}
        <div className="p-4 bg-slate-900 text-white border-t border-slate-800">
          <a
            href="tel:+8801700000000"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>Call Hotline: +880 1700-000000</span>
          </a>
        </div>
      </div>
    </div>
  );
};
