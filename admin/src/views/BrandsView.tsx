import React, { useState, useEffect } from 'react';
import { Brand } from '../types';
import { adminApi } from '../api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { BrandModal } from '../components/BrandModal';

export const BrandsView: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getBrands();
      setBrands(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSave = async (data: Partial<Brand>) => {
    try {
      if (editingBrand) {
        await adminApi.updateBrand(editingBrand.id, data);
      } else {
        await adminApi.createBrand(data);
      }
      fetchBrands();
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete brand "${name}"?`)) return;
    try {
      await adminApi.deleteBrand(id);
      fetchBrands();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Brands Management</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Manage authorized manufacturer brand logos and descriptions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingBrand(null); setIsModalOpen(true); }}>
          <Plus size={16} /> Add Brand
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
        {loading ? (
          <p>Loading brands...</p>
        ) : brands.map(b => (
          <div key={b.id} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ width: '100%', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
              <img src={b.logo} alt={b.name} style={{ maxHeight: '60px', maxWidth: '80%', objectFit: 'contain' }} />
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{b.name}</h4>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Slug: {b.slug}</p>
            {b.website && (
              <a href={b.website} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#ff6600', textDecoration: 'none', marginTop: '2px' }}>
                {b.website.replace('https://', '')}
              </a>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', width: '100%' }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => { setEditingBrand(b); setIsModalOpen(true); }}>
                <Edit2 size={13} /> Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id, b.name)}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <BrandModal
          brand={editingBrand}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
