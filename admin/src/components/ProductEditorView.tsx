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
  ArrowLeft,
  ArrowRight,
  Bold,
  Italic,
  Heading2,
  List,
  Link as LinkIcon,
  Table as TableIcon,
  Sparkles,
  Code,
  FileText,
  Scissors
} from 'lucide-react';
import { adminApi } from '../api';
import { htmlToCleanPlainText, plainTextToCleanHtml } from '../utils/htmlTextConverter';
import { ImageCropperModal } from './ImageCropperModal';

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
  const [category, setCategory] = useState(product?.category ? product.category.replace(/^cat-/, '') : (categories[0]?.slug || ''));
  const [subcategory, setSubcategory] = useState(product?.subcategory || '');
  const [availableSubcats, setAvailableSubcats] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Pricing & Status
  const [regularPrice, setRegularPrice] = useState<number>(product?.oldPrice || 0);
  const [specialPrice, setSpecialPrice] = useState<number>(product?.price || 0);
  const [inStock, setInStock] = useState<boolean>((product?.stock !== undefined ? product.stock > 0 : true));
  const [stockQuantity, setStockQuantity] = useState<number>(product?.stock !== undefined ? product.stock : 10);

  // Images: Main Product Image (One only) & Gallery Images (Multiple, reorderable)
  const [mainImage, setMainImage] = useState<string>(() => {
    return product?.image || (product?.images && product.images[0]) || '';
  });
  const [uploadingMain, setUploadingMain] = useState(false);
  const [cleaningImage, setCleaningImage] = useState(false);
  const [mainUrlInput, setMainUrlInput] = useState('');
  const [showMainUrlInput, setShowMainUrlInput] = useState(false);
  const [croppingTarget, setCroppingTarget] = useState<{ url: string; isMain: boolean; galleryIdx?: number } | null>(null);

  const handleCleanImage = async (imgUrl: string, isMain: boolean, galleryIdx?: number) => {
    if (!imgUrl) return;
    try {
      setCleaningImage(true);
      const res = await adminApi.cleanImageBanner(imgUrl);
      if (res.url && res.url !== imgUrl && !res.alreadyClean) {
        if (isMain) {
          setMainImage(res.url);
        } else if (galleryIdx !== undefined) {
          const updated = [...galleryImages];
          updated[galleryIdx] = res.url;
          setGalleryImages(updated);
        }
        alert('Image cleaned successfully! Bottom banner and competitor phone numbers removed.');
      } else {
        alert('Image is already clean! No bottom banner or competitor phone numbers were detected.\n\nTip: You can use "✂️ Crop Manually" anytime to cut or trim any custom part of the image.');
      }
    } catch (e: any) {
      alert('Cleaning failed: ' + e.message);
    } finally {
      setCleaningImage(false);
    }
  };

  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    const raw = product?.images || [];
    const main = product?.image || raw[0] || '';
    return raw.filter((img, i) => {
      if (!img) return false;
      if (img === main && i === 0) return false;
      return true;
    });
  });
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [showGalleryUrlInput, setShowGalleryUrlInput] = useState(false);

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

  // Description mode: 'plain' (easy, non-technical friendly) | 'html' (raw HTML)
  const [descMode, setDescMode] = useState<'plain' | 'html'>('plain');
  const [description, setDescription] = useState(() =>
    htmlToCleanPlainText(product?.description || product?.shortDescription || '')
  );

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

  // Load subcategories when category changes
  useEffect(() => {
    if (!category) { setAvailableSubcats([]); return; }
    const cat = categories.find(c => c.slug === category || c.id === category) ||
      categories.flatMap(m => m.children || []).find(c => c.slug === category || c.id === category);
    if (cat && cat.subcategories && cat.subcategories.length > 0) {
      setAvailableSubcats(cat.subcategories.map(s => ({
        id: s.id || s.slug,
        name: s.name,
        slug: s.slug
      })));
    } else {
      // Fetch from API
      adminApi.getSubcategories(category)
        .then(subs => setAvailableSubcats(subs))
        .catch(() => setAvailableSubcats([]));
    }
    // Don't clear subcategory on initial load (editing)
    if (!product) setSubcategory('');
  }, [category]);

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

  // Main Image Handlers
  const handleMainFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    try {
      setUploadingMain(true);
      const url = await adminApi.uploadImage(e.target.files[0]);
      setMainImage(url);
    } catch (err: any) {
      alert('Main image upload failed: ' + err.message);
    } finally {
      setUploadingMain(false);
    }
  };

  const handleSetMainImageUrl = () => {
    if (mainUrlInput.trim()) {
      setMainImage(mainUrlInput.trim());
      setMainUrlInput('');
      setShowMainUrlInput(false);
    }
  };

  // Gallery Images Handlers
  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploadingGallery(true);
      const files = Array.from(e.target.files);
      const urls: string[] = [];
      for (const f of files) {
        const u = await adminApi.uploadImage(f);
        urls.push(u);
      }
      setGalleryImages([...galleryImages, ...urls]);
    } catch (err: any) {
      alert('Gallery upload failed: ' + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddGalleryImageUrl = () => {
    if (galleryUrlInput.trim()) {
      setGalleryImages([...galleryImages, galleryUrlInput.trim()]);
      setGalleryUrlInput('');
      setShowGalleryUrlInput(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleMoveGalleryImage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= galleryImages.length) return;
    const updated = [...galleryImages];
    const [item] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, item);
    setGalleryImages(updated);
  };

  const handlePromoteToMainImage = (galleryIdx: number) => {
    const chosen = galleryImages[galleryIdx];
    if (!chosen) return;
    const oldMain = mainImage;
    const updated = [...galleryImages];
    if (oldMain) {
      updated[galleryIdx] = oldMain;
    } else {
      updated.splice(galleryIdx, 1);
    }
    setMainImage(chosen);
    setGalleryImages(updated);
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

      const cleanMain = mainImage.trim();
      const cleanGallery = galleryImages.filter(img => img && img.trim() !== '' && img !== cleanMain);
      const allImages = cleanMain ? [cleanMain, ...cleanGallery] : cleanGallery;

      const payload: Partial<Product> = {
        title: title.trim(),
        slug: (slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
        brand: brand.trim(),
        productCode: productCode.trim(),
        category,
        subcategory: subcategory || undefined,
        subcategoryName: subcategory
          ? (availableSubcats.find(s => s.slug === subcategory)?.name || subcategory)
          : undefined,
        price: Number(specialPrice),
        oldPrice: Number(regularPrice),
        stock: inStock ? Number(stockQuantity) : 0,
        image: cleanMain || (allImages[0] || ''),
        images: allImages.length > 0 ? allImages : [],
        keyFeatures: keyFeatures.filter(f => f.trim().length > 0),
        shortDescription: keyFeatures.join('\n'),
        specs: groupedSpecsMap,
        warranty: warrantyText || '1 Year Official Warranty',
        description: descMode === 'plain'
          ? plainTextToCleanHtml(description)
          : description.trim(),
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
                  placeholder="e.g. MX-18477"
                  value={productCode}
                  onChange={e => setProductCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={category.replace(/^cat-/, '')}
                  onChange={e => setCategory(e.target.value)}
                  required
                >
                  <option value="">— Select Category —</option>
                  {categories.map(mother => {
                    const children = mother.children || [];
                    if (children.length > 0) {
                      return (
                        <optgroup key={mother.id || mother.slug} label={mother.name}>
                          <option value={mother.slug}>{mother.name} (Mother Main)</option>
                          {children.map(child => (
                            <option key={child.id || child.slug} value={child.slug}>
                              ↳ {child.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    }
                    return (
                      <option key={mother.id || mother.slug} value={mother.slug}>
                        {mother.name}
                      </option>
                    );
                  })}
                </select>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Hierarchy: Mother Category &gt; Subcategory
                </span>
              </div>
            </div>

            {/* Subcategory — full width below the 2-col row */}
            <div className="form-group" style={{ marginTop: '0' }}>
              <label className="form-label">Subcategory</label>
              <select
                className="form-select"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                disabled={availableSubcats.length === 0}
              >
                <option value="">— None (no subcategory) —</option>
                {availableSubcats.map(s => (
                  <option key={s.id} value={s.slug}>{s.name}</option>
                ))}
              </select>
              {availableSubcats.length === 0 && category && (
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  No subcategories for this category. Add them in Subcategories management.
                </span>
              )}
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
              <div style={{ display: 'flex', gap: '16px', color: '#047857', fontWeight: 600, marginBottom: '2px', flexWrap: 'wrap' }}>
                {hasDiscount && (
                  <span>Save: ৳{saveAmount.toLocaleString()} ({discountPercent}% off)</span>
                )}
                <span>Reward: {rewardPoints} points</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                Calculated from regular and special prices. No extra fields to fill in.
              </div>
            </div>
          </div>

          {/* Card 3A: Main Product Image (One Image Only) */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Main Product Image
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                  One primary image shown on product cards, catalog grids, and as the hero image on the product page.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowMainUrlInput(!showMainUrlInput)}
              >
                {showMainUrlInput ? 'Cancel' : '+ Add / Edit URL'}
              </button>
            </div>

            {showMainUrlInput && (
              <div style={{ display: 'flex', gap: '8px', margin: '14px 0' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste direct image URL for Main Image (https://...)"
                  value={mainUrlInput}
                  onChange={e => setMainUrlInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSetMainImageUrl}
                >
                  Set Main Image
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
              {/* Main Image Preview Box */}
              <div style={{
                position: 'relative',
                width: '130px',
                height: '130px',
                borderRadius: '10px',
                border: mainImage ? '2px solid #ff6600' : '2px dashed #cbd5e1',
                background: '#f8fafc',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {mainImage ? (
                  <>
                    <img
                      src={mainImage}
                      alt="Main Product"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/admin/product-placeholder.svg';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: '#ff6600',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      Main
                    </span>
                    <button
                      type="button"
                      onClick={() => setMainImage('')}
                      title="Remove Main Image"
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '8px' }}>
                    <ImageIcon size={28} style={{ margin: '0 auto 4px', display: 'block' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>No Main Image</span>
                  </div>
                )}
              </div>

              {/* Upload Button & Dropzone */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    <Upload size={16} />
                    <span>{uploadingMain ? 'Uploading Main Image...' : (mainImage ? 'Replace Main Image' : 'Upload Main Image')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainFileUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingMain}
                    />
                  </label>

                  {mainImage && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCroppingTarget({ url: mainImage, isMain: true })}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: '1px solid #ff6600',
                          background: '#fff7ed',
                          color: '#ea580c',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Manually crop image and select exact area to keep"
                      >
                        <Scissors size={15} />
                        <span>✂️ Crop Manually</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCleanImage(mainImage, true)}
                        disabled={cleaningImage}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          color: '#475569',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: cleaningImage ? 'not-allowed' : 'pointer'
                        }}
                        title="Automatically detect and crop bottom banner/competitor numbers"
                      >
                        <Sparkles size={15} />
                        <span>{cleaningImage ? 'Cleaning Image...' : '⚡ Auto-Crop Banner'}</span>
                      </button>
                    </>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Supports PNG, JPG, WEBP, AVIF. Use &quot;Crop Manually&quot; to select any custom area, or &quot;Auto-Crop Banner&quot; to remove watermarks automatically.
                </div>
              </div>
            </div>
          </div>

          {/* Card 3B: Gallery Images (Multiple, Reorderable) */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Gallery Images ({galleryImages.length})
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Additional photos shown on the product page. Use the ← → arrows to reorder, or click &quot;Make Main&quot; to swap.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowGalleryUrlInput(!showGalleryUrlInput)}
              >
                {showGalleryUrlInput ? 'Cancel' : '+ Add Gallery URL'}
              </button>
            </div>

            {showGalleryUrlInput && (
              <div style={{ display: 'flex', gap: '8px', margin: '14px 0' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste direct image URL for Gallery (https://...)"
                  value={galleryUrlInput}
                  onChange={e => setGalleryUrlInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddGalleryImageUrl}
                >
                  Add to Gallery
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', margin: '16px 0 12px 0' }}>
              {galleryImages.map((src, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    width: '115px',
                    height: '115px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={src}
                    alt={`Gallery ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/admin/product-placeholder.svg';
                    }}
                    style={{ width: '100%', height: '80px', objectFit: 'contain', padding: '4px' }}
                  />

                  {/* Index Number */}
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    background: '#334155',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '3px'
                  }}>
                    #{idx + 1}
                  </span>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    title="Remove from Gallery"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={10} />
                  </button>

                  {/* Bottom Controls: Reorder Left / Right and Set Main */}
                  <div style={{
                    width: '100%',
                    height: '28px',
                    background: '#f1f5f9',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 4px'
                  }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveGalleryImage(idx, 'left')}
                      title="Move Left"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: idx === 0 ? 'default' : 'pointer',
                        color: idx === 0 ? '#cbd5e1' : '#475569',
                        padding: '2px'
                      }}
                    >
                      <ArrowLeft size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePromoteToMainImage(idx)}
                      title="Set as Main Image"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#ea580c',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    >
                      Make Main
                    </button>

                    <button
                      type="button"
                      onClick={() => setCroppingTarget({ url: src, isMain: false, galleryIdx: idx })}
                      title="Crop Manually (Select area to keep)"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ff6600',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Scissors size={11} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCleanImage(src, false, idx)}
                      title="Auto-Crop Banner / Phone"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ea580c',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Sparkles size={11} />
                    </button>

                    <button
                      type="button"
                      disabled={idx === galleryImages.length - 1}
                      onClick={() => handleMoveGalleryImage(idx, 'right')}
                      title="Move Right"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: idx === galleryImages.length - 1 ? 'default' : 'pointer',
                        color: idx === galleryImages.length - 1 ? '#cbd5e1' : '#475569',
                        padding: '2px'
                      }}
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload Dropzone for Gallery */}
              <label style={{
                width: '120px',
                height: '115px',
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
                <span>{uploadingGallery ? 'Uploading...' : '+ Upload Photos'}</span>
                <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>Select 1 or more</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingGallery}
                />
              </label>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Description
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
                  {descMode === 'plain'
                    ? 'Plain text mode (user-friendly). Type normally with paragraphs and bullet points.'
                    : 'HTML mode. Edit raw markup directly.'}
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px', border: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (descMode !== 'plain') {
                      setDescription(htmlToCleanPlainText(description));
                      setDescMode('plain');
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    background: descMode === 'plain' ? '#ffffff' : 'transparent',
                    color: descMode === 'plain' ? '#ff6600' : '#64748b',
                    boxShadow: descMode === 'plain' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <FileText size={13} /> Plain Text (Easy)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (descMode !== 'html') {
                      setDescription(plainTextToCleanHtml(description));
                      setDescMode('html');
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    background: descMode === 'html' ? '#ffffff' : 'transparent',
                    color: descMode === 'html' ? '#ff6600' : '#64748b',
                    boxShadow: descMode === 'html' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Code size={13} /> HTML Code
                </button>
              </div>
            </div>

            {/* Formatting toolbar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => descMode === 'plain' ? insertFormatting('**', '**') : insertFormatting('<strong>', '</strong>')}
                  style={{ background: 'none', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, color: '#334155' }}
                  title="Bold"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => descMode === 'plain' ? insertFormatting('*', '*') : insertFormatting('<em>', '</em>')}
                  style={{ background: 'none', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontStyle: 'italic', color: '#334155' }}
                  title="Italic"
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => descMode === 'plain' ? insertFormatting('## ') : insertFormatting('<h2>', '</h2>')}
                  style={{ background: 'none', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', color: '#334155' }}
                  title="Heading"
                >
                  <Heading2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => descMode === 'plain' ? insertFormatting('• ') : insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
                  style={{ background: 'none', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', color: '#334155' }}
                  title="Bullet List"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => descMode === 'plain' ? insertFormatting('[Link Text](https://...)') : insertFormatting('<a href="https://..." target="_blank">', '</a>')}
                  style={{ background: 'none', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', color: '#334155' }}
                  title="Link"
                >
                  <LinkIcon size={14} />
                </button>
                {descMode === 'html' && (
                  <button
                    type="button"
                    onClick={() => insertFormatting('<table>\n  <tr><th>Header</th></tr>\n  <tr><td>Value</td></tr>\n</table>')}
                    style={{ background: 'none', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', color: '#334155' }}
                    title="Table"
                  >
                    <TableIcon size={14} />
                  </button>
                )}
              </div>

              {/* Clean HTML / Format Helper */}
              <button
                type="button"
                onClick={() => {
                  setDescription(htmlToCleanPlainText(description));
                  setDescMode('plain');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
                title="Remove messy HTML tags and clean up text formatting"
              >
                <Sparkles size={12} color="#ff6600" /> Clean to Plain Text
              </button>
            </div>

            <textarea
              id="desc-editor"
              className="form-textarea"
              rows={10}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter product description in simple plain text. Paragraphs and bullet points are automatically formatted for the website."
              style={{
                borderRadius: '0 0 8px 8px',
                fontSize: '13px',
                lineHeight: 1.6,
                fontFamily: descMode === 'html' ? 'monospace' : 'inherit'
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
                {mainImage || galleryImages[0] ? (
                  <img
                    src={mainImage || galleryImages[0]}
                    alt={title || 'Product'}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/admin/product-placeholder.svg';
                    }}
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

      {croppingTarget && (
        <ImageCropperModal
          imageUrl={croppingTarget.url}
          title={croppingTarget.isMain ? 'Crop Main Product Image' : `Crop Gallery Image #${(croppingTarget.galleryIdx || 0) + 1}`}
          onClose={() => setCroppingTarget(null)}
          onCropComplete={(newCroppedUrl) => {
            if (croppingTarget.isMain) {
              setMainImage(newCroppedUrl);
            } else if (croppingTarget.galleryIdx !== undefined) {
              const updated = [...galleryImages];
              updated[croppingTarget.galleryIdx] = newCroppedUrl;
              setGalleryImages(updated);
            }
            setCroppingTarget(null);
          }}
        />
      )}

    </div>
  );
};