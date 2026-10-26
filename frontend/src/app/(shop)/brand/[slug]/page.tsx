import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';
import { ChevronRight, Home, Tag, PackageX } from 'lucide-react';
import type { Metadata } from 'next';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

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

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;

  let brand = null;
  try {
    brand = await api.getBrand(slug);
  } catch {
    notFound();
  }

  // Fetch products by brand
  let products: any[] = [];
  try {
    const res = await api.getProducts({ brand: brand.name, limit: 30 });
    products = res.items || [];
    if (products.length === 0) {
      // Also try slug
      const resSlug = await api.getProducts({ brand: slug, limit: 30 });
      products = resSlug.items || [];
    }
  } catch (err) {
    console.error('Failed to fetch brand products:', err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 mb-5 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-gray-500">Brands</span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">{brand.name}</span>
      </nav>

      {/* Brand Header Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-2">
          {brand.logo ? (
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              sizes="112px"
              className="object-contain p-2"
            />
          ) : (
            <Tag className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            {brand.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
            {brand.description || `Explore 100% genuine ${brand.name} devices, spares, and accessories with official warranty and fast delivery across Bangladesh.`}
          </p>
          <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-gray-500">
            <span className="text-[#FF6600] font-bold">{products.length} Products Available</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
          <div className="w-1.5 h-5 bg-[#FF6600] rounded-full" />
          <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight">
            All Products by {brand.name}
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center">
            <PackageX className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">No products available</h3>
            <p className="text-xs text-gray-500 max-w-xs mb-4">
              Products for this brand are currently restocking. Please check back shortly or explore other categories.
            </p>
            <Link
              href="/"
              className="px-4 py-2 bg-[#FF6600] text-white text-xs font-semibold rounded-lg hover:bg-[#e55c00] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
