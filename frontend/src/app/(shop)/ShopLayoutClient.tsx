'use client';

import React, { useState } from 'react';
import { Header } from '@/components/shop/Header';
import { MobileDrawer } from '@/components/shop/MobileDrawer';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { FloatingSupport } from '@/components/shop/FloatingSupport';
import { MobileBottomNav } from '@/components/shop/MobileBottomNav';
import { Footer } from '@/components/shop/Footer';
import { Category } from '@/lib/types';
import { CartProvider } from '@/lib/cartContext';
import { WishlistProvider } from '@/lib/wishlistContext';

interface ShopLayoutClientProps {
  children: React.ReactNode;
  categories: Category[];
}

export const ShopLayoutClient: React.FC<ShopLayoutClientProps> = ({ children, categories }) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-gray-900 font-sans">
          {/* Main Header with Top Header & Main Nav Bar */}
          <Header
            categories={categories}
            onToggleMobileDrawer={() => setIsMobileDrawerOpen(true)}
          />

          {/* Mobile Navigation Drawer */}
          <MobileDrawer
            isOpen={isMobileDrawerOpen}
            onClose={() => setIsMobileDrawerOpen(false)}
            categories={categories}
          />

          {/* Slide-over Cart Drawer */}
          <CartDrawer />

          {/* Main Content Area */}
          <main className="flex-1 pb-16 lg:pb-0">
            {children}
          </main>

          {/* Floating WhatsApp & Messenger Support Buttons */}
          <FloatingSupport />

          {/* Mobile Fixed Bottom Navigation Bar */}
          <MobileBottomNav onOpenCategories={() => setIsMobileDrawerOpen(true)} />

          {/* Footer */}
          <Footer />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
};
