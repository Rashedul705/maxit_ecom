'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check, Star } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cartContext';
import { ProductReviewsSection } from './ProductReviewsSection';

interface ProductInteractiveViewProps {
  product: Product;
}

export const ProductInteractiveView: React.FC<ProductInteractiveViewProps> = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();

  const [activeImage, setActiveImage] = useState(product.images[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews' | 'shipping'>('specs');
  const [isAddedToast, setIsAddedToast] = useState(false);

  const discountPercent = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const savings = product.oldPrice && product.oldPrice > product.price
    ? product.oldPrice - product.price
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className="space-y-8">
      
      {/* Upper 2-Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        
        {/* Left: Product Gallery (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="relative aspect-square w-full rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
            <Image
              src={activeImage || product.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80'}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-xs">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img ? 'border-blue-600 shadow-xs' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx + 1}`} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-5">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                {product.brand}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 capitalize">{product.category.replace(/-/g, ' ')}</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug mb-2">
              {product.title}
            </h1>

            {/* Star Rating Overview Link */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map(st => (
                  <Star
                    key={st}
                    className={`w-4 h-4 ${
                      st <= Math.round(product.rating || 4.8)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating || 4.8}</span>
              <span className="text-xs text-slate-300">•</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('reviews');
                  const el = document.getElementById('product-tabs-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                {product.reviewCount || 12} Verified Customer Reviews
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              {product.shortDescription}
            </p>

            {/* Price Box */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-5 flex flex-wrap items-baseline gap-3">
              {product.price === 0 ? (
                <span className="text-2xl sm:text-3xl font-black text-[#FF6600]">
                  Call for price
                </span>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-[#FF6600]">
                    ৳{product.price.toLocaleString()}
                  </span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <del className="text-base text-gray-400 font-medium">
                      ৳{product.oldPrice.toLocaleString()}
                    </del>
                  )}
                  {savings > 0 && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                      Save ৳{savings.toLocaleString()} ({discountPercent}% ছাড়)
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Stock Indicator */}
            <div className="flex items-center gap-2 mb-5 text-sm">
              <span className="font-semibold text-gray-700">Availability:</span>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  In Stock ({product.stock} units available)
                </span>
              ) : (
                <span className="text-red-500 font-bold text-xs bg-red-50 px-2.5 py-0.5 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Quantity Selector & Purchase CTAs */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 rounded-l-lg cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-sm font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 rounded-r-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="w-full py-3 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>অর্ডার করুন (Order Now)</span>
                </button>
              </div>

              {isAddedToast && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>কার্টে যোগ করা হয়েছে! (Item added to cart)</span>
                </div>
              )}
            </div>

          </div>

          {/* Delivery & Warranty Trust Box */}
          <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Home Delivery</p>
                <p className="text-slate-500 text-[11px]">৳80 Dhaka | ৳130 Outside</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <RotateCcw className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">7 Days Return</p>
                <p className="text-slate-500 text-[11px]">Replacement Guarantee</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">100% Genuine</p>
                <p className="text-slate-500 text-[11px]">Cash on Delivery</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs Section: Specifications, Description, Reviews, Policy */}
      <div id="product-tabs-section" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'specs'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Product Specifications
          </button>
          <button
            onClick={() => setActiveTab('desc')}
            className={`px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'desc'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Detailed Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Customer Reviews</span>
            <span className="text-[11px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full">
              {product.reviewCount || 12}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'shipping'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Shipping & Returns in BD
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Technical Specifications</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {Object.entries(product.specs || {}).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-1 sm:grid-cols-3 p-3 text-xs sm:text-sm hover:bg-slate-50/50">
                    <span className="font-semibold text-slate-500 sm:col-span-1">{key}</span>
                    <span className="text-slate-900 sm:col-span-2 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'desc' && (
            <div className="prose max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <h3 className="text-base font-bold text-slate-900">About {product.title}</h3>
              <p>{product.description}</p>
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-900 text-xs">
                <strong>Why buy from maxitshop?</strong> We are committed to supplying genuine branded gadgets and renewable energy components with verified local warranties, official packaging, and fast doorstep shipping across Bangladesh.
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ProductReviewsSection
              productSlug={product.slug}
              productTitle={product.title}
            />
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <h3 className="text-base font-bold text-slate-900">Delivery Information & Charges</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li><strong>Inside Dhaka City:</strong> Delivery within 24 to 48 hours (৳80 delivery charge).</li>
                <li><strong>Outside Dhaka (All BD Districts):</strong> Delivery within 48 to 72 hours via trusted couriers (৳130 delivery charge).</li>
                <li><strong>Cash on Delivery:</strong> Available nationwide. You inspect parcel packaging before handing cash to the courier representative.</li>
                <li><strong>Return Policy:</strong> 7 days replacement guarantee in case of manufacturing defects or wrong item received.</li>
              </ul>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
