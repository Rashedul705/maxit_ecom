import React, { useState } from 'react';
import { Category } from '../types';
import { X, Upload } from 'lucide-react';
import { adminApi } from '../api';
import { CategoryIconDisplay, CategoryCoverDisplay, CATEGORY_ICON_PRESETS } from './CategoryMedia';

interface CategoryModalProps {
  category: Category | null;
  motherCategories?: Category[];
  onClose: () => void;
  onSave: (data: Partial<Category>) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ category, motherCategories = [], onClose, onSave }) => {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [parent, setParent] = useState(category?.parent || '');
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
      parent: parent ? parent.trim() : null,
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Parent Category</label>
              <select
                className="form-input"
                value={parent}
                onChange={e => setParent(e.target.value)}
              >
                <option value="">None (Mother Category)</option>
                {(motherCategories || [])
                  .filter(m => !category || (m.id !== category.id && m.slug !== category.slug))
                  .map(m => (
                    <option key={m.id || m.slug} value={m.slug}>
                      {m.name}
                    </option>
                  ))}
              </select>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                Select a Mother Category to make this a Subcategory, or "None" for top-level.
              </span>
            </div>

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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <CategoryIconDisplay icon={icon} name={name || 'Category'} size={20} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Icon name (e.g. Sun, Battery) or Image URL"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  style={{ flex: 1 }}
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} title="Upload Custom Icon Image">
                  <Upload size={14} /> Upload
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, 'icon')} />
                </label>
              </div>
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Quick Icon Presets:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '72px', overflowY: 'auto', padding: '4px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {CATEGORY_ICON_PRESETS.map(preset => {
                    const PresetIcon = preset.icon;
                    const isSelected = icon === preset.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setIcon(preset.name)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 7px',
                          fontSize: '11px',
                          borderRadius: '4px',
                          border: isSelected ? '1px solid #ff6600' : '1px solid #cbd5e1',
                          background: isSelected ? '#fff7ed' : '#ffffff',
                          color: isSelected ? '#ff6600' : '#334155',
                          cursor: 'pointer'
                        }}
                        title={preset.label}
                      >
                        <PresetIcon size={12} />
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category Cover Image (for Grid)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <CategoryCoverDisplay image={image} name={name || 'Category'} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  style={{ flex: 1 }}
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} title="Upload Cover Image">
                  <Upload size={14} /> Upload
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
