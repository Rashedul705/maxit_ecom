import React, { useState } from 'react';
import { Brand } from '../types';
import { X, Upload } from 'lucide-react';
import { adminApi } from '../api';

interface BrandModalProps {
  brand: Brand | null;
  onClose: () => void;
  onSave: (data: Partial<Brand>) => Promise<void>;
}

export const BrandModal: React.FC<BrandModalProps> = ({ brand, onClose, onSave }) => {
  const [name, setName] = useState(brand?.name || '');
  const [slug, setSlug] = useState(brand?.slug || '');
  const [logo, setLogo] = useState(brand?.logo || '');
  const [website, setWebsite] = useState(brand?.website || '');
  const [description, setDescription] = useState(brand?.description || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    try {
      setUploading(true);
      const url = await adminApi.uploadImage(e.target.files[0]);
      setLogo(url);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Brand name is required');
    setSaving(true);
    await onSave({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      logo: logo || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=200&q=80',
      website,
      description
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '17px', fontWeight: 600 }}>{brand ? 'Edit Brand' : 'Add Brand'}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Brand Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Canadian Solar"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (!brand) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand Logo URL or Upload</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={logo}
                  onChange={e => setLogo(e.target.value)}
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
                </label>
              </div>
              {uploading && <p style={{ fontSize: '11px', color: '#ff6600', marginTop: '4px' }}>Uploading...</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Official Website</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://..."
                value={website}
                onChange={e => setWebsite(e.target.value)}
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
              {saving ? 'Saving...' : brand ? 'Update Brand' : 'Create Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
