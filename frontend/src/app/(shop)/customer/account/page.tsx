'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Order, Product } from '@/lib/types';
import { useCart } from '@/lib/cartContext';
import { User, Package, LogOut, Home, ChevronRight, Phone, MapPin, Truck, Heart, Plus, CheckCircle2, RotateCcw } from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { addToCart, openCart } = useCart();
  const [customer, setCustomer] = useState<{ id?: string; name: string; phone: string; email: string; addresses?: any[] } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string>('');

  // Address edit state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '', area: 'inside_dhaka' });
  const [addressSuccess, setAddressSuccess] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('maxitshop_customer');
      if (!stored) {
        router.push('/customer/login');
        return;
      }

      const u = JSON.parse(stored);
      setCustomer(u);
      setToken(u.token || '');

      if (u.token) {
        api.getCustomerProfile(u.token).then(profile => {
          if (profile?.user) {
            setCustomer(prev => ({ ...prev, ...profile.user }));
          }
          if (profile?.orders) {
            setOrders(profile.orders);
          }
        }).catch(() => {
          // Fallback to track by phone if profile fetch fails
          if (u.phone) {
            api.trackOrder(undefined, u.phone).then(res => setOrders(res || [])).catch(() => {});
          }
        }).finally(() => {
          setIsLoading(false);
        });
      } else {
        if (u.phone) {
          api.trackOrder(undefined, u.phone).then(res => setOrders(res || [])).catch(() => {});
        }
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('maxitshop_customer');
    router.push('/customer/login');
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.address.trim()) return;

    const currentAddresses = customer?.addresses || [];
    const updatedAddresses = [
      ...currentAddresses,
      {
        name: newAddress.name || customer?.name || 'Home Address',
        phone: newAddress.phone || customer?.phone || '',
        address: newAddress.address.trim(),
        area: newAddress.area,
        isDefault: currentAddresses.length === 0
      }
    ];

    try {
      if (token) {
        const updatedUser = await api.updateCustomerProfile({ addresses: updatedAddresses }, token);
        setCustomer(prev => prev ? ({ ...prev, addresses: updatedUser.addresses || updatedAddresses }) : null);
      } else {
        setCustomer(prev => prev ? ({ ...prev, addresses: updatedAddresses }) : null);
      }
      setAddressSuccess('Delivery address added successfully!');
      setIsAddressModalOpen(false);
      setNewAddress({ name: '', phone: '', address: '', area: 'inside_dhaka' });
      setTimeout(() => setAddressSuccess(''), 3000);
    } catch (err) {
      alert('Failed to update address');
    }
  };

  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    for (const item of order.items) {
      const p: Product = {
        id: item.id || (item as any).productId || 'product-item',
        title: item.title,
        price: item.price,
        slug: item.slug || item.id || 'product-item',
        images: item.image ? [item.image] : [],
        category: 'electronics',
        brand: 'MaxiT',
        stock: 10,
        rating: 5,
        specs: {},
        isNew: false,
        isFeatured: false,
        isDeal: false,
        shortDescription: item.title,
        description: item.title
      };
      addToCart(p, item.quantity);
    }
    openCart();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 mb-6 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">My Account</span>
      </nav>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-[#FF6600] flex items-center justify-center font-black text-2xl shrink-0">
            {customer?.name ? customer.name[0] : 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              {customer?.name || 'Customer Profile'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {customer?.phone}
              </span>
              <span>•</span>
              <span>{customer?.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/wishlist"
            className="px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>My Wishlist</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {addressSuccess && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{addressSuccess}</span>
        </div>
      )}

      {/* Saved Addresses Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF6600]" />
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              Saved Delivery Addresses
            </h2>
          </div>
          <button
            onClick={() => setIsAddressModalOpen(true)}
            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#FF6600] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Address</span>
          </button>
        </div>

        {customer?.addresses && customer.addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customer.addresses.map((addr: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 relative">
                {addr.isDefault && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
                <p className="text-xs font-bold text-gray-900">{addr.name || 'Address'}</p>
                <p className="text-xs text-gray-600 mt-1">{addr.address}</p>
                {addr.phone && (
                  <p className="text-[11px] text-gray-400 mt-1">📞 {addr.phone}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No saved addresses yet. Click &quot;Add New Address&quot; to speed up checkout.</p>
        )}
      </div>

      {/* Orders History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#FF6600]" />
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              My Order History
            </h2>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {orders.length} orders placed
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading order records...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-gray-500">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-[#FF6600] text-white text-xs font-bold rounded-lg hover:bg-[#e55c00] transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((ord) => (
              <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#FF6600]">{ord.orderNumber}</span>
                    <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full capitalize">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • {ord.items.length} items
                  </p>
                  <div className="mt-1 text-xs text-gray-600">
                    {ord.items.map((it: any, i: number) => (
                      <span key={i} className="inline-block mr-2">
                        • {it.quantity}x {it.title.substring(0, 24)}...
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-gray-900">
                    ৳{ord.total.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleReorder(ord)}
                    title="Order Again"
                    className="px-2.5 py-1.5 bg-orange-50 hover:bg-[#FF6600] hover:text-white text-[#FF6600] rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Buy Again</span>
                  </button>
                  <Link
                    href={`/track-order?orderNumber=${ord.orderNumber}&phone=${customer?.phone || ''}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-[#FF6600] hover:text-white text-gray-800 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-black text-gray-900 mb-4">Add Delivery Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Label (e.g. Home, Office)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Address"
                  value={newAddress.name}
                  onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. 017XXXXXXXX"
                  value={newAddress.phone}
                  onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Street Address</label>
                <textarea
                  required
                  rows={3}
                  placeholder="House number, road number, area, district..."
                  value={newAddress.address}
                  onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-lg text-xs font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
