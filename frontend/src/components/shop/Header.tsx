'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Box,
  Handshake,
  User,
  ShoppingBag,
  Menu,
  X,
  Truck,
  Sparkles,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { api } from '@/lib/api';
import { SearchSuggestion } from '@/lib/types';

interface HeaderProps {
  onToggleMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileDrawer }) => {
  const router = useRouter();
  const { totalItems, openCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

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

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccountDropdown(false);
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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center py-3.5 gap-6">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center group select-none py-1">
            <span className="text-2xl sm:text-[28px] font-black tracking-tight text-[#FF6A00] group-hover:opacity-95 transition-opacity">
              MaxiT
            </span>
            <span className="text-2xl sm:text-[28px] font-black tracking-tight text-gray-900">
              Shop
            </span>
          </Link>

          {/* Search Bar + Connected Action Buttons */}
          <div className="flex-1 flex items-center gap-3 max-w-4xl">
            {/* Search Input Container */}
            <div ref={searchContainerRef} className="relative flex-1">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  placeholder="Search for products, brands, or categories..."
                  className="w-full pl-11 pr-8 py-2.5 bg-gray-100/90 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden transition-all h-11"
                  autoComplete="off"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  {isLoadingSuggestions ? (
                    <div className="p-4 text-center text-sm text-gray-500">Searching products...</div>
                  ) : suggestions.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      <div className="p-2.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Matching &quot;{searchQuery}&quot;</span>
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      {suggestions.map((item) => (
                        <Link
                          key={item.id}
                          href={`/product/${item.slug}`}
                          onClick={() => setShowSuggestions(false)}
                          className="p-2.5 hover:bg-blue-50/70 flex items-center gap-3 transition-colors group"
                        >
                          <div className="relative w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="44px"
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{item.brand} • {item.category.replace(/-/g, ' ')}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-blue-600">৳{item.price.toLocaleString()}</span>
                            {item.oldPrice && (
                              <div className="text-xs text-gray-400 line-through">৳{item.oldPrice.toLocaleString()}</div>
                            )}
                          </div>
                        </Link>
                      ))}
                      <div className="p-2 bg-gray-50 text-center">
                        <button
                          onClick={handleSearchSubmit}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          View all results for &quot;{searchQuery}&quot; →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No products found for &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Connected Action Buttons: Group Buy, Dropshop, Be Partner */}
            <div className="flex items-center shrink-0 h-11">
              <Link
                href="/category/solar-green-energy"
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-l-lg transition-colors flex items-center gap-2 text-sm font-semibold whitespace-nowrap shadow-xs h-full"
              >
                <Users className="w-4 h-4" />
                <span>Group Buy</span>
              </Link>
              <Link
                href="/about"
                className="px-3.5 py-2.5 bg-[#0F2942] hover:bg-[#153a5c] text-white transition-colors flex items-center gap-2 text-sm font-semibold whitespace-nowrap border-l border-blue-900/40 shadow-xs h-full"
              >
                <Box className="w-4 h-4" />
                <span>Dropshop</span>
              </Link>
              <Link
                href="/contact"
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-r-lg transition-colors flex items-center gap-2 text-sm font-semibold whitespace-nowrap border-l border-emerald-500 shadow-xs h-full"
              >
                <Handshake className="w-4 h-4" />
                <span>Be Partner</span>
              </Link>
            </div>
          </div>

          {/* Right Action Icons: Account & My Cart */}
          <div className="flex items-center gap-5 ml-auto shrink-0">
            {/* Account Menu with Dropdown */}
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center gap-1.5 text-gray-700 hover:text-gray-950 font-medium text-sm transition-colors py-2 px-1 focus:outline-hidden"
              >
                <User className="w-5 h-5 text-gray-700" />
                <span>Account</span>
              </button>

              {showAccountDropdown && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <Link
                    href="/admin/login"
                    onClick={() => setShowAccountDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-gray-400" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/admin/login"
                    onClick={() => setShowAccountDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-gray-400" />
                    <span>Register</span>
                  </Link>
                  <div className="my-1 border-t border-gray-100" />
                  <Link
                    href="/track-order"
                    onClick={() => setShowAccountDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors"
                  >
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span>Track Order</span>
                  </Link>
                </div>
              )}
            </div>

            {/* My Cart Button */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 text-gray-700 hover:text-gray-950 font-medium text-sm transition-colors py-2 px-1 focus:outline-hidden"
            >
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              <span>My Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden py-3">
          <div className="flex items-center justify-between mb-2.5">
            <button
              onClick={onToggleMobileDrawer}
              className="p-1.5 text-gray-700 hover:text-blue-600 rounded-lg"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center select-none">
              <span className="text-xl font-black tracking-tight text-[#FF6A00]">
                MaxiT
              </span>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Shop
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/admin/login" className="p-1.5 text-gray-700">
                <User className="w-5 h-5" />
              </Link>
              <button
                onClick={openCart}
                className="relative p-1.5 text-gray-700"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute 0 top-0 right-0 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-gray-300"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>
      </div>
    </header>
  );
};
