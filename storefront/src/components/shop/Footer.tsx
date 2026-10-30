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
    <footer className="bg-[#0B1528] text-gray-300 pt-12 pb-20 lg:pb-8 border-t border-[#1C2739] text-xs [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#1C2739]">
          
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

            {/* Contact Details */}
            <div className="space-y-2 pt-1 text-gray-300">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Contact</p>

              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-[#FF6600] shrink-0" />
                <a href="mailto:sales@m4xit.com" className="hover:text-[#FF6600] transition-colors">
                  sales@m4xit.com
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF6600] shrink-0" />
                <a href="tel:+8801733272445" className="font-semibold text-white hover:text-[#FF6600] transition-colors">
                  +8801733-272445
                </a>
              </div>

              <div className="flex items-start gap-2 text-gray-300 text-xs">
                <MapPin className="w-4 h-4 text-[#FF6600] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>
                    <span className="font-bold text-white">Head Office: </span>
                    <span className="text-gray-300">Afroza Tower, 4th Floor, Uposhohor Newmarket, Rajshahi</span>
                  </p>
                  <p>
                    <span className="font-bold text-white">LAB Office: </span>
                    <span className="text-gray-300">Afroza Tower, 2nd Floor, Uposhohor Newmarket, Rajshahi</span>
                  </p>
                </div>
              </div>
            </div>

            {/* App Download Badges */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Experience Mobile App
              </p>
              <div className="flex items-center gap-2.5">
                {/* Google Play Badge Placeholder */}
                <div className="flex items-center gap-2 bg-[#101C33] border border-[#1C2739] px-3 py-1.5 rounded-md hover:border-[#0468D3]/50 cursor-pointer transition-colors">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <div className="text-left">
                    <p className="text-[9px] text-gray-400 leading-none">GET IT ON</p>
                    <p className="text-[11px] font-bold text-white leading-tight">Google Play</p>
                  </div>
                </div>

                {/* App Store Badge Placeholder */}
                <div className="flex items-center gap-2 bg-[#101C33] border border-[#1C2739] px-3 py-1.5 rounded-md hover:border-[#0468D3]/50 cursor-pointer transition-colors">
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
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-[#1C2739]">
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
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-[#1C2739]">
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
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1 border-b border-[#1C2739]">
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
                  className="w-full px-3 py-2 bg-[#101C33] border border-[#1C2739] rounded-md text-xs text-white placeholder-gray-400 focus:outline-hidden focus:border-[#0468D3]"
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
                  className="w-8 h-8 rounded-full bg-[#1C2739] hover:bg-[#1877F2] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
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
                  className="w-8 h-8 rounded-full bg-[#1C2739] hover:bg-[#FF0000] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a
                  href="https://wa.me/8801733272445"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#1C2739] hover:bg-[#25D366] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.058-1.776-.367-1.428-.532-2.348-1.954-2.42-2.048-.07-.095-.568-.756-.568-1.442 0-.685.358-1.023.486-1.163.128-.14.281-.175.375-.175.093 0 .188.001.27.006.088.004.205-.034.32.245.12.289.41 1.002.446 1.075.036.073.06.158.01.256-.048.098-.073.158-.145.244-.073.085-.153.19-.219.255-.073.072-.15.15-.064.298.086.147.382.63.818 1.019.561.5 1.034.655 1.18.728.147.073.233.061.32-.037.086-.098.375-.436.475-.586.1-.15.201-.125.337-.075.137.05.867.41 1.016.485.15.074.25.111.287.174.037.063.037.368-.107.773zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.399C8.423 21.493 10.153 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#1C2739] hover:bg-[#0A66C2] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
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

        {/* Google Map Embedded Location */}
        <div className="py-6 border-b border-[#1C2739]">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#FF6600]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Store &amp; Office Location</span>
            <span className="text-gray-400 text-xs hidden sm:inline">— Afroza Tower, Uposhohor Newmarket, Rajshahi</span>
          </div>
          <div className="w-full h-48 sm:h-60 rounded-xl overflow-hidden border border-[#1C2739] shadow-inner bg-[#101C33]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3634.103439609135!2d88.59531817559223!3d24.377704764404523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14644734df7254d%3A0x9ca140a46bae1fa1!2sMax%20iT%20Solution!5e0!3m2!1sen!2sbd!4v1793392757385!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Max iT Solution Google Maps Location"
            />
          </div>
        </div>

        {/* Copyright notice */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500 text-[11px]">
          <p>© 2026 Max iT Solution. All rights reserved. · <Link href="/admin" className="hover:text-[#FF6600] transition-colors underline">Admin Portal</Link></p>
          <p>Payment Methods: Cash on Delivery (COD), bKash, Nagad, Rocket</p>
        </div>

      </div>
    </footer>
  );
};
