'use client';

import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export const FloatingSupport: React.FC = () => {
  return (
    <aside aria-label="Customer Support" className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
      <a
        href="https://wa.me/8801700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-bold hidden sm:inline">WhatsApp Help</span>
      </a>

      <a
        href="tel:+8801700000000"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
        title="Call Hotline"
        aria-label="Call Hotline"
      >
        <Phone className="w-5 h-5 fill-current" />
        <span className="text-xs font-bold hidden sm:inline">Hotline Support</span>
      </a>
    </aside>
  );
};
