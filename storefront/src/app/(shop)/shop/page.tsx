import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';
import { CategoryFilterSidebar } from '@/components/shop/CategoryFilterSidebar';
import { CategorySortBar } from '@/components/shop/CategorySortBar';
import {
  ChevronRight,
  Home,
  ArrowLeft,
  ArrowRight,
  PackageX,
  ShoppingBag,
  Sparkles,
  Sun,
  BatteryCharging,
  Zap,
  Cpu,
  Bot,
  Radio,
  Layers,
  Wrench,
  ShieldCheck,
  Monitor,
  Package,
  LayoutGrid
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products | MaxiTShop Bangladesh',
  description: 'Shop genuine solar inverters, solar panels, lithium & lead batteries, industrial equipment, online UPS, voltage stabilizers and electronics at best prices in Bangladesh.',
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  }>;
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'solar-renewable-energy':
      return Sun;
    case 'batteries-portable-power':
      return BatteryCharging;
    case 'ups-power-protection':
      return Zap;
    case 'smart-home-automation':
      return Home;
    case 'microcontrollers-dev-boards':
      return Cpu;
    case 'robotics-drone-kits':
      return Bot;
    case 'sensors-modules-wireless':
      return Radio;
    case 'electronic-components':
      return Layers;
    case 'tools-instruments':
      return Wrench;
    case 'security-safety':
      return ShieldCheck;
    case 'computer-networking-office':
      return Monitor;
    case 'accessories-services':
      return Package;
    default:
      return LayoutGrid;
  }
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const search = await searchParams;
  const page = parseInt(search.page || '1', 10);
  const limit = 15;

  // Fetch categories and products concurrently
  const [categories, productsResponse] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getProducts({
      category: search.category,
      brand: search.brand,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
      inStock: search.inStock,
      sort: search.sort || 'newest',
      page,
      limit
    }).catch(() => ({
      items: [],
      pagination: { total: 0, totalPages: 1, page: 1, limit, hasNext: false, hasPrev: false },
      filterMeta: { availableBrands: [] }
    }))
  ]);

  const items = productsResponse.items || [];
  const total = (productsResponse as any).total ?? productsResponse.pagination?.total ?? items.length;
  const totalPages = (productsResponse as any).totalPages ?? productsResponse.pagination?.totalPages ?? 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const availableBrands = productsResponse.filterMeta?.availableBrands || [];

  const currentCategory = categories.find((c: any) => c.slug === search.category) ||
    categories.flatMap((c: any) => c.children || []).find((c: any) => c.slug === search.category);

  const totalAllCategoriesCount = categories.reduce((acc: number, c: any) => acc + (c.productCount || 0), 0) || total;

  // Prepare mother category items for sidebar
  const motherSubcategories = categories.map((c: any) => ({
    id: c._id || c.id,
    name: c.name,
    slug: c.slug,
    productCount: c.productCount
  }));

  // Helper to construct pagination URLs while preserving current filters
  const buildPageUrl = (targetPage: number) => {
    const p = new URLSearchParams();
    if (search.category) p.set('category', search.category);
    if (search.brand) p.set('brand', search.brand);
    if (search.minPrice) p.set('minPrice', search.minPrice);
    if (search.maxPrice) p.set('maxPrice', search.maxPrice);
    if (search.inStock) p.set('inStock', search.inStock);
    if (search.sort) p.set('sort', search.sort);
    p.set('page', String(targetPage));
    return `/shop?${p.toString()}`;
  };

  // Helper for category URLs
  const buildCategoryUrl = (slug?: string) => {
    const p = new URLSearchParams();
    if (slug) p.set('category', slug);
    if (search.brand) p.set('brand', search.brand);
    if (search.minPrice) p.set('minPrice', search.minPrice);
    if (search.maxPrice) p.set('maxPrice', search.maxPrice);
    if (search.inStock) p.set('inStock', search.inStock);
    if (search.sort) p.set('sort', search.sort);
    return `/shop${p.toString() ? `?${p.toString()}` : ''}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center text-xs text-gray-500 mb-5 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <Link href="/shop" className="hover:text-[#FF6600] transition-colors">
          Shop
        </Link>
        {currentCategory && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="font-semibold text-gray-900">{currentCategory.name}</span>
          </>
        )}
      </nav>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#FF6600] text-xs font-bold mb-3">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Official MaxiTShop Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              {currentCategory ? currentCategory.name : 'All Products'}
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Explore our complete range of certified solar packages, on-grid &amp; hybrid inverters, industrial equipment, power protection, and electronic accessories with nationwide warranty.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700">
            <Sparkles className="w-4 h-4 text-[#FF6600]" />
            <div>
              <p className="font-bold text-slate-900">{total} Products Available</p>
              <p className="text-[11px] text-slate-500">100% Genuine &amp; Brand Warranty</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MOTHER CATEGORIES SHOWCASE SECTION ─── */}
      {categories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#FF6600]" />
                <span>Browse by Mother Category</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Select any of our 12 primary divisions to view specialized components and turnkey systems
              </p>
            </div>
            {search.category && (
              <Link
                href="/shop"
                className="text-xs font-bold text-[#FF6600] hover:text-[#e55c00] flex items-center gap-1 self-start sm:self-auto px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200"
              >
                <span>View All Products</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* 12 Mother Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {/* "All Categories" Tile */}
            <Link
              href={buildCategoryUrl()}
              className={`group relative p-3 rounded-xl border transition-all flex flex-col justify-between ${
                !search.category
                  ? 'bg-gradient-to-br from-orange-50 to-amber-50/50 border-[#FF6600] shadow-xs ring-1 ring-[#FF6600]'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  !search.category ? 'bg-[#FF6600] text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-[#FF6600]'
                }`}>
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  !search.category ? 'bg-orange-200/60 text-[#b54800]' : 'bg-gray-100 text-gray-500'
                }`}>
                  All
                </span>
              </div>
              <div>
                <span className={`block text-xs font-bold leading-tight mb-0.5 ${
                  !search.category ? 'text-[#FF6600]' : 'text-gray-900 group-hover:text-[#FF6600]'
                }`}>
                  All Products
                </span>
                <span className="text-[11px] text-gray-400">
                  {totalAllCategoriesCount.toLocaleString()} items
                </span>
              </div>
            </Link>

            {/* 12 Mother Categories */}
            {categories.map((cat: any) => {
              const IconComponent = getCategoryIcon(cat.slug);
              const isActive = search.category === cat.slug;
              return (
                <Link
                  key={cat.id || cat.slug}
                  href={isActive ? buildCategoryUrl() : buildCategoryUrl(cat.slug)}
                  className={`group relative p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-gradient-to-br from-orange-50 to-amber-50/50 border-[#FF6600] shadow-xs ring-1 ring-[#FF6600]'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? 'bg-[#FF6600] text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-[#FF6600]'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    {cat.productCount !== undefined && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-orange-200/60 text-[#b54800]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cat.productCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className={`block text-xs font-bold leading-tight mb-0.5 line-clamp-2 ${
                      isActive ? 'text-[#FF6600]' : 'text-gray-900 group-hover:text-[#FF6600]'
                    }`}>
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {cat.children?.length ? `${cat.children.length} subcategories` : 'Explore'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* If a Mother Category is selected and has children, show its subcategories right below */}
          {currentCategory && currentCategory.children && currentCategory.children.length > 0 && (
            <div className="mt-4 pt-3.5 border-t border-gray-100">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-gray-700">
                  Subcategories in <span className="text-[#FF6600]">{currentCategory.name}</span>:
                </span>
                <Link
                  href={`/category/${currentCategory.slug}`}
                  className="text-xs text-[#FF6600] hover:underline font-semibold flex items-center gap-1"
                >
                  Open Category Page <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {currentCategory.children.map((sub: any) => (
                  <Link
                    key={sub._id || sub.id || sub.slug}
                    href={`/category/${sub.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 text-xs font-medium text-gray-700 hover:text-[#FF6600] transition-all whitespace-nowrap flex items-center gap-1.5"
                  >
                    <span>{sub.name}</span>
                    {sub.productCount !== undefined && (
                      <span className="text-[10px] bg-white text-gray-500 px-1.5 py-0.2 rounded-full border border-gray-200">
                        {sub.productCount}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2-Column Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Sidebar Filter */}
        <div className="lg:col-span-1">
          <CategoryFilterSidebar
            availableBrands={availableBrands}
            currentCategory={search.category}
            subcategories={motherSubcategories}
            isShop={true}
            totalProducts={totalAllCategoriesCount}
          />
        </div>

        {/* Right Main Grid */}
        <div className="lg:col-span-3 space-y-4">
          <CategorySortBar total={total} />

          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
              <PackageX className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No products found</h3>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                We couldn&apos;t find any items matching your selected criteria. Try resetting your filters.
              </p>
              <Link
                href="/shop"
                className="px-4 py-2 bg-[#FF6600] text-white text-xs font-semibold rounded-lg hover:bg-[#e55c00] transition-colors"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {items.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {hasPrev && (
                <Link
                  href={buildPageUrl(page - 1)}
                  className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center gap-1 shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              )}

              {/* Pagination Numbers */}
              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (page > 3) pages.push('...');
                  const start = Math.max(2, page - 1);
                  const end = Math.min(totalPages - 1, page + 1);
                  for (let i = start; i <= end; i++) {
                    if (!pages.includes(i)) pages.push(i);
                  }
                  if (page < totalPages - 2) pages.push('...');
                  if (!pages.includes(totalPages)) pages.push(totalPages);
                }

                return pages.map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">
                        ...
                      </span>
                    );
                  }
                  const pageNum = Number(p);
                  return (
                    <Link
                      key={pageNum}
                      href={buildPageUrl(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                        pageNum === page
                          ? 'bg-[#FF6600] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                });
              })()}

              {hasNext && (
                <Link
                  href={buildPageUrl(page + 1)}
                  className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center gap-1 shadow-xs"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
