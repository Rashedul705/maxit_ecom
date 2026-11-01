import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { adminApi } from '../api';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Tag } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface SubcategoryModalProps {
  categoryId: string;
  sub: Subcategory | null;
  onClose: () => void;
  onSaved: () => void;
}

const SubcategoryModal: React.FC<SubcategoryModalProps> = ({ categoryId, sub, onClose, onSaved }) => {
  const [name, setName] = useState(sub?.name || '');
  const [slug, setSlug] = useState(sub?.slug || '');
  const [slugTouched, setSlugTouched] = useState(!!sub);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slugTouched) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [name, slugTouched]);

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    try {
      if (sub) {
        await adminApi.updateSubcategory(categoryId, sub.id, { name: name.trim(), slug });
      } else {
        await adminApi.createSubcategory(categoryId, { name: name.trim(), slug });
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px', padding: '28px', width: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
          {sub ? 'Edit Subcategory' : 'Add Subcategory'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '5px' }}>
              Name *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Projector"
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                borderRadius: '8px', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '5px' }}>
              Slug
            </label>
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugTouched(true); }}
              placeholder="auto-generated"
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#64748b',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {error && (
          <p style={{ marginTop: '10px', color: '#ef4444', fontSize: '13px' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px', border: '1px solid #e2e8f0', borderRadius: '8px',
              background: '#fff', fontSize: '13px', cursor: 'pointer', color: '#64748b'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 18px', border: 'none', borderRadius: '8px',
              background: '#3b82f6', color: '#fff', fontSize: '13px',
              cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600,
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : (sub ? 'Update' : 'Add Subcategory')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SubcategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [subcatMap, setSubcatMap] = useState<Record<string, Subcategory[]>>({});
  const [loadingCat, setLoadingCat] = useState<Record<string, boolean>>({});
  const [modalCatId, setModalCatId] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
      // Pre-populate subcategories from category data (they're embedded)
      const map: Record<string, Subcategory[]> = {};
      data.forEach((cat) => {
        if (cat.subcategories && cat.subcategories.length > 0) {
          map[cat.id] = cat.subcategories.map(s => ({
            id: s.id || `${cat.id}-${s.slug}`,
            name: s.name,
            slug: s.slug
          }));
        }
      });
      setSubcatMap(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const toggleExpand = async (cat: Category) => {
    const isOpen = expanded[cat.id];
    setExpanded(prev => ({ ...prev, [cat.id]: !isOpen }));
    // Refresh subcategories from API when opening
    if (!isOpen) {
      setLoadingCat(prev => ({ ...prev, [cat.id]: true }));
      try {
        const subs = await adminApi.getSubcategories(cat.id);
        setSubcatMap(prev => ({ ...prev, [cat.id]: subs }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCat(prev => ({ ...prev, [cat.id]: false }));
      }
    }
  };

  const handleDeleteSub = async (cat: Category, sub: Subcategory) => {
    if (!window.confirm(`Delete subcategory "${sub.name}" from "${cat.name}"?`)) return;
    try {
      await adminApi.deleteSubcategory(cat.id, sub.id);
      setSubcatMap(prev => ({
        ...prev,
        [cat.id]: (prev[cat.id] || []).filter(s => s.id !== sub.id)
      }));
    } catch (e: any) {
      alert('Delete failed: ' + e.message);
    }
  };

  const handleModalSaved = (catId: string) => {
    // Refresh subcats for this category
    adminApi.getSubcategories(catId).then(subs => {
      setSubcatMap(prev => ({ ...prev, [catId]: subs }));
    }).catch(() => {});
  };

  const totalSubs = Object.values(subcatMap).reduce((s, a) => s + a.length, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Subcategories</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Manage subcategory pills under each parent category. Click a category to expand its subcategories.
          </p>
        </div>
        <div style={{
          background: '#f1f5f9', borderRadius: '10px', padding: '8px 16px',
          fontSize: '13px', color: '#64748b', fontWeight: 500
        }}>
          <Tag size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          {totalSubs} total subcategories across {categories.length} categories
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading categories...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categories.map(cat => {
            const isOpen = !!expanded[cat.id];
            const subs = subcatMap[cat.id] || cat.subcategories || [];
            const subCount = subs.length;

            return (
              <div key={cat.id} style={{
                border: '1px solid #e2e8f0', borderRadius: '12px',
                overflow: 'hidden', background: '#fff',
                boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                {/* Category Row */}
                <div
                  onClick={() => toggleExpand(cat)}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '14px 18px',
                    cursor: 'pointer', gap: '12px',
                    background: isOpen ? '#f8fafc' : '#fff',
                    borderBottom: isOpen ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <div style={{ color: '#94a3b8' }}>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  {cat.icon && (
                    <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{cat.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>/{cat.slug}</div>
                  </div>
                  <span style={{
                    background: subCount > 0 ? '#dbeafe' : '#f1f5f9',
                    color: subCount > 0 ? '#2563eb' : '#94a3b8',
                    borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600
                  }}>
                    {subCount} subcategories
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); setModalCatId(cat.id); setEditingSub(null); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '5px 12px', background: '#3b82f6', color: '#fff',
                      border: 'none', borderRadius: '7px', fontSize: '12px',
                      cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>

                {/* Subcategories List */}
                {isOpen && (
                  <div style={{ padding: '12px 18px 14px' }}>
                    {loadingCat[cat.id] ? (
                      <div style={{ color: '#94a3b8', fontSize: '13px', padding: '8px 0' }}>Loading...</div>
                    ) : subs.length === 0 ? (
                      <div style={{
                        color: '#94a3b8', fontSize: '13px', padding: '20px 0',
                        textAlign: 'center', borderTop: '1px dashed #f1f5f9'
                      }}>
                        No subcategories yet.{' '}
                        <button
                          onClick={() => { setModalCatId(cat.id); setEditingSub(null); }}
                          style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                        >
                          Add the first one
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {subs.map((sub: Subcategory) => (
                          <div key={sub.id} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: '20px', padding: '4px 6px 4px 12px',
                            fontSize: '13px', color: '#374151'
                          }}>
                            <span style={{ fontWeight: 500 }}>{sub.name}</span>
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>/{sub.slug}</span>
                            <button
                              onClick={() => { setModalCatId(cat.id); setEditingSub(sub); }}
                              title="Edit"
                              style={{
                                background: '#e0f2fe', border: 'none', borderRadius: '50%',
                                width: '22px', height: '22px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7'
                              }}
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteSub(cat, sub)}
                              title="Delete"
                              style={{
                                background: '#fee2e2', border: 'none', borderRadius: '50%',
                                width: '22px', height: '22px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'
                              }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalCatId && (
        <SubcategoryModal
          categoryId={modalCatId}
          sub={editingSub}
          onClose={() => { setModalCatId(null); setEditingSub(null); }}
          onSaved={() => handleModalSaved(modalCatId)}
        />
      )}
    </div>
  );
};

