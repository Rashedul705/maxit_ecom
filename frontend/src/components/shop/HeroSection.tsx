'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  BatteryCharging,
  Cpu,
  Tv,
  ShieldCheck,
  Headphones,
  Laptop,
  Wrench,
  Car,
  Activity,
  Zap,
  Wind,
  Camera,
  Briefcase,
  Bot,
  Radio,
  Printer,
  ChevronRight as ArrowRightIcon
} from 'lucide-react';
import { Category, Banner, SiteSetting } from '@/lib/types';

interface HeroSectionProps {
  categories: Category[];
  banners: Banner[];
  hero?: SiteSetting['hero'];
}

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'solar-renewable-energy':
    case 'solar-energy':
    case 'solar-inverter':
    case 'solar-battery':
    case 'solar-package':
    case 'solar-green-energy':
      return <Sun className="w-4 h-4 text-[#FF6600]" />;
    case 'batteries-portable-power':
    case 'battery-bms-charger':
    case 'ups-battery':
    case 'portable-power-station':
    case 'batteries-inverters':
      return <BatteryCharging className="w-4 h-4 text-emerald-600" />;
    case 'ups-power-protection':
    case 'online-ups':
    case 'ups':
    case 'voltage-stabilizer':
    case 'lt-ht-power-goods':
      return <Zap className="w-4 h-4 text-amber-500" />;
    case 'smart-home-automation':
    case 'smart-home-iot':
    case 'home-automation':
    case 'automation-process-cont.':
      return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    case 'microcontrollers-dev-boards':
    case 'esp':
    case 'arduino':
    case 'microcontroller':
    case 'development-board':
      return <Cpu className="w-4 h-4 text-blue-600" />;
    case 'robotics-drone-kits':
    case 'robotics':
    case 'drone':
    case 'kits':
      return <Bot className="w-4 h-4 text-indigo-500" />;
    case 'sensors-modules-wireless':
    case 'sensor':
    case 'modules-&-sensor':
    case 'wireless-transceiver':
    case 'display':
      return <Radio className="w-4 h-4 text-blue-500" />;
    case 'electronic-components':
    case 'electronics-parts':
    case 'basic-component':
    case 'general-ic':
    case 'igbt-fet-diode-transistor':
    case 'customized-circuit---pcb':
      return <Activity className="w-4 h-4 text-rose-600" />;
    case 'tools-instruments':
    case 'instruments':
    case 'tools---hardware':
    case 'maintenance-tools':
    case '3d-printer-accessories':
    case 'tools-measurement':
      return <Wrench className="w-4 h-4 text-orange-600" />;
    case 'security-safety':
    case 'security-camera':
    case 'safety---security':
      return <Camera className="w-4 h-4 text-amber-600" />;
    case 'computer-networking-office':
    case 'computer-accessories':
    case 'server-networking':
    case 'office-equipment':
    case 'computers-office':
      return <Laptop className="w-4 h-4 text-sky-600" />;
    case 'accessories-services':
    case 'accessories':
    case 'miscellaneous':
    case 'service-&-maintenance':
      return <Briefcase className="w-4 h-4 text-cyan-600" />;
    case 'wind-energy':
      return <Wind className="w-4 h-4 text-sky-500" />;
    case 'consumer-electronics':
      return <Tv className="w-4 h-4 text-purple-600" />;
    default:
      return <Zap className="w-4 h-4 text-[#FF6600]" />;
  }
};

export const HeroSection: React.FC<HeroSectionProps> = ({ categories, banners, hero }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-3 sm:pt-4">
      <div className="flex gap-4">
        
        {/* Left Vertical Category Menu (Desktop only - Nanopowerbd layout) */}
        <div 
          className="hidden lg:flex flex-col w-64 shrink-0 bg-white border border-gray-200 rounded-lg shadow-xs relative h-[420px] z-30"
          onMouseLeave={() => setHoveredSlug(null)}
        >
          <div className="bg-[#131A22] text-white px-4 py-3 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 rounded-t-lg">
            <span>Categories</span>
          </div>
          <div className="divide-y divide-gray-100 overflow-y-auto flex-1 overscroll-contain min-h-0 rounded-b-lg">
            {categories.map((cat) => {
              const children = (cat.children && cat.children.length > 0) ? cat.children : (cat.subcategories || []);
              const hasChildren = children.length > 0;
              const isHovered = hoveredSlug === cat.slug;

              return (
                <div
                  key={cat.id || cat.slug}
                  onMouseEnter={() => setHoveredSlug(cat.slug)}
                >
                  <Link
                    href={`/category/${cat.slug}`}
                    className={`group flex items-center justify-between px-3.5 py-2 text-xs transition-colors ${
                      isHovered
                        ? 'bg-orange-50 text-[#FF6600]'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-[#FF6600]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="shrink-0">{getCategoryIcon(cat.slug)}</span>
                      <span className="truncate font-medium">{cat.name}</span>
                    </div>
                    {hasChildren ? (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#FF6600] shrink-0" />
                    ) : (
                      <ArrowRightIcon className="w-3 h-3 text-gray-400 group-hover:text-[#FF6600] group-hover:translate-x-0.5 transition-all shrink-0" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Subcategories Flyout Drawer to the Right */}
          {(() => {
            const activeCat = categories.find((c) => c.slug === hoveredSlug);
            const children = (activeCat?.children && activeCat.children.length > 0) ? activeCat.children : (activeCat?.subcategories || []);
            if (!activeCat || children.length === 0) return null;

            return (
              <div 
                className="absolute left-full top-0 ml-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-40 max-h-[420px] overflow-y-auto"
                onMouseEnter={() => setHoveredSlug(activeCat.slug)}
              >
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider truncate">
                    {activeCat.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal shrink-0 ml-2">
                    ({children.length})
                  </span>
                </div>
                <div className="py-1">
                  {children.map((child: any) => (
                    <Link
                      key={child.id || child.slug}
                      href={`/category/${child.slug}`}
                      className="flex items-center justify-between px-4 py-2 text-xs text-gray-700 hover:bg-orange-50 hover:text-[#FF6600] transition-colors"
                    >
                      <span className="truncate">{child.name}</span>
                      {child.productCount !== undefined && (
                        <span className="text-[10px] text-gray-400 font-normal shrink-0 ml-2">
                          ({child.productCount})
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Hero Banner Slider */}
        <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-900 h-[220px] sm:h-[300px] md:h-[360px] lg:h-[420px] group shadow-xs">
          {banners.length > 0 ? (
            <>
              {/* Slides */}
              <div
                className="flex h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {banners.map((banner) => (
                  <div key={banner.id} className="relative w-full h-full shrink-0">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      priority
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 980px"
                      className="object-cover"
                    />
                    {/* Dark gradient for legible text */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

                    {/* Banner Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-xl text-white">
                      {banner.badge && (
                        <span className="bg-[#FF6600] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full w-fit mb-2 shadow-xs">
                          {banner.badge}
                        </span>
                      )}
                      <h2 className="text-xl sm:text-2xl md:text-4xl font-black leading-tight mb-2 text-white">
                        {banner.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 mb-4">
                        {banner.subtitle}
                      </p>
                      <Link
                        href={banner.link || '/category/solar-green-energy'}
                        className="inline-flex items-center gap-2 bg-[#FF6600] hover:bg-[#e55c00] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-md transition-colors w-fit shadow-xs"
                      >
                        <span>Shop Now</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prev / Next Buttons */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`transition-all ${
                          currentSlide === idx
                            ? 'w-6 h-2 bg-[#FF6600] rounded-full'
                            : 'w-2 h-2 bg-white/60 hover:bg-white rounded-full'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col justify-center px-8 sm:px-14 bg-gradient-to-r from-[#0B1528] via-[#101C33] to-[#0468D3] text-white">
              {hero?.badge && (
                <span className="bg-[#FF6600] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full w-fit mb-3">
                  {hero.badge}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight mb-2">
                {hero?.headline || 'Powering Bangladesh With High-Performance Solar & Battery Systems'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-200 max-w-xl line-clamp-2 mb-5">
                {hero?.subheadline || 'Explore genuine Grade-A LiFePO4 cells, active balance smart BMS, MPPT solar controllers, and inverters.'}
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={hero?.primaryBtnUrl || '/#deals'}
                  className="bg-[#FF6600] hover:bg-[#e55c00] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-md transition-colors shadow-xs"
                >
                  {hero?.primaryBtnText || 'Shop Best Deals'}
                </Link>
                {hero?.secondaryBtnText && (
                  <Link
                    href={hero?.secondaryBtnUrl || '/track-order'}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-md transition-colors"
                  >
                    {hero.secondaryBtnText}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
