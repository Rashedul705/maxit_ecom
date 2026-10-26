'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { api } from '@/lib/api';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    try {
      setIsLoading(true);
      await api.subscribeNewsletter(email);
      setIsSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error('Subscription error:', err);
      // Still show thanks to user
      setIsSubscribed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-[#131A22] text-gray-300 pt-12 pb-20 lg:pb-8 border-t border-gray-800 text-xs">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-gray-800">
          
          {/* Column 1 & 2: Brand, Tagline, Contact & App Badges */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center select-none">
              <span className="text-2xl font-black text-[#FF6600]">maxit</span>
              <span className="text-2xl font-black text-white">shop</span>
            </Link>

            <p className="text-gray-400 leading-relaxed text-xs max-w-sm">
              Maxitshop - Your trusted online shopping destination in Bangladesh for solar equipment, gadgets, inverters, and premium smart devices.
            </p>

            {/* Phone numbers */}
            <div className="space-y-1.5 pt-1 text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF6600] shrink-0" />
                <span className="font-semibold text-white">+880 1711-000000, +880 1811-000000</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span>support@maxitshop.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Panthapath, Dhaka-1205, Bangladesh</span>
              </div>
            </div>

            {/* App Download Badges */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Experience Mobile App
              </p>
              <div className="flex items-center gap-2.5">
                {/* Google Play Badge Placeholder */}
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-md hover:border-gray-500 cursor-pointer transition-colors">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <div className="text-left">
                    <p className="text-[9px] text-gray-400 leading-none">GET IT ON</p>
                    <p className="text-[11px] font-bold text-white leading-tight">Google Play</p>
                  </div>
                </div>

                {/* App Store Badge Placeholder */}
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-md hover:border-gray-500 cursor-pointer transition-colors">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <p className="text-[9px] text-gray-400 leading-none">Download on the</p>
                    <p className="text-[11px] font-bold text-white leading-tight">App Store</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Useful Link */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-gray-800">
              Useful Link
            </h3>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <Link href="/" className="hover:text-[#FF6600] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/sellers" className="hover:text-[#FF6600] transition-colors">
                  Sellers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FF6600] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/customer/order-track" className="hover:text-[#FF6600] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/complaint" className="hover:text-[#FF6600] transition-colors">
                  Complaints
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Link (Policies) */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-gray-800">
              Link
            </h3>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <Link href="/page/order-procedure" className="hover:text-[#FF6600] transition-colors">
                  Order Procedure
                </Link>
              </li>
              <li>
                <Link href="/page/delivery-rules" className="hover:text-[#FF6600] transition-colors">
                  Delivery Rules
                </Link>
              </li>
              <li>
                <Link href="/page/return-policy" className="hover:text-[#FF6600] transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/page/privacy-policy" className="hover:text-[#FF6600] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/page/terms-conditions" className="hover:text-[#FF6600] transition-colors">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter Subscribe Box & Social Icons */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-gray-800">
              Newsletter
            </h3>
            <p className="text-gray-400 text-xs mb-3">
              Subscribe to get special discounts and weekly hot deal notifications.
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-950/80 text-emerald-400 rounded-md border border-emerald-800">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold">Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-[#FF6600]"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-[#FF6600] hover:bg-[#e55c00] text-white font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Subscribing...' : 'Subscribe'}</span>
                </button>
              </form>
            )}

            {/* Social Icons */}
            <div className="pt-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Follow Us
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#1877F2] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#FF0000] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#E4405F] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#0A66C2] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500 text-[11px]">
          <p>© 2026 maxitshop. All rights reserved. Powered by MaxiT Technologies.</p>
          <p>Payment Methods: Cash on Delivery (COD), bKash, Nagad, Rocket</p>
        </div>

      </div>
    </footer>
  );
};
