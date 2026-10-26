import React, { useState } from 'react';
import { Banner } from '../types';
import { X, Upload } from 'lucide-react';
import { adminApi } from '../api';

interface BannerModalProps {
  banner: Banner | null;
  onClose: () => void;
  onSave: (data: Partial<Banner>) => Promise<void>;
}

export const BannerModal: React.FC<BannerModalProps> = ({ banner, onClose, onSave }) => {
  const [title, setTitle] = useState(banner?.title || '');
  const [image, setImage] = useState(banner?.image || '');
  const [link, setLink] = useState(banner?.link || '/');
  const [order, setOrder] = useState(banner?.order || 1);
  const [active, setActive] = useState(banner?.active !== false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    try {
      setUploading(true);
      const url = await adminApi.uploadImage(e.target.files[0]);
      setImage(url);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) return alert('Title and Image are required');
    setSaving(true);
    await onSave({
      title,
      image,
      link,
      order: Number(order),
      active
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '17px', fontWeight: 600 }}>{banner ? 'Edit Hero Banner' : 'Add Hero Banner'}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Banner Heading / Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sustainable Solar Energy Systems"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Banner Image URL or File *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  required
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
                </label>
              </div>
              {uploading && <p style={{ fontSize: '11px', color: '#ff6600', marginTop: '4px' }}>Uploading...</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Target Link (Click URL)</label>
              <input
                type="text"
                className="form-input"
                placeholder="/category/solar-energy"
                value={link}
                onChange={e => setLink(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Sequence Order</label>
                <input
                  type="number"
                  className="form-input"
                  value={order}
                  onChange={e => setOrder(Number(e.target.value))}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
                  Active / Visible in Slider
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : banner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
