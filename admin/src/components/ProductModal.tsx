import React, { useState, useEffect } from 'react';
import { Product, Category, Brand } from '../types';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { adminApi } from '../api';

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
  const [brand, setBrand] = useState(product?.brand || (brands[0]?.name || 'Nano Power'));
  const [stock, setStock] = useState(product?.stock !== undefined ? product.stock : 10);
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || '');
  const [description, setDescription] = useState(product?.description || '');
  const [images, setImages] = useState<string[]>(product?.images && product.images.length > 0 ? product.images : ['']);
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

  const handleAddImageField = () => setImages([...images, '']);
  const handleImageChange = (val: string, index: number) => {
    const copy = [...images];
    copy[index] = val;
    setImages(copy);
  };
  const handleRemoveImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || !e.target.files[0]) return;
    try {
      setUploading(true);
      const url = await adminApi.uploadImage(e.target.files[0]);
      handleImageChange(url, index);
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

    const cleanImages = images.filter(img => img.trim() !== '');

    await onSave({
      title,
      price: Number(price),
      oldPrice: Number(oldPrice),
      category,
      brand,
      stock: Number(stock),
      shortDescription,
      description,
      images: cleanImages.length > 0 ? cleanImages : ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&q=80'],
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

            {/* Multiple Images */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0 }}>Product Images (URL or Upload)</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddImageField}>
                  <Plus size={14} /> Add Image
                </button>
              </div>
              {images.map((img, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://..."
                    value={img}
                    onChange={e => handleImageChange(e.target.value, i)}
                  />
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={14} />
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, i)} />
                  </label>
                  {images.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveImage(i)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {uploading && <p style={{ fontSize: '12px', color: '#ff6600' }}>Uploading image...</p>}
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
