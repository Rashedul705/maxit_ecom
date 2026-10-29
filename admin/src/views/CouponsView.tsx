import React, { useState, useEffect } from 'react';
import { Coupon } from '../types';
import { adminApi } from '../api';
import { Plus, Tag, Search, Edit2, Trash2, CheckCircle, XCircle, Clock, Percent, DollarSign, Calendar } from 'lucide-react';

export const CouponsView: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    expiryDate: '',
    usageLimit: 0,
    isActive: true
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCoupons();
      setCoupons(data || []);
    } catch (err: any) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percent',
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      expiryDate: '',
      usageLimit: 100,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscountAmount: c.maxDiscountAmount || 0,
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: c.usageLimit || 0,
      isActive: c.isActive
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      alert('Coupon code is required');
      return;
    }

    try {
      if (editingCoupon) {
        await adminApi.updateCoupon(editingCoupon.id, formData);
      } else {
        await adminApi.createCoupon(formData);
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      alert('Failed to save coupon: ' + err.message);
    }
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      await adminApi.updateCoupon(c.id, { isActive: !c.isActive });
      fetchCoupons();
    } catch (err: any) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      await adminApi.deleteCoupon(id);
      fetchCoupons();
    } catch (err: any) {
      alert('Failed to delete coupon: ' + err.message);
    }
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCount = coupons.filter(c => c.isActive).length;
  const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Coupon &amp; Voucher Management</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Create promotional discount codes, set minimum purchase thresholds, and monitor campaign redemptions.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Tag size={20} />
          </div>
          <div>
            <div className="stat-val">{coupons.length}</div>
            <div className="stat-label">Total Coupons</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-val">{activeCount}</div>
            <div className="stat-label">Active Campaigns</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Percent size={20} />
          </div>
          <div>
            <div className="stat-val">{totalUsed}</div>
            <div className="stat-label">Times Redeemed</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', maxWidth: '400px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by coupon code or title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Coupons Table */}
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Usage Count</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading coupons...
                </td>
              </tr>
            ) : filteredCoupons.length > 0 ? (
              filteredCoupons.map(c => {
                const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '4px 10px',
                          background: '#fff7ed',
                          color: '#ea580c',
                          border: '1px dashed #fdba74',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '13px',
                          fontFamily: 'monospace'
                        }}>
                          {c.code}
                        </span>
                      </div>
                      {c.description && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {c.discountType === 'percent' ? `${c.discountValue}% OFF` : `৳${c.discountValue.toLocaleString()} OFF`}
                      </div>
                      {c.discountType === 'percent' && c.maxDiscountAmount > 0 && (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Max cap: ৳{c.maxDiscountAmount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>
                        {c.minOrderAmount > 0 ? `৳${c.minOrderAmount.toLocaleString()}` : 'No minimum'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>
                        {c.usedCount || 0} {c.usageLimit > 0 ? `/ ${c.usageLimit}` : '(Unlimited)'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: isExpired ? '#ef4444' : '#475569', fontWeight: isExpired ? 700 : 500 }}>
                        {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never expires'}
                        {isExpired && ' (Expired)'}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(c)}
                        style={{
                          background: c.isActive && !isExpired ? '#ecfdf5' : '#f1f5f9',
                          color: c.isActive && !isExpired ? '#059669' : '#64748b',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {c.isActive && !isExpired ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEditModal(c)}
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(c.id, c.code)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No coupons found. Click "+ Add Coupon" to create your first discount voucher.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EID2026, SUMMER10"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Campaign Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Eid 10% Discount on Inverters"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={e => setFormData({ ...formData, discountType: e.target.value as 'percent' | 'fixed' })}
                    className="form-select"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed BDT Amount (৳)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder={formData.discountType === 'percent' ? '10 (for 10%)' : '200 (for ৳200)'}
                    value={formData.discountValue || ''}
                    onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Min. Order Spend (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = No minimum"
                    value={formData.minOrderAmount || ''}
                    onChange={e => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Max Discount Cap (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Unlimited"
                    value={formData.maxDiscountAmount || ''}
                    onChange={e => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Usage Limit (Max Uses)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Unlimited"
                    value={formData.usageLimit || ''}
                    onChange={e => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#ff6600' }}
                />
                <label htmlFor="couponActive" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Coupon is active and redeemable immediately
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
