'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, MapPin, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { api } from '@/lib/api';
import { SearchSuggestion } from '@/lib/types';

interface HeaderProps {
  onToggleMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileDrawer }) => {
  const router = useRouter();
  const { totalItems, subtotal, openCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoadingSuggestions(true);
        const data = await api.getSearchSuggestions(searchQuery);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to fetch search suggestions:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for suggestions modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 md:gap-6">
        
        {/* Mobile Menu Button + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileDrawer}
            className="lg:hidden p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="flex items-center gap-1.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                maxit<span className="text-orange-500">shop</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider -mt-1 hidden sm:block">
                Online Shopping BD
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              placeholder="Search for laptops, phones, solar panels, smartwatches..."
              className="w-full pl-4 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                className="absolute right-20 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
              {isLoadingSuggestions ? (
                <div className="p-4 text-center text-sm text-slate-500">Searching products...</div>
              ) : suggestions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  <div className="p-2.5 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Products matching &quot;{searchQuery}&quot;</span>
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  {suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/product/${item.slug}`}
                      onClick={() => setShowSuggestions(false)}
                      className="p-2.5 hover:bg-blue-50/70 flex items-center gap-3 transition-colors group"
                    >
                      <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 line-clamp-1 group-hover:text-blue-600">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">{item.brand} • {item.category.replace(/-/g, ' ')}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-blue-600">৳{item.price.toLocaleString()}</span>
                        {item.oldPrice && (
                          <div className="text-xs text-slate-400 line-through">৳{item.oldPrice.toLocaleString()}</div>
                        )}
                      </div>
                    </Link>
                  ))}
                  <div className="p-2.5 bg-slate-50 text-center">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      View all results for &quot;{searchQuery}&quot; →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  No products found for &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Track Order Shortcut */}
          <Link
            href="/track-order"
            className="hidden sm:flex items-center gap-1.5 text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <MapPin className="w-4 h-4 text-orange-500" />
            <span>Track Order</span>
          </Link>

          {/* Cart Trigger Button */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 sm:gap-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 sm:px-4 py-2 rounded-lg transition-colors border border-blue-200/80 group"
            aria-label="View shopping cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-orange-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-medium text-slate-500 leading-tight">My Cart</span>
              <span className="text-xs font-bold text-slate-900 leading-tight">৳{subtotal.toLocaleString()}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Below Header on small screens) */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products in Bangladesh..."
            className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white"
          />
          <button
            type="submit"
            className="absolute right-1.5 p-1.5 text-blue-600 hover:text-blue-800"
            aria-label="Submit search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
};
