'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/lib/types';
import {
  Sun,
  BatteryCharging,
  Zap,
  Home,
  Cpu,
  Bot,
  Radio,
  Layers,
  Wrench,
  ShieldCheck,
  Monitor,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface CategoriesGridProps {
  categories: Category[];
}

function getCleanCategoryImageUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  return rawUrl.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i, '$3').trim();
}

function getCategoryIcon(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes('solar') || s.includes('renewable')) return Sun;
  if (s.includes('batter') || s.includes('portable')) return BatteryCharging;
  if (s.includes('ups') || s.includes('voltage') || s.includes('power')) return Zap;
  if (s.includes('smart') || s.includes('home') || s.includes('automation')) return Home;
  if (s.includes('micro') || s.includes('arduino') || s.includes('esp')) return Cpu;
  if (s.includes('robot') || s.includes('drone') || s.includes('kit')) return Bot;
  if (s.includes('sensor') || s.includes('wire') || s.includes('module')) return Radio;
  if (s.includes('tool') || s.includes('instrument')) return Wrench;
  if (s.includes('secur') || s.includes('safe') || s.includes('camera')) return ShieldCheck;
  if (s.includes('comput') || s.includes('server') || s.includes('network')) return Monitor;
  if (s.includes('access') || s.includes('service')) return Sparkles;
  return Layers;
}

const CategoryCardItem: React.FC<{ category: Category }> = ({ category }) => {
  const [imgError, setImgError] = useState(false);
  const cleanImgUrl = getCleanCategoryImageUrl(category.image);
  const IconComponent = getCategoryIcon(category.slug);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative flex flex-col items-center justify-between p-3 sm:p-4 bg-white border border-slate-200/80 rounded-2xl hover:border-[#FF6600] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
    >
      {/* Uniform Brand Icon / Image Capsule */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2.5 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-amber-50/50 border border-orange-100 flex items-center justify-center p-2 group-hover:scale-105 group-hover:border-orange-300 transition-all duration-300 shadow-2xs overflow-hidden">
        {cleanImgUrl && !imgError ? (
          <Image
            src={cleanImgUrl}
            alt={category.name}
            fill
            sizes="80px"
            className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50/60 rounded-xl">
            <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF6600] group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
      </div>

      {/* Category Name (Clamped to 2 lines max with uniform height) */}
      <div className="w-full">
        <span className="text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-[#FF6600] line-clamp-2 h-[34px] sm:h-[36px] flex items-center justify-center leading-snug transition-colors">
          {category.name}
        </span>
        <div className="flex items-center justify-center gap-0.5 text-[10px] text-slate-400 group-hover:text-[#FF6600] font-semibold mt-1 transition-colors">
          <span>Explore</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-3 sm:py-5">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2.5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-[#FF6600] rounded-full" />
          <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">
            Featured Categories
          </h2>
        </div>
        <span className="text-xs font-semibold text-gray-500">
          {categories.length} Categories
        </span>
      </div>

      {/* Responsive Grid: 2 cols on mobile, 3 on small tablet, 4 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((category) => (
          <CategoryCardItem key={category.id || category.slug} category={category} />
        ))}
      </div>
    </section>
  );
};
