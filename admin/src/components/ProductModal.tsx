import React, { useState, useEffect } from 'react';
import { Product, Category, Brand } from '../types';
import { X, Plus, Trash2, Upload, ArrowLeft, ArrowRight } from 'lucide-react';
import { adminApi } from '../api';
import { htmlToCleanPlainText, plainTextToCleanHtml } from '../utils/htmlTextConverter';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  categories,
  brands,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(product?.title || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [oldPrice, setOldPrice] = useState(product?.oldPrice || 0);
  const [category, setCategory] = useState(product?.category || (categories[0]?.slug || ''));
  const [subcategory, setSubcategory] = useState(product?.subcategory || '');
  const [availableSubcats, setAvailableSubcats] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [brand, setBrand] = useState(product?.brand || (brands[0]?.name || 'Nano Power'));
  const [stock, setStock] = useState(product?.stock !== undefined ? product.stock : 10);
  const [productCode, setProductCode] = useState(product?.productCode || '');
  const [warranty, setWarranty] = useState(product?.warranty || '');
  const [keyFeaturesText, setKeyFeaturesText] = useState((product?.keyFeatures || []).join('\n'));
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || '');
  const [description, setDescription] = useState(() => htmlToCleanPlainText(product?.description || ''));
  // Separate Main Image (1 image) & Gallery Images (Multiple, reorderable)
  const [mainImage, setMainImage] = useState<string>(() => {
    return product?.image || (product?.images && product.images[0]) || '';
  });
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    const raw = product?.images || [];
    const main = product?.image || raw[0] || '';
    return raw.filter((img, i) => {
      if (!img) return false;
      if (img === main && i === 0) return false;
      return true;
    });
  });
  const [isDeal, setIsDeal] = useState(product?.isDeal || false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [isNewItem, setIsNewItem] = useState(product?.isNewItem || false);
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product && product.specs) {
      const arr = Object.entries(product.specs).map(([key, value]) => ({ key, value }));
      setSpecs(arr);
    } else {
      setSpecs([{ key: 'Warranty', value: '1 Year Warranty' }]);
    }
  }, [product]);

  useEffect(() => {
    if (!category) {
      setAvailableSubcats([]);
      return;
    }
    const cat = categories.find(c => c.slug === category || c.id === category) ||
      categories.flatMap(m => m.children || []).find(c => c.slug === category || c.id === category);
    if (cat && cat.subcategories && cat.subcategories.length > 0) {
      setAvailableSubcats(cat.subcategories.map(s => ({
        id: s.id || s.slug,
        name: s.name,
        slug: s.slug
      })));
    } else {
      adminApi.getSubcategories(category)
        .then(subs => setAvailableSubcats(subs))
        .catch(() => setAvailableSubcats([]));
    }
    if (!product) setSubcategory('');
  }, [category, categories]);

  // Main Image Upload
  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    try {
      setUploading(true);
      const url = await adminApi.uploadImage(e.target.files[0]);
      setMainImage(url);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Gallery Handlers
  const handleAddGalleryField = () => setGalleryImages([...galleryImages, '']);
  const handleGalleryChange = (val: string, index: number) => {
    const copy = [...galleryImages];
    copy[index] = val;
    setGalleryImages(copy);
  };
  const handleRemoveGallery = (index: number) => setGalleryImages(galleryImages.filter((_, i) => i !== index));
  const handleMoveGallery = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= galleryImages.length) return;
    const copy = [...galleryImages];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    setGalleryImages(copy);
  };
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploading(true);
      const files = Array.from(e.target.files);
      const urls: string[] = [];
      for (const f of files) {
        const u = await adminApi.uploadImage(f);
        urls.push(u);
      }
      setGalleryImages([...galleryImages, ...urls]);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const handleSpecChange = (field: 'key' | 'value', val: string, index: number) => {
    const copy = [...specs];
    copy[index][field] = val;
    setSpecs(copy);
  };
  const handleRemoveSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Title is required');

    setSaving(true);
    const specsMap: Record<string, string> = {};
    specs.forEach(s => {
      if (s.key.trim()) specsMap[s.key.trim()] = s.value.trim();
    });

    const cleanMain = mainImage.trim();
    const cleanGallery = galleryImages.filter(img => img && img.trim() !== '' && img !== cleanMain);
    const allImages = cleanMain ? [cleanMain, ...cleanGallery] : cleanGallery;

    const cleanKeyFeatures = keyFeaturesText
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    await onSave({
      title,
      price: Number(price),
      oldPrice: Number(oldPrice),
      category,
      subcategory: subcategory || undefined,
      subcategoryName: subcategory
        ? (availableSubcats.find(s => s.slug === subcategory)?.name || subcategory)
        : undefined,
      brand,
      stock: Number(stock),
      productCode: productCode.trim(),
      warranty: warranty.trim(),
      keyFeatures: cleanKeyFeatures,
      shortDescription,
      description: plainTextToCleanHtml(description),
      image: cleanMain || (allImages[0] || ''),
      images: allImages.length > 0 ? allImages : [],
      specs: specsMap,
      isDeal,
      isFeatured,
      isNewItem
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '17px', fontWeight: 600 }}>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Product Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Lifepo4 3.2V 173Ah Grade A Battery"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Price (৳ BDT) *</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>If ৳0, displays "Call for price"</span>
              </div>
              <div className="form-group">
                <label className="form-label">Old / Regular Price (৳)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={oldPrice}
                  onChange={e => setOldPrice(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Units</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={stock}
                  onChange={e => setStock(Number(e.target.value))}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <select className="form-select" value={brand} onChange={e => setBrand(e.target.value)}>
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
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
              {availableSubcats.length === 0 && (
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  No subcategories for this category.
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Product Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 51939"
                  value={productCode}
                  onChange={e => setProductCode(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Warranty</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 5 Years Official Warranty"
                  value={warranty}
                  onChange={e => setWarranty(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Key Features (One bullet per line)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder={"Rated Power: 6000W\nMax Charge Current: 100A\nIP65 Protection Grade"}
                value={keyFeaturesText}
                onChange={e => setKeyFeaturesText(e.target.value)}
              />
            </div>

            {/* Badges / Checkboxes */}
            <div style={{ display: 'flex', gap: '20px', padding: '10px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isDeal} onChange={e => setIsDeal(e.target.checked)} />
                🔥 Hot Deal
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                ⭐ Featured
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isNewItem} onChange={e => setIsNewItem(e.target.checked)} />
                ✨ New Arrival
              </label>
            </div>

            {/* Main Product Image (One only) */}
            <div className="form-group" style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>Main Product Image</label>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Shown on cards and as hero photo</p>
                </div>
                {mainImage && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMainImage('')} style={{ color: '#ef4444' }}>
                    Remove
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://... or upload"
                  value={mainImage}
                  onChange={e => setMainImage(e.target.value)}
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <Upload size={14} /> Upload
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleMainUpload} />
                </label>
              </div>
              {mainImage && (
                <div style={{ marginTop: '8px' }}>
                  <img
                    src={mainImage}
                    alt="Main Preview"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/admin/product-placeholder.svg';
                    }}
                    style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
                  />
                </div>
              )}
            </div>

            {/* Gallery Images (Multiple, reorderable) */}
            <div className="form-group" style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>Gallery Images ({galleryImages.length})</label>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Reorder with ← → buttons</p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={14} /> Upload Multi
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryUpload} />
                  </label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddGalleryField}>
                    <Plus size={14} /> Add URL
                  </button>
                </div>
              </div>
              {galleryImages.map((img, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => handleMoveGallery(i, 'left')}
                    className="btn btn-secondary btn-sm"
                    title="Move Up"
                    style={{ padding: '4px 6px' }}
                  >
                    <ArrowLeft size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={i === galleryImages.length - 1}
                    onClick={() => handleMoveGallery(i, 'right')}
                    className="btn btn-secondary btn-sm"
                    title="Move Down"
                    style={{ padding: '4px 6px' }}
                  >
                    <ArrowRight size={12} />
                  </button>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://..."
                    value={img}
                    onChange={e => handleGalleryChange(e.target.value, i)}
                  />
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveGallery(i)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {uploading && <p style={{ fontSize: '12px', color: '#ff6600', margin: '4px 0 0 0' }}>Uploading...</p>}
            </div>

            {/* Specifications */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>Specifications (Key-Value)</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSpec}>
                  <Plus size={14} /> Add Spec
                </button>
              </div>
              {specs.map((s, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Capacity"
                    value={s.key}
                    onChange={e => handleSpecChange('key', e.target.value, idx)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 173Ah"
                    value={s.value}
                    onChange={e => handleSpecChange('value', e.target.value, idx)}
                  />
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveSpec(idx)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Short Description</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Description</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
