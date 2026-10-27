'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Truck,
  RotateCcw,
  Check,
  CheckCircle2,
  Minus,
  Plus,
  Star,
  Play,
  PhoneCall,
  ShoppingBag,
  Zap,
  Package,
  HelpCircle,
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Product, SiteSetting } from '@/lib/types';
import { useCart } from '@/lib/cartContext';
import { ProductReviewsSection } from './ProductReviewsSection';

interface ProductInteractiveViewProps {
  product: Product;
  settings?: SiteSetting | null;
}

// Bengali number converter helper
const toBn = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, w => bnDigits[+w]);
};

export const ProductInteractiveView: React.FC<ProductInteractiveViewProps> = ({
  product,
  settings
}) => {
  const router = useRouter();
  const { addToCart } = useCart();

  // Active gallery media
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [modalVideoUrl, setModalVideoUrl] = useState('');

  // Selected variant / set
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Active tab
  const [activeTab, setActiveTab] = useState<'desc' | 'box' | 'video' | 'reviews' | 'faq'>('desc');

  // Add to cart feedback toast
  const [isAddedToast, setIsAddedToast] = useState(false);
  const [comboAddedToast, setComboAddedToast] = useState(false);

  // Dynamic values from settings or sensible defaults
  const hotline = settings?.contact?.phone || settings?.phone || '+880 1733-115391';
  const whatsappNum = (settings?.socialLinks?.whatsapp || settings?.contact?.whatsapp || '+8801733115391').replace(/[^0-9]/g, '');
  const insideDhakaFee = settings?.deliveryRates?.insideDhaka ?? 70;
  const outsideDhakaFee = settings?.deliveryRates?.outsideDhaka ?? 130;

  // Pricing calculations
  const basePrice = Number(product.price) || 999;
  const baseOldPrice = Number(product.oldPrice) || Math.round(basePrice * 1.25);
  const discountPercent = baseOldPrice > basePrice
    ? Math.round(((baseOldPrice - basePrice) / baseOldPrice) * 100)
    : 21;

  // Generate 3 Realistic Sets / Variants matching the reference image
  const variants = [
    {
      id: 'set-1',
      title: '১২ পিস সেট',
      subtitle: '[সেটে কী আছে] স্ট্যান্ডার্ড প্যাক ও ফুল কানেক্টর',
      price: basePrice,
      badge: 'স্টকে আছে'
    },
    {
      id: 'set-2',
      title: '[সেট ২ এর নাম] ডাবল প্যাক কম্বো',
      subtitle: '[সেটে কী আছে] দ্বিগুণ ক্যাপাসিটি ও অতিরিক্ত বাসবার',
      price: Math.round(basePrice * 1.9),
      badge: 'স্টকে আছে'
    },
    {
      id: 'set-3',
      title: '[সেট ৩ এর নাম] ফুল প্রফেশনাল কিট',
      subtitle: '[সেটে কী আছে] ৪x ইউনিট, স্মার্ট ব্যালেন্সার ও এক্সেসরিজ',
      price: Math.round(basePrice * 3.7),
      badge: 'স্টকে আছে'
    }
  ];

  const currentVariant = variants[selectedVariantIndex] || variants[0];
  const unitPrice = currentVariant.price;
  const totalPrice = unitPrice * quantity;

  // Combo Offer calculation
  const comboExtraPrice = Math.round(basePrice * 0.35);
  const comboPrice = basePrice + comboExtraPrice;

  // Related products resolution (ensures 4 items matching reference mockup)
  const rawRelated: Product[] = Array.isArray(product.relatedProducts) && product.relatedProducts.length > 0
    ? product.relatedProducts
    : Array.isArray((product as { related?: Product[] }).related) && (product as { related?: Product[] }).related!.length > 0
      ? (product as { related?: Product[] }).related!
      : [];

  const fallbackRelated: Product[] = [
    {
      id: 'rel-1',
      title: 'স্মার্ট বিএমএস ব্যালেন্সার ক্যাবল ও পিন প্যাক',
      price: Math.round(basePrice * 0.35) || 450,
      slug: 'smart-bms-balancer-cable-pack',
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80'],
      category: product.category,
      brand: 'MaxiT',
      rating: 4.8,
      stock: 25,
      shortDescription: 'উচ্চমানের সিলিকন ওয়্যার ও গোল্ড প্লেটেড পিন'
    },
    {
      id: 'rel-2',
      title: 'পিউর নিকেল স্ট্রিপ রোল ০.১৫ মিমি (১০ মিটার)',
      price: Math.round(basePrice * 0.25) || 320,
      slug: 'pure-nickel-strip-roll-10m',
      images: ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80'],
      category: product.category,
      brand: 'MaxiT',
      rating: 4.9,
      stock: 40,
      shortDescription: '৯৯.৬% পিউর নিকেল শিট স্পট ওয়েল্ডিংয়ের জন্য'
    },
    {
      id: 'rel-3',
      title: 'লিথিয়াম ব্যাটারি ইনসুলেশন বার্লি পেপার গ্যাসকেট',
      price: Math.round(basePrice * 0.15) || 180,
      slug: 'battery-insulation-barley-paper-gasket',
      images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'],
      category: product.category,
      brand: 'MaxiT',
      rating: 4.7,
      stock: 100,
      shortDescription: 'হিট রেসিস্ট্যান্ট ও শক প্রুফ সেল প্রোটেকশন'
    },
    {
      id: 'rel-4',
      title: 'প্রফেশনাল ব্যাটারি স্পট ওয়েল্ডার রিপ্লেসমেন্ট পেন',
      price: Math.round(basePrice * 0.6) || 1250,
      slug: 'professional-spot-welder-pen-replacement',
      images: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&q=80'],
      category: product.category,
      brand: 'MaxiT',
      rating: 5.0,
      stock: 15,
      shortDescription: 'হেভি ডিউটি কপার পিন ও অটোমেটিক ট্রিগার'
    }
  ];

  const relatedList: Product[] = rawRelated.length >= 4
    ? rawRelated.slice(0, 4)
    : [...rawRelated, ...fallbackRelated.filter(f => !rawRelated.some(r => r.slug === f.slug || r.id === f.id))].slice(0, 4);

  // Media list: product images + 2 demo videos matching reference image
  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&q=80'];

  const mediaList = [
    ...galleryImages.map((src, i) => ({ type: 'image' as const, src, label: `ছবি ${toBn(i + 1)}` })),
    {
      type: 'video' as const,
      src: galleryImages[0] || '',
      label: `ভিডিও ০:১৫`,
      duration: '0:15',
      title: 'ভিডিও ১, ০:১৫ - আনবক্সিং ও রিভিউ',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      type: 'video' as const,
      src: galleryImages[1] || galleryImages[0] || '',
      label: `ভিডিও ০:৪৫`,
      duration: '0:45',
      title: 'ভিডিও ২, ০:৪৫ - ভিডিওতে দেখুন ও লাইভ টেস্ট',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  ];

  const activeMedia = mediaList[activeMediaIndex] || mediaList[0];

  const handleMediaClick = (index: number) => {
    setActiveMediaIndex(index);
    const item = mediaList[index];
    if (item.type === 'video') {
      setModalVideoUrl(item.videoUrl);
      setIsVideoModalOpen(true);
    }
  };

  const handleAddToCart = () => {
    // Add selected variant to cart
    addToCart({
      ...product,
      title: `${product.title} (${currentVariant.title})`,
      price: unitPrice
    }, quantity);

    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 3000);
  };

  const handleOrderNow = () => {
    addToCart({
      ...product,
      title: `${product.title} (${currentVariant.title})`,
      price: unitPrice
    }, quantity);
    router.push('/checkout');
  };

  const handleAddComboToCart = () => {
    addToCart({
      ...product,
      id: `${product.id}-combo`,
      title: `${product.title} + স্মার্ট কানেক্টিং এক্সেসরিজ সেট (কম্বো অফার)`,
      price: comboPrice
    }, 1);

    setComboAddedToast(true);
    setTimeout(() => setComboAddedToast(false), 3000);
  };

  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম, আমি MaxiTShop থেকে "${product.title}" (${currentVariant.title}) অর্ডার করতে চাই। মোট দাম: ৳${totalPrice}। বিস্তারিত বুঝিয়ে দেবেন?`
    );
    window.open(`https://wa.me/${whatsappNum}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-10">
      
      {/* ================= MAIN PRODUCT HERO (2-COLUMN GRID) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Gallery & Media (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Hero Image Container with Yellow Discount Badge */}
          <div className="relative aspect-square w-full rounded-2xl bg-[#FFFBEB] border border-[#FEF08A] overflow-hidden flex items-center justify-center p-6 shadow-xs">
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 z-10 bg-[#FEF08A] text-[#B45309] border border-[#FDE047] text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full shadow-xs">
                {toBn(discountPercent)}% ছাড়
              </div>
            )}

            <div className="relative w-full h-full">
              <Image
                src={activeMedia.src}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 550px"
                className="object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {activeMedia.type === 'video' && (
              <button
                type="button"
                onClick={() => {
                  setModalVideoUrl(activeMedia.videoUrl);
                  setIsVideoModalOpen(true);
                }}
                className="absolute inset-0 m-auto w-16 h-16 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
              >
                <Play className="w-8 h-8 fill-white ml-1" />
              </button>
            )}
          </div>

          {/* Thumbnails Strip matching reference image */}
          <div className="flex flex-wrap gap-2.5">
            {mediaList.map((item, idx) => {
              const isActive = activeMediaIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleMediaClick(idx)}
                  className={`relative min-w-[70px] sm:min-w-[78px] h-18 rounded-xl p-1.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FEF08A]/70 border-2 border-[#DC2626] shadow-xs'
                      : 'bg-[#FFFBEB] border border-[#FEF08A] hover:border-[#DC2626]/50'
                  }`}
                >
                  {item.type === 'video' ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center mb-1">
                        <Play className="w-3 h-3 fill-white ml-0.5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">ভিডিও</span>
                      <span className="text-[10px] text-slate-500 font-medium">{item.duration}</span>
                    </>
                  ) : (
                    <>
                      <div className="relative w-10 h-10 mb-0.5 rounded overflow-hidden">
                        <Image src={item.src} alt={item.label} fill sizes="40px" className="object-cover" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{item.label}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Purchasing & Decision Box (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Status & SKU Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              স্টকে আছে, এখনই পাঠানো যাবে
            </span>

            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              SKU: {product.id ? product.id.toUpperCase() : 'CAR-PAIN-12-PIECE-SET'}
            </span>
          </div>

          {/* Product Title & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] leading-snug">
              {product.title}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {product.brand ? `${product.brand} Official Edition • Authentic Grade-A Quality` : 'Car Painting Kit & Energy Engineering'}
            </p>
          </div>

          {/* Ratings & Review Anchor Link */}
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map(st => (
                <Star key={st} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-extrabold text-slate-900">{toBn(4.9)}</span>
            <span className="text-xs text-slate-400">•</span>
            <button
              type="button"
              onClick={() => {
                setActiveTab('reviews');
                const el = document.getElementById('product-tabs-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              ({toBn(product.reviewCount || 48)}টি রিভিউ দেখুন)
            </button>
          </div>

          {/* Price Row */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-[#DC2626]">
              ৳{toBn(unitPrice.toLocaleString())}
            </span>
            <del className="text-sm sm:text-base text-slate-400 font-medium">
              ৳{toBn(baseOldPrice.toLocaleString())} [পুরনো দাম]
            </del>
          </div>

          {/* Variant / Set Selector (`সেট বাছুন`) matching reference image */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-extrabold text-slate-900">সেট বাছুন</span>
              <span className="text-slate-500 font-medium">{toBn(variants.length)}টি অপশন</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {variants.map((v, idx) => {
                const isSelected = selectedVariantIndex === idx;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`relative p-3.5 rounded-xl text-left border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#DC2626] bg-[#FEF2F2]/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {v.title}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0 inline-block"></span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mb-2 leading-tight">
                      {v.subtitle}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-xs sm:text-sm font-extrabold text-[#DC2626]">
                        ৳{toBn(v.price.toLocaleString())}
                      </span>
                      <span className="text-[10px] font-bold text-[#059669]">
                        {v.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector & Total Price Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">পরিমাণ</span>
              <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3.5 text-sm font-bold text-slate-900">{toBn(quantity)}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">
                {currentVariant.title} x {toBn(quantity)}
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900">
                মোট ৳{toBn(totalPrice.toLocaleString())}
              </span>
            </div>
          </div>

          {/* Action Buttons Row matching reference image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <button
              type="button"
              onClick={handleOrderNow}
              className="w-full py-3.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>এখনই অর্ডার করুন</span>
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-white hover:bg-slate-50 text-[#DC2626] border-2 border-[#DC2626] rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>কার্টে যোগ করুন</span>
            </button>
          </div>

          {/* Added to cart toast */}
          {isAddedToast && (
            <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-[#059669]" />
              <span>কার্টে যোগ করা হয়েছে! (Item added to cart successfully)</span>
            </div>
          )}

          {/* Assisted Ordering Callout Box (`কথা বলে অর্ডার করতে চান?`) */}
          <div className="bg-[#ECFDF5] rounded-xl p-3.5 sm:p-4 border border-[#A7F3D0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                কথা বলে অর্ডার করতে চান?
              </p>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                আমাদের প্রতিনিধি অর্ডার ও ডেলিভারি বুঝিয়ে দেবেন
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <span>হোয়াটসঅ্যাপ</span>
              </button>

              <a
                href={`tel:${hotline.replace(/[^0-9+]/g, '')}`}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
                <span>কল করুন</span>
              </a>
            </div>
          </div>

          {/* 4 Trust & Assurance Feature Badges matching reference image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-[#FEFCE8] p-3 rounded-xl border border-[#FEF08A] flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FEF08A] flex items-center justify-center shrink-0 text-[#B45309]">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">সারা বাংলাদেশে হোম ডেলিভারি</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  ঢাকা ৳{toBn(insideDhakaFee)} (২৪-৪৮ ঘণ্টা), ঢাকার বাইরে ৳{toBn(outsideDhakaFee)}
                </p>
              </div>
            </div>

            <div className="bg-[#FEFCE8] p-3 rounded-xl border border-[#FEF08A] flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FEF08A] flex items-center justify-center shrink-0 text-[#B45309]">
                <span className="text-xs font-extrabold">৳</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">ক্যাশ অন ডেলিভারি</p>
                <p className="text-[11px] text-slate-600 mt-0.5">পণ্য হাতে পেয়ে টাকা দিন</p>
              </div>
            </div>

            <div className="bg-[#FEFCE8] p-3 rounded-xl border border-[#FEF08A] flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FEF08A] flex items-center justify-center shrink-0 text-[#B45309]">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">৭ দিনে সহজ রিটার্ন</p>
                <p className="text-[11px] text-slate-600 mt-0.5">ভাঙা বা নষ্ট পেলে বদলে দেওয়া হবে</p>
              </div>
            </div>

            <div className="bg-[#FEFCE8] p-3 rounded-xl border border-[#FEF08A] flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FEF08A] flex items-center justify-center shrink-0 text-[#B45309]">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">ফুড-গ্রেড ও নন-টক্সিক / ১০০% জেনুইন</p>
                <p className="text-[11px] text-slate-600 mt-0.5">নিরাপদ ব্যবহার ও সর্বোচ্চ মান নিশ্চিত</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ================= TABS SECTION (DETAILS, VIDEOS, REVIEWS) ================= */}
      <div id="product-tabs-section" className="space-y-6 pt-4">
        
        {/* Navigation Tabs Bar */}
        <div className="flex border-b-2 border-slate-200 overflow-x-auto gap-2">
          {[
            { id: 'desc', label: 'বিবরণ' },
            { id: 'box', label: 'বাক্সে কী আছে' },
            { id: 'video', label: 'ডেমো ভিডিও' },
            { id: 'reviews', label: `রিভিউ (${toBn(product.reviewCount || 48)})` },
            { id: 'faq', label: 'প্রশ্নোত্তর' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-4 text-xs sm:text-sm font-extrabold whitespace-nowrap cursor-pointer transition-all border-b-2 -mb-[2px] ${
                  isActive
                    ? 'border-[#DC2626] text-[#DC2626]'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: বিবরণ (Description & Real Demo Video 2-Col Layout) */}
        {activeTab === 'desc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: পণ্যের বিবরণ */}
            <div className="lg:col-span-7 space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h2 className="text-lg font-extrabold text-slate-900">
                পণ্যের বিবরণ
              </h2>

              <div
                className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-slate-900 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5"
                dangerouslySetInnerHTML={{
                  __html: product.description || product.shortDescription || '[পণ্যের বিস্তারিত বিবরণ এখানে থাকবে। কী করা যায়, কোন বয়সের জন্য, কীভাবে ব্যবহার করতে হয়]'
                }}
              />

              {/* Technical Specifications Highlights */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-3">
                    টেকনিক্যাল স্পেসিফিকেশন ও তথ্য:
                  </h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="grid grid-cols-3 p-2.5 hover:bg-slate-50">
                        <span className="font-semibold text-slate-500 col-span-1">{key}</span>
                        <span className="text-slate-900 font-medium col-span-2">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: রিয়েল ডেমো ভিডিও */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">
                  রিয়েল ডেমো ভিডিও
                </h2>
                <span className="text-xs text-slate-500 font-medium">২টি ভিডিও</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
                <div
                  onClick={() => {
                    setModalVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
                    setIsVideoModalOpen(true);
                  }}
                  className="bg-[#FFFBEB] border border-[#FEF08A] rounded-2xl p-5 hover:border-[#DC2626] transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[140px]"
                >
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-xs">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">ভিডিও ১, ০:১৫</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">[আনবক্সিং ও রিভিউ]</p>
                </div>

                <div
                  onClick={() => {
                    setModalVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
                    setIsVideoModalOpen(true);
                  }}
                  className="bg-[#FFFBEB] border border-[#FEF08A] rounded-2xl p-5 hover:border-[#DC2626] transition-all cursor-pointer flex flex-col items-center justify-center text-center group min-h-[140px]"
                >
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-xs">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">ভিডিও ২, ০:৪৫</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">[ভিডিও এর বিষয় / লাইভ টেস্ট]</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: বাক্সে কী আছে (What's in the Box) */}
        {activeTab === 'box' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              প্যাকেজ ও বাক্সে যা যা থাকছে
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <Package className="w-6 h-6 text-[#DC2626]" />
                <div>
                  <p className="text-xs font-bold text-slate-900">{product.title}</p>
                  <p className="text-[11px] text-slate-500">মূল পণ্য ১টি</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900">এক্সেসরিজ ও কানেক্টর</p>
                  <p className="text-[11px] text-slate-500">কমপ্লিট কানেক্টিং কিট</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900">ইউজার ম্যানুয়াল গাইড</p>
                  <p className="text-[11px] text-slate-500">সহজ নির্দেশিকা বই</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900">অফিসিয়াল ওয়ারেন্টি কার্ড</p>
                  <p className="text-[11px] text-slate-500">MaxiTShop অথেনটিক স্টিকার</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: ডেমো ভিডিও */}
        {activeTab === 'video' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              রিয়েল ডেমো ও আনবক্সিং ভিডিও
            </h2>
            <div className="aspect-video w-full max-w-3xl mx-auto rounded-xl overflow-hidden bg-black shadow-md">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Product Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Tab 4: কাস্টমার রিভিউ */}
        {activeTab === 'reviews' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <ProductReviewsSection
              productSlug={product.slug}
              productTitle={product.title}
            />
          </div>
        )}

        {/* Tab 5: প্রশ্নোত্তর (FAQ) */}
        {activeTab === 'faq' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              সচরাচর জিজ্ঞাসিত সাধারণ প্রশ্নোত্তর
            </h2>
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs sm:text-sm font-bold text-slate-900">১. পণ্যটি পেতে কত দিন সময় লাগবে?</p>
                <p className="text-xs text-slate-600 mt-1">ঢাকা সিটির ভিতরে ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে দেশের যে কোনো জেলায় ২-৩ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs sm:text-sm font-bold text-slate-900">২. ডেলিভারির সময় কি খুলে দেখা যাবে?</p>
                <p className="text-xs text-slate-600 mt-1">হ্যাঁ, ডেলিভারি ম্যানের সামনে প্যাকেজ চেক করে দেখে ক্যাশ অন ডেলিভারিতে মূল্য পরিশোধ করতে পারবেন।</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs sm:text-sm font-bold text-slate-900">৩. কোনো ত্রুটি থাকলে কি রিটার্ন পলিসি আছে?</p>
                <p className="text-xs text-slate-600 mt-1">অবশ্যই! পণ্য পাওয়ার পর ৭ দিনের মধ্যে কোনো ত্রুটি দেখা দিলে সম্পূর্ণ বিনামূল্যে রিপ্লেসমেন্ট সুবিধা পাবেন।</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ================= BUNDLE OFFER BANNER (`একসাথে কিনলে ছাড়`) ================= */}
      <div className="bg-[#FFFBEB] rounded-2xl p-4 sm:p-5 border border-[#FDE68A] flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider block">
            স্পেশাল বান্ডেল অফার
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
            একসাথে কিনলে ছাড়
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            [{product.title}] + [স্মার্ট কানেক্টিং ক্যাবল ও বাসবার সেট]
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
          <span className="text-2xl sm:text-3xl font-black text-[#DC2626]">
            ৳{toBn(comboPrice.toLocaleString())}
          </span>

          <button
            type="button"
            onClick={handleAddComboToCart}
            className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            কম্বো কার্টে যোগ করুন
          </button>
        </div>
      </div>

      {comboAddedToast && (
        <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-[#059669]" />
          <span>কম্বো অফার কার্টে যুক্ত হয়েছে!</span>
        </div>
      )}

      {/* ================= RELATED PRODUCTS (`সম্পর্কিত পণ্য`) ================= */}
      {relatedList.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              সম্পর্কিত পণ্য
            </h2>
            <Link
              href={`/category/${product.category}`}
              className="text-xs font-bold text-[#DC2626] hover:underline"
            >
              সবগুলো দেখুন →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedList.slice(0, 4).map((rel) => (
              <div
                key={rel.id}
                className="group bg-white rounded-xl border border-slate-200 hover:border-[#DC2626] overflow-hidden p-3 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <Link href={`/product/${rel.slug}`} className="block">
                  <div className="relative aspect-square w-full rounded-lg bg-[#FFFBEB] border border-[#FEF08A] overflow-hidden mb-2.5 flex items-center justify-center p-3">
                    <Image
                      src={rel.images[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80'}
                      alt={rel.title}
                      fill
                      sizes="220px"
                      className="object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#DC2626] transition-colors">
                    {rel.title}
                  </h3>
                </Link>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm sm:text-base font-extrabold text-[#DC2626]">
                    ৳{toBn(rel.price.toLocaleString())}
                  </span>

                  <button
                    type="button"
                    onClick={() => addToCart(rel, 1)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#DC2626] hover:text-white text-slate-700 transition-colors cursor-pointer"
                    title="কার্টে যোগ করুন"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Lightbox Modal */}
      {isVideoModalOpen && (
        <div
          onClick={() => setIsVideoModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={`${modalVideoUrl}?autoplay=1`}
                title="Product Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
