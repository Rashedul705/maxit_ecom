'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Warehouse, AlertTriangle } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <div className="bg-black text-white py-2 text-xs border-b border-gray-900 select-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-3">
        {/* Left: Greeting & Stock Source */}
        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
          <span className="text-gray-300 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>Assalamu Walaikum</span>
          </span>
          <span className="hidden sm:flex items-center gap-1 text-sky-300">
            <Warehouse className="w-3.5 h-3.5 text-sky-400" />
            <span>Showing items from: <strong className="font-semibold text-sky-200">OnlineStock</strong></span>
          </span>
        </div>

        {/* Center: Beta Notice */}
        <div className="flex items-center justify-center text-center">
          <span className="text-yellow-400 flex items-center gap-1.5 font-semibold text-[11px] sm:text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>This is a Beta Version - Some items may not be in stock</span>
          </span>
        </div>

        {/* Right: Social Media Icons */}
        <div className="hidden md:flex items-center gap-3.5 text-gray-400 justify-end flex-shrink-0">
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
            title="Facebook"
            aria-label="Facebook"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
            title="Community Group"
            aria-label="Community Group"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
            title="YouTube"
            aria-label="YouTube"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};
