import React from 'react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import { ShopLayoutClient } from './ShopLayoutClient';

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: Category[] = [];
  try {
    categories = await api.getCategories();
  } catch (err) {
    console.error('Failed to prefetch categories in ShopLayout:', err);
    // Fallback categories for resilient rendering
    categories = [
      { id: 'cat-solar', name: 'Solar & Green Energy', slug: 'solar-green-energy', parent: null },
      { id: 'cat-mobile', name: 'Mobile Phones', slug: 'mobile-phones', parent: null },
      { id: 'cat-laptops', name: 'Laptops', slug: 'laptops', parent: null },
      { id: 'cat-watches', name: 'Smart Watches', slug: 'smart-watches', parent: null },
      { id: 'cat-home', name: 'Home Appliances', slug: 'home-appliances', parent: null },
      { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', parent: null }
    ];
  }

  return (
    <ShopLayoutClient categories={categories}>
      {children}
    </ShopLayoutClient>
  );
}
