import React, { useState, useEffect } from 'react';
import { Seller } from '../types';
import { adminApi } from '../api';
import { Plus, Check, Star } from 'lucide-react';

export const SellersView: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSellers();
      setSellers(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      setSaving(true);
      await adminApi.createSeller({ name, phone, email, address });
      fetchSellers();
      setShowAdd(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
    } catch (err: any) {
      alert('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Sellers & Merchants</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Manage vendor registrations, active seller profiles, and contact details.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Seller
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {loading ? (
          <p>Loading sellers...</p>
        ) : sellers.map(s => (
          <div key={s.id} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', marginBottom: '12px' }}>
              <img
                src={s.logo || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=100&q=80'}
                alt={s.name}
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
              />
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{s.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b', marginTop: '2px' }}>
                  <Star size={13} fill="#f59e0b" /> {s.rating} Rating ({s.totalProducts} products)
                </div>
              </div>
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', width: '100%' }}>
              <p>📞 {s.phone || 'N/A'}</p>
              <p>✉️ {s.email || 'N/A'}</p>
              <p>📍 {s.address || 'Bangladesh'}</p>
            </div>
            <span className="badge badge-active" style={{ marginTop: '14px' }}>{s.status}</span>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Register New Seller</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Store / Company Name *</label>
                  <input type="text" className="form-input" required value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Address</label>
                  <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Register Seller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
