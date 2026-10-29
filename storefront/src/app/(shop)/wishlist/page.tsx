'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/lib/wishlistContext';
import { useCart } from '@/lib/cartContext';
import { Heart, ShoppingBag, Trash2, Home, ChevronRight, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    openCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 mb-6 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">My Wishlist</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              My Saved Wishlist
            </h1>
            <p className="text-xs text-gray-500">
              Items you&apos;ve saved to purchase later
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-pink-100 text-pink-800 px-3 py-1 rounded-full">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Your wishlist is empty</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Save your favorite electronics, solar panels, and gadgets by tapping the heart icon on any product.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <Image
                    src={(prod.images && prod.images[0]) || (prod as any).image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500'}
                    alt={prod.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 300px"
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeFromWishlist(prod.id)}
                    title="Remove from Wishlist"
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-red-500 hover:bg-red-50 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6600]">
                    {prod.brand || 'Original'}
                  </span>
                  <Link
                    href={`/product/${prod.slug}`}
                    className="block text-xs font-bold text-gray-900 hover:text-[#FF6600] line-clamp-2 mt-1 leading-snug"
                  >
                    {prod.title}
                  </Link>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-base font-black text-gray-900">
                      ৳{prod.price.toLocaleString()}
                    </span>
                    {prod.oldPrice && prod.oldPrice > prod.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ৳{prod.oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => handleAddToCart(prod)}
                  className="w-full py-2.5 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
