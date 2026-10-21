import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { StoriesHero } from '@/components/shop/StoriesHero';
import { ProductCard } from '@/components/shop/ProductCard';
import { SpeciallyForYou } from '@/components/shop/SpeciallyForYou';
import { Flame, Sparkles, Star, ArrowRight, ShieldCheck, Truck, RefreshCcw, Headphones, Zap } from 'lucide-react';
import { Product, Banner, Category } from '@/lib/types';

export const revalidate = 0; // Fresh data

export default async function HomePage() {
  let categories: Category[] = [];
  let deals: Product[] = [];
  let newArrivals: Product[] = [];
  let featured: Product[] = [];
  let forYouProducts: Product[] = [];
  let solarProducts: Product[] = [];
  let totalForYou = 40;

  try {
    const [categoriesData, dealsData, newData, featData, allProdsData, solarData] = await Promise.all([
      api.getCategories().catch(() => []),
      api.getDeals(10).catch(() => []),
      api.getNewArrivals(10).catch(() => []),
      api.getFeatured(10).catch(() => []),
      api.getProducts({ page: 1, limit: 10 }).catch(() => ({ items: [], pagination: { total: 0 } })),
      api.getProducts({ category: 'solar-green-energy', limit: 8 }).catch(() => ({ items: [], pagination: { total: 0 } }))
    ]);

    categories = categoriesData;
    deals = dealsData;
    newArrivals = newData;
    featured = featData;
    forYouProducts = allProdsData.items;
    solarProducts = solarData.items.length > 0 ? solarData.items : allProdsData.items.slice(0, 8);
    totalForYou = allProdsData.pagination?.total || 40;
  } catch (err) {
    console.error('Error prefetching home page data:', err);
  }

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      
      {/* 1. Hero Stories Carousel (Matching reference screenshot) */}
      <StoriesHero />

      {/* 2. Solar & Green Energy Section Header (Matching reference screenshot) */}
      <section className="max-w-7xl mx-auto px-4 -mt-2 sm:-mt-4">
        {/* Section Title with glowing gradient pill bars */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="h-1 w-10 sm:w-14 bg-gradient-to-r from-transparent to-blue-600 rounded-full" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Solar &amp; green energy
            </h2>
            <div className="h-1 w-10 sm:w-14 bg-gradient-to-l from-transparent to-blue-600 rounded-full" />
          </div>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto">
            Products from{' '}
            <Link
              href="/category/solar-green-energy"
              className="text-blue-600 font-medium hover:underline"
            >
              solar &amp; wind energy
            </Link>{' '}
            and its subcategories.
          </p>
        </div>

        {/* Solar Products Row/Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {solarProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. Key Selling Points / Trust Strip */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Cash on Delivery</p>
              <p className="text-[11px] text-slate-500">Pay cash upon delivery across BD</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Fast 2-3 Days Shipping</p>
              <p className="text-[11px] text-slate-500">Express delivery to 64 districts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">100% Genuine Guaranteed</p>
              <p className="text-[11px] text-slate-500">Authentic products with warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">7 Days Replacement</p>
              <p className="text-[11px] text-slate-500">Hassle-free return & claim policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Deals of the Day (Flash Deals) */}
      <section id="deals" className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl p-4 sm:p-6 shadow-md text-white mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Flame className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                    Deals of the Day
                  </h2>
                  <span className="bg-white text-red-600 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full">
                    Special Prices
                  </span>
                </div>
                <p className="text-xs text-white/90">Grab genuine products with maximum discounts before stock runs out!</p>
              </div>
            </div>

            <Link
              href="/category/solar-green-energy"
              className="inline-flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-4 py-2 rounded-lg transition-colors w-fit shadow-xs"
            >
              <span>View All Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Deals Horizontal Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {deals.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Shop by Top Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Explore Popular Categories
            </h2>
            <p className="text-xs text-slate-500">Find top-grade solar systems, electronics and smart gadgets</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center text-center hover:border-blue-500 hover:shadow-md transition-all duration-200"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 overflow-hidden mb-2.5 border-2 border-slate-100 group-hover:scale-105 group-hover:border-blue-400 transition-all">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-600">
                    <Headphones className="w-8 h-8" />
                  </div>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-600 line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {cat.subcategories?.length || 4}+ items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                New Arrivals
              </h2>
              <p className="text-xs text-slate-500">Newly launched devices and green energy equipment</p>
            </div>
          </div>
          <Link
            href="/category/solar-green-energy"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>See More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {newArrivals.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Specially For You (Continuous Feed) */}
      <section className="max-w-7xl mx-auto px-4">
        <SpeciallyForYou initialProducts={forYouProducts} totalAvailable={totalForYou} />
      </section>

    </div>
  );
}
