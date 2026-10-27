'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Truck,
  Menu,
  ChevronDown,
  X,
  Sparkles,
  User,
  LogIn
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { api } from '@/lib/api';
import { Category, SearchSuggestion } from '@/lib/types';

interface HeaderProps {
  categories?: Category[];
  onToggleMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ categories = [], onToggleMobileDrawer }) => {
  const router = useRouter();
  const { totalItems, subtotal, openCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);

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
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setShowCatDropdown(false);
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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* 1. TOP HEADER (Logo, Search, Track Order, Cart) */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={onToggleMobileDrawer}
            className="lg:hidden p-2 text-gray-700 hover:text-[#FF6600] rounded-md"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center select-none py-0.5">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#FF6600]">
              maxit
            </span>
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#131A22]">
              shop
            </span>
          </Link>

          {/* Search Bar with live autocomplete */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-2xl hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                placeholder="Search products, brands, models..."
                className="w-full pl-4 pr-12 py-2.5 bg-gray-100 hover:bg-gray-50 focus:bg-white border border-gray-300 focus:border-[#FF6600] rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-hidden transition-all h-11"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                  }}
                  className="absolute right-12 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3.5 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-md flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                {isLoadingSuggestions ? (
                  <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                ) : suggestions.length > 0 ? (
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    <div className="p-2.5 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Matching &quot;{searchQuery}&quot;</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6600]" />
                    </div>
                    {suggestions.map((item) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        className="p-2.5 hover:bg-orange-50/70 flex items-center gap-3 transition-colors group"
                      >
                        <div className="relative w-11 h-11 rounded-md bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="44px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-[#FF6600]">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-gray-400 capitalize">
                            {item.brand} • {item.category.replace(/-/g, ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-bold text-[#FF6600]">
                            ৳{item.price.toLocaleString()}
                          </span>
                          {item.oldPrice && (
                            <div className="text-[10px] text-gray-400 line-through">
                              ৳{item.oldPrice.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                    <div className="p-2 bg-gray-50 text-center">
                      <button
                        onClick={handleSearchSubmit}
                        className="text-xs font-bold text-[#FF6600] hover:underline"
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

          {/* Right Header Controls: Track Order & Cart Icon with Taka */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Track Order Direct Link */}
            <Link
              href="/customer/order-track"
              className="hidden md:flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#FF6600] transition-colors"
            >
              <Truck className="w-4 h-4 text-[#FF6600]" />
              <span>Track Order</span>
            </Link>

            {/* Cart Icon with Item Count & Total in Taka */}
            <button
              onClick={() => openCart()}
              className="flex items-center gap-2.5 bg-gray-100 hover:bg-gray-200/80 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <div className="relative text-gray-800">
                <ShoppingBag className="w-5 h-5 text-gray-800" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FF6600] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] text-gray-500 uppercase font-bold">Cart</span>
                <span className="text-xs font-black text-[#131A22]">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (visible on small screens) */}
        <div className="mt-2.5 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-3.5 pr-10 py-2 bg-gray-100 rounded-lg text-xs text-gray-900 border border-gray-200 focus:outline-hidden focus:border-[#FF6600]"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#FF6600] text-white rounded-md flex items-center justify-center"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* 2. MAIN NAV BAR (ALL CATEGORIES dropdown, Home, Sellers, Contact, Login / Sign Up) */}
      <nav className="bg-[#131A22] text-white hidden lg:block select-none">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          <div className="flex items-center">
            {/* "ALL CATEGORIES" dropdown toggle */}
            <div ref={catDropdownRef} className="relative">
              <button
                onClick={() => setShowCatDropdown(!showCatDropdown)}
                className="flex items-center gap-3 bg-[#FF6600] hover:bg-[#e55c00] text-white px-5 py-3 font-bold text-sm tracking-wide transition-colors cursor-pointer"
              >
                <Menu className="w-4 h-4" />
                <span className="uppercase">ALL CATEGORIES</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCatDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Category Dropdown Menu */}
              {showCatDropdown && (
                <div className="absolute top-full left-0 w-64 bg-white text-gray-800 shadow-2xl border border-gray-200 py-2 z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={() => setShowCatDropdown(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold hover:bg-orange-50 hover:text-[#FF6600] transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-gray-400 text-[10px]">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex items-center ml-2">
              <Link
                href="/"
                className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-200 hover:text-[#FF6600] transition-colors"
              >
                Home
              </Link>
              <Link
                href="/sellers"
                className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-200 hover:text-[#FF6600] transition-colors"
              >
                Sellers
              </Link>
              <Link
                href="/contact"
                className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-200 hover:text-[#FF6600] transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Right Side: Customer Login / Sign Up */}
          <div className="flex items-center gap-3">
            <Link
              href="/customer/login"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-200 hover:text-[#FF6600] transition-colors py-3"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Sign Up</span>
            </Link>
          </div>

        </div>
      </nav>
    </header>
  );
};
