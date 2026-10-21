'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';
import { AdminUser } from '@/lib/types';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('maxitshop_admin_user');
      if (stored) {
        setAdminUser(JSON.parse(stored));
      }
    } catch {
      // ignore json parse error
    }
  }, []);

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
    localStorage.removeItem('maxitshop_admin_token');
    localStorage.removeItem('maxitshop_admin_user');
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base">
            M
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight block">MaxiT<span className="text-orange-500">Shop</span></span>
            <span className="text-[10px] font-semibold text-slate-400 block -mt-1">ADMIN CONSOLE</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 text-xs font-semibold">
        <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Management
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-3 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Storefront
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>View Live Shop</span>
          </div>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Public</span>
        </Link>
      </nav>

      {/* Admin Footer / Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/60 rounded-xl text-xs text-slate-300 border border-slate-700/50">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold truncate text-[11px] text-white">
              {adminUser?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {adminUser?.email || 'admin@maxitshop.com'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-950/60 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

    </aside>
  );
};
