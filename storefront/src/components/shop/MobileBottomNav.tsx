'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid, Truck, Home, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

interface MobileBottomNavProps {
  onOpenCategories: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCategories }) => {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();

  const isHome = pathname === '/';
  const isTracking = pathname.startsWith('/customer/order-track');
  const isLogin = pathname.startsWith('/customer/login');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden shadow-lg select-none">
      <div className="grid grid-cols-5 h-14">
        {/* 1. Category */}
        <button
          onClick={onOpenCategories}
          className="flex flex-col items-center justify-center text-gray-600 hover:text-[#FF6600] active:text-[#FF6600] transition-colors"
          aria-label="Categories"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Category</span>
        </button>

        {/* 2. Tracking */}
        <Link
          href="/customer/order-track"
          className={`flex flex-col items-center justify-center transition-colors ${
            isTracking ? 'text-[#FF6600]' : 'text-gray-600 hover:text-[#FF6600]'
          }`}
          aria-label="Track Order"
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Tracking</span>
        </Link>

        {/* 3. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center transition-colors ${
            isHome ? 'text-[#FF6600]' : 'text-gray-600 hover:text-[#FF6600]'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
        </Link>

        {/* 4. Cart */}
        <button
          onClick={() => openCart()}
          className="flex flex-col items-center justify-center text-gray-600 hover:text-[#FF6600] relative transition-colors"
          aria-label="Shopping Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FF6600] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5">Cart</span>
        </button>

        {/* 5. Login */}
        <Link
          href="/customer/login"
          className={`flex flex-col items-center justify-center transition-colors ${
            isLogin ? 'text-[#FF6600]' : 'text-gray-600 hover:text-[#FF6600]'
          }`}
          aria-label="User Account"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Login</span>
        </Link>
      </div>
    </nav>
  );
};
