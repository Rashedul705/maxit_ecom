'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Search, Plus, Edit2, Trash2, X, Check, Loader2, AlertCircle } from 'lucide-react';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('solar-green-energy');
  const [formBrand, setFormBrand] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOldPrice, setFormOldPrice] = useState('');
  const [formStock, setFormStock] = useState('20');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  const getToken = useCallback(() => {
    const token = localStorage.getItem('maxitshop_admin_token');
    if (!token) {
      document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
      router.push('/admin/login');
      return '';
    }
    return token;
  }, [router]);

  const handleAuthError = useCallback(() => {
    document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax';
    localStorage.removeItem('maxitshop_admin_token');
    localStorage.removeItem('maxitshop_admin_user');
    router.push('/admin/login');
  }, [router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({ limit: 50 });
      setProducts(res?.items || []);
    } catch (err: unknown) {
      console.error('Failed to load products:', err);
      const message = err instanceof Error ? err.message : 'Error loading catalog';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    loadProducts();
  }, [getToken]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormCategory('solar-green-energy');
    setFormBrand('');
    setFormPrice('');
    setFormOldPrice('');
    setFormStock('20');
    setFormShortDesc('');
    setFormImageUrl('https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormCategory(p.category);
    setFormBrand(p.brand);
    setFormPrice(String(p.price));
    setFormOldPrice(p.oldPrice ? String(p.oldPrice) : '');
    setFormStock(String(p.stock));
    setFormShortDesc(p.shortDescription);
    setFormImageUrl(p.images[0] || '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrice.trim() || !formBrand.trim()) return;

    try {
      setModalLoading(true);
      const token = getToken();

      const payload = {
        title: formTitle.trim(),
        category: formCategory,
        brand: formBrand.trim(),
        price: parseFloat(formPrice),
        oldPrice: formOldPrice ? parseFloat(formOldPrice) : undefined,
        stock: parseInt(formStock, 10) || 0,
        shortDescription: formShortDesc.trim(),
        images: [formImageUrl.trim() || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80']
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload, token);
      } else {
        await api.createProduct(payload, token);
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (err: unknown) {
      console.error('Failed to save product:', err);
      const isAuthError = (err as { status?: number })?.status === 401 || (err instanceof Error && err.message.toLowerCase().includes('unauthorized'));
      if (isAuthError) {
        handleAuthError();
        return;
      }
      const message = err instanceof Error ? err.message : 'Could not save product';
      alert(message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const token = getToken();
      if (!token) return;
      await api.deleteProduct(id, token);
      loadProducts();
    } catch (err: unknown) {
      console.error('Failed to delete product:', err);
      const isAuthError = (err as { status?: number })?.status === 401 || (err instanceof Error && err.message.toLowerCase().includes('unauthorized'));
      if (isAuthError) {
        handleAuthError();
        return;
      }
      const message = err instanceof Error ? err.message : 'Delete failed';
      alert(message);
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Products Management"
        description="Add, edit, restock, or remove products from the active catalog"
      />

      <div className="p-6 space-y-4">
        
        {/* Actions bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search products by title, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-600" />
              <span className="text-xs">Loading product inventory...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-xs text-red-600">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No products match your criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            <Image src={p.images[0] || ''} alt={p.title} fill sizes="40px" className="object-cover" />
                          </div>
                          <span className="font-semibold text-slate-900 max-w-xs line-clamp-1">{p.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 capitalize">{p.category.replace(/-/g, ' ')}</td>
                      <td className="py-3 px-4 font-bold text-slate-700 uppercase text-[11px]">{p.brand}</td>
                      <td className="py-3 px-4 font-bold text-blue-600">৳{p.price.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.stock} in stock
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.title)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product to maxitshop'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. SolarTech Hybrid Inverter 5kVA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="solar-green-energy">Solar & Green Energy</option>
                    <option value="mobile-phones">Mobile Phones</option>
                    <option value="laptops">Laptops</option>
                    <option value="smart-watches">Smart Watches</option>
                    <option value="home-appliances">Home Appliances</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. Samsung, Apple, MaxitVolt"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 18500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Old Price (৳)</label>
                  <input
                    type="number"
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Count *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="Key features and summary..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
