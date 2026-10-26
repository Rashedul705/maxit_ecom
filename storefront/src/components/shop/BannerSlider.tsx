'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Banner } from '@/lib/types';

interface BannerSliderProps {
  banners: Banner[];
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const prevSlide = () => {
    setCurrent(prev => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrent(prev => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md group">
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative w-full shrink-0 aspect-21/9 sm:aspect-16/6 md:aspect-16/5 min-h-[220px]">
            {/* Banner Background Image with Gradient Overlay */}
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1280px"
              className="object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />

            {/* Banner Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-2xl text-white">
              {banner.badge && (
                <span className="inline-block bg-orange-500 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit mb-2 shadow-xs">
                  {banner.badge}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold leading-tight mb-2 tracking-tight text-white drop-shadow-xs">
                {banner.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 mb-4 max-w-lg drop-shadow-xs">
                {banner.subtitle}
              </p>
              <div>
                <Link
                  href={banner.link}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-all shadow-md hover:shadow-blue-500/30 hover:gap-3"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`transition-all ${
                  current === idx
                    ? 'w-6 h-2 bg-blue-500 rounded-full'
                    : 'w-2 h-2 bg-white/50 hover:bg-white rounded-full'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
