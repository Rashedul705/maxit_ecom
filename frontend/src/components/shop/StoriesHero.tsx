'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface StoryItem {
  id: number;
  title: string;
  subtitle: string;
  actionText: string;
  image: string;
  link: string;
  gradient: string;
}

const STORIES: StoryItem[] = [
  {
    id: 1,
    title: 'Electronics Hub',
    subtitle: 'Latest gadgets',
    actionText: 'Shop Now',
    image: '/images/stories/story1.webp',
    link: '/category/accessories',
    gradient: 'from-black/85 via-black/40 to-transparent'
  },
  {
    id: 2,
    title: 'Smart Living',
    subtitle: 'Smart home solutions',
    actionText: 'Explore',
    image: '/images/stories/story2.webp',
    link: '/category/home-appliances',
    gradient: 'from-blue-950/85 via-blue-900/40 to-transparent'
  },
  {
    id: 3,
    title: 'Gaming Zone',
    subtitle: 'Gaming gear',
    actionText: 'Discover',
    image: '/images/stories/story3.webp',
    link: '/category/laptops',
    gradient: 'from-purple-950/85 via-purple-900/40 to-transparent'
  },
  {
    id: 4,
    title: 'Audio Paradise',
    subtitle: 'Sound systems',
    actionText: 'Listen',
    image: '/images/stories/story4.webp',
    link: '/category/smart-watches',
    gradient: 'from-red-950/85 via-red-900/40 to-transparent'
  },
  {
    id: 5,
    title: 'Mobile World',
    subtitle: 'Latest smartphones',
    actionText: 'Browse',
    image: '/images/stories/story5.webp',
    link: '/category/mobile-phones',
    gradient: 'from-green-950/85 via-green-900/40 to-transparent'
  },
  {
    id: 6,
    title: 'Computing Power',
    subtitle: 'Laptops & desktops',
    actionText: 'View All',
    image: '/images/stories/story6.webp',
    link: '/category/laptops',
    gradient: 'from-indigo-950/85 via-indigo-900/40 to-transparent'
  },
  {
    id: 7,
    title: 'Photography Hub',
    subtitle: 'Cameras & lenses',
    actionText: 'Capture',
    image: '/images/stories/story7.webp',
    link: '/category/accessories',
    gradient: 'from-orange-950/85 via-orange-900/40 to-transparent'
  },
  {
    id: 8,
    title: 'Accessories Corner',
    subtitle: 'Tech accessories',
    actionText: 'Shop',
    image: '/images/stories/story8.webp',
    link: '/category/accessories',
    gradient: 'from-teal-950/85 via-teal-900/40 to-transparent'
  }
];

export const StoriesHero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Total items 8, desktop shows 6 at a time, so maxIndex = 2
  const maxIndex = STORIES.length - 6;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="pt-4 sm:pt-6 pb-2 bg-white relative select-none">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative">
          {/* Navigation Arrow Left */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              aria-label="Previous Stories"
              className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white text-gray-800 shadow-xl rounded-full p-2.5 hover:scale-105 transition-all hidden md:flex items-center justify-center border border-gray-100"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Navigation Arrow Right */}
          {currentIndex < maxIndex && (
            <button
              onClick={handleNext}
              aria-label="Next Stories"
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white text-gray-800 shadow-xl rounded-full p-2.5 hover:scale-105 transition-all hidden md:flex items-center justify-center border border-gray-100"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Stories Carousel Wrapper */}
          <div ref={containerRef} className="overflow-hidden rounded-2xl py-1">
            <div
              className="flex transition-transform duration-500 ease-out gap-3 md:gap-3.5"
              style={{
                transform: `translateX(-${currentIndex * (100 / 6 + 0.58)}%)`
              }}
            >
              {STORIES.map((story) => (
                <div
                  key={story.id}
                  className="shrink-0 w-1/2 sm:w-1/3 md:w-[calc((100%-70px)/6)]"
                >
                  <Link
                    href={story.link}
                    className="group block relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Story Card Image Container */}
                    <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        priority={story.id <= 6}
                      />

                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${story.gradient}`} />

                      {/* Content Overlay at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-3.5 z-10">
                        <h3 className="text-white text-sm sm:text-base font-bold mb-0.5 leading-snug drop-shadow-xs">
                          {story.title}
                        </h3>
                        <p className="text-white/85 text-[11px] sm:text-xs mb-2 line-clamp-1 drop-shadow-xs">
                          {story.subtitle}
                        </p>
                        <span className="inline-flex items-center gap-1 text-white text-[11px] font-semibold group-hover:underline">
                          <span>{story.actionText}</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
