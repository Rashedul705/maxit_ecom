import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { ChevronRight, Home, Store, CheckCircle, Star, Phone, MapPin, Package } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verified Sellers & Partners | MaxiTShop Bangladesh',
  description: 'Connect with certified sellers and authorized distributors on MaxiTShop.',
};

export default async function SellersPage() {
  let sellers: any[] = [];
  try {
    sellers = await api.getSellers();
  } catch (err) {
    console.error('Failed to fetch sellers:', err);
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
        <span className="font-semibold text-gray-900">Sellers</span>
      </nav>

      {/* Page Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#FF6600] flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              Verified Sellers &amp; Authorized Partners
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Buy directly from verified solar manufacturers, official importers, and authorized component suppliers across Bangladesh.
            </p>
          </div>
        </div>
      </div>

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <div
            key={seller.id}
            className="bg-white rounded-xl border border-gray-200 hover:border-[#FF6600] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                    {seller.logo ? (
                      <Image
                        src={seller.logo}
                        alt={seller.storeName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                        {seller.storeName[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-bold text-gray-900">{seller.storeName}</h2>
                      {seller.verified && (
                        <span title="Verified Seller">
                          <CheckCircle className="w-4 h-4 text-blue-600 fill-blue-50 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{seller.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-amber-700 text-xs font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{seller.rating ? seller.rating.toFixed(1) : '4.9'}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 py-3 border-y border-gray-100 my-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#FF6600] shrink-0" />
                  <span>{seller.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{seller.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{seller.totalProducts || 18}+ Active Products</span>
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="w-full py-2 bg-gray-100 hover:bg-[#FF6600] text-gray-800 hover:text-white rounded-lg text-xs font-bold text-center transition-colors"
            >
              Explore Seller Catalog
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
