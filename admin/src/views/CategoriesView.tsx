import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { adminApi } from '../api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { CategoryModal } from '../components/CategoryModal';
import { Can } from '../components/Can';

export const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    if (selectedIds.length === categories.length && categories.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map(c => c.id));
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
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Categories Management</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Configure category hierarchy, cover images, and left menu icons.</p>
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
                  checked={categories.length > 0 && selectedIds.length === categories.length}
                  onChange={handleToggleSelectAll}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#ff6600' }}
                  title="Select all categories"
                />
              </th>
              <th>Order</th>
              <th>Icon</th>
              <th>Cover Image</th>
              <th>Category Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '30px' }}>Loading categories...</td></tr>
            ) : categories.map(c => {
              const isSelected = selectedIds.includes(c.id);
              return (
                <tr key={c.id} style={{ background: isSelected ? '#fff1f2' : undefined }}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(c.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#ff6600' }}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>#{c.order}</td>
                  <td>
                    <img
                      src={c.icon || c.image || 'https://via.placeholder.com/32'}
                      alt={c.name}
                      style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'contain', background: '#fff', border: '1px solid #e2e8f0' }}
                    />
                  </td>
                  <td>
                    <img
                      src={c.image || 'https://via.placeholder.com/60'}
                      alt={c.name}
                      style={{ width: '60px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>{c.slug}</td>
                  <td style={{ fontSize: '12px', color: '#64748b', maxWidth: '240px' }}>{c.description || '-'}</td>
                  <td>
                    <span className="badge badge-active">{c.isActive ? 'Active' : 'Hidden'}</span>
                  </td>
                  <td>
                    <Can permission="categories.manage">
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCategory(c); setIsModalOpen(true); }}>
                          <Edit2 size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.name)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </Can>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
