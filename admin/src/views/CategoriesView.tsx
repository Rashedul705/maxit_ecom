import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { adminApi } from '../api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { CategoryModal } from '../components/CategoryModal';

export const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Categories Management</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Configure category hierarchy, cover images, and left menu icons.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
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
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>Loading categories...</td></tr>
            ) : categories.map(c => (
              <tr key={c.id}>
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
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCategory(c); setIsModalOpen(true); }}>
                      <Edit2 size={13} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.name)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
