import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { adminApi } from '../api';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { BannerModal } from '../components/BannerModal';

export const BannersView: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getBanners();
      setBanners(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSave = async (data: Partial<Banner>) => {
    try {
      if (editingBanner) {
        await adminApi.updateBanner(editingBanner.id, data);
      } else {
        await adminApi.createBanner(data);
      }
      fetchBanners();
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete banner "${title}"?`)) return;
    try {
      await adminApi.deleteBanner(id);
      fetchBanners();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Hero Sliders & Banners</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Configure homepage hero carousel images, titles, and target destination links.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingBanner(null); setIsModalOpen(true); }}>
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {loading ? (
          <p>Loading banners...</p>
        ) : banners.map(b => (
          <div key={b.id} className="table-card" style={{ marginBottom: 0 }}>
            <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
              <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className={`badge ${b.active ? 'badge-active' : 'badge-pending'}`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                {b.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff6600' }}>SLIDE #{b.order}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Link: {b.link}</span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginTop: '6px', color: '#0f172a' }}>{b.title}</h4>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setEditingBanner(b); setIsModalOpen(true); }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id, b.title)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <BannerModal
          banner={editingBanner}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
