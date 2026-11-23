import React, { useState, useEffect, useMemo } from 'react';
import { Category } from '../types';
import { adminApi } from '../api';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Tag,
  Search,
  Maximize2,
  Minimize2,
  X,
  Sun,
  BatteryCharging,
  Package,
  Zap,
  Activity,
  Battery,
  Power,
  Server,
  Briefcase,
  Video,
  Cpu,
  Shield,
  Wrench,
  Sliders,
  Layers,
  FolderTree,
  CheckSquare,
  Square
} from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>> = {
  Sun,
  BatteryCharging,
  Package,
  Zap,
  Activity,
  Battery,
  Power,
  Server,
  Briefcase,
  Video,
  Cpu,
  Shield,
  Wrench,
  Sliders,
  Layers,
  FolderTree
};

const CategoryIconBadge: React.FC<{ icon?: string; name: string }> = ({ icon, name }) => {
  if (icon && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/') || icon.startsWith('data:'))) {
    return (
      <div style={{
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <img
          src={icon}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  const IconComponent = (icon && ICON_MAP[icon]) || FolderTree;
  return (
    <div style={{
      width: '34px',
      height: '34px',
      borderRadius: '8px',
      background: '#fff7ed',
      border: '1px solid #fed7aa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ea580c',
      flexShrink: 0
    }}>
      <IconComponent size={18} />
    </div>
  );
};

interface SubcategoryModalProps {
  categories: Category[];
  initialCatId: string;
  sub: Subcategory | null;
  onClose: () => void;
  onSaved: (catId: string) => void;
}

const SubcategoryModal: React.FC<SubcategoryModalProps> = ({ categories, initialCatId, sub, onClose, onSaved }) => {
  const [selectedCatId, setSelectedCatId] = useState(initialCatId || (categories[0]?.id || ''));
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
    if (!name.trim()) {
      setError('Subcategory name is required');
      return;
    }
    if (!selectedCatId) {
      setError('Please select a parent category');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (sub) {
        await adminApi.updateSubcategory(selectedCatId, sub.id, { name: name.trim(), slug });
      } else {
        await adminApi.createSubcategory(selectedCatId, { name: name.trim(), slug });
      }
      onSaved(selectedCatId);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save subcategory');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '28px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            {sub ? 'Edit Subcategory' : 'Add New Subcategory'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Parent Category *
            </label>
            <select
              value={selectedCatId}
              disabled={!!sub} // Lock parent category during edit
              onChange={e => setSelectedCatId(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                background: sub ? '#f8fafc' : '#fff',
                cursor: sub ? 'not-allowed' : 'pointer'
              }}
            >
              {categories.map(mother => {
                const children = mother.children || [];
                if (children.length > 0) {
                  return (
                    <optgroup key={mother.id} label={mother.name}>
                      {children.map(ch => (
                        <option key={ch.id} value={ch.id}>
                          {ch.name} (/{ch.slug})
                        </option>
                      ))}
                    </optgroup>
                  );
                }
                return (
                  <option key={mother.id} value={mother.id}>
                    {mother.name} (/{mother.slug})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Subcategory Name *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Solar PV Panels, Hybrid Inverter"
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
              URL Slug
            </label>
            <input
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugTouched(true); }}
              placeholder="auto-generated-slug"
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                color: '#64748b',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary btn-sm"
            style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600 }}
          >
            {saving ? 'Saving...' : (sub ? 'Update Subcategory' : 'Create Subcategory')}
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
  const [selectedSubIds, setSelectedSubIds] = useState<Record<string, string[]>>({});
  const [bulkDeletingCatId, setBulkDeletingCatId] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCategories();
      setCategories(data);

      const map: Record<string, Subcategory[]> = {};
      const initialExpanded: Record<string, boolean> = {};

      data.forEach((mother) => {
        initialExpanded[mother.id] = true;
        (mother.children || []).forEach((cat) => {
          initialExpanded[cat.id] = true;
          const subs = cat.subcategories || [];
          map[cat.id] = subs.map(s => ({
            id: s.id || `${cat.id}-${s.slug}`,
            name: s.name,
            slug: s.slug
          }));
        });
      });

      setSubcatMap(map);
      setExpanded(initialExpanded);
    } catch (e) {
      console.error('Failed to load categories and subcategories:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleExpand = async (cat: Category) => {
    const isOpen = expanded[cat.id] !== false;
    setExpanded(prev => ({ ...prev, [cat.id]: !isOpen }));

    if (!isOpen && (!subcatMap[cat.id] || subcatMap[cat.id].length === 0)) {
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

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    categories.forEach(mother => {
      allExpanded[mother.id] = true;
      (mother.children || []).forEach(ch => {
        allExpanded[ch.id] = true;
      });
    });
    setExpanded(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpanded({});
  };

  const handleDeleteSub = async (cat: Category, sub: Subcategory) => {
    if (!window.confirm(`Are you sure you want to delete subcategory "${sub.name}" from "${cat.name}"?`)) return;
    try {
      await adminApi.deleteSubcategory(cat.id, sub.id);
      setSubcatMap(prev => ({
        ...prev,
        [cat.id]: (prev[cat.id] || []).filter(s => s.id !== sub.id)
      }));
      setSelectedSubIds(prev => ({
        ...prev,
        [cat.id]: (prev[cat.id] || []).filter(id => id !== sub.id)
      }));
    } catch (e: any) {
      alert('Delete failed: ' + e.message);
    }
  };

  const handleBulkDeleteSub = async (cat: Category) => {
    const ids = selectedSubIds[cat.id] || [];
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected subcategories from "${cat.name}"?`)) return;

    try {
      setBulkDeletingCatId(cat.id);
      await adminApi.bulkDeleteSubcategories(cat.id, ids);
      setSubcatMap(prev => ({
        ...prev,
        [cat.id]: (prev[cat.id] || []).filter(s => !ids.includes(s.id))
      }));
      setSelectedSubIds(prev => ({
        ...prev,
        [cat.id]: []
      }));
    } catch (e: any) {
      alert('Bulk delete failed: ' + e.message);
    } finally {
      setBulkDeletingCatId(null);
    }
  };

  const handleToggleSelectAllSubs = (catId: string, subs: Subcategory[]) => {
    const current = selectedSubIds[catId] || [];
    if (current.length === subs.length && subs.length > 0) {
      setSelectedSubIds(prev => ({ ...prev, [catId]: [] }));
    } else {
      setSelectedSubIds(prev => ({ ...prev, [catId]: subs.map(s => s.id) }));
    }
  };

  const handleToggleSelectOneSub = (catId: string, subId: string) => {
    setSelectedSubIds(prev => {
      const current = prev[catId] || [];
      const updated = current.includes(subId) ? current.filter(id => id !== subId) : [...current, subId];
      return { ...prev, [catId]: updated };
    });
  };

  const handleModalSaved = (catId: string) => {
    adminApi.getSubcategories(catId).then(subs => {
      setSubcatMap(prev => ({ ...prev, [catId]: subs }));
      setExpanded(prev => ({ ...prev, [catId]: true }));
    }).catch(() => {});
  };

  const totalSubs = useMemo(() => {
    return Object.values(subcatMap).reduce((s, a) => s + (a?.length || 0), 0);
  }, [subcatMap]);

  const totalCategoriesCount = useMemo(() => {
    return categories.reduce((sum, m) => sum + (m.children?.length || 0), 0);
  }, [categories]);

  // Filtered mothers, categories, and subcategories
  const filteredMothers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories.filter(mother => {
      // Category filter pill check
      if (selectedCategoryFilter !== 'all' && mother.id !== selectedCategoryFilter && mother.slug !== selectedCategoryFilter) {
        return false;
      }

      // Search query check
      if (!query) return true;

      const motherMatches = mother.name.toLowerCase().includes(query) || mother.slug.toLowerCase().includes(query);
      if (motherMatches) return true;

      const children = mother.children || [];
      return children.some(ch => {
        if (ch.name.toLowerCase().includes(query) || ch.slug.toLowerCase().includes(query)) return true;
        const subs = subcatMap[ch.id] || ch.subcategories || [];
        return subs.some(s => s.name.toLowerCase().includes(query) || s.slug.toLowerCase().includes(query));
      });
    });
  }, [categories, subcatMap, searchQuery, selectedCategoryFilter]);

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Subcategories Management</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            3-Tier Structure: Mother Category &gt; Category &gt; Subcategories (All {totalSubs} subcategories).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '7px 14px',
            fontSize: '13px',
            color: '#1d4ed8',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Tag size={15} />
            <span>{totalSubs} Subcategories across {totalCategoriesCount || 43} Categories in {categories.length} Mother Categories</span>
          </div>

          <button
            onClick={() => {
              const firstChildId = categories[0]?.children?.[0]?.id || categories[0]?.id || '';
              setModalCatId(firstChildId);
              setEditingSub(null);
            }}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontWeight: 600 }}
          >
            <Plus size={15} /> Add Subcategory
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search subcategory, category, or mother..."
            style={{
              width: '100%',
              padding: '8px 14px 8px 36px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '11px', top: '10px', color: '#94a3b8' }} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleExpandAll}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Maximize2 size={13} /> Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '6px 12px' }}
          >
            <Minimize2 size={13} /> Collapse All
          </button>
        </div>
      </div>

      {/* Mother Category Filter Pills */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px',
        scrollbarWidth: 'thin'
      }}>
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            border: selectedCategoryFilter === 'all' ? '1px solid #ff6600' : '1px solid #e2e8f0',
            background: selectedCategoryFilter === 'all' ? '#ff6600' : '#fff',
            color: selectedCategoryFilter === 'all' ? '#fff' : '#64748b',
            cursor: 'pointer'
          }}
        >
          All Mothers ({totalSubs})
        </button>

        {categories.map(mother => {
          const motherSubCount = (mother.children || []).reduce((sum, ch) => sum + (subcatMap[ch.id] || ch.subcategories || []).length, 0);
          const isSelected = selectedCategoryFilter === mother.id || selectedCategoryFilter === mother.slug;

          return (
            <button
              key={mother.id}
              onClick={() => setSelectedCategoryFilter(mother.slug)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                border: isSelected ? '1px solid #ff6600' : '1px solid #e2e8f0',
                background: isSelected ? '#ff6600' : '#fff',
                color: isSelected ? '#fff' : '#475569',
                cursor: 'pointer'
              }}
            >
              {mother.name} ({motherSubCount})
            </button>
          );
        })}
      </div>

      {/* Main 3-Tier Hierarchy: Mother Category -> Category -> Subcategories */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Loading categories and subcategories...
        </div>
      ) : filteredMothers.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          No categories or subcategories matching your criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredMothers.map(mother => {
            const isMotherOpen = expanded[mother.id] !== false;
            const query = searchQuery.trim().toLowerCase();
            
            // Filter children that match query or have matching subs
            const children = (mother.children || []).filter(ch => {
              if (!query) return true;
              if (ch.name.toLowerCase().includes(query) || ch.slug.toLowerCase().includes(query)) return true;
              const subs = subcatMap[ch.id] || ch.subcategories || [];
              return subs.some(s => s.name.toLowerCase().includes(query) || s.slug.toLowerCase().includes(query));
            });

            const motherTotalSubs = (mother.children || []).reduce((sum, ch) => sum + (subcatMap[ch.id] || ch.subcategories || []).length, 0);

            return (
              <div key={mother.id} style={{
                border: '1px solid #cbd5e1',
                borderRadius: '14px',
                overflow: 'hidden',
                background: '#ffffff',
                boxShadow: isMotherOpen ? '0 4px 16px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                {/* Level 1: Mother Category Header */}
                <div
                  onClick={() => setExpanded(prev => ({ ...prev, [mother.id]: !isMotherOpen }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    gap: '14px',
                    background: isMotherOpen ? '#f8fafc' : '#ffffff',
                    borderBottom: isMotherOpen ? '1px solid #e2e8f0' : 'none',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ color: '#64748b' }}>
                    {isMotherOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>

                  <CategoryIconBadge icon={mother.icon} name={mother.name} />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                        {mother.name}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        border: '1px solid #bae6fd',
                        borderRadius: '12px',
                        padding: '1px 8px',
                        fontWeight: 700
                      }}>
                        Mother Category
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {(mother.children || []).length} Categories · {motherTotalSubs} Subcategories · <span style={{ fontFamily: 'monospace' }}>/{mother.slug}</span>
                    </div>
                  </div>

                  <span style={{
                    background: motherTotalSubs > 0 ? '#eff6ff' : '#f1f5f9',
                    color: motherTotalSubs > 0 ? '#2563eb' : '#94a3b8',
                    border: `1px solid ${motherTotalSubs > 0 ? '#bfdbfe' : '#e2e8f0'}`,
                    borderRadius: '20px',
                    padding: '4px 14px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {motherTotalSubs} {motherTotalSubs === 1 ? 'subcategory' : 'subcategories'}
                  </span>
                </div>

                {/* Level 2 & 3: Child Categories and Subcategories inside this Mother */}
                {isMotherOpen && (
                  <div style={{ padding: '16px 20px', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {children.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                        No categories found in this mother category.
                      </div>
                    ) : (
                      children.map(cat => {
                        const isCatOpen = expanded[cat.id] !== false;
                        const allSubs = subcatMap[cat.id] || cat.subcategories || [];
                        const subs = query
                          ? allSubs.filter(s => s.name.toLowerCase().includes(query) || s.slug.toLowerCase().includes(query))
                          : allSubs;
                        const subCount = allSubs.length;

                        return (
                          <div key={cat.id} style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            background: '#ffffff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                          }}>
                            {/* Level 2: Category Header */}
                            <div
                              onClick={() => toggleExpand(cat)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                gap: '12px',
                                background: isCatOpen ? '#ffffff' : '#f8fafc',
                                borderBottom: isCatOpen ? '1px solid #f1f5f9' : 'none',
                                userSelect: 'none'
                              }}
                            >
                              <div style={{ color: '#94a3b8' }}>
                                {isCatOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </div>

                              <CategoryIconBadge icon={cat.icon} name={cat.name} />

                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                                  {cat.name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                  /{cat.slug}
                                </div>
                              </div>

                              <span style={{
                                background: subCount > 0 ? '#fff7ed' : '#f8fafc',
                                color: subCount > 0 ? '#ea580c' : '#94a3b8',
                                border: `1px solid ${subCount > 0 ? '#ffedd5' : '#e2e8f0'}`,
                                borderRadius: '16px',
                                padding: '2px 10px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}>
                                {subCount} {subCount === 1 ? 'subcategory' : 'subcategories'}
                              </span>

                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setModalCatId(cat.id);
                                  setEditingSub(null);
                                }}
                                className="btn btn-primary btn-sm"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 600
                                }}
                              >
                                <Plus size={12} /> Add
                              </button>
                            </div>

                            {/* Level 3: Subcategories Chips / Table */}
                            {isCatOpen && (
                              <div style={{ padding: '14px 16px', background: '#fafbfc' }}>
                                {subs.length === 0 ? (
                                  <div style={{
                                    color: '#94a3b8',
                                    fontSize: '12px',
                                    padding: '16px 0',
                                    textAlign: 'center',
                                    background: '#fff',
                                    borderRadius: '6px',
                                    border: '1px dashed #cbd5e1'
                                  }}>
                                    {query ? 'No subcategories match search.' : 'No subcategories in this category yet.'}{' '}
                                    <button
                                      onClick={() => { setModalCatId(cat.id); setEditingSub(null); }}
                                      style={{
                                        color: '#ff6600',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 700
                                      }}
                                    >
                                      + Add Subcategory
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    {/* Bulk Action Toolbar */}
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      marginBottom: '10px',
                                      paddingBottom: '8px',
                                      borderBottom: '1px solid #e2e8f0',
                                      flexWrap: 'wrap',
                                      gap: '8px'
                                    }}>
                                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
                                        <input
                                          type="checkbox"
                                          checked={subs.length > 0 && ((selectedSubIds[cat.id] || []).length === subs.length)}
                                          onChange={() => handleToggleSelectAllSubs(cat.id, subs)}
                                          style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: '#ff6600' }}
                                        />
                                        <span>Select All ({subs.length})</span>
                                      </label>

                                      {(selectedSubIds[cat.id]?.length || 0) > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48' }}>
                                            {selectedSubIds[cat.id]?.length} selected
                                          </span>
                                          <button
                                            onClick={() => handleBulkDeleteSub(cat)}
                                            disabled={bulkDeletingCatId === cat.id}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              background: '#e11d48',
                                              color: '#fff',
                                              border: 'none',
                                              borderRadius: '6px',
                                              padding: '3px 10px',
                                              fontSize: '11px',
                                              fontWeight: 600,
                                              cursor: 'pointer'
                                            }}
                                          >
                                            <Trash2 size={11} />
                                            {bulkDeletingCatId === cat.id ? 'Deleting...' : `Delete Selected (${selectedSubIds[cat.id]?.length})`}
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Subcategory Chips */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                      {subs.map((sub: Subcategory) => {
                                        const isSubSelected = (selectedSubIds[cat.id] || []).includes(sub.id);

                                        return (
                                          <div
                                            key={sub.id}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              background: isSubSelected ? '#fff1f2' : '#ffffff',
                                              border: `1px solid ${isSubSelected ? '#fda4af' : '#e2e8f0'}`,
                                              borderRadius: '20px',
                                              padding: '5px 10px 5px 8px',
                                              fontSize: '12px',
                                              color: '#1e293b',
                                              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                            }}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={isSubSelected}
                                              onChange={() => handleToggleSelectOneSub(cat.id, sub.id)}
                                              style={{ cursor: 'pointer', width: '13px', height: '13px', accentColor: '#ff6600' }}
                                            />

                                            <span style={{ fontWeight: 600 }}>{sub.name}</span>
                                            <span style={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}>
                                              /{sub.slug}
                                            </span>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '3px' }}>
                                              <button
                                                onClick={() => { setModalCatId(cat.id); setEditingSub(sub); }}
                                                title="Edit subcategory"
                                                style={{
                                                  background: '#f0fdf4',
                                                  border: '1px solid #bbf7d0',
                                                  borderRadius: '50%',
                                                  width: '22px',
                                                  height: '22px',
                                                  cursor: 'pointer',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  color: '#16a34a'
                                                }}
                                              >
                                                <Edit2 size={10} />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteSub(cat, sub)}
                                                title="Delete subcategory"
                                                style={{
                                                  background: '#fef2f2',
                                                  border: '1px solid #fecaca',
                                                  borderRadius: '50%',
                                                  width: '22px',
                                                  height: '22px',
                                                  cursor: 'pointer',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  color: '#dc2626'
                                                }}
                                              >
                                                <Trash2 size={10} />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Subcategory Modal */}
      {modalCatId && (
        <SubcategoryModal
          categories={categories}
          initialCatId={modalCatId}
          sub={editingSub}
          onClose={() => { setModalCatId(null); setEditingSub(null); }}
          onSaved={handleModalSaved}
        />
      )}
    </div>
  );
};
