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
  ChevronRight,
  X,
  Sparkles,
  User,
  LogIn,
  Heart,
  Phone,
  Sun
} from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useWishlist } from '@/lib/wishlistContext';
import { api } from '@/lib/api';
import { Category, SearchSuggestion, SiteSetting } from '@/lib/types';

interface HeaderProps {
  categories?: Category[];
  settings?: SiteSetting | null;
  onToggleMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ categories = [], settings, onToggleMobileDrawer }) => {
  const router = useRouter();
  const { totalItems, subtotal, openCart } = useCart();
  const { wishlistCount } = useWishlist();

  const [customer, setCustomer] = useState<{ name?: string; email?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [hoveredCatSlug, setHoveredCatSlug] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('maxitshop_customer');
      if (raw) {
        setCustomer(JSON.parse(raw));
      }
    } catch (e) {}
  }, []);

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
      {/* 0. TOP ANNOUNCEMENT BAR (Editable from Admin) */}
      {settings?.header?.showAnnouncement && settings.header.announcementText && (
        <div className="bg-[#0B1528] text-white text-[11px] sm:text-xs py-2 px-4 border-b border-[#1C2739] select-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 text-center font-medium truncate">
              {settings.header.announcementLink ? (
                <Link
                  href={settings.header.announcementLink}
                  className="hover:text-[#FF6600] transition-colors underline decoration-dotted underline-offset-2"
                >
                  {settings.header.announcementText}
                </Link>
              ) : (
                <span>{settings.header.announcementText}</span>
              )}
            </div>
            {settings?.header?.hotline && (
              <div className="hidden md:flex items-center gap-2 text-gray-300 shrink-0 text-xs">
                <Phone className="w-3.5 h-3.5 text-[#FF6600]" />
                <span className="text-gray-400">Hotline:</span>
                <a
                  href={`tel:${settings.header.hotline.replace(/[^0-9+]/g, '')}`}
                  className="font-bold text-white hover:text-[#FF6600] transition-colors"
                >
                  {settings.header.hotline}
                </a>
                {settings.header.supportHours && (
                  <span className="text-[10px] text-gray-400 border-l border-gray-700 pl-2">
                    {settings.header.supportHours}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
            <Image
              src="/images/logo.png"
              alt="MAXIT"
              width={160}
              height={36}
              priority
              className="h-8 sm:h-9 w-auto object-contain"
            />
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
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            {item.productCode && (
                              <span className="font-bold text-[#FF6600] bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200/60 uppercase shrink-0">
                                {item.productCode}
                              </span>
                            )}
                            <span className="capitalize truncate">{item.brand} • {item.category.replace(/-/g, ' ')}</span>
                          </div>
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

          {/* Right Header Controls: Wishlist, Track Order & Cart Icon with Taka */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            {/* Wishlist Direct Link */}
            <Link
              href="/wishlist"
              className="flex items-center gap-1.5 p-2 text-gray-700 hover:text-[#FF6600] transition-colors relative"
              aria-label="View Wishlist"
            >
              <div className="relative">
                <Heart className="w-5 h-5 text-gray-800 hover:text-[#FF6600] transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FF6600] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-semibold text-gray-700">Wishlist</span>
            </Link>

            {/* Track Order Direct Link */}
            <Link
              href="/track-order"
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
                <div
                  className="absolute top-full left-0 w-64 bg-white text-gray-800 shadow-2xl border border-gray-200 py-1.5 z-50 rounded-b-lg"
                  onMouseLeave={() => setHoveredCatSlug(null)}
                >
                  {categories.map((cat) => {
                    const children = (cat.children && cat.children.length > 0) ? cat.children : (cat.subcategories || []);
                    const hasChildren = children.length > 0;
                    const isHovered = hoveredCatSlug === cat.slug;

                    return (
                      <div
                        key={cat.id || cat.slug}
                        className="relative"
                        onMouseEnter={() => setHoveredCatSlug(cat.slug)}
                      >
                        <Link
                          href={`/category/${cat.slug}`}
                          onClick={() => {
                            setShowCatDropdown(false);
                            setHoveredCatSlug(null);
                          }}
                          className={`flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors ${
                            isHovered
                              ? 'bg-orange-50 text-[#FF6600]'
                              : 'text-gray-700 hover:bg-orange-50 hover:text-[#FF6600]'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {hasChildren ? (
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          ) : (
                            <span className="text-gray-300 text-[10px]">→</span>
                          )}
                        </Link>

                        {/* Subcategory Flyout to the Right */}
                        {hasChildren && isHovered && (
                          <div className="absolute left-full top-0 ml-0.5 w-64 bg-white text-gray-800 shadow-2xl border border-gray-200 py-2 z-50 rounded-lg max-h-[420px] overflow-y-auto">
                            <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 flex items-center justify-between">
                              <span className="truncate">{cat.name}</span>
                              <span className="text-[10px] text-gray-400 font-normal shrink-0 ml-2">({children.length})</span>
                            </div>
                            <div className="py-1">
                              {children.map((child: any) => (
                                <Link
                                  key={child.id || child.slug}
                                  href={`/category/${child.slug}`}
                                  onClick={() => {
                                    setShowCatDropdown(false);
                                    setHoveredCatSlug(null);
                                  }}
                                  className="flex items-center justify-between px-4 py-2 text-xs text-gray-700 hover:bg-orange-50 hover:text-[#FF6600] transition-colors"
                                >
                                  <span className="truncate">{child.name}</span>
                                  {child.productCount !== undefined && (
                                    <span className="text-[10px] text-gray-400 font-normal shrink-0 ml-2">
                                      ({child.productCount})
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Navigation Links (Admin Controlled) */}
            <div className="flex items-center ml-2 overflow-x-auto scrollbar-none whitespace-nowrap" suppressHydrationWarning>
              {(settings?.navLinks && settings.navLinks.length > 0
                ? settings.navLinks.filter(
                    (l) => l.label.toLowerCase() !== 'track order' && l.url !== '/track-order'
                  )
                : [
                    { label: 'Home', url: '/' },
                    { label: 'Sellers', url: '/sellers' },
                    { label: 'Contact', url: '/contact' },
                    { label: 'Shop', url: '/shop' }
                  ]
              ).map((link, idx) => (
                link.isExternal ? (
                  <a
                    key={`nav-link-${link.url}-${idx}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-200 hover:text-[#FF6600] transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={`nav-link-${link.url}-${idx}`}
                    href={link.url}
                    className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-200 hover:text-[#FF6600] transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              ))}
              {/* Solar System Builder highlighted tool button */}
              <Link
                key="solar-builder-nav-btn"
                href="/solar-system-builder"
                className="ml-2 px-3 py-1.5 bg-[#FF6600] hover:bg-[#e55c00] text-white text-xs font-black rounded-md flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>SOLAR BUILDER</span>
              </Link>
            </div>
          </div>

          {/* Right Side: Customer Account / Login */}
          <div className="flex items-center gap-4">
            {customer ? (
              <Link
                href="/customer/account"
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-200 hover:text-[#FF6600] transition-colors py-3"
              >
                <User className="w-3.5 h-3.5 text-[#FF6600]" />
                <span className="max-w-[120px] truncate">{customer.name || 'My Account'}</span>
              </Link>
            ) : (
              <Link
                href="/customer/login"
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-200 hover:text-[#FF6600] transition-colors py-3"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login / Sign Up</span>
              </Link>
            )}
          </div>

        </div>
      </nav>
    </header>
  );
};
