'use client';

import React from 'react';
import {
  ShieldCheck,
  Truck,
  Wrench,
  Award,
  Headphones,
  Zap,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export interface TrustFeature {
  title: string;
  description: string;
  icon: string;
}

interface TrustFeaturesStripProps {
  features?: TrustFeature[];
}

const DEFAULT_FEATURES: TrustFeature[] = [
  {
    title: '100% Genuine Cells',
    description: 'Tested Grade-A with guaranteed capacity',
    icon: 'ShieldCheck'
  },
  {
    title: 'Fast BD Delivery',
    description: 'Inside Dhaka in 24h, nationwide in 48h',
    icon: 'Truck'
  },
  {
    title: 'Technical Support',
    description: 'Expert engineering advice on WhatsApp',
    icon: 'Wrench'
  },
  {
    title: 'Official Warranty',
    description: 'Authentic manufacturer replacement backup',
    icon: 'Award'
  }
];

const renderFeatureIcon = (iconName: string) => {
  const norm = (iconName || '').toLowerCase().trim();
  switch (norm) {
    case 'shieldcheck':
    case 'shield':
      return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
    case 'truck':
      return <Truck className="w-5 h-5 text-blue-600" />;
    case 'wrench':
    case 'tools':
      return <Wrench className="w-5 h-5 text-orange-600" />;
    case 'award':
    case 'badge':
      return <Award className="w-5 h-5 text-amber-500" />;
    case 'headphones':
    case 'support':
      return <Headphones className="w-5 h-5 text-purple-600" />;
    case 'zap':
    case 'bolt':
      return <Zap className="w-5 h-5 text-amber-500" />;
    case 'check':
    case 'checkcircle':
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    case 'clock':
      return <Clock className="w-5 h-5 text-sky-600" />;
    default:
      return <Sparkles className="w-5 h-5 text-[#FF6600]" />;
  }
};

export const TrustFeaturesStrip: React.FC<TrustFeaturesStripProps> = ({ features }) => {
  const items = (features && features.length > 0) ? features : DEFAULT_FEATURES;

  return (
    <section aria-label="Trust Features" className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3.5 sm:p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-[#FF6600]/40 transition-all duration-200 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gray-50 group-hover:bg-orange-50/80 flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-orange-100 transition-colors">
              {renderFeatureIcon(item.icon)}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#FF6600] transition-colors truncate">
                {item.title}
              </h4>
              <p className="text-[11px] text-gray-500 truncate mt-0.5 leading-snug">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
