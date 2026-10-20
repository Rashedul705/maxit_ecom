'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/shop/TopBar';
import { Header } from '@/components/shop/Header';
import { MegaMenu } from '@/components/shop/MegaMenu';
import { MobileDrawer } from '@/components/shop/MobileDrawer';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { FloatingSupport } from '@/components/shop/FloatingSupport';
import { Footer } from '@/components/shop/Footer';
import { Category } from '@/lib/types';
import { CartProvider } from '@/lib/cartContext';

interface ShopLayoutClientProps {
  children: React.ReactNode;
  categories: Category[];
}

export const ShopLayoutClient: React.FC<ShopLayoutClientProps> = ({ children, categories }) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        {/* Top Utility Bar */}
        <TopBar />

        {/* Main Header with Search & Cart */}
        <Header onToggleMobileDrawer={() => setIsMobileDrawerOpen(true)} />

        {/* Mega Menu Bar (Desktop) */}
        <MegaMenu categories={categories} />

        {/* Mobile Navigation Drawer */}
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          categories={categories}
        />

        {/* Slide-over Cart Drawer */}
        <CartDrawer />

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>

        {/* Floating WhatsApp & Hotline Button */}
        <FloatingSupport />

        {/* Footer */}
        <Footer />
      </div>
    </CartProvider>
  );
};
