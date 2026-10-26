import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { adminApi } from '../api';
import { Save, Check, Upload } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'footerLogo') => {
    if (!e.target.files || !e.target.files[0] || !settings) return;
    try {
      setUploading(true);
      const url = await adminApi.uploadImage(e.target.files[0]);
      setSettings({ ...settings, [field]: url });
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSaving(true);
      await adminApi.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div style={{ padding: '30px' }}>Loading settings...</div>;
  }

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Global Site Settings</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Configure contact phone numbers, delivery rates, branding logos, and social channels.</p>
      </div>

      <form onSubmit={handleSave}>
        {/* General Information */}
        <div className="table-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            Brand & Contact Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Site Name</label>
              <input
                type="text"
                className="form-input"
                value={settings.siteName}
                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Support Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Site Tagline</label>
            <input
              type="text"
              className="form-input"
              value={settings.tagline}
              onChange={e => setSettings({ ...settings, tagline: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Support Email Address</label>
              <input
                type="email"
                className="form-input"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Office / Showroom Address</label>
              <input
                type="text"
                className="form-input"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </div>

          {/* Logos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
            <div className="form-group">
              <label className="form-label">Header Logo URL or Upload</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={settings.logo}
                  onChange={e => setSettings({ ...settings, logo: e.target.value })}
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, 'logo')} />
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Footer Logo URL</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={settings.footerLogo}
                  onChange={e => setSettings({ ...settings, footerLogo: e.target.value })}
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, 'footerLogo')} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Rates */}
        <div className="table-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            Bangladesh Delivery Shipping Rates
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Inside Dhaka City Delivery Fee (৳)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={settings.deliveryRates.insideDhaka}
                onChange={e => setSettings({
                  ...settings,
                  deliveryRates: { ...settings.deliveryRates, insideDhaka: Number(e.target.value) }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Outside Dhaka (All 64 Districts) Fee (৳)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={settings.deliveryRates.outsideDhaka}
                onChange={e => setSettings({
                  ...settings,
                  deliveryRates: { ...settings.deliveryRates, outsideDhaka: Number(e.target.value) }
                })}
              />
            </div>
          </div>
        </div>

        {/* Social & Chat Widgets */}
        <div className="table-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            Social Channels & Floating Chat Widgets
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">WhatsApp Contact Number (Floating Widget)</label>
              <input
                type="text"
                className="form-input"
                placeholder="+8801733115391"
                value={settings.socialLinks.whatsapp}
                onChange={e => setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, whatsapp: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Facebook Page / Messenger Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="maxitshop"
                value={settings.socialLinks.messenger}
                onChange={e => setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, messenger: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Facebook URL</label>
              <input
                type="text"
                className="form-input"
                value={settings.socialLinks.facebook}
                onChange={e => setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, facebook: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">YouTube URL</label>
              <input
                type="text"
                className="form-input"
                value={settings.socialLinks.youtube}
                onChange={e => setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, youtube: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }} disabled={saving}>
            {savedSuccess ? <><Check size={18} /> Settings Saved!</> : <><Save size={18} /> Save All Settings</>}
          </button>
        </div>
      </form>
    </div>
  );
};
