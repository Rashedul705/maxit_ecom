'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Sun,
  Zap,
  BatteryCharging,
  Cpu,
  Sliders,
  ShieldCheck,
  Cable,
  Wrench,
  Printer,
  Share2,
  RotateCcw,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Plus,
  Minus,
  Trash2,
  Search,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { Product } from '@/lib/types';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cartContext';
import { SafeImage, PLACEHOLDER_PRODUCT_IMAGE } from '@/components/common/SafeImage';

export interface SolarSlotConfig {
  id: string;
  slotNumber: string;
  name: string;
  shortName: string;
  badge: 'Required' | 'Recommended' | 'Optional' | 'Essential';
  description: string;
  iconName: 'Sun' | 'Zap' | 'BatteryCharging' | 'Cpu' | 'Sliders' | 'ShieldCheck' | 'Cable' | 'Wrench';
  defaultCategory: string;
  subCategory?: string;
  fallbackSearch?: string;
  defaultQty: number;
  minQty: number;
  maxQty: number;
  unitLabel: string;
}

export const SOLAR_SLOTS: SolarSlotConfig[] = [
  {
    id: 'panels',
    slotNumber: '01',
    name: 'Solar PV Panels',
    shortName: 'Solar Panels',
    badge: 'Required',
    description: 'High-efficiency Monocrystalline PERC, Bifacial or TopCon Solar Modules',
    iconName: 'Sun',
    defaultCategory: 'solar-energy',
    subCategory: 'solar-pv-panels',
    fallbackSearch: 'solar panel',
    defaultQty: 6,
    minQty: 1,
    maxQty: 48,
    unitLabel: 'Panels'
  },
  {
    id: 'inverter',
    slotNumber: '02',
    name: 'Solar Inverter / Hybrid Inverter',
    shortName: 'Inverter',
    badge: 'Required',
    description: 'Pure Sine Wave Hybrid, On-Grid, or Off-Grid Solar Power Inverter',
    iconName: 'Zap',
    defaultCategory: 'solar-inverter',
    fallbackSearch: 'inverter',
    defaultQty: 1,
    minQty: 1,
    maxQty: 4,
    unitLabel: 'Unit'
  },
  {
    id: 'battery',
    slotNumber: '03',
    name: 'Solar Energy Storage Battery',
    shortName: 'Battery Storage',
    badge: 'Recommended',
    description: 'LiFePO4 Lithium Battery, Wall-Mounted, Rack or Deep Cycle Bank',
    iconName: 'BatteryCharging',
    defaultCategory: 'solar-battery',
    fallbackSearch: 'battery',
    defaultQty: 1,
    minQty: 1,
    maxQty: 16,
    unitLabel: 'Unit'
  },
  {
    id: 'bms',
    slotNumber: '04',
    name: 'Smart BMS / Active Balancer',
    shortName: 'BMS & Balancer',
    badge: 'Optional',
    description: 'Battery Management System with Bluetooth & Active Cell Equalization',
    iconName: 'Cpu',
    defaultCategory: 'battery-bms-charger',
    fallbackSearch: 'bms balancer',
    defaultQty: 1,
    minQty: 1,
    maxQty: 4,
    unitLabel: 'Unit'
  },
  {
    id: 'controller',
    slotNumber: '05',
    name: 'Solar Charge Controller / MPPT',
    shortName: 'Charge Controller',
    badge: 'Optional',
    description: 'High-tracking efficiency MPPT Solar Charger for standalone DC systems',
    iconName: 'Sliders',
    defaultCategory: 'solar-energy',
    subCategory: 'solar-charge-controller',
    fallbackSearch: 'mppt charge controller',
    defaultQty: 1,
    minQty: 1,
    maxQty: 4,
    unitLabel: 'Unit'
  },
  {
    id: 'protection',
    slotNumber: '06',
    name: 'DC Protection & Switchgear',
    shortName: 'DC Protection',
    badge: 'Essential',
    description: 'DC Circuit Breaker (MCB/MCCB), DC SPD Surge Arrester, Fuses & Combiner Box',
    iconName: 'ShieldCheck',
    defaultCategory: 'solar-energy',
    subCategory: 'dc-protection-spd',
    fallbackSearch: 'dc breaker spd fuse',
    defaultQty: 1,
    minQty: 1,
    maxQty: 10,
    unitLabel: 'Set'
  },
  {
    id: 'cables',
    slotNumber: '07',
    name: 'Solar PV Cable & MC4 Connectors',
    shortName: 'Cables & MC4',
    badge: 'Essential',
    description: 'TUV Certified 4mm² / 6mm² Solar Wire & Waterproof MC4 Terminals',
    iconName: 'Cable',
    defaultCategory: 'solar-energy',
    subCategory: 'solar-accessories-connectors',
    fallbackSearch: 'solar cable mc4',
    defaultQty: 1,
    minQty: 1,
    maxQty: 100,
    unitLabel: 'Lot/Set'
  },
  {
    id: 'mounting',
    slotNumber: '08',
    name: 'Mounting Structure & Hardware',
    shortName: 'Mounting Hardware',
    badge: 'Essential',
    description: 'Anodized Aluminum Rooftop Rails, Mid/End Clamps & Tilt Brackets',
    iconName: 'Wrench',
    defaultCategory: 'solar-energy',
    subCategory: 'solar-mounting-cables',
    fallbackSearch: 'mounting rail clamp',
    defaultQty: 1,
    minQty: 1,
    maxQty: 24,
    unitLabel: 'Set'
  }
];

export interface SlotSelection {
  product: Product;
  quantity: number;
}

export const SolarSystemBuilder: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addMultipleToCart } = useCart();

  // Selected components per slot
  const [selectedSlots, setSelectedSlots] = useState<Record<string, SlotSelection>>({});

  // Selection Modal state
  const [activeSlot, setActiveSlot] = useState<SolarSlotConfig | null>(null);
  const [modalSearch, setModalSearch] = useState('');
  const [modalBrand, setModalBrand] = useState<string>('all');
  const [modalInStockOnly, setModalInStockOnly] = useState(false);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  // Quotation Modal state
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Hydrate from URL query parameters on initial load
  useEffect(() => {
    if (!searchParams) return;
    const loadFromUrl = async () => {
      const updates: Record<string, SlotSelection> = {};
      let hasAny = false;

      for (const slot of SOLAR_SLOTS) {
        const val = searchParams.get(slot.id);
        if (val) {
          // Format: PROD_SLUG:QTY or PROD_ID:QTY
          const [slugOrId, qtyStr] = val.split(':');
          const qty = parseInt(qtyStr, 10) || slot.defaultQty;
          try {
            const product = await api.getProduct(slugOrId);
            if (product) {
              updates[slot.id] = { product, quantity: qty };
              hasAny = true;
            }
          } catch (e) {
            console.error(`Failed to load product ${slugOrId} for slot ${slot.id}:`, e);
          }
        }
      }

      if (hasAny) {
        setSelectedSlots(prev => ({ ...prev, ...updates }));
        showToast('Solar System configuration loaded from link!');
      }
    };

    loadFromUrl();
  }, [searchParams, showToast]);

  // Load products when selection modal opens or filters change
  useEffect(() => {
    if (!activeSlot) return;

    let isCancelled = false;
    const fetchSlotProducts = async () => {
      setIsLoadingModal(true);
      try {
        const res = await api.getProducts({
          category: activeSlot.defaultCategory,
          sub: activeSlot.subCategory,
          search: modalSearch.trim() || undefined,
          brand: modalBrand !== 'all' ? modalBrand : undefined,
          inStock: modalInStockOnly ? 'true' : undefined,
          limit: 48
        });

        if (!isCancelled) {
          let items = res.items || [];
          // If subcategory has few or no items, fallback to searching the whole category without subcategory
          if (items.length === 0 && activeSlot.subCategory) {
            const fallbackRes = await api.getProducts({
              category: activeSlot.defaultCategory,
              search: modalSearch.trim() || undefined,
              brand: modalBrand !== 'all' ? modalBrand : undefined,
              inStock: modalInStockOnly ? 'true' : undefined,
              limit: 48
            });
            items = fallbackRes.items || [];
          }

          // If still no items and there is a fallback search query
          if (items.length === 0 && activeSlot.fallbackSearch && !modalSearch.trim()) {
            const fallbackSearchRes = await api.getProducts({
              search: activeSlot.fallbackSearch,
              brand: modalBrand !== 'all' ? modalBrand : undefined,
              inStock: modalInStockOnly ? 'true' : undefined,
              limit: 48
            });
            items = fallbackSearchRes.items || [];
          }

          setModalProducts(items);

          // Extract brands dynamically from products to always provide accurate brand filters
          const allBrands = Array.from(new Set(items.map(p => p.brand).filter(Boolean))) as string[];
          setAvailableBrands(allBrands.length > 0 ? allBrands : (res.filterMeta?.availableBrands || []));
        }
      } catch (err) {
        console.error('Error fetching slot products:', err);
        if (!isCancelled) setModalProducts([]);
      } finally {
        if (!isCancelled) setIsLoadingModal(false);
      }
    };

    const timer = setTimeout(fetchSlotProducts, modalSearch ? 300 : 0);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [activeSlot, modalSearch, modalBrand, modalInStockOnly]);

  // Open Component Picker modal
  const handleOpenPicker = (slot: SolarSlotConfig) => {
    setActiveSlot(slot);
    setModalSearch('');
    setModalBrand('all');
    setModalInStockOnly(false);
  };

  // Select product into slot
  const handleSelectProduct = (slot: SolarSlotConfig, product: Product) => {
    setSelectedSlots(prev => ({
      ...prev,
      [slot.id]: {
        product,
        quantity: prev[slot.id]?.quantity || slot.defaultQty
      }
    }));
    setActiveSlot(null);
    showToast(`Added ${product.title.slice(0, 32)}... to ${slot.shortName}`);
  };

  // Remove component from slot
  const handleRemoveSlot = (slotId: string) => {
    setSelectedSlots(prev => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  };

  // Update component quantity
  const handleUpdateQuantity = (slotId: string, newQty: number, slot: SolarSlotConfig) => {
    if (newQty < slot.minQty) return;
    if (newQty > slot.maxQty) return;
    setSelectedSlots(prev => {
      if (!prev[slotId]) return prev;
      return {
        ...prev,
        [slotId]: {
          ...prev[slotId],
          quantity: newQty
        }
      };
    });
  };

  // Clear all slots
  const handleResetSystem = () => {
    if (Object.keys(selectedSlots).length === 0) return;
    if (window.confirm('Are you sure you want to reset all chosen components in your Solar System?')) {
      setSelectedSlots({});
      showToast('Solar System cleared.');
    }
  };

  // Share build URL
  const handleShareBuild = async () => {
    if (Object.keys(selectedSlots).length === 0) {
      showToast('Please add at least one component before sharing.');
      return;
    }
    const params = new URLSearchParams();
    Object.entries(selectedSlots).forEach(([slotId, selection]) => {
      params.set(slotId, `${selection.product.slug || selection.product.id}:${selection.quantity}`);
    });
    const shareUrl = `${window.location.origin}/solar-system-builder?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('🔗 Solar System configuration link copied to clipboard!');
    } catch (e) {
      prompt('Copy your Solar System link:', shareUrl);
    }
  };

  // Add all selected to cart
  const handleAddAllToCart = () => {
    const entries = Object.values(selectedSlots);
    if (entries.length === 0) {
      showToast('Please choose at least one solar component first.');
      return;
    }

    const itemsToAdd = entries.map(entry => ({
      product: entry.product,
      quantity: entry.quantity
    }));

    addMultipleToCart(itemsToAdd, true);
    showToast(`Added ${itemsToAdd.length} solar system items to your cart!`);
  };

  // Calculate live metrics
  const metrics = useMemo(() => {
    let totalPrice = 0;
    let totalItemsCount = 0;

    // Solar PV calculations
    let panelWatts = 0;
    let panelQty = 0;
    if (selectedSlots.panels) {
      panelQty = selectedSlots.panels.quantity;
      const title = selectedSlots.panels.product.title;
      const match = title.match(/(\d{2,4})\s*W(?:att)?(?!\w)/i);
      panelWatts = match ? parseInt(match[1], 10) : 550;
    }
    const totalSolarWatts = panelWatts * panelQty;
    const totalSolarKwp = totalSolarWatts / 1000;

    // Daily energy in Bangladesh: 4.2 peak sun hours * 0.82 system efficiency factor
    const dailyKwhMin = Number((totalSolarKwp * 4.0 * 0.82).toFixed(1));
    const dailyKwhMax = Number((totalSolarKwp * 4.5 * 0.85).toFixed(1));
    const monthlySavingsBdt = Math.round(((dailyKwhMin + dailyKwhMax) / 2) * 30 * 8.5);

    // Inverter capacity calculation
    let inverterKw = 0;
    if (selectedSlots.inverter) {
      const title = selectedSlots.inverter.product.title;
      const kwMatch = title.match(/(\d+(?:\.\d+)?)\s*KW/i);
      const kvaMatch = title.match(/(\d+(?:\.\d+)?)\s*KVA/i);
      if (kwMatch) {
        inverterKw = parseFloat(kwMatch[1]);
      } else if (kvaMatch) {
        inverterKw = parseFloat(kvaMatch[1]) * 0.8;
      } else {
        inverterKw = 5.0;
      }
    }

    // Battery storage calculation
    let batteryKwhPerUnit = 0;
    let batteryQty = 0;
    if (selectedSlots.battery) {
      batteryQty = selectedSlots.battery.quantity;
      const title = selectedSlots.battery.product.title;
      const kwhMatch = title.match(/(\d+(?:\.\d+)?)\s*kWh/i);
      const vahMatch = title.match(/(\d+(?:\.\d+)?)\s*V.*?(\d+)\s*Ah/i);
      if (kwhMatch) {
        batteryKwhPerUnit = parseFloat(kwhMatch[1]);
      } else if (vahMatch) {
        const v = parseFloat(vahMatch[1]);
        const ah = parseFloat(vahMatch[2]);
        batteryKwhPerUnit = Number(((v * ah) / 1000).toFixed(2));
      } else {
        batteryKwhPerUnit = 5.12;
      }
    }
    const totalBatteryKwh = Number((batteryKwhPerUnit * batteryQty).toFixed(2));
    // Backup duration on typical 500W load (85% depth of discharge)
    const backupHours500w = totalBatteryKwh > 0 ? Number(((totalBatteryKwh * 1000 * 0.85) / 500).toFixed(1)) : 0;

    // Total price
    Object.values(selectedSlots).forEach(s => {
      totalPrice += s.product.price * s.quantity;
      totalItemsCount += s.quantity;
    });

    return {
      totalPrice,
      totalItemsCount,
      totalSolarWatts,
      totalSolarKwp: Number(totalSolarKwp.toFixed(2)),
      dailyKwhMin,
      dailyKwhMax,
      monthlySavingsBdt,
      inverterKw: Number(inverterKw.toFixed(1)),
      totalBatteryKwh,
      backupHours500w
    };
  }, [selectedSlots]);

  // System Compatibility Warnings & Advice
  const systemAdvisory = useMemo(() => {
    const notes: { type: 'success' | 'warning' | 'info'; text: string }[] = [];

    if (selectedSlots.panels && !selectedSlots.inverter) {
      notes.push({
        type: 'info',
        text: 'Add a Solar Inverter to convert your solar panel DC power into usable AC electricity for home appliances.'
      });
    }

    if (selectedSlots.inverter && !selectedSlots.battery) {
      notes.push({
        type: 'info',
        text: 'For uninterrupted power during load-shedding and night hours, consider adding a LiFePO4 Battery Bank.'
      });
    }

    if (metrics.totalSolarKwp > 0 && metrics.inverterKw > 0) {
      if (metrics.totalSolarKwp > metrics.inverterKw * 1.35) {
        notes.push({
          type: 'warning',
          text: `Total panel array (${metrics.totalSolarKwp} kWp) exceeds typical 135% DC oversizing for your ${metrics.inverterKw} kW inverter.`
        });
      } else {
        notes.push({
          type: 'success',
          text: `Optimal solar PV array (${metrics.totalSolarKwp} kWp) matched with ${metrics.inverterKw} kW Inverter.`
        });
      }
    }

    if (selectedSlots.panels && selectedSlots.inverter && selectedSlots.protection) {
      notes.push({
        type: 'success',
        text: 'Safe & Protected: DC Circuit Breakers & SPDs included to safeguard your system against voltage spikes.'
      });
    }

    return notes;
  }, [selectedSlots, metrics]);

  // Render Slot Icon
  const renderSlotIcon = (iconName: SolarSlotConfig['iconName']) => {
    const props = { className: 'w-5 h-5 text-[#FF6600]' };
    switch (iconName) {
      case 'Sun': return <Sun {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'BatteryCharging': return <BatteryCharging {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      case 'Sliders': return <Sliders {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Cable': return <Cable {...props} />;
      case 'Wrench': return <Wrench {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-6 sm:py-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131A22] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#FF6600]/40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#FF6600] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs text-gray-500 mb-5 gap-1.5 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#FF6600] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold">Tools</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#FF6600] font-bold">Solar System Builder</span>
        </nav>

        {/* Builder Header Bar (StarTech Style) */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-5 sm:p-7 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 text-[#FF6600] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Sun className="w-3.5 h-3.5 animate-spin-slow" />
                <span>MaxiT Interactive Solar Configurator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                Solar System Builder
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                Configure your complete residential or commercial solar power plant with Tier-1 panels, hybrid inverters, LiFePO4 batteries, and switchgear.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={handleResetSystem}
                disabled={Object.keys(selectedSlots).length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                title="Reset all components"
              >
                <RotateCcw className="w-4 h-4 text-gray-500" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                onClick={handleShareBuild}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                title="Share this build configuration"
              >
                <Share2 className="w-4 h-4 text-[#FF6600]" />
                <span>Share</span>
              </button>

              <button
                onClick={() => setQuotationModalOpen(true)}
                disabled={Object.keys(selectedSlots).length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#131A22] hover:bg-slate-800 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#FF6600]" />
                <span>Get Quotation</span>
              </button>

              <button
                onClick={handleAddAllToCart}
                disabled={Object.keys(selectedSlots).length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6600] hover:bg-[#e55c00] text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add All to Cart</span>
                {metrics.totalItemsCount > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {metrics.totalItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Live Metrics Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-gray-100">
            {/* 1. Total Price */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 sm:p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6600] flex items-center justify-center shrink-0 font-black text-lg">
                ৳
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  Total Estimated
                </div>
                <div className="text-base sm:text-xl font-black text-gray-900 truncate">
                  ৳{metrics.totalPrice.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 2. Solar Generation Capacity */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 sm:p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  Solar Array Power
                </div>
                <div className="text-base sm:text-xl font-black text-gray-900 truncate">
                  {metrics.totalSolarKwp > 0 ? `${metrics.totalSolarKwp} kWp` : '0 kWp'}
                </div>
                {metrics.totalSolarWatts > 0 && (
                  <div className="text-[10px] text-gray-500 truncate">
                    ({metrics.totalSolarWatts.toLocaleString()} Watts)
                  </div>
                )}
              </div>
            </div>

            {/* 3. Daily Unit Generation & Savings */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 sm:p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  Daily Generation
                </div>
                <div className="text-base sm:text-xl font-black text-gray-900 truncate">
                  {metrics.totalSolarKwp > 0 ? `${metrics.dailyKwhMin}-${metrics.dailyKwhMax}` : '0'} <span className="text-xs font-semibold text-gray-500">kWh/day</span>
                </div>
                {metrics.monthlySavingsBdt > 0 && (
                  <div className="text-[10px] text-emerald-700 font-semibold truncate">
                    Save ~৳{metrics.monthlySavingsBdt.toLocaleString()}/mo
                  </div>
                )}
              </div>
            </div>

            {/* 4. Battery Storage & Backup */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 sm:p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  Battery Storage
                </div>
                <div className="text-base sm:text-xl font-black text-gray-900 truncate">
                  {metrics.totalBatteryKwh > 0 ? `${metrics.totalBatteryKwh} kWh` : 'No Battery'}
                </div>
                {metrics.backupHours500w > 0 && (
                  <div className="text-[10px] text-blue-700 font-semibold truncate">
                    ~{metrics.backupHours500w} hrs backup (500W load)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Compatibility Advisor Notes */}
          {systemAdvisory.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
              {systemAdvisory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-xs rounded-lg px-3 py-1.5 ${
                    item.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                      : item.type === 'warning'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                      : 'bg-blue-50 text-blue-800 border border-blue-200/60'
                  }`}
                >
                  {item.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : item.type === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Component Slots List (StarTech PC Builder Table Style) */}
        <div className="space-y-3 sm:space-y-4">
          {SOLAR_SLOTS.map((slot) => {
            const selection = selectedSlots[slot.id];
            const isSelected = !!selection;

            return (
              <div
                key={slot.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'border-gray-200 shadow-xs'
                    : 'border-dashed border-gray-300 hover:border-gray-400 bg-white/70'
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Slot Meta & Icon */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 md:w-1/3 shrink-0">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                        {renderSlotIcon(slot.iconName)}
                      </div>
                      <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 bg-gray-900 text-white text-[9px] font-bold rounded-md">
                        {slot.slotNumber}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                          {slot.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            slot.badge === 'Required'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : slot.badge === 'Essential'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : slot.badge === 'Recommended'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {slot.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                        {slot.description}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Selected Item or Empty Placeholder */}
                  <div className="flex-1 min-w-0">
                    {isSelected ? (
                      <div className="flex items-center gap-3 bg-slate-50/70 border border-slate-200/70 p-2.5 rounded-xl">
                        <div className="w-14 h-14 relative rounded-lg bg-white overflow-hidden shrink-0 border border-gray-100">
                          <SafeImage
                            src={selection.product.image || selection.product.images?.[0] || PLACEHOLDER_PRODUCT_IMAGE}
                            alt={selection.product.title}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-200/70 px-1.5 py-0.5 rounded">
                              {selection.product.brand || 'Brand'}
                            </span>
                            {selection.product.stock <= 5 && selection.product.stock > 0 && (
                              <span className="text-[10px] font-semibold text-amber-600">
                                Only {selection.product.stock} in stock
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/product/${selection.product.slug}`}
                            target="_blank"
                            className="text-xs sm:text-sm font-bold text-gray-900 hover:text-[#FF6600] transition-colors line-clamp-1 mt-0.5 flex items-center gap-1 group"
                          >
                            <span>{selection.product.title}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#FF6600] shrink-0" />
                          </Link>
                          <div className="text-xs font-semibold text-gray-500 mt-0.5">
                            Unit Price: <span className="text-gray-900 font-bold">৳{selection.product.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic py-2">
                        No component selected yet. Choose a compatible {slot.shortName.toLowerCase()}.
                      </div>
                    )}
                  </div>

                  {/* Right: Quantity Stepper, Price & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    {isSelected ? (
                      <>
                        {/* Quantity Multiplier Stepper */}
                        <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg p-0.5">
                          <button
                            onClick={() => handleUpdateQuantity(slot.id, selection.quantity - 1, slot)}
                            disabled={selection.quantity <= slot.minQty}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-bold text-gray-900">
                            {selection.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(slot.id, selection.quantity + 1, slot)}
                            disabled={selection.quantity >= slot.maxQty}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[90px]">
                          <div className="text-xs sm:text-sm font-black text-[#FF6600]">
                            ৳{(selection.product.price * selection.quantity).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {selection.quantity} {slot.unitLabel}
                          </div>
                        </div>

                        {/* Change / Remove Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenPicker(slot)}
                            className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            onClick={() => handleRemoveSlot(slot.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove component"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenPicker(slot)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Choose {slot.shortName}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating / Sticky Mobile Bottom Checkout Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 px-4 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Estimated Total</div>
              <div className="text-base font-black text-[#FF6600]">
                ৳{metrics.totalPrice.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuotationModalOpen(true)}
                disabled={Object.keys(selectedSlots).length === 0}
                className="px-3 py-2 bg-gray-100 text-gray-800 disabled:opacity-40 rounded-xl text-xs font-bold"
              >
                Quotation
              </button>
              <button
                onClick={handleAddAllToCart}
                disabled={Object.keys(selectedSlots).length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6600] text-white disabled:opacity-40 rounded-xl text-xs font-bold shadow-md"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart ({metrics.totalItemsCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Solar System Guide & FAQ section */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FF6600]" />
            <span>How to Design Your Solar Energy System</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-gray-600">
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-sm">1. Sizing Your Solar PV Array</h4>
              <p>
                In Bangladesh, average solar peak sun hours are ~4.2 hours/day. A 4.4 kWp solar array generates approximately 15 to 18 kWh (units) of clean electricity every day, significantly slashing your monthly DESCO, DPDC or BREB electric bill.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-sm">2. Hybrid Inverter vs. Off-Grid</h4>
              <p>
                Hybrid inverters intelligently route solar energy to run your home first, recharge batteries with surplus solar power, and export excess to the national net-metering grid. They switch to battery backup in under 10ms during grid blackouts.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 text-sm">3. LiFePO4 Lithium Batteries</h4>
              <p>
                Lithium Iron Phosphate (LiFePO4) solar batteries offer 6,000+ deep charge cycles (over 10-15 years lifespan) compared to old tubular lead-acid batteries. Built-in smart BMS protects against overcharging, high temperatures, and short circuits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COMPONENT SELECTION MODAL / DRAWER */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6600]">
                  {renderSlotIcon(activeSlot.iconName)}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900">
                    Select {activeSlot.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Choose from verified solar components in MaxiTShop catalog
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close component picker"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filters & Search Bar */}
            <div className="p-4 sm:px-6 bg-gray-50/70 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder={`Search ${activeSlot.shortName.toLowerCase()} by model, brand, wattage...`}
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:border-[#FF6600]"
                  autoFocus
                />
                {modalSearch && (
                  <button
                    onClick={() => setModalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Brand filter dropdown */}
              {availableBrands.length > 0 && (
                <select
                  value={modalBrand}
                  onChange={(e) => setModalBrand(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 focus:outline-hidden focus:border-[#FF6600]"
                >
                  <option value="all">All Brands</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              )}

              {/* In-Stock Only filter */}
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none px-2">
                <input
                  type="checkbox"
                  checked={modalInStockOnly}
                  onChange={(e) => setModalInStockOnly(e.target.checked)}
                  className="rounded text-[#FF6600] focus:ring-[#FF6600]"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Modal Product List Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 divide-y divide-gray-100">
              {isLoadingModal ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-3 border-[#FF6600] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-gray-500 font-semibold">Loading solar components...</p>
                </div>
              ) : modalProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {modalProducts.map((prod) => {
                    const isAlreadySelected = selectedSlots[activeSlot.id]?.product.id === prod.id;

                    return (
                      <div
                        key={prod.id}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                          isAlreadySelected
                            ? 'bg-orange-50/50 border-orange-200'
                            : 'bg-white border-gray-200/80 hover:border-[#FF6600]/60 hover:shadow-xs'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 relative shrink-0 overflow-hidden">
                          <SafeImage
                            src={prod.image || prod.images?.[0] || PLACEHOLDER_PRODUCT_IMAGE}
                            alt={prod.title}
                            fill
                            sizes="64px"
                            className="object-contain p-1"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                              {prod.brand || 'Solar'}
                            </span>
                            {prod.stock > 0 ? (
                              <span className="text-[10px] text-emerald-600 font-semibold">In Stock</span>
                            ) : (
                              <span className="text-[10px] text-gray-400">Pre-Order</span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mt-0.5 leading-snug">
                            {prod.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs sm:text-sm font-black text-[#FF6600]">
                              ৳{prod.price.toLocaleString()}
                            </span>
                            {prod.oldPrice && (
                              <span className="text-[10px] text-gray-400 line-through">
                                ৳{prod.oldPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectProduct(activeSlot, prod)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                            isAlreadySelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#FF6600] hover:bg-[#e55c00] text-white shadow-xs'
                          }`}
                        >
                          {isAlreadySelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">No products found</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Try clearing your search query or selecting &quot;All Brands&quot;.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE QUOTATION MODAL */}
      {quotationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Quotation Header & Actions */}
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between gap-4 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF6600]" />
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  Solar System Official Quotation
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setQuotationModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Quotation Content */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-gray-800" id="solar-quotation-sheet">
              {/* MaxiT Header */}
              <div className="flex items-start justify-between border-b-2 border-gray-900 pb-5 mb-5">
                <div>
                  <div className="text-2xl font-black text-gray-900 tracking-tight">
                    MAXIT<span className="text-[#FF6600]">SHOP</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Renewable Energy & Solar Power Solutions
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Hotline: +8801733-272445 | Email: support@maxitshop.com<br />
                    Web: https://maxitshop.com | Dhaka, Bangladesh
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-1">
                    Solar Quotation
                  </div>
                  <div className="text-xs font-bold text-gray-800">
                    Ref: #MXT-{Date.now().toString().slice(-6)}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Valid for: 7 Days
                  </div>
                </div>
              </div>

              {/* Customer Info Form (Editable before printing) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-gray-50 rounded-xl mb-6 border border-gray-200/80">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full text-xs font-semibold bg-transparent border-b border-gray-300 py-1 focus:outline-hidden focus:border-[#FF6600]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full text-xs font-semibold bg-transparent border-b border-gray-300 py-1 focus:outline-hidden focus:border-[#FF6600]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Installation Site</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="City / District"
                    className="w-full text-xs font-semibold bg-transparent border-b border-gray-300 py-1 focus:outline-hidden focus:border-[#FF6600]"
                  />
                </div>
              </div>

              {/* Technical System Summary */}
              <div className="grid grid-cols-4 gap-2 p-3 bg-orange-50/60 rounded-xl border border-orange-200/60 text-center mb-6">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">PV Array</div>
                  <div className="text-xs sm:text-sm font-black text-gray-900">
                    {metrics.totalSolarKwp > 0 ? `${metrics.totalSolarKwp} kWp` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Daily Gen</div>
                  <div className="text-xs sm:text-sm font-black text-gray-900">
                    {metrics.dailyKwhMin ? `~${metrics.dailyKwhMin} kWh` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Inverter</div>
                  <div className="text-xs sm:text-sm font-black text-gray-900">
                    {metrics.inverterKw > 0 ? `${metrics.inverterKw} kW` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Battery Bank</div>
                  <div className="text-xs sm:text-sm font-black text-gray-900">
                    {metrics.totalBatteryKwh > 0 ? `${metrics.totalBatteryKwh} kWh` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Component / Specification</th>
                      <th className="py-2.5 px-3 text-center w-16">Qty</th>
                      <th className="py-2.5 px-3 text-right w-24">Unit Price</th>
                      <th className="py-2.5 px-3 text-right w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {SOLAR_SLOTS.filter(s => selectedSlots[s.id]).map((slot, idx) => {
                      const item = selectedSlots[slot.id];
                      return (
                        <tr key={slot.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 text-center text-gray-400 font-bold">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-gray-900">{slot.name}</div>
                            <div className="text-[11px] text-gray-600 line-clamp-1">{item.product.title}</div>
                            <div className="text-[10px] text-gray-400">Brand: {item.product.brand || 'Generic'}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-gray-600">
                            ৳{item.product.price.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-gray-900">
                            ৳{(item.product.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-900 text-white font-bold">
                      <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-xs">
                        Grand Total (BDT):
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-black text-[#FF6600]">
                        ৳{metrics.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Warranty & Terms */}
              <div className="text-[11px] text-gray-500 space-y-1.5 border-t border-gray-200 pt-4">
                <div className="font-bold text-gray-800 text-xs mb-1">Terms & Warranty Conditions:</div>
                <p>• Solar Panels: 12-Year Product Warranty & 25-Year Linear Power Warranty.</p>
                <p>• Inverters: 2-Year to 5-Year Standard Manufacturer Replacement/Repair Warranty.</p>
                <p>• LiFePO4 Batteries: 3-Year to 5-Year Cycle Life Warranty (6,000+ Cycles at 80% DOD).</p>
                <p>• Final quotation price includes standard VAT/AIT. Delivery & rooftop installation available across all 64 districts in Bangladesh.</p>
              </div>

              {/* Signature Line */}
              <div className="flex justify-between items-end mt-12 pt-6 border-t border-gray-200 text-xs text-gray-600">
                <div>
                  <div className="border-t border-gray-400 w-44 pt-1 text-center font-semibold">
                    Customer Acceptance
                  </div>
                </div>
                <div className="text-right">
                  <div className="border-t border-gray-400 w-48 pt-1 text-center font-semibold">
                    MaxiT Authorized Officer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
