'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Scale, Heart } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cartContext';
import { useWishlist } from '@/lib/wishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openCheckout } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isInCompare, setIsInCompare] = useState<boolean>(false);

  // Sync compare status with localStorage
  useEffect(() => {
    const checkCompare = () => {
      try {
        const stored = localStorage.getItem('maxit_compare');
        if (stored) {
          const list: string[] = JSON.parse(stored);
          setIsInCompare(list.includes(product.id));
        } else {
          setIsInCompare(false);
        }
      } catch {
        // ignore storage errors
      }
    };

    checkCompare();
    window.addEventListener('maxit_compare_updated', checkCompare);
    return () => window.removeEventListener('maxit_compare_updated', checkCompare);
  }, [product.id]);

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('maxit_compare');
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (list.includes(product.id)) {
        list = list.filter(id => id !== product.id);
        setIsInCompare(false);
      } else {
        list.push(product.id);
        setIsInCompare(true);
      }
      localStorage.setItem('maxit_compare', JSON.stringify(list));
      window.dispatchEvent(new Event('maxit_compare_updated'));
    } catch {
      // ignore
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.price === 0) {
      window.location.href = 'tel:+8801733272445';
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

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-xl border border-gray-200 p-3 sm:p-3.5 hover:border-[#FF6600] hover:shadow-md transition-all duration-200">
      
      {/* Top Part: Image, Badges, Title, Key Features */}
      <div>
        {/* Product Image Area */}
        <div className="relative block w-full aspect-square rounded-lg bg-gray-50 overflow-hidden mb-2.5">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80'}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
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
        </div>

        {/* Product Title (clamped to 2 lines max) */}
        <Link href={`/product/${product.slug}`} className="block mb-2">
          <h3 className="text-xs sm:text-[13px] font-semibold text-gray-800 line-clamp-2 min-h-[34px] sm:min-h-[36px] group-hover:text-[#FF6600] transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Key Feature Bullets (3 to 4 bullets) */}
        {bullets.length > 0 ? (
          <ul className="space-y-1 mb-2.5 text-[11px] text-gray-600 min-h-[64px]">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5 leading-tight">
                <span className="w-1 h-1 rounded-full bg-gray-400 mt-1 shrink-0" />
                <span className="line-clamp-1">{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="min-h-[16px] mb-1" />
        )}
      </div>

      {/* Bottom Part: Price & Action Buttons */}
      <div className="mt-auto pt-2 border-t border-gray-100">
        
        {/* Pricing display */}
        <div className="flex items-baseline gap-2 mb-2.5">
          {product.price === 0 ? (
            <span className="text-xs sm:text-sm font-bold text-[#FF6600]">
              Call for Price
            </span>
          ) : (
            <>
              <span className="text-sm sm:text-base font-bold text-[#FF6600]">
                ৳{product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <del className="text-xs text-gray-400 font-medium">
                  ৳{product.oldPrice!.toLocaleString()}
                </del>
              )}
            </>
          )}
        </div>

        {/* Action Buttons: Buy Now & Add to Compare */}
        <div className="flex items-center gap-1.5">
          {/* Buy Now Button */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="flex-1 py-1.5 px-2 bg-[#FF6600] hover:bg-[#E65100] active:scale-[0.99] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{product.price === 0 ? 'Call Now' : 'Buy Now'}</span>
          </button>

          {/* Add to Compare Button */}
          <button
            type="button"
            onClick={handleToggleCompare}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 ${
              isInCompare
                ? 'bg-orange-50 border-orange-200 text-[#FF6600]'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title={isInCompare ? 'Remove from Compare' : 'Add to Compare'}
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isInCompare ? 'Compared' : 'Compare'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
