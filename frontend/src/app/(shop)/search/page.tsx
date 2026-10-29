import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';
import { CategoryFilterSidebar } from '@/components/shop/CategoryFilterSidebar';
import { CategorySortBar } from '@/components/shop/CategorySortBar';
import { Search, Home, ChevronRight, PackageSearch, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search results for "${q}" | MaxiTShop` : 'Search Products | MaxiTShop',
    description: 'Find products on MaxiTShop Bangladesh with best deals and Cash on Delivery.',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const page = parseInt(params.page || '1', 10);
  const limit = 16;

  const fallbackResponse = {
    items: [],
    pagination: { total: 0, totalPages: 1, page: 1, limit, hasNext: false, hasPrev: false },
    filterMeta: { availableBrands: [] }
  };

  const productsResponse = query
    ? await api.getProducts({
        search: query,
        brand: params.brand,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        inStock: params.inStock,
        sort: params.sort || 'newest',
        page,
        limit
      }).catch(() => fallbackResponse)
    : fallbackResponse;

  const items = productsResponse.items || [];
  const total = (productsResponse as any).total ?? productsResponse.pagination?.total ?? items.length;
  const totalPages = (productsResponse as any).totalPages ?? productsResponse.pagination?.totalPages ?? 1;
  const availableBrands = productsResponse.filterMeta?.availableBrands || [];

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Build pagination url helper
  const getPageUrl = (targetPage: number) => {
    const qp = new URLSearchParams();
    if (query) qp.set('q', query);
    if (params.brand) qp.set('brand', params.brand);
    if (params.minPrice) qp.set('minPrice', params.minPrice);
    if (params.maxPrice) qp.set('maxPrice', params.maxPrice);
    if (params.inStock) qp.set('inStock', params.inStock);
    if (params.sort) qp.set('sort', params.sort);
    qp.set('page', String(targetPage));
    return `/search?${qp.toString()}`;
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
        <span className="font-semibold text-gray-900">Search</span>
        {query && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-[#FF6600] font-bold">&quot;{query}&quot;</span>
          </>
        )}
      </nav>

      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6600] flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              {query ? `Search results for "${query}"` : 'Search Products'}
            </h1>
          </div>
          <p className="text-xs text-gray-500">
            {total > 0
              ? `Found ${total} matching items across categories in our store`
              : 'Try searching by brand, model, or product name'}
          </p>
        </div>

        {query && (
          <div className="text-xs font-semibold px-3 py-1.5 bg-orange-50 text-[#FF6600] rounded-full border border-orange-200/60 self-start sm:self-auto">
            Keyword: {query}
          </div>
        )}
      </div>

      {/* 2-Column Discovery Layout: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1">
          <CategoryFilterSidebar availableBrands={availableBrands} />
        </div>

        {/* Right Main Grid & Sort Bar */}
        <div className="lg:col-span-3 space-y-4">
          <CategorySortBar total={total} />

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center shadow-xs">
              <PackageSearch className="w-16 h-16 text-gray-300 mb-3" />
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                No products found {query ? `for "${query}"` : 'matching your criteria'}
              </h2>
              <p className="text-xs text-gray-500 max-w-sm mb-5">
                Check your spelling, reset your active filters, or explore our top categories.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/category/solar-energy" className="px-3.5 py-2 bg-gray-100 hover:bg-orange-50 hover:text-[#FF6600] text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                  Solar Energy
                </Link>
                <Link href="/category/battery-bms-charger" className="px-3.5 py-2 bg-gray-100 hover:bg-orange-50 hover:text-[#FF6600] text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                  Battery &amp; BMS
                </Link>
                <Link href="/category/customized-circuit-pcb" className="px-3.5 py-2 bg-gray-100 hover:bg-orange-50 hover:text-[#FF6600] text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                  Circuits &amp; PCB
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {items.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-6 flex items-center justify-center gap-2">
              {hasPrev ? (
                <Link
                  href={getPageUrl(page - 1)}
                  className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 flex items-center gap-1 shadow-xs transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="px-3 py-2 bg-gray-50 border border-gray-200 text-gray-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-not-allowed">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </span>
              )}

              <span className="text-xs text-gray-500 font-medium px-2">
                Page {page} of {totalPages}
              </span>

              {hasNext ? (
                <Link
                  href={getPageUrl(page + 1)}
                  className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 flex items-center gap-1 shadow-xs transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="px-3 py-2 bg-gray-50 border border-gray-200 text-gray-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-not-allowed">
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
