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
      { id: 'cat-solar-energy', name: 'SOLAR ENERGY', slug: 'solar-energy', parent: null },
      { id: 'cat-battery-bms-charger', name: 'BATTERY-BMS-CHARGER', slug: 'battery-bms-charger', parent: null },
      { id: 'cat-service-maintenance', name: 'SERVICE & MAINTENANCE', slug: 'service-&-maintenance', parent: null },
      { id: 'cat-customized-circuit-pcb', name: 'CUSTOMIZED CIRCUIT - PCB', slug: 'customized-circuit---pcb', parent: null },
      { id: 'cat-lt-ht-power-goods', name: 'LT-HT POWER GOODS', slug: 'lt-ht-power-goods', parent: null },
      { id: 'cat-modules-sensor', name: 'MODULES & SENSOR', slug: 'modules-&-sensor', parent: null },
      { id: 'cat-igbt-fet-diode-transistor', name: 'IGBT-FET-DIODE-TRANSISTOR', slug: 'igbt-fet-diode-transistor', parent: null },
      { id: 'cat-electronics-parts', name: 'ELECTRONICS PARTS', slug: 'electronics-parts', parent: null },
      { id: 'cat-safety-security', name: 'SAFETY - SECURITY', slug: 'safety---security', parent: null },
      { id: 'cat-tools-hardware', name: 'TOOLS - HARDWARE', slug: 'tools---hardware', parent: null },
      { id: 'cat-automation-process-cont', name: 'AUTOMATION-PROCESS CONT.', slug: 'automation-process-cont.', parent: null }
    ];
  }

  return (
    <ShopLayoutClient categories={categories}>
      {children}
    </ShopLayoutClient>
  );
}
