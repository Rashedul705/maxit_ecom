import React from 'react';
import Link from 'next/link';
import { Phone, Clock, MapPin, ShieldCheck } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
        {/* Left: Hotline & Service hours */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span>Hotline: <strong className="text-white font-medium">+880 1700-000000</strong></span>
          </div>
          <div className="hidden sm:flex items-center space-x-1 text-slate-400">
            <Clock className="w-3 h-3" />
            <span>9:00 AM - 10:00 PM (Everyday)</span>
          </div>
        </div>

        {/* Right: Quick Links */}
        <div className="flex items-center space-x-4 text-slate-300">
          <div className="hidden md:flex items-center space-x-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Genuine Products</span>
          </div>
          <Link href="/track-order" className="hover:text-blue-400 transition-colors flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-orange-400" />
            <span>Track Order</span>
          </Link>
          <Link href="/about" className="hover:text-white transition-colors hidden sm:inline">
            About Us
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors hidden sm:inline">
            Contact
          </Link>
          <div className="text-slate-400 font-medium bg-slate-800 px-2 py-0.5 rounded text-[11px]">
            BDT (৳)
          </div>
        </div>
      </div>
    </div>
  );
};
