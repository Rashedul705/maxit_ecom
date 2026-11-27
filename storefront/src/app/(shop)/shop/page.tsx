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
  Sparkles
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

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const search = await searchParams;
  const page = parseInt(search.page || '1', 10);
  const limit = 50;

  // On shop page: show all products across the catalog by default (with solar products prioritized first).
  // If search.category is specified and not 'all', filter by that specific category.
  const isAllCategories = !search.category || search.category === 'all';
  const effectiveCategory = isAllCategories ? undefined : search.category;

  // Fetch categories and products concurrently
  const [categories, productsResponse] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getProducts({
      category: effectiveCategory,
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

  const currentCategory = effectiveCategory
    ? (categories.find((c: any) => c.slug === effectiveCategory) ||
       categories.flatMap((c: any) => c.children || []).find((c: any) => c.slug === effectiveCategory))
    : null;

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
    if (search.category && search.category !== 'all') {
      p.set('category', search.category);
    }
    if (search.brand) p.set('brand', search.brand);
    if (search.minPrice) p.set('minPrice', search.minPrice);
    if (search.maxPrice) p.set('maxPrice', search.maxPrice);
    if (search.inStock) p.set('inStock', search.inStock);
    if (search.sort) p.set('sort', search.sort);
    p.set('page', String(targetPage));
    return `/shop?${p.toString()}`;
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
        <Link href="/shop?category=all" className="hover:text-[#FF6600] transition-colors">
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
              {currentCategory
                ? 'Explore certified solar packages, on-grid & hybrid solar inverters, solar panels, and lithium storage solutions with nationwide warranty.'
                : 'Explore our complete range of certified solar packages, on-grid & hybrid inverters, industrial equipment, power protection, and electronic accessories with nationwide warranty.'}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700">
            <Sparkles className="w-4 h-4 text-[#FF6600]" />
            <div>
              <p className="font-bold text-slate-900">
                {(isAllCategories ? totalAllCategoriesCount : total).toLocaleString()} Products Available
              </p>
              <p className="text-[11px] text-slate-500">100% Genuine &amp; Brand Warranty</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Sidebar Filter (keeps all mother categories with Solar first and active by default) */}
        <div className="lg:col-span-1">
          <CategoryFilterSidebar
            availableBrands={availableBrands}
            currentCategory={effectiveCategory}
            subcategories={motherSubcategories}
            isShop={true}
            totalProducts={totalAllCategoriesCount}
          />
        </div>

        {/* Right Main Grid */}
        <div className="lg:col-span-3 space-y-4 min-w-0">
          <CategorySortBar total={total} />

          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
              <PackageX className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No products found</h3>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                We couldn&apos;t find any items matching your selected criteria. Try resetting your filters.
              </p>
              <Link
                href="/shop?category=all"
                className="px-4 py-2 bg-[#FF6600] text-white text-xs font-semibold rounded-lg hover:bg-[#e55c00] transition-colors"
              >
                View All Categories
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-4">
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
