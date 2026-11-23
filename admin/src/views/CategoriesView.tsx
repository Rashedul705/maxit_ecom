import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { adminApi } from '../api';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Layers, FolderTree } from 'lucide-react';
import { CategoryModal } from '../components/CategoryModal';
import { Can } from '../components/Can';
import { CategoryIconDisplay, CategoryCoverDisplay } from '../components/CategoryMedia';

export const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [collapsedMothers, setCollapsedMothers] = useState<Record<string, boolean>>({});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCategories();
      setCategories(data);
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('edit');
      if (editId) {
        const flat = data.flatMap(m => [m, ...(m.children || [])]);
        const found = flat.find(c => c.id === editId || c.slug === editId);
        if (found) {
          setEditingCategory(found);
          setIsModalOpen(true);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleCollapse = (slug: string) => {
    setCollapsedMothers(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  const allFlatCategories: Category[] = categories.flatMap(m => [m, ...(m.children || [])]);

  const handleSave = async (data: Partial<Category>) => {
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, data);
      } else {
        await adminApi.createCategory(data);
      }
      fetchCategories();
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await adminApi.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} selected categories?`)) return;

    try {
      setBulkDeleting(true);
      const res = await adminApi.bulkDeleteCategories(selectedIds);
      alert(`Deleted ${res.deletedCount || count} categories`);
      setSelectedIds([]);
      fetchCategories();
    } catch (err: any) {
      alert('Bulk delete failed: ' + err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === allFlatCategories.length && allFlatCategories.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFlatCategories.map(c => c.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderTree size={24} color="#ff6600" />
            <span>Categories Management</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Configure 12 mother categories, their nested subcategories, product counts, and media.
          </p>
        </div>
        <Can permission="categories.manage">
          <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}>
            <Plus size={16} /> Add Category
          </button>
        </Can>
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
            <span>{selectedIds.length} categor{selectedIds.length > 1 ? 'ies' : 'y'} selected</span>
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

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allFlatCategories.length > 0 && selectedIds.length === allFlatCategories.length}
                  onChange={handleToggleSelectAll}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#ff6600' }}
                  title="Select all categories"
                />
              </th>
              <th style={{ width: '60px' }}>Order</th>
              <th style={{ width: '50px' }}>Icon</th>
              <th style={{ width: '70px' }}>Cover</th>
              <th>Category Name & Hierarchy</th>
              <th>Type</th>
              <th>Products</th>
              <th>Slug</th>
              <th>Status</th>
              <th style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '30px' }}>Loading categories...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '30px' }}>No categories found</td></tr>
            ) : (
              categories.map(mother => {
                const children = mother.children || [];
                const isCollapsed = Boolean(collapsedMothers[mother.slug]);
                const isMotherSelected = selectedIds.includes(mother.id);

                return (
                  <React.Fragment key={mother.id || mother.slug}>
                    {/* Mother Category Row */}
                    <tr style={{ background: isMotherSelected ? '#fff1f2' : '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isMotherSelected}
                          onChange={() => handleToggleSelectOne(mother.id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#ff6600' }}
                        />
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>#{mother.order}</td>
                      <td>
                        <CategoryIconDisplay icon={mother.icon} name={mother.name} size={18} />
                      </td>
                      <td>
                        <CategoryCoverDisplay image={mother.image} name={mother.name} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {children.length > 0 ? (
                            <button
                              onClick={() => toggleCollapse(mother.slug)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                color: '#64748b'
                              }}
                              title={isCollapsed ? 'Expand subcategories' : 'Collapse subcategories'}
                            >
                              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                            </button>
                          ) : (
                            <span style={{ width: '16px' }} />
                          )}
                          <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                            {mother.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#fff7ed',
                          color: '#c2410c',
                          border: '1px solid #fed7aa'
                        }}>
                          Mother ({children.length} sub)
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: '#f1f5f9',
                          color: '#334155'
                        }}>
                          {mother.productCount ?? 0}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b' }}>{mother.slug}</td>
                      <td>
                        <span className="badge badge-active">{mother.isActive ? 'Active' : 'Hidden'}</span>
                      </td>
                      <td>
                        <Can permission="categories.manage">
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => { setEditingCategory(mother); setIsModalOpen(true); }}
                              title="Edit Mother Category"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(mother.id, mother.name)}
                              title="Delete Category"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </Can>
                      </td>
                    </tr>

                    {/* Child Category Rows (Nested / Indented) */}
                    {!isCollapsed && children.map((child: Category) => {
                      const isChildSelected = selectedIds.includes(child.id);
                      return (
                        <tr
                          key={child.id || child.slug}
                          style={{
                            background: isChildSelected ? '#fff1f2' : '#ffffff',
                            borderLeft: '4px solid #ff6600'
                          }}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isChildSelected}
                              onChange={() => handleToggleSelectOne(child.id)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#ff6600' }}
                            />
                          </td>
                          <td style={{ fontSize: '12px', color: '#94a3b8' }}>#{child.order}</td>
                          <td>
                            <CategoryIconDisplay icon={child.icon} name={child.name} size={16} />
                          </td>
                          <td>
                            <CategoryCoverDisplay image={child.image} name={child.name} />
                          </td>
                          <td>
                            <div style={{ paddingLeft: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>↳</span>
                              <span style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>
                                {child.name}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 7px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              background: '#f8fafc',
                              color: '#64748b',
                              border: '1px solid #e2e8f0'
                            }}>
                              Subcategory
                            </span>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: '#f8fafc',
                              color: '#475569',
                              border: '1px solid #e2e8f0'
                            }}>
                              {child.productCount ?? 0}
                            </span>
                          </td>
                          <td style={{ fontSize: '11px', color: '#94a3b8' }}>{child.slug}</td>
                          <td>
                            <span className="badge badge-active">{child.isActive ? 'Active' : 'Hidden'}</span>
                          </td>
                          <td>
                            <Can permission="categories.manage">
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => { setEditingCategory(child); setIsModalOpen(true); }}
                                  title="Edit Subcategory"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(child.id, child.name)}
                                  title="Delete Subcategory"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </Can>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          motherCategories={categories}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
