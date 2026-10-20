'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Flame, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const discountPercent = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const savings = product.oldPrice && product.oldPrice > product.price
    ? product.oldPrice - product.price
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-slate-200 p-3 hover:border-blue-400 hover:shadow-lg transition-all duration-200">
      
      {/* Product Image Area */}
      <Link href={`/product/${product.slug}`} className="relative block w-full aspect-square rounded-lg bg-slate-50 overflow-hidden mb-2.5">
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80'}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          {product.isDeal && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
              <Flame className="w-2.5 h-2.5" />
              <span>Deal</span>
            </span>
          )}
          {product.isNew && !product.isDeal && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
              <span>New</span>
            </span>
          )}
        </div>
      </Link>

      {/* Brand & Stock Status */}
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="font-bold text-slate-400 uppercase tracking-wider">{product.brand}</span>
        {product.stock > 0 ? (
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            In Stock
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Out of Stock
          </span>
        )}
      </div>

      {/* Title */}
      <Link href={`/product/${product.slug}`} className="block mb-2 flex-1">
        <h3 className="text-[13px] sm:text-sm font-semibold text-slate-800 line-clamp-2 min-h-[38px] group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
      </Link>

      {/* Price Block */}
      <div className="mt-auto pt-2 border-t border-slate-100 flex flex-col gap-1 mb-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-blue-600">
            ৳{product.price.toLocaleString()}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              ৳{product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>
        {savings > 0 && (
          <div className="text-[10px] font-bold text-red-600 bg-red-50 w-fit px-1.5 py-0.5 rounded">
            Save ৳{savings.toLocaleString()}
          </div>
        )}
      </div>

      {/* Action CTA Button */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock <= 0}
        className="w-full py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/btn"
      >
        <ShoppingBag className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
        <span>Add to Order</span>
      </button>
    </div>
  );
};
