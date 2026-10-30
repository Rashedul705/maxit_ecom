'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, PhoneCall, Star } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openCheckout } = useCart();
  const CALL_FOR_PRICE = true; // Temporary: call for price on all products

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (CALL_FOR_PRICE || product.price === 0) {
      window.location.href = 'tel:+8801733272445';
      return;
    }
    addToCart(product, 1, false);
    openCheckout();
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-lg border border-gray-200/90 p-2.5 sm:p-3 hover:border-[#FF6600] hover:shadow-lg transition-all duration-200">
      {/* Product Image Area */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block w-full aspect-square rounded-md bg-gray-50 overflow-hidden mb-2"
      >
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80'}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Badge: e.g. "10% OFF" */}
        {!CALL_FOR_PRICE && discountPercent > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-[#E53935] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {discountPercent}% OFF
          </div>
        )}
      </Link>

      {/* Brand & Stock */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
        <span className="font-semibold uppercase tracking-wider text-gray-400">
          {product.brand}
        </span>
        {product.stock > 0 ? (
          <span className="text-emerald-600 font-medium text-[11px]">In Stock</span>
        ) : (
          <span className="text-red-500 font-medium text-[11px]">Out of Stock</span>
        )}
      </div>

      {/* Truncated Title */}
      <Link href={`/product/${product.slug}`} className="block mb-1.5 flex-1">
        <h3 className="text-xs sm:text-[13px] font-semibold text-gray-800 line-clamp-2 min-h-[36px] group-hover:text-[#FF6600] transition-colors leading-snug">
          {product.title}
        </h3>
      </Link>

      {/* Star Rating */}
      <div className="flex items-center gap-1 mb-2 text-[11px] text-gray-500">
        <div className="flex items-center text-amber-400">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        </div>
        <span className="font-semibold text-gray-700">
          {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
        </span>
        <span className="text-[10px] text-gray-400">
          ({product.reviewCount || 10})
        </span>
      </div>

      {/* Pricing display */}
      <div className="mt-auto pt-2 border-t border-gray-100 mb-2.5">
        {CALL_FOR_PRICE || product.price === 0 ? (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FF6600]">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call for price</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-black text-[#FF6600]">
              ৳{product.price.toLocaleString()}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <del className="text-xs text-gray-400 font-medium">
                ৳{product.oldPrice.toLocaleString()}
              </del>
            )}
          </div>
        )}
      </div>

      {/* Order Now Button */}
      <button
        onClick={handleOrderNow}
        className="w-full py-2 px-3 bg-[#FF6600] hover:bg-[#e55c00] active:scale-[0.99] text-white rounded-md text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
      >
        <PhoneCall className="w-3.5 h-3.5" />
        <span>Call for Price</span>
      </button>
    </div>
  );
};
