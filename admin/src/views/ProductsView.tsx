import React, { useState, useEffect } from 'react';
import { Product, Category, Brand } from '../types';
import { adminApi } from '../api';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ProductModal } from '../components/ProductModal';
import { ProductEditorView } from '../components/ProductEditorView';

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // In-line Quick Editing State
  const [inlineEditing, setInlineEditing] = useState<{ id: string; field: 'price' | 'stock'; value: string } | null>(null);
  const [inlineSavingId, setInlineSavingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

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
        subcategory: subcategoryFilter,
        search,
        page,
        limit: 15
      });
      setProducts(data.items);
      setSelectedIds([]);
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
  }, [page, categoryFilter, subcategoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleSaveProduct = async (data: Partial<Product>) => {
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, data);
        showFeedback('success', 'Product updated successfully!');
      } else {
        await adminApi.createProduct(data);
        showFeedback('success', 'Product created successfully!');
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
      showFeedback('success', `Deleted "${title}"`);
      fetchProducts();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Bulk Delete Products Handler
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} selected products?`)) return;

    try {
      setBulkDeleting(true);
      const res = await adminApi.bulkDeleteProducts(selectedIds);
      showFeedback('success', `Successfully deleted ${res.deletedCount || count} products`);
      setSelectedIds([]);
      fetchProducts();
    } catch (err: any) {
      alert('Bulk delete failed: ' + err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === products.length && products.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Quick In-line Stock & Price Save
  const handleSaveInline = async () => {
    if (!inlineEditing) return;
    const { id, field, value } = inlineEditing;
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      alert('Please enter a valid non-negative number');
      return;
    }

    try {
      setInlineSavingId(id);
      await adminApi.quickUpdateProduct(id, { [field]: num });

      // Update state in-place for instant UI responsiveness
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, [field]: num };
        }
        return p;
      }));

      showFeedback('success', `Updated ${field} to ${field === 'price' ? '৳' : ''}${num.toLocaleString()}`);
      setInlineEditing(null);
    } catch (err: any) {
      showFeedback('error', 'Update failed: ' + err.message);
    } finally {
      setInlineSavingId(null);
    }
  };

  if (viewMode === 'editor') {
    return (
      <ProductEditorView
        product={editingProduct}
        categories={categories}
        brands={brands}
        onDiscard={() => {
          setEditingProduct(null);
          setViewMode('list');
        }}
        onSave={async (data) => {
          await handleSaveProduct(data);
          setViewMode('list');
        }}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Products Catalog &amp; Inventory</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Manage catalog, specifications, and use quick in-line editing for real-time stock and BDT pricing.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditingProduct(null); setViewMode('editor'); }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div style={{
          padding: '10px 16px',
          marginBottom: '16px',
          borderRadius: '8px',
          background: feedbackMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${feedbackMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: feedbackMsg.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

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
          onChange={e => { setCategoryFilter(e.target.value); setSubcategoryFilter(''); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {(() => {
          const selectedCat = categories.find(c => c.slug === categoryFilter);
          if (selectedCat?.subcategories && selectedCat.subcategories.length > 0) {
            return (
              <select
                className="form-select"
                style={{ width: '200px' }}
                value={subcategoryFilter}
                onChange={e => { setSubcategoryFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Subcategories</option>
                {selectedCat.subcategories.map(s => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            );
          }
          return null;
        })()}
      </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            marginBottom: '16px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '10px',
            color: '#9f1239'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600 }}>
              <span style={{
                background: '#e11d48',
                color: '#fff',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {selectedIds.length}
              </span>
              <span>{selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedIds([])}
              >
                Clear Selection
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={14} />
                {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={handleToggleSelectAll}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#ff6600' }}
                    title="Select all on this page"
                  />
                </th>
                <th>Image</th>
                <th>Product Title</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price (BDT) <span style={{ fontSize: '10px', color: '#94a3b8' }}>(Click to edit)</span></th>
                <th>Stock <span style={{ fontSize: '10px', color: '#94a3b8' }}>(Click to edit)</span></th>
                <th>Badges</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading catalog...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map(p => {
                  const isEditingPrice = inlineEditing?.id === p.id && inlineEditing?.field === 'price';
                  const isEditingStock = inlineEditing?.id === p.id && inlineEditing?.field === 'stock';
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr key={p.id} style={{ background: isSelected ? '#fff1f2' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(p.id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#ff6600' }}
                        />
                      </td>
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
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      <div style={{ textTransform: 'uppercase', fontWeight: 600 }}>{p.category}</div>
                      {p.subcategoryName && (
                        <div style={{ fontSize: '11px', color: '#ea580c', background: '#fff7ed', border: '1px solid #ffedd5', display: 'inline-block', padding: '1px 6px', borderRadius: '4px', marginTop: '3px', fontWeight: 500 }}>
                          {p.subcategoryName}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '13px' }}>{p.brand}</td>

                    {/* Price with In-line Edit */}
                    <td>
                      {isEditingPrice ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#ff6600' }}>৳</span>
                          <input
                            type="number"
                            autoFocus
                            value={inlineEditing.value}
                            onChange={e => setInlineEditing({ ...inlineEditing, value: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveInline();
                              if (e.key === 'Escape') setInlineEditing(null);
                            }}
                            className="form-input"
                            style={{ width: '90px', padding: '3px 6px', fontSize: '13px', fontWeight: 700 }}
                          />
                          <button
                            type="button"
                            onClick={handleSaveInline}
                            disabled={inlineSavingId === p.id}
                            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px', cursor: 'pointer' }}
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setInlineEditing(null)}
                            style={{ background: '#e2e8f0', color: '#64748b', border: 'none', borderRadius: '4px', padding: '3px', cursor: 'pointer' }}
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setInlineEditing({ id: p.id, field: 'price', value: String(p.price) })}
                          style={{ cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', display: 'inline-block' }}
                          title="Click to edit price directly"
                          className="hover-editable"
                        >
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
                        </div>
                      )}
                    </td>

                    {/* Stock with In-line Edit */}
                    <td>
                      {isEditingStock ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            autoFocus
                            value={inlineEditing.value}
                            onChange={e => setInlineEditing({ ...inlineEditing, value: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveInline();
                              if (e.key === 'Escape') setInlineEditing(null);
                            }}
                            className="form-input"
                            style={{ width: '70px', padding: '3px 6px', fontSize: '13px', fontWeight: 600 }}
                          />
                          <button
                            type="button"
                            onClick={handleSaveInline}
                            disabled={inlineSavingId === p.id}
                            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px', cursor: 'pointer' }}
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setInlineEditing(null)}
                            style={{ background: '#e2e8f0', color: '#64748b', border: 'none', borderRadius: '4px', padding: '3px', cursor: 'pointer' }}
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setInlineEditing({ id: p.id, field: 'stock', value: String(p.stock) })}
                          style={{ cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', display: 'inline-block' }}
                          title="Click to edit inventory stock"
                          className="hover-editable"
                        >
                          <span style={{
                            fontWeight: 700,
                            fontSize: '12px',
                            color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f59e0b' : '#10b981',
                            background: p.stock === 0 ? '#fef2f2' : p.stock <= 5 ? '#fffbeb' : '#ecfdf5',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}>
                            {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Badges */}
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {p.isDeal && <span style={{ fontSize: '10px', background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px' }}>Deal</span>}
                        {p.isFeatured && <span style={{ fontSize: '10px', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px' }}>Featured</span>}
                        {p.isNewItem && <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px' }}>New</span>}
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setEditingProduct(p); setViewMode('editor'); }}
                          title="Full Edit"
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
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
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
