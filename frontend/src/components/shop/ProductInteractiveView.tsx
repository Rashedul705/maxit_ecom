'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Scale,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { Product, SiteSetting, StoreConfig, defaultStoreConfig } from '@/lib/types';
import { useCart } from '@/lib/cartContext';
import { useWishlist } from '@/lib/wishlistContext';
import { ProductReviewsSection } from './ProductReviewsSection';
import { ProductCard } from './ProductCard';

interface ProductInteractiveViewProps {
  product: Product;
  settings?: SiteSetting | null;
  storeConfig?: StoreConfig;
  relatedProducts?: Product[];
}

export function normalizeSpecs(specs: any, warranty?: string): { group: string; items: [string, string][] }[] {
  let groups: { group: string; items: [string, string][] }[] = [];

  if (specs && typeof specs === 'object') {
    const entries = Object.entries(specs);
    if (entries.length > 0) {
      // Check if any value is an object (grouped format)
      const isGrouped = entries.some(([_, val]) => val && typeof val === 'object' && !Array.isArray(val));

      if (isGrouped) {
        groups = entries.map(([groupName, groupData]) => {
          let items: [string, string][] = [];
          if (groupData && typeof groupData === 'object' && !Array.isArray(groupData)) {
            items = Object.entries(groupData).map(([k, v]) => [
              k,
              typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')
            ]);
          } else {
            items = [[groupName, String(groupData ?? '')]];
          }
          return { group: groupName, items };
        });
      } else {
        // Flat format fallback
        groups = [{
          group: 'General Information',
          items: entries.map(([k, v]) => [
            k,
            typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')
          ])
        }];
      }
    }
  }

  // If warranty exists and is not already in groups, add Warranty Information group
  if (warranty && warranty.trim()) {
    const hasWarrantyGroup = groups.some(g =>
      g.group.toLowerCase().includes('warranty') ||
      g.items.some(([k]) => k.toLowerCase() === 'warranty')
    );
    if (!hasWarrantyGroup) {
      groups.push({
        group: 'Warranty Information',
        items: [['Warranty', warranty.trim()]]
      });
    }
  }

  return groups;
}

export const ProductInteractiveView: React.FC<ProductInteractiveViewProps> = ({
  product,
  settings,
  storeConfig = defaultStoreConfig,
  relatedProducts = []
}) => {
  const { addToCart, openCheckout } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Active gallery image
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Quantity selector state
  const [quantity, setQuantity] = useState<number>(1);

  // Active section indicator for sticky menu
  const [activeSection, setActiveSection] = useState<'specification' | 'description' | 'questions' | 'reviews'>('specification');

  // Compare state with localStorage
  const [isInCompare, setIsInCompare] = useState<boolean>(false);
  const [compareToast, setCompareToast] = useState<string | null>(null);

  // Share state with toast
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Wishlist state
  const inWishlist = isInWishlist(product.id);

  // Contact info fallback
  const hotline = settings?.contact?.phone || settings?.phone || '+8801733-272445';
  const supportHours = settings?.header?.supportHours || 'Sat - Thu: 9:00 AM - 8:00 PM';

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          url: url,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareToast('Link copied to clipboard!');
        setTimeout(() => setShareToast(null), 3000);
      }
    } catch {
      setShareToast('Failed to copy link');
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  // Load compare status
  useEffect(() => {
    try {
      const stored = localStorage.getItem('maxit_compare');
      if (stored) {
        const list: string[] = JSON.parse(stored);
        setIsInCompare(list.includes(product.id));
      }
    } catch {
      // ignore storage errors
    }
  }, [product.id]);

  const handleToggleCompare = () => {
    try {
      const stored = localStorage.getItem('maxit_compare');
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (list.includes(product.id)) {
        list = list.filter(id => id !== product.id);
        setIsInCompare(false);
        setCompareToast('Removed from compare list');
      } else {
        list.push(product.id);
        setIsInCompare(true);
        setCompareToast(`Added to compare (${list.length} items)`);
      }
      localStorage.setItem('maxit_compare', JSON.stringify(list));
      setTimeout(() => setCompareToast(null), 3000);
    } catch {
      // ignore
    }
  };

  const handleBuyNow = () => {
    if (product.price === 0) {
      window.location.href = `tel:${hotline.replace(/[^0-9+]/g, '')}`;
      return;
    }
    addToCart(product, quantity, false);
    openCheckout();
  };

  const scrollToSection = (sectionId: 'specification' | 'description' | 'questions' | 'reviews') => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Gallery images array
  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80'];

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

  // Key Features: use keyFeatures array or fallback to shortDescription lines
  let keyFeaturesList: string[] = [];
  if (Array.isArray(product.keyFeatures) && product.keyFeatures.length > 0) {
    keyFeaturesList = product.keyFeatures.filter(f => f && f.trim());
  } else if (product.shortDescription) {
    keyFeaturesList = product.shortDescription
      .split(/\r?\n/)
      .map(s => s.replace(/^[•\-\*]\s*/, '').trim())
      .filter(s => s.length > 0);
  }

  // Specifications (supports both grouped and flat formats, includes warranty if present)
  const specGroups = normalizeSpecs(product.specs, product.warranty);

  // Related products
  const rawRelated: Product[] = (relatedProducts && relatedProducts.length > 0)
    ? relatedProducts
    : Array.isArray(product.relatedProducts) && product.relatedProducts.length > 0
      ? product.relatedProducts
      : Array.isArray((product as { related?: Product[] }).related) && (product as { related?: Product[] }).related!.length > 0
        ? (product as { related?: Product[] }).related!
        : [];

  return (
    <div className="space-y-10">
      
      {/* Toast Notification for Compare & Share */}
      {(compareToast || shareToast) && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{compareToast || shareToast}</span>
        </div>
      )}

      {/* ================= TOP SECTION (TWO-COLUMN STARTECH LAYOUT) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 shadow-xs">
        
        {/* Left Column: Image Gallery (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square w-full rounded-2xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center p-4">
            <Image
              src={activeImage}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Clickable Thumbnails Strip */}
          {galleryImages.length > 1 && (
            <div className="flex flex-wrap gap-2.5">
              {galleryImages.map((src, idx) => {
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl border-2 overflow-hidden bg-white p-1 transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#FF6600] shadow-xs'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${product.title} - thumbnail ${idx + 1}`}
                      fill
                      sizes="72px"
                      className="object-contain"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-start">
          
          {/* 1. Product Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-gray-900 leading-snug mb-3">
            {product.title}
          </h1>

          {/* 2. Top Action Utilities: Save (Wishlist), Add to Compare & Share */}
          <div className="flex flex-wrap items-center gap-2.5 mb-5 pb-4 border-b border-gray-100 text-xs sm:text-sm">
            {/* Save / Wishlist Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                inWishlist
                  ? 'bg-pink-50 border-pink-200 text-pink-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300 hover:text-pink-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-pink-600 text-pink-600' : 'text-gray-500'}`} />
              <span>{inWishlist ? 'Saved' : 'Save'}</span>
            </button>

            {/* Add to Compare Button */}
            <button
              type="button"
              onClick={handleToggleCompare}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                isInCompare
                  ? 'bg-blue-50 border-blue-200 text-[#0D6EFD]'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-[#0D6EFD]'
              }`}
            >
              <Scale className={`w-4 h-4 ${isInCompare ? 'text-[#0D6EFD]' : 'text-gray-500'}`} />
              <span>{isInCompare ? 'Added to Compare' : 'Add to Compare'}</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold hover:border-gray-400 hover:text-gray-900 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-gray-500" />
              <span>Share</span>
            </button>
          </div>

          {/* 3. Product Info Table (Startech Info Group) */}
          <div className="bg-gray-50/80 rounded-xl border border-gray-200 p-4 mb-5">
            <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[150px_1fr] gap-y-2.5 gap-x-2 text-xs sm:text-sm items-center">
              
              {/* Price */}
              <div className="text-gray-500 font-medium">Price:</div>
              <div className="font-bold text-xl sm:text-2xl text-gray-900">
                {product.price > 0 ? `৳${product.price.toLocaleString()}` : 'Call for Price'}
              </div>

              {/* Regular Price (shown only when oldPrice > price) */}
              {product.oldPrice && product.oldPrice > product.price ? (
                <>
                  <div className="text-gray-500 font-medium">Regular Price:</div>
                  <div className="text-gray-400 line-through font-medium text-sm sm:text-base">
                    ৳{product.oldPrice.toLocaleString()}
                  </div>
                </>
              ) : null}

              {/* Status */}
              <div className="text-gray-500 font-medium">Status:</div>
              <div>
                {product.stock > 0 ? (
                  <span className="font-semibold text-emerald-600">
                    In Stock
                  </span>
                ) : (
                  <span className="font-semibold text-red-600">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product Code (hide if empty) */}
              {product.productCode ? (
                <>
                  <div className="text-gray-500 font-medium">Product Code:</div>
                  <div className="font-semibold text-gray-800">{product.productCode}</div>
                </>
              ) : null}

              {/* Brand */}
              <div className="text-gray-500 font-medium">Brand:</div>
              <div className="font-semibold text-gray-800">
                <Link
                  href={`/brand/${encodeURIComponent(product.brand.toLowerCase())}`}
                  className="text-[#FF6600] hover:underline"
                >
                  {product.brand}
                </Link>
              </div>

              {/* Warranty (if present) */}
              {product.warranty ? (
                <>
                  <div className="text-gray-500 font-medium">Warranty:</div>
                  <div className="text-gray-800 font-medium">{product.warranty}</div>
                </>
              ) : null}

            </div>
          </div>

          {/* 4. Key Features Bullet List */}
          {keyFeaturesList.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                Key Features
              </h2>
              <ul className="space-y-1.5 text-xs sm:text-sm text-gray-700">
                {keyFeaturesList.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('specification')}
                    className="text-[#FF6600] hover:text-[#E65100] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>View More Info</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* 5. Payment Options Box (Cash Discount, Optional EMI, Optional Points) */}
          <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-3.5 sm:p-4 mb-5">
            <div className={`grid gap-3 ${storeConfig.emiEnabled && product.price > 0 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Cash Discount Price Box */}
              <div className="bg-white rounded-lg border border-orange-200/80 p-3 shadow-2xs">
                <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Cash Discount Price</div>
                <div className="text-xl sm:text-2xl font-bold text-[#FF6600] my-0.5">
                  {product.price > 0 ? `৳${product.price.toLocaleString()}` : 'Call for Price'}
                </div>
                <div className="text-[11px] text-gray-400">Online / Cash Payment</div>
              </div>

              {/* Optional EMI Box (shown ONLY if storeConfig.emiEnabled is true) */}
              {storeConfig.emiEnabled && product.price > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-2xs">
                  <div className="text-[11px] sm:text-xs text-gray-500 font-medium">
                    0% EMI for up to {storeConfig.emiMonths} months
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900 my-0.5">
                    ৳{Math.round(product.price / storeConfig.emiMonths).toLocaleString()}/month
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Regular Price: ৳{(product.oldPrice && product.oldPrice > product.price ? product.oldPrice : product.price).toLocaleString()}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Optional Reward Points Line (shown ONLY if storeConfig.pointsEnabled is true) */}
            {storeConfig.pointsEnabled && product.price > 0 ? (
              <div className="text-xs font-semibold text-emerald-700 mt-2.5 pt-2.5 border-t border-orange-200/50 flex items-center gap-1.5">
                <span>Earn {Math.floor(product.price / storeConfig.pointsDivisor)} reward points with this order</span>
              </div>
            ) : null}
          </div>

          {/* 6. Quantity Selector & Buy Now Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Quantity Selector */}
            <div className="inline-flex items-center justify-between sm:justify-start border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={1}
                max={product.stock || 99}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setQuantity(Math.max(1, Math.min(val, product.stock || 99)));
                }}
                className="w-14 h-11 text-center font-bold text-sm text-gray-900 border-x border-gray-200 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                disabled={product.stock > 0 && quantity >= product.stock}
                className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="flex-1 h-11 px-6 bg-[#FF6600] hover:bg-[#E65100] active:scale-[0.99] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-[#FF6600]/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{product.price === 0 ? 'Call for Price' : 'Buy Now'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* ================= STICKY SECTION NAVIGATION ================= */}
      <div className="sticky top-16 sm:top-20 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => scrollToSection('specification')}
            className={`py-3.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeSection === 'specification'
                ? 'border-[#FF6600] text-gray-900 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Specification
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('description')}
            className={`py-3.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeSection === 'description'
                ? 'border-[#FF6600] text-gray-900 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('questions')}
            className={`py-3.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeSection === 'questions'
                ? 'border-[#FF6600] text-gray-900 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Questions (0)
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('reviews')}
            className={`py-3.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeSection === 'reviews'
                ? 'border-[#FF6600] text-gray-900 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Reviews ({product.reviewCount || 0})
          </button>
        </div>
      </div>

      {/* ================= LOWER TWO-COLUMN SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Specification, Description, Questions, Reviews (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Specification Section */}
          <section id="specification" className="scroll-mt-36">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-gray-900 mb-3">
              Specification
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
              {specGroups.length > 0 ? (
                specGroups.map((group, gIdx) => (
                  <div key={gIdx} className="border-b border-gray-200 last:border-b-0">
                    {/* Group Heading Row */}
                    <div className="bg-gray-100/90 px-4 py-2.5 border-b border-gray-200">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                        {group.group}
                      </h3>
                    </div>

                    {/* Key / Value Table Rows */}
                    <table className="w-full text-xs sm:text-sm">
                      <colgroup>
                        <col className="w-1/3 sm:w-1/4" />
                        <col className="w-2/3 sm:w-3/4" />
                      </colgroup>
                      <tbody className="divide-y divide-gray-100">
                        {group.items.map(([key, val], rIdx) => (
                          <tr
                            key={rIdx}
                            className="hover:bg-gray-50/60 transition-colors"
                          >
                            <td className="py-2.5 px-4 font-normal text-gray-600 bg-white align-top border-r border-gray-100">
                              {key}
                            </td>
                            <td className="py-2.5 px-4 text-gray-900 font-normal align-top whitespace-pre-line">
                              {val}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <div className="p-6 text-xs sm:text-sm text-gray-500 italic">
                  No detailed specifications provided for this product.
                </div>
              )}
            </div>
          </section>

          {/* 2. Description Section */}
          <section id="description" className="scroll-mt-36">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-gray-900 mb-3">
              Description
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs">
              <div
                className="prose max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed [&>h2]:text-base [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-sm [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:mt-3 [&>h3]:mb-1 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>table]:w-full [&>table]:border [&>table]:border-gray-200 [&>table_th]:border [&>table_th]:p-2 [&>table_td]:border [&>table_td]:p-2"
                dangerouslySetInnerHTML={{
                  __html: product.description || product.shortDescription || '<p>Detailed product description will appear here.</p>'
                }}
              />
            </div>
          </section>

          {/* 3. Questions Section */}
          <section id="questions" className="scroll-mt-36">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-gray-900 mb-3">
              Questions (0)
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-2xs">
              <p className="text-xs sm:text-sm text-gray-500 mb-4">
                No questions yet. Be the first to ask.
              </p>
              <button
                type="button"
                onClick={() => {
                  const tel = hotline.replace(/[^0-9+]/g, '');
                  if (typeof window !== 'undefined') {
                    window.open(`https://wa.me/${tel.replace('+', '')}?text=${encodeURIComponent(`Hi, I have a question about: ${product.title}`)}`, '_blank');
                  }
                }}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-[#FF6600] text-[#FF6600] hover:bg-orange-50 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Ask Question
              </button>
            </div>
          </section>

          {/* 4. Reviews Section */}
          <section id="reviews" className="scroll-mt-36">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-gray-900 mb-3">
              Reviews ({product.reviewCount || 0})
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs">
              <ProductReviewsSection
                productSlug={product.slug}
                productTitle={product.title}
              />
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Similar Product & Support Sidebar (4 cols, flows below on mobile) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Similar Product Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-3 pb-2 border-b border-gray-100">
              Similar Product
            </h3>
            {rawRelated.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {rawRelated.slice(0, 4).map((rel) => {
                  const relImg = (rel.images && rel.images.length > 0)
                    ? rel.images[0]
                    : ((rel as any).image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&q=80');
                  return (
                    <Link
                      key={rel.id || rel.slug}
                      href={`/product/${rel.slug}`}
                      className="flex items-center gap-3 py-2.5 hover:bg-gray-50/80 rounded-lg p-1.5 transition-colors group"
                    >
                      <div className="w-14 h-14 relative bg-gray-50 rounded-lg border border-gray-200/80 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <Image
                          src={relImg}
                          alt={rel.title}
                          fill
                          sizes="56px"
                          className="object-contain p-1 group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-[#FF6600] leading-snug mb-1">
                          {rel.title}
                        </h4>
                        <div className="text-xs sm:text-sm font-bold text-[#FF6600]">
                          {rel.price > 0 ? `৳${rel.price.toLocaleString()}` : 'Call for Price'}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic py-2">
                No similar products found in this category.
              </p>
            )}
          </div>

          {/* Support Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-3">
              Support
            </h3>
            <div className="space-y-1.5 text-xs text-gray-600 mb-4">
              <div>
                <span className="font-medium text-gray-700">Call us: </span>
                <a
                  href={`tel:${hotline.replace(/[^0-9+]/g, '')}`}
                  className="text-gray-900 font-semibold hover:text-[#FF6600]"
                >
                  {hotline}
                </a>
              </div>
              <div>
                <span className="font-medium text-gray-700">Open: </span>
                <span className="text-gray-800 font-medium">{supportHours}</span>
              </div>
            </div>
            <Link
              href="/contact"
              className="w-full text-center py-2 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors block"
            >
              Store locator
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};
