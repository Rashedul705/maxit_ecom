import React, { useState, useEffect } from 'react';
import { Product, Category, Brand } from '../types';
import {
  GripVertical,
  Plus,
  Trash2,
  X,
  Upload,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Bold,
  Italic,
  Heading2,
  List,
  Link as LinkIcon,
  Table as TableIcon
} from 'lucide-react';
import { adminApi } from '../api';

interface SpecItem {
  key: string;
  value: string;
}

interface SpecGroup {
  group: string;
  items: SpecItem[];
}

interface ProductEditorViewProps {
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  onDiscard: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}

export const ProductEditorView: React.FC<ProductEditorViewProps> = ({
  product,
  categories,
  brands,
  onDiscard,
  onSave
}) => {
  // Basic Information
  const [title, setTitle] = useState(product?.title || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [slugTouched, setSlugTouched] = useState(false);
  const [brand, setBrand] = useState(product?.brand || (brands[0]?.name || 'Gospower'));
  const [productCode, setProductCode] = useState(product?.productCode || '');
  const [category, setCategory] = useState(product?.category || (categories[0]?.slug || ''));

  // Pricing & Status
  const [regularPrice, setRegularPrice] = useState<number>(product?.oldPrice || 0);
  const [specialPrice, setSpecialPrice] = useState<number>(product?.price || 0);
  const [inStock, setInStock] = useState<boolean>((product?.stock !== undefined ? product.stock > 0 : true));
  const [stockQuantity, setStockQuantity] = useState<number>(product?.stock !== undefined ? product.stock : 10);

  // Images
  const [images, setImages] = useState<string[]>(
    product?.images && product.images.length > 0 ? product.images : []
  );
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Key Features
  const [keyFeatures, setKeyFeatures] = useState<string[]>(
    product?.keyFeatures && product.keyFeatures.length > 0
      ? product.keyFeatures
      : product?.shortDescription
        ? product.shortDescription.split(/\r?\n/).map(s => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean)
        : []
  );
  const [featureInput, setFeatureInput] = useState('');

  // Specifications (Grouped)
  const [specGroups, setSpecGroups] = useState<SpecGroup[]>([]);
  const [showQuickPaste, setShowQuickPaste] = useState(false);
  const [quickPasteText, setQuickPasteText] = useState('');

  // Description
  const [description, setDescription] = useState(product?.description || product?.shortDescription || '');

  // Publish switches
  const [isFeatured, setIsFeatured] = useState<boolean>(product?.isFeatured || false);
  const [isNewItem, setIsNewItem] = useState<boolean>(product?.isNewItem || true);
  const [isDeal, setIsDeal] = useState<boolean>(product?.isDeal || false);
  const [isHotDeal, setIsHotDeal] = useState<boolean>(product?.isHotDeal || false);

  const [saving, setSaving] = useState(false);

  // Auto-slug from title if not touched
  useEffect(() => {
    if (!slugTouched && !product) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  }, [title, slugTouched, product]);

  // Parse product specs into spec groups
  useEffect(() => {
    if (product && product.specs && typeof product.specs === 'object') {
      const entries = Object.entries(product.specs);
      if (entries.length > 0) {
        const isGrouped = entries.some(([_, val]) => val && typeof val === 'object' && !Array.isArray(val));
        if (isGrouped) {
          const parsed = entries.map(([groupName, groupData]) => {
            let items: SpecItem[] = [];
            if (groupData && typeof groupData === 'object' && !Array.isArray(groupData)) {
              items = Object.entries(groupData).map(([k, v]) => ({
                key: k,
                value: typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')
              }));
            }
            return { group: groupName, items };
          });
          setSpecGroups(parsed);
          return;
        } else {
          // Flat specs
          setSpecGroups([{
            group: 'General Information',
            items: entries.map(([k, v]) => ({ key: k, value: String(v ?? '') }))
          }]);
          return;
        }
      }
    }

    // Default template specs if creating new
    if (!product) {
      setSpecGroups([
        {
          group: 'Physical Information',
          items: [
            { key: 'Dimension', value: '535*485*198.5' },
            { key: 'Weight', value: 'Net weight 12.4 Kg' }
          ]
        },
        {
          group: 'Warranty Information',
          items: [
            { key: 'Warranty', value: '3 years' }
          ]
        }
      ]);
    }
  }, [product]);

  // Price calculations
  const hasDiscount = regularPrice > specialPrice && specialPrice > 0;
  const saveAmount = hasDiscount ? regularPrice - specialPrice : 0;
  const discountPercent = hasDiscount && regularPrice > 0 ? Math.round((saveAmount / regularPrice) * 100) : 0;
  const emiPerMonth = specialPrice > 0 ? Math.round(specialPrice / 12) : 0;
  const rewardPoints = specialPrice > 0 ? Math.floor(specialPrice / 1000) : 0;

  // Add Key Feature
  const handleAddFeature = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = featureInput.trim();
      if (trimmed) {
        setKeyFeatures([...keyFeatures, trimmed]);
        setFeatureInput('');
      }
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setKeyFeatures(keyFeatures.filter((_, i) => i !== idx));
  };

  // Image Upload / Management
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    try {
      setUploading(true);
      const url = await adminApi.uploadImage(e.target.files[0]);
      setImages([...images, url]);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (urlInput.trim()) {
      setImages([...images, urlInput.trim()]);
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleMakeMainImage = (index: number) => {
    if (index === 0) return;
    const reordered = [...images];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    setImages(reordered);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Specifications manipulation
  const handleAddGroup = () => {
    const groupName = prompt('Enter group name (e.g. "Output", "Input (Charging)"):', 'New Information');
    if (groupName && groupName.trim()) {
      setSpecGroups([...specGroups, { group: groupName.trim(), items: [{ key: '', value: '' }] }]);
    }
  };

  const handleRemoveGroup = (gIdx: number) => {
    setSpecGroups(specGroups.filter((_, idx) => idx !== gIdx));
  };

  const handleAddRow = (gIdx: number) => {
    const updated = [...specGroups];
    if (updated[gIdx]) {
      updated[gIdx].items.push({ key: '', value: '' });
      setSpecGroups(updated);
    } else if (updated.length > 0) {
      updated[updated.length - 1].items.push({ key: '', value: '' });
      setSpecGroups(updated);
    } else {
      setSpecGroups([{ group: 'General Information', items: [{ key: '', value: '' }] }]);
    }
  };

  const handleRemoveRow = (gIdx: number, rIdx: number) => {
    const updated = [...specGroups];
    updated[gIdx].items = updated[gIdx].items.filter((_, idx) => idx !== rIdx);
    setSpecGroups(updated);
  };

  const handleSpecChange = (gIdx: number, rIdx: number, field: 'key' | 'value', val: string) => {
    const updated = [...specGroups];
    updated[gIdx].items[rIdx][field] = val;
    setSpecGroups(updated);
  };

  // Quick Paste Parser for Startech specs
  const handleParseQuickPaste = () => {
    if (!quickPasteText.trim()) return;

    try {
      // First check if JSON
      if (quickPasteText.trim().startsWith('{')) {
        const parsed = JSON.parse(quickPasteText);
        const entries = Object.entries(parsed);
        const isGrouped = entries.some(([_, val]) => val && typeof val === 'object');
        if (isGrouped) {
          const res: SpecGroup[] = entries.map(([grp, obj]: any) => ({
            group: grp,
            items: Object.entries(obj).map(([k, v]) => ({ key: k, value: String(v) }))
          }));
          setSpecGroups(res);
          setShowQuickPaste(false);
          setQuickPasteText('');
          return;
        }
      }
    } catch {
      // not JSON, fallback to line-based parsing
    }

    const lines = quickPasteText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let currentGroup = 'General Information';
    const groupsMap: Record<string, SpecItem[]> = {};

    for (const line of lines) {
      if (line.includes(':') || line.includes('\t')) {
        const separator = line.includes('\t') ? '\t' : ':';
        const parts = line.split(separator);
        const key = parts[0].trim();
        const value = parts.slice(1).join(separator).trim();
        if (!groupsMap[currentGroup]) groupsMap[currentGroup] = [];
        groupsMap[currentGroup].push({ key, value });
      } else {
        // Likely a group header line
        currentGroup = line;
        if (!groupsMap[currentGroup]) groupsMap[currentGroup] = [];
      }
    }

    const res: SpecGroup[] = Object.entries(groupsMap).map(([group, items]) => ({
      group,
      items
    })).filter(g => g.items.length > 0);

    if (res.length > 0) {
      setSpecGroups(res);
    }
    setShowQuickPaste(false);
    setQuickPasteText('');
  };

  // Rich Text Toolbar helpers
  const insertFormatting = (tagStart: string, tagEnd = '') => {
    const textarea = document.getElementById('desc-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = description.substring(start, end);
    const replacement = tagStart + (sel || 'text') + tagEnd;
    const updated = description.substring(0, start) + replacement + description.substring(end);
    setDescription(updated);
  };

  // Submit Handler
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a product title');
      return;
    }

    setSaving(true);
    try {
      // Reconstruct grouped specs
      const groupedSpecsMap: Record<string, Record<string, string>> = {};
      let warrantyText = '';

      specGroups.forEach(g => {
        const groupObj: Record<string, string> = {};
        g.items.forEach(it => {
          if (it.key.trim()) {
            groupObj[it.key.trim()] = it.value.trim();
            if (it.key.toLowerCase().includes('warranty')) {
              warrantyText = it.value.trim();
            }
          }
        });
        if (Object.keys(groupObj).length > 0) {
          groupedSpecsMap[g.group.trim()] = groupObj;
        }
      });

      const cleanImages = images.filter(img => img.trim() !== '');

      const payload: Partial<Product> = {
        title: title.trim(),
        slug: (slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
        brand: brand.trim(),
        productCode: productCode.trim(),
        category,
        price: Number(specialPrice),
        oldPrice: Number(regularPrice),
        stock: inStock ? Number(stockQuantity) : 0,
        images: cleanImages.length > 0 ? cleanImages : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80'],
        keyFeatures: keyFeatures.filter(f => f.trim().length > 0),
        shortDescription: keyFeatures.join('\n'),
        specs: groupedSpecsMap,
        warranty: warrantyText || '1 Year Official Warranty',
        description: description.trim(),
        isFeatured,
        isNewItem,
        isDeal,
        isHotDeal
      };

      await onSave(payload);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* ================= HEADER BAR ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
            Products / {product ? 'Edit product' : 'Add new'}
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>
            {product ? 'Edit Product' : 'Add Product'}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onDiscard}
            disabled={saving}
          >
            Discard
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSave}
            disabled={saving}
            style={{ background: '#ffffff' }}
          >
            Save draft
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ minWidth: '140px' }}
          >
            {saving ? 'Publishing...' : 'Publish product'}
          </button>
        </div>
      </div>

      {/* ================= TWO-COLUMN GRID ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        
        {/* ================= LEFT / MAIN COLUMN (~70%) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Basic Information */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
              Basic information
            </h3>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Gospower GPEX-6KL1 6kW Hybrid Solar Inverter"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Slug</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="gospower-gpex-6kl1-6kw-hybrid-solar-inverter"
                  value={slug}
                  onChange={e => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                />
                <span style={{ fontSize: '11px', color: '#10b981', display: 'block', marginTop: '4px' }}>
                  Auto-generated. Available.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gospower"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Product code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="51939"
                  value={productCode}
                  onChange={e => setProductCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c.id || c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Pricing and Status */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
              Pricing and status
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-end', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Regular price (taka)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={regularPrice || ''}
                  onChange={e => setRegularPrice(Number(e.target.value))}
                  placeholder="68,750"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Special price (taka)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={specialPrice || ''}
                  onChange={e => setSpecialPrice(Number(e.target.value))}
                  placeholder="64,350"
                />
              </div>

              {hasDiscount ? (
                <div style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  Save: {saveAmount.toLocaleString()} taka ({discountPercent}% off)
                </div>
              ) : null}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setInStock(true)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: inStock ? '#0f172a' : '#f8fafc',
                      color: inStock ? '#ffffff' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                  >
                    In Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setInStock(false)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      background: !inStock ? '#0f172a' : '#f8fafc',
                      color: !inStock ? '#ffffff' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                  >
                    Out of Stock
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Stock quantity</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={stockQuantity}
                  onChange={e => setStockQuantity(Number(e.target.value))}
                  placeholder="10"
                />
              </div>
            </div>

            {/* Note box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#475569'
            }}>
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Shown on the product page automatically
              </div>
              <div style={{ display: 'flex', gap: '16px', color: '#047857', fontWeight: 600, marginBottom: '2px' }}>
                <span>0% EMI: {emiPerMonth.toLocaleString()} taka/month (12 months)</span>
                <span>Reward: {rewardPoints} points</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                Calculated from the special price. No extra fields to fill in.
              </div>
            </div>
          </div>

          {/* Card 3: Images */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Images
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                + Add Image by URL
              </button>
            </div>

            {showUrlInput && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste direct image URL (https://...)"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddImageUrl}
                >
                  Add
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
              {images.map((src, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Click to set as Main Image"
                  onClick={() => handleMakeMainImage(idx)}
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                  />

                  {idx === 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: '#0f172a',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      Main
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Upload Dropzone */}
              <label style={{
                width: '120px',
                height: '100px',
                borderRadius: '8px',
                border: '2px dashed #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                padding: '10px',
                background: '#f8fafc',
                color: '#64748b',
                fontSize: '11px',
                transition: 'border 0.2s'
              }}>
                <Upload size={18} style={{ marginBottom: '4px', color: '#94a3b8' }} />
                <span>{uploading ? 'Uploading...' : 'Drop images here or browse'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Drag to reorder. First image is the main image.
            </div>
          </div>

          {/* Card 4: Key Features */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
              Key features
            </h3>

            {keyFeatures.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {keyFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      color: '#1e293b'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GripVertical size={14} style={{ color: '#94a3b8', cursor: 'grab' }} />
                      <span>{feat}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: '2px 6px'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '6px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type a feature and press Enter"
                value={featureInput}
                onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={handleAddFeature}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Aim for 4 to 6 short points.
            </div>
          </div>

          {/* Card 5: Specification */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Specification
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowQuickPaste(!showQuickPaste)}
              >
                Quick paste
              </button>
            </div>

            {showQuickPaste && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>
                  Paste specifications (JSON or Startech text with tabs/colons):
                </label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  value={quickPasteText}
                  onChange={e => setQuickPasteText(e.target.value)}
                  placeholder="Physical Information&#10;Dimension: 535*485*198.5&#10;Weight: Net weight 12.4 Kg&#10;Warranty Information&#10;Warranty: 3 years"
                  style={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowQuickPaste(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleParseQuickPaste}
                  >
                    Apply Specs
                  </button>
                </div>
              </div>
            )}

            {/* Spec Groups Tables */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
              {specGroups.map((grp, gIdx) => (
                <div
                  key={gIdx}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Group Header */}
                  <div style={{
                    background: '#f1f5f9',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <input
                      type="text"
                      value={grp.group}
                      onChange={e => {
                        const copy = [...specGroups];
                        copy[gIdx].group = e.target.value;
                        setSpecGroups(copy);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '13px',
                        color: '#0f172a',
                        outline: 'none',
                        width: '70%'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleAddRow(gIdx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        + Add row
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(gIdx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete group
                      </button>
                    </div>
                  </div>

                  {/* Rows */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      {grp.items.map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ width: '35%', padding: '6px 12px', verticalAlign: 'top' }}>
                            <input
                              type="text"
                              value={row.key}
                              placeholder="Key (e.g. Dimension)"
                              onChange={e => handleSpecChange(gIdx, rIdx, 'key', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}
                            />
                          </td>
                          <td style={{ width: '55%', padding: '6px 12px', verticalAlign: 'top' }}>
                            <input
                              type="text"
                              value={row.value}
                              placeholder="Value (e.g. 535*485*198.5)"
                              onChange={e => handleSpecChange(gIdx, rIdx, 'value', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}
                            />
                          </td>
                          <td style={{ width: '10%', padding: '6px 8px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(gIdx, rIdx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Spec action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddGroup}
              >
                Add group
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleAddRow(specGroups.length - 1)}
              >
                Add row
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowQuickPaste(true)}
              >
                Quick paste
              </button>
            </div>
          </div>

          {/* Card 6: Description */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
              Description
            </h3>

            {/* Rich text formatting toolbar */}
            <div style={{
              display: 'flex',
              gap: '6px',
              padding: '6px 8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0'
            }}>
              <button
                type="button"
                onClick={() => insertFormatting('<strong>', '</strong>')}
                style={{ background: 'none', border: 'none', padding: '4px 6px', cursor: 'pointer', fontWeight: 700 }}
                title="Bold"
              >
                <Bold size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<em>', '</em>')}
                style={{ background: 'none', border: 'none', padding: '4px 6px', cursor: 'pointer', fontStyle: 'italic' }}
                title="Italic"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<h2>', '</h2>')}
                style={{ background: 'none', border: 'none', padding: '4px 6px', cursor: 'pointer' }}
                title="Heading 2"
              >
                <Heading2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
                style={{ background: 'none', border: 'none', padding: '4px 6px', cursor: 'pointer' }}
                title="List"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<a href="https://..." target="_blank">', '</a>')}
                style={{ background: 'none', border: 'none', padding: '4px 6px', cursor: 'pointer' }}
                title="Link"
              >
                <LinkIcon size={14} />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<table>\n  <tr><th>Header</th></tr>\n  <tr><td>Value</td></tr>\n</table>')}
                style={{ background: 'none', border: 'none', padding: '4px 6px', cursor: 'pointer' }}
                title="Table"
              >
                <TableIcon size={14} />
              </button>
            </div>

            <textarea
              id="desc-editor"
              className="form-textarea"
              rows={8}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="The Gospower 6kW Hybrid Solar Inverter supports up to 8000W PV input power and operates reliably from -25°C to 60°C."
              style={{
                borderRadius: '0 0 8px 8px',
                fontSize: '13px',
                lineHeight: 1.6
              }}
            />
          </div>

        </div>

        {/* ================= RIGHT COLUMN (~30%) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Publish Toggles */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
              Publish
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Featured */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>Featured</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '20px',
                    background: isFeatured ? '#10b981' : '#cbd5e1',
                    transition: '0.2s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: isFeatured ? '20px' : '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: '0.2s'
                    }} />
                  </span>
                </label>
              </div>

              {/* New item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>New item</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isNewItem}
                    onChange={e => setIsNewItem(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '20px',
                    background: isNewItem ? '#10b981' : '#cbd5e1',
                    transition: '0.2s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: isNewItem ? '20px' : '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: '0.2s'
                    }} />
                  </span>
                </label>
              </div>

              {/* Deal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>Deal</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isDeal}
                    onChange={e => setIsDeal(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '20px',
                    background: isDeal ? '#10b981' : '#cbd5e1',
                    transition: '0.2s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: isDeal ? '20px' : '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: '0.2s'
                    }} />
                  </span>
                </label>
              </div>

              {/* Hot deal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>Hot deal</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isHotDeal}
                    onChange={e => setIsHotDeal(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '20px',
                    background: isHotDeal ? '#10b981' : '#cbd5e1',
                    transition: '0.2s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: isHotDeal ? '20px' : '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: '0.2s'
                    }} />
                  </span>
                </label>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              Draft saved a few seconds ago
            </div>
          </div>

          {/* Card 2: Live Preview */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              Live preview
            </h3>

            {/* Product Card Container */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {/* Main Image container */}
              <div style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '8px',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {images[0] ? (
                  <img
                    src={images[0]}
                    alt={title || 'Product'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
                  />
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>
                    Main Image
                  </span>
                )}
              </div>

              {/* Title */}
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#0f172a',
                lineHeight: 1.3,
                minHeight: '34px'
              }}>
                {title || 'Gospower GPEX-6KL1 6kW Hybrid Solar Inverter'}
              </div>

              {/* Bullets */}
              {keyFeatures.length > 0 && (
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: '11px',
                  color: '#64748b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}>
                  {keyFeatures.slice(0, 3).map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '8px', color: '#94a3b8' }}>•</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Price Row */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ff6600' }}>
                  {specialPrice > 0 ? `৳${specialPrice.toLocaleString()}` : 'Call for Price'}
                </span>
                {hasDiscount && (
                  <del style={{ fontSize: '11px', color: '#94a3b8' }}>
                    ৳{regularPrice.toLocaleString()}
                  </del>
                )}
              </div>

              {/* Metadata row */}
              <div style={{
                fontSize: '10px',
                color: '#64748b',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '6px',
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap'
              }}>
                <span>{inStock ? 'In Stock' : 'Out of Stock'}</span>
                <span>|</span>
                <span>Code {productCode || '51939'}</span>
                {hasDiscount && (
                  <>
                    <span>|</span>
                    <span style={{ color: '#047857', fontWeight: 600 }}>Save {saveAmount.toLocaleString()}৳</span>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};