import React, { useState } from 'react';
import { Category } from '../types';
import { X, Upload } from 'lucide-react';
import { adminApi } from '../api';

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: (data: Partial<Category>) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ category, onClose, onSave }) => {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [image, setImage] = useState(category?.image || '');
  const [icon, setIcon] = useState(category?.icon || '');
  const [order, setOrder] = useState(category?.order || 1);
  const [description, setDescription] = useState(category?.description || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'icon') => {
    if (!e.target.files || !e.target.files[0]) return;
    try {
      setUploading(true);
      const url = await adminApi.uploadImage(e.target.files[0]);
      if (target === 'image') setImage(url);
      else setIcon(url);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name is required');
    setSaving(true);
    await onSave({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image,
      icon,
      order: Number(order),
      description,
      isActive: true
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '17px', fontWeight: 600 }}>{category ? 'Edit Category' : 'Add Category'}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SOLAR ENERGY"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (!category) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL Slug</label>
              <input
                type="text"
                className="form-input"
                value={slug}
                onChange={e => setSlug(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category Icon (for Left Menu)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, 'icon')} />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category Cover Image (for Grid)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={image}
                  onChange={e => setImage(e.target.value)}
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, 'image')} />
                </label>
              </div>
              {uploading && <p style={{ fontSize: '11px', color: '#ff6600', marginTop: '4px' }}>Uploading...</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Display Sequence Order</label>
              <input
                type="number"
                className="form-input"
                value={order}
                onChange={e => setOrder(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
