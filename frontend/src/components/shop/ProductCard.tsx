'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap, Check, Heart, Edit3, PhoneCall } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cartContext';
import { useWishlist } from '@/lib/wishlistContext';
import { useAdminAuth } from '@/lib/useAdminAuth';
import { useSettings } from '@/lib/settingsContext';
import { SafeImage } from '@/components/common/SafeImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openCheckout } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { hotline, telHref } = useSettings();
  const isAdmin = useAdminAuth();
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const isCallForPrice = product.price === 0 || isOutOfStock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCallForPrice) {
      window.location.href = telHref;
      return;
    }
    addToCart(product, 1, true);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCallForPrice) {
      window.location.href = telHref;
      return;
    }
    addToCart(product, 1, false);
    openCheckout();
  };

  const inWishlist = isInWishlist(product.id);

  // Calculate savings in taka if oldPrice > price
  const hasDiscount = Boolean(product.oldPrice && product.oldPrice > product.price);
  const saveAmount = hasDiscount ? (product.oldPrice! - product.price) : 0;

  // Extract 3 to 4 Key Feature Bullets with fallbacks
  let bullets: string[] = [];
  if (Array.isArray(product.keyFeatures) && product.keyFeatures.length > 0) {
    bullets = product.keyFeatures.filter(f => f && f.trim()).slice(0, 4);
  } else if (product.shortDescription) {
    bullets = product.shortDescription
      .split(/\r?\n/)
      .map(s => s.replace(/^[•\-\*]\s*/, '').trim())
      .filter(s => s.length > 0)
      .slice(0, 4);
  } else if (product.specs && typeof product.specs === 'object') {
    // Graceful fallback for existing products with flat specs
    bullets = Object.entries(product.specs)
      .filter(([_, v]) => typeof v === 'string' && v.trim().length > 0)
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${v}`);
  }

  // Pick the best available non-placeholder image
  const displayImage = (product.image && !product.image.includes('product-placeholder'))
    ? product.image
    : (Array.isArray(product.images) ? product.images.find(img => img && !img.includes('product-placeholder')) : null) || product.image || '';

  return (
    <div className="group relative flex flex-col justify-between h-full bg-white rounded-xl border border-gray-200 p-3 sm:p-3.5 hover:border-[#FF6600] hover:shadow-md transition-all duration-200">
      
      {/* Top Part: Image, Badges, Title, Key Features */}
      <div>
        {/* Product Image Area */}
        <div className="relative block w-full aspect-square rounded-lg bg-gray-50 overflow-hidden mb-2.5">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <SafeImage
              src={displayImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Link>

          {/* Startech-style "Save: X taka" Badge when oldPrice > price */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 z-10 bg-[#FF6600] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs pointer-events-none">
              Save: ৳{saveAmount.toLocaleString()}
            </div>
          )}

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              inWishlist
                ? 'bg-pink-50 text-pink-600 shadow-xs'
                : 'bg-white/90 text-gray-400 hover:text-pink-600 hover:bg-white shadow-2xs'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current text-pink-600' : ''}`} />
          </button>

          {/* Admin Edit Shortcut Button (Only visible to authenticated admins) */}
          {isAdmin && (
            <a
              href={`/admin?tab=products&edit=${product.id || product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute top-10 right-2 z-10 w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
              title="Edit Product (Admin)"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Product Title (clamped to 2 lines with uniform fixed height) */}
        <Link href={`/product/${product.slug}`} className="block mb-2">
          <h3 className="text-xs sm:text-[13px] font-semibold text-gray-800 line-clamp-2 h-[34px] sm:h-[36px] group-hover:text-[#FF6600] transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Key Feature Bullets (3 to 4 bullets with uniform height) */}
        {bullets.length > 0 ? (
          <ul className="space-y-1 mb-2.5 text-[11px] text-gray-600 h-[64px] overflow-hidden">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5 leading-tight">
                <span className="w-1 h-1 rounded-full bg-gray-400 mt-1 shrink-0" />
                <span className="line-clamp-1">{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-[64px] mb-2.5 flex items-center">
            <span className="text-[11px] text-gray-400 italic">Official Warranty &amp; Fast Delivery</span>
          </div>
        )}
      </div>

      {/* Bottom Part: Price & Action Buttons */}
      <div className="mt-auto pt-2 border-t border-gray-100">
        
        {/* Pricing display */}
        <div className="flex items-baseline justify-between gap-2 mb-2.5">
          {product.price === 0 ? (
            <span className="text-xs sm:text-sm font-bold text-[#FF6600]">
              Call for Price
            </span>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-bold text-[#FF6600]">
                ৳{product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <del className="text-xs text-gray-400 font-medium">
                  ৳{product.oldPrice!.toLocaleString()}
                </del>
              )}
            </div>
          )}
          {isOutOfStock && (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded shrink-0">
              Out of Stock
            </span>
          )}
        </div>

        {/* Action Buttons: Active Call for Price when out of stock / price 0, otherwise Buy Now & Add to Cart */}
        {isCallForPrice ? (
          <a
            href={telHref}
            onClick={(e) => e.stopPropagation()}
            className="w-full py-1.5 px-3 bg-[#FF6600] hover:bg-[#E65100] active:scale-[0.99] text-white rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title={`Call ${hotline} for price & availability`}
          >
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Call for Price</span>
          </a>
        ) : (
          <div className="flex items-center gap-1.5">
            {/* Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 py-1.5 px-2 bg-[#FF6600] hover:bg-[#E65100] active:scale-[0.99] text-white rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white shrink-0" />
              <span className="truncate">Buy Now</span>
            </button>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] sm:text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                isAdded
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white hover:bg-orange-50 border-orange-200 text-[#FF6600] hover:border-[#FF6600]'
              } shadow-2xs`}
              title="Add to Cart"
            >
              {isAdded ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5 text-[#FF6600] shrink-0" />
              )}
              <span className="truncate">{isAdded ? 'Added!' : 'Add to Cart'}</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
