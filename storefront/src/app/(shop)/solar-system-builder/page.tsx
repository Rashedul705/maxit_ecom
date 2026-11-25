import { Metadata } from 'next';
import { Suspense } from 'react';
import { SolarSystemBuilder } from '@/components/shop/SolarSystemBuilder';

export const metadata: Metadata = {
  title: 'Solar System Builder - Custom Solar Power Plant Configurator | MaxiTShop',
  description: 'Design and configure your residential or commercial solar energy system with live BDT pricing, solar kWp calculation, daily unit estimates, and instant official quotation.',
};

export default function SolarSystemBuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-24 text-center">
        <div className="w-8 h-8 border-3 border-[#FF6600] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-gray-500 font-semibold">Loading Solar System Builder...</p>
      </div>
    }>
      <SolarSystemBuilder />
    </Suspense>
  );
}
