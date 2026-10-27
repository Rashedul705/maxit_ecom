'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingSupport: React.FC = () => {
  return (
    <aside
      aria-label="Floating Chat Support"
      className="fixed bottom-16 lg:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-3 select-none"
    >
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/8801733272445"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group font-bold text-xs sm:text-sm"
        title="Chat on WhatsApp (+880 1733-272445)"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-current shrink-0" />
        <span>Chat on WhatsApp</span>
      </a>

      {/* Messenger Button */}
      <a
        href="https://m.me/maxitshop"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#0084FF] hover:bg-[#0074e0] text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        title="Chat on Messenger"
        aria-label="Chat on Messenger"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.085.3 2.238.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.194 14.963l-3.056-3.26-5.963 3.26 6.556-6.963 3.13 3.26 5.889-3.26-6.556 6.963z" />
        </svg>
        <span className="text-xs font-bold hidden sm:inline">Messenger</span>
      </a>
    </aside>
  );
};
