import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';
import { CategoryFilterSidebar } from '@/components/shop/CategoryFilterSidebar';
import { CategorySortBar } from '@/components/shop/CategorySortBar';
import { ChevronRight, Home, ArrowLeft, ArrowRight, PackageX } from 'lucide-react';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    sub?: string;
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await api.getCategory(slug);
    return {
      title: `${category.name} in Bangladesh | maxitshop`,
      description: `Buy original ${category.name} at lowest price in Bangladesh. 100% genuine products with Cash on Delivery at maxitshop.`,
    };
  } catch {
    return {
      title: 'Category | maxitshop Bangladesh',
    };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const search = await searchParams;

  let category = null;
  try {
    category = await api.getCategory(slug);
  } catch {
    notFound();
  }

  // Fetch products
  const page = parseInt(search.page || '1', 10);
  const productsResponse = await api.getProducts({
    category: slug,
    brand: search.brand,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    sort: search.sort || 'newest',
    page,
    limit: 12
  });

  const { items, pagination, filterMeta } = productsResponse;
  const availableBrands = filterMeta?.availableBrands || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center text-xs text-slate-500 mb-5 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-semibold text-slate-900">{category.name}</span>
      </nav>

      {/* Category Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-xs">
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 mb-2">
          {category.name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          Browse our extensive collection of {category.name.toLowerCase()} with official warranty, lowest market rates, and fast doorstep delivery across Bangladesh.
        </p>

        {/* Subcategory Pills */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            {category.subcategories.map(sub => (
              <span
                key={sub.id}
                className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 px-3 py-1.5 rounded-full font-medium transition-colors"
              >
                {sub.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2-Column Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Sidebar Filter */}
        <div className="lg:col-span-1">
          <CategoryFilterSidebar
            availableBrands={availableBrands}
            currentCategory={slug}
          />
        </div>

        {/* Right Main Grid */}
        <div className="lg:col-span-3 space-y-4">
          <CategorySortBar total={pagination.total} />

          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
              <PackageX className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No products found</h3>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                We couldn&apos;t find any items matching your current filters. Try resetting the filters or searching with another term.
              </p>
              <Link
                href={`/category/${slug}`}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {items.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-6 flex items-center justify-center gap-2">
              {pagination.hasPrev && (
                <Link
                  href={`/category/${slug}?page=${page - 1}`}
                  className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center gap-1 shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Link>
              )}

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={`/category/${slug}?page=${p}`}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                    p === page
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </Link>
              ))}

              {pagination.hasNext && (
                <Link
                  href={`/category/${slug}?page=${page + 1}`}
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
