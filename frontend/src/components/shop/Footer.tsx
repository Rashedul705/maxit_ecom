import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 border-t border-slate-800">
      
      {/* Trust Badges Ribbon */}
      <div className="max-w-7xl mx-auto px-4 pb-10 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fast Nationwide Delivery</h4>
              <p className="text-xs text-slate-400">2-3 Days anywhere in Bangladesh</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Cash on Delivery</h4>
              <p className="text-xs text-slate-400">Pay after receiving your parcel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Genuine Products</h4>
              <p className="text-xs text-slate-400">Directly from official distributors</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7 Days Replacement</h4>
              <p className="text-xs text-slate-400">Hassle-free warranty claim</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Col 1: About & Contact */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg">
              M
            </div>
            <span className="text-2xl font-black text-white">
              MaxiT<span className="text-orange-500">Shop</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            MaxiTShop is a leading e-commerce platform in Bangladesh specializing in Green Solar Solutions, Flagship Smartphones, Laptops, Gadgets, and Smart Home Appliances.
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <span>Level 6, Block B, Panthapath, Dhaka-1205, Bangladesh</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Hotline: +880 1700-000000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>support@maxitshop.com</span>
            </div>
          </div>
        </div>

        {/* Col 2: Customer Care */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Customer Care
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link href="/track-order" className="hover:text-blue-400 transition-colors">Track Your Order</Link></li>
            <li><Link href="/shipping-returns" className="hover:text-blue-400 transition-colors">Shipping & Delivery Rates</Link></li>
            <li><Link href="/shipping-returns#returns" className="hover:text-blue-400 transition-colors">7 Days Return & Replacement Policy</Link></li>
            <li><Link href="/faq" className="hover:text-blue-400 transition-colors">Frequently Asked Questions (FAQ)</Link></li>
            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Customer Service & Helpline</Link></li>
          </ul>
        </div>

        {/* Col 3: Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link href="/about" className="hover:text-blue-400 transition-colors">About maxitshop</Link></li>
            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/#deals" className="hover:text-blue-400 transition-colors">Deals of the Day</Link></li>
            <li><Link href="/#new-arrivals" className="hover:text-blue-400 transition-colors">New Arrivals</Link></li>
            <li><Link href="/admin" className="hover:text-slate-500 transition-colors">Staff Portal (Admin)</Link></li>
          </ul>
        </div>

        {/* Col 4: Payments & Security */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            Accepted Payments
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Safe & verified payment channels across all 64 districts of Bangladesh:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-800 border border-slate-700 text-center font-semibold text-white">
              Cash On Delivery
            </div>
            <div className="p-2 rounded bg-pink-950/40 border border-pink-700/50 text-center font-bold text-pink-400">
              bKash
            </div>
            <div className="p-2 rounded bg-orange-950/40 border border-orange-700/50 text-center font-bold text-orange-400">
              Nagad
            </div>
            <div className="p-2 rounded bg-blue-950/40 border border-blue-700/50 text-center font-bold text-blue-400">
              Visa / Master
            </div>
          </div>
          <div className="mt-4 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-slate-300">256-bit SSL Secure Checkout & Privacy Guaranteed</span>
          </div>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 MaxiiT. All rights reserved.</p>
      </div>
    </footer>
  );
};
