import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';
import { CategorySortBar } from '@/components/shop/CategorySortBar';
import { ChevronRight, Home, Tag, PackageX, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const brand = await api.getBrand(slug);
    return {
      title: `${brand.name} Products in Bangladesh | MaxiTShop`,
      description: `Shop authentic ${brand.name} products at lowest price in Bangladesh. Official warranty and Cash on Delivery at MaxiTShop.`,
    };
  } catch {
    return {
      title: 'Brand | MaxiTShop Bangladesh',
    };
  }
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const page = Math.max(1, parseInt(search.page || '1', 10));
  const limit = 20;
  const sort = search.sort || 'newest';

  let brand: any = null;
  try {
    brand = await api.getBrand(slug);
  } catch {
    notFound();
  }

  if (!brand) {
    notFound();
  }

  // Fetch paginated products matching this brand
  let products: any[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const res = await api.getProducts({ brand: brand.name, sort, page, limit });
    products = res.items || [];
    total = (res as any).total ?? res.pagination?.total ?? products.length;
    totalPages = (res as any).totalPages ?? res.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));
  } catch (err) {
    console.error('Failed to fetch brand products:', err);
  }

  // Fallback to embedded brand.products if query returned empty (e.g. edge-case punctuation match)
  if (products.length === 0 && Array.isArray(brand.products) && brand.products.length > 0) {
    const allBrandProds = [...brand.products];
    if (sort === 'price-asc') allBrandProds.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === 'price-desc') allBrandProds.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === 'popular') allBrandProds.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    else if (sort === 'rating') allBrandProds.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    total = allBrandProds.length;
    totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    products = allBrandProds.slice(start, start + limit);
  }

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const buildPageUrl = (targetPage: number) => {
    const p = new URLSearchParams();
    if (search.sort) p.set('sort', search.sort);
    p.set('page', String(targetPage));
    return `/brand/${encodeURIComponent(brand.slug || slug)}?${p.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 mb-5 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <Link href="/brands" className="hover:text-[#FF6600] transition-colors">
          Brands
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">{brand.name}</span>
      </nav>

      {/* Brand Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-2">
          {brand.logo ? (
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              unoptimized
              sizes="112px"
              className="object-contain p-2"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <Tag className="w-9 h-9 text-[#FF6600] mb-1" />
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider px-1 line-clamp-1">
                {brand.name}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF6600] text-[11px] font-bold mb-2">
            <Tag className="w-3 h-3" />
            <span>Official Brand Store</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            {brand.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            {brand.description || `Explore 100% genuine ${brand.name} devices, spares, and accessories with official warranty and fast delivery across Bangladesh.`}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-semibold text-gray-500">
            <span className="text-[#FF6600] font-bold">{total.toLocaleString()} Products Available</span>
            <span className="text-gray-300">•</span>
            <Link href="/brands" className="text-gray-600 hover:text-[#FF6600] underline transition-colors">
              Browse All Brands
            </Link>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-1">
          <div className="w-1.5 h-5 bg-[#FF6600] rounded-full" />
          <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight">
            All Products by {brand.name}
          </h2>
        </div>

        <CategorySortBar total={total} />

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
            <PackageX className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">No products available</h3>
            <p className="text-xs text-gray-500 max-w-xs mb-4">
              Products for this brand are currently restocking. Please check back shortly or explore other brands.
            </p>
            <Link
              href="/brands"
              className="px-4 py-2 bg-[#FF6600] text-white text-xs font-semibold rounded-lg hover:bg-[#e55c00] transition-colors"
            >
              View All Brands
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {hasPrev && (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center gap-1 shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => {
                    const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsisBefore && (
                          <span className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">
                            ...
                          </span>
                        )}
                        <Link
                          href={buildPageUrl(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                            p === page
                              ? 'bg-[#FF6600] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </Link>
                      </React.Fragment>
                    );
                  })}

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
          </>
        )}
      </div>
    </div>
  );
}
