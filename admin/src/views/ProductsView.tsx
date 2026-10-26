import React, { useState, useEffect } from 'react';
import { Product, Category, Brand } from '../types';
import { adminApi } from '../api';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductModal } from '../components/ProductModal';

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAux = async () => {
    try {
      const [cats, brs] = await Promise.all([adminApi.getCategories(), adminApi.getBrands()]);
      setCategories(cats);
      setBrands(brs);
    } catch (e) {}
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProducts({
        category: categoryFilter,
        search,
        page,
        limit: 15
      });
      setProducts(data.items);
      setTotal(data.total);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAux();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleSaveProduct = async (data: Partial<Product>) => {
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, data);
      } else {
        await adminApi.createProduct(data);
      }
      fetchProducts();
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await adminApi.deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Products Catalog</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Manage inventory, BDT pricing, specifications, and images.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: '1', minWidth: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search products by title, category, brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            <Search size={16} />
          </button>
        </form>

        <select
          className="form-select"
          style={{ width: '220px' }}
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Title</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price (BDT)</th>
              <th>Stock</th>
              <th>Badges</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading catalog...
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map(p => (
                <tr key={p.id}>
                  <td>
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=100&q=80'}
                      alt={p.title}
                      style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff' }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, maxWidth: '280px' }}>{p.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Slug: {p.slug}</div>
                  </td>
                  <td style={{ fontSize: '12px', textTransform: 'uppercase', color: '#475569' }}>
                    {p.category}
                  </td>
                  <td style={{ fontSize: '13px' }}>{p.brand}</td>
                  <td>
                    {p.price > 0 ? (
                      <div>
                        <div style={{ fontWeight: 700, color: '#ff6600' }}>৳{p.price.toLocaleString()}</div>
                        {p.oldPrice > p.price && (
                          <div style={{ fontSize: '11px', textDecoration: 'line-through', color: '#94a3b8' }}>
                            ৳{p.oldPrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="badge badge-pending">Call for price</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: p.stock <= 5 ? '#ef4444' : '#10b981' }}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {p.isDeal && <span style={{ fontSize: '10px', background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px' }}>Deal</span>}
                      {p.isFeatured && <span style={{ fontSize: '10px', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px' }}>Featured</span>}
                      {p.isNewItem && <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px' }}>New</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteProduct(p.id, p.title)}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Showing {products.length} of {total} products
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={products.length < 15}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          brands={brands}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};
