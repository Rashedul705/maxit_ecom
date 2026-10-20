import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';
import { Search, Home, ChevronRight, PackageSearch } from 'lucide-react';
import type { Metadata } from 'next';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search results for "${q}" | maxitshop` : 'Search Products | maxitshop',
    description: 'Find products on maxitshop Bangladesh with best deals and Cash on Delivery.',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || '';

  const productsResponse = query
    ? await api.getProducts({ search: query, limit: 30 }).catch(() => ({ items: [], pagination: { total: 0 } }))
    : { items: [], pagination: { total: 0 } };

  const { items, pagination } = productsResponse;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-slate-500 mb-5 gap-1.5">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-semibold text-slate-900">Search</span>
        {query && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-blue-600 font-bold">&quot;{query}&quot;</span>
          </>
        )}
      </nav>

      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {query ? `Search results for "${query}"` : 'Search Products'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {pagination.total > 0
              ? `Found ${pagination.total} matching items in our store`
              : 'Try searching by brand, model, or product name'}
          </p>
        </div>
      </div>

      {/* Results Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <PackageSearch className="w-16 h-16 text-slate-300 mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">No products found for &quot;{query}&quot;</h2>
          <p className="text-xs text-slate-500 max-w-sm mb-5">
            Check your spelling, try more general terms, or explore our top categories.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/category/solar-green-energy" className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 text-xs font-semibold rounded-lg">
              Solar Panels
            </Link>
            <Link href="/category/mobile-phones" className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 text-xs font-semibold rounded-lg">
              Mobile Phones
            </Link>
            <Link href="/category/laptops" className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 text-xs font-semibold rounded-lg">
              Laptops
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
