import React from 'react';
import { api } from '@/lib/api';
import { Category, SiteSetting } from '@/lib/types';
import { ShopLayoutClient } from './ShopLayoutClient';

export const revalidate = 0;

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: Category[] = [];
  let settings: SiteSetting | null = null;

  try {
    const [catsData, settingsData] = await Promise.all([
      api.getCategories().catch(() => []),
      api.getSettings().catch(() => null)
    ]);
    categories = catsData;
    settings = settingsData;
  } catch (err) {
    console.error('Failed to prefetch categories and settings in ShopLayout:', err);
    // Fallback categories for resilient rendering
    categories = [
      { id: 'cat-solar-renewable-energy', name: 'Solar & Renewable Energy', slug: 'solar-renewable-energy', parent: null },
      { id: 'cat-batteries-portable-power', name: 'Batteries & Portable Power', slug: 'batteries-portable-power', parent: null },
      { id: 'cat-ups-power-protection', name: 'UPS & Power Protection', slug: 'ups-power-protection', parent: null },
      { id: 'cat-smart-home-automation', name: 'Smart Home & Automation', slug: 'smart-home-automation', parent: null },
      { id: 'cat-microcontrollers-dev-boards', name: 'Microcontrollers & Dev Boards', slug: 'microcontrollers-dev-boards', parent: null },
      { id: 'cat-robotics-drone-kits', name: 'Robotics, Drone & Kits', slug: 'robotics-drone-kits', parent: null },
      { id: 'sensors-modules-wireless', name: 'Sensors, Modules & Wireless', slug: 'sensors-modules-wireless', parent: null },
      { id: 'cat-electronic-components', name: 'Electronic Components', slug: 'electronic-components', parent: null },
      { id: 'cat-tools-instruments', name: 'Tools & Instruments', slug: 'tools-instruments', parent: null },
      { id: 'cat-security-safety', name: 'Security & Safety', slug: 'security-safety', parent: null },
      { id: 'cat-computer-networking-office', name: 'Computer, Networking & Office', slug: 'computer-networking-office', parent: null },
      { id: 'cat-accessories-services', name: 'Accessories & Services', slug: 'accessories-services', parent: null },
    ];
  }

  return (
    <ShopLayoutClient categories={categories} settings={settings}>
      {children}
    </ShopLayoutClient>
  );
}
