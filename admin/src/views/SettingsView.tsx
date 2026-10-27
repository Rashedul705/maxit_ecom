import React, { useState, useEffect } from 'react';
import { SiteSettings, NavLinkItem, TrustFeature } from '../types';
import { adminApi } from '../api';
import {
  Save,
  Check,
  Upload,
  Globe,
  Truck,
  Menu as MenuIcon,
  Sparkles,
  LayoutTemplate,
  PhoneCall,
  Share2,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Info
} from 'lucide-react';

type SettingsTab =
  | 'general'
  | 'delivery'
  | 'header_nav'
  | 'hero'
  | 'footer'
  | 'contact'
  | 'social'
  | 'policies'
  | 'seo';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [policyTab, setPolicyTab] = useState<'terms' | 'privacy' | 'returnPolicy' | 'warranty' | 'shipping'>('terms');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSettings();

      // Ensure all tabs and nested objects have robust defaults
      const merged: SiteSettings = {
        ...data,
        siteName: data.siteName || 'maxitshop',
        tagline: data.tagline || 'Your Trusted Solar & Energy Solutions Partner in Bangladesh',
        logo: data.logo || '',
        footerLogo: data.footerLogo || '',
        favicon: data.favicon || '',
        phone: data.phone || '+880 1733-115391',
        email: data.email || 'support@maxitshop.com',
        address: data.address || 'Dhaka, Bangladesh',
        deliveryRates: {
          insideDhaka: data.deliveryRates?.insideDhaka ?? 70,
          outsideDhaka: data.deliveryRates?.outsideDhaka ?? 130,
          freeDeliveryThreshold: data.deliveryRates?.freeDeliveryThreshold ?? 0,
          insideDhakaTime: data.deliveryRates?.insideDhakaTime || '24 - 48 Hours',
          outsideDhakaTime: data.deliveryRates?.outsideDhakaTime || '2 - 4 Days',
          codAvailable: data.deliveryRates?.codAvailable ?? true,
          codNote: data.deliveryRates?.codNote || 'Cash on delivery available across all 64 districts of Bangladesh.'
        },
        header: {
          showAnnouncement: data.header?.showAnnouncement ?? true,
          announcementText: data.header?.announcementText || '⚡ Special Discount on LiFePO4 & Solar Inverters - Fast Delivery Across Bangladesh 🇧🇩',
          announcementLink: data.header?.announcementLink || '/#deals',
          hotline: data.header?.hotline || data.phone || '+880 1733-115391',
          supportHours: data.header?.supportHours || 'Sat - Thu: 9:00 AM - 8:00 PM'
        },
        navLinks: Array.isArray(data.navLinks) && data.navLinks.length > 0 ? data.navLinks : [
          { label: 'All Products', url: '/category/all', isExternal: false },
          { label: 'LiFePO4 Batteries', url: '/category/lifepo4', isExternal: false },
          { label: 'Smart BMS', url: '/category/bms', isExternal: false },
          { label: 'Solar Inverters', url: '/category/solar-inverters', isExternal: false },
          { label: 'Hot Deals', url: '/#deals', isExternal: false },
          { label: 'Brand Directory', url: '/#brands', isExternal: false },
          { label: 'Verified Sellers', url: '/sellers', isExternal: false },
          { label: 'Track Order', url: '/track-order', isExternal: false }
        ],
        hero: {
          badge: data.hero?.badge || '🇧🇩 Premier Solar & LiFePO4 Energy Store in Bangladesh',
          headline: data.hero?.headline || 'Powering Bangladesh With High-Performance Solar & Battery Systems',
          subheadline: data.hero?.subheadline || 'Explore genuine Grade-A LiFePO4 cells, active balance smart BMS, MPPT solar controllers, pure sine wave inverters, and industrial equipment.',
          primaryBtnText: data.hero?.primaryBtnText || 'Shop Best Deals',
          primaryBtnUrl: data.hero?.primaryBtnUrl || '/#deals',
          secondaryBtnText: data.hero?.secondaryBtnText || 'Track Your Order',
          secondaryBtnUrl: data.hero?.secondaryBtnUrl || '/track-order',
          trustFeatures: Array.isArray(data.hero?.trustFeatures) && data.hero.trustFeatures.length > 0 ? data.hero.trustFeatures : [
            { title: '100% Genuine Cells', description: 'Tested Grade-A with guaranteed capacity', icon: 'ShieldCheck' },
            { title: 'Fast BD Delivery', description: 'Inside Dhaka in 24h, nationwide in 48h', icon: 'Truck' },
            { title: 'Technical Support', description: 'Expert engineering advice on WhatsApp', icon: 'Wrench' },
            { title: 'Official Warranty', description: 'Authentic manufacturer replacement backup', icon: 'Award' }
          ]
        },
        footer: {
          aboutText: data.footer?.aboutText || 'MaxiTShop is Bangladesh\'s leading store for high-capacity LiFePO4 battery cells, solar inverters, smart BMS modules, and industrial electronics with authentic manufacturer warranties.',
          copyrightText: data.footer?.copyrightText || '© 2026 MaxiTShop. All rights reserved. Trusted Engineering & Green Energy Solutions.',
          newsletterTitle: data.footer?.newsletterTitle || 'Stay Updated On New Arrivals & Technical Guides',
          newsletterSubtitle: data.footer?.newsletterSubtitle || 'Subscribe to receive exclusive deals, technical data sheets, and battery building tutorials.',
          paymentBannerText: data.footer?.paymentBannerText || 'Cash on Delivery Available Nationwide • bKash • Nagad • Bank Transfer'
        },
        contact: {
          phone: data.contact?.phone || data.phone || '+880 1733-115391',
          whatsapp: data.contact?.whatsapp || data.socialLinks?.whatsapp || '+8801733115391',
          email: data.contact?.email || data.email || 'support@maxitshop.com',
          address: data.contact?.address || data.address || 'House 45, Road 7, Dhanmondi, Dhaka, Bangladesh',
          googleMapsUrl: data.contact?.googleMapsUrl || 'https://maps.google.com',
          supportHours: data.contact?.supportHours || 'Saturday - Thursday: 9:00 AM - 8:00 PM (Friday Closed)'
        },
        socialLinks: {
          facebook: data.socialLinks?.facebook || 'https://facebook.com/maxitshop',
          instagram: data.socialLinks?.instagram || 'https://instagram.com/maxitshop',
          youtube: data.socialLinks?.youtube || 'https://youtube.com/@maxitshop',
          whatsapp: data.socialLinks?.whatsapp || '+8801733115391',
          messenger: data.socialLinks?.messenger || 'maxitshop',
          linkedin: data.socialLinks?.linkedin || 'https://linkedin.com/company/maxitshop'
        },
        policies: {
          terms: data.policies?.terms || '',
          privacy: data.policies?.privacy || '',
          returnPolicy: data.policies?.returnPolicy || '',
          warranty: data.policies?.warranty || '',
          shipping: data.policies?.shipping || ''
        },
        metaTags: {
          title: data.metaTags?.title || 'maxitshop - Solar & Engineering Store Bangladesh',
          description: data.metaTags?.description || 'Buy solar panels, batteries, BMS, inverters, power tools and electronics parts in Bangladesh with Cash on Delivery.',
          keywords: data.metaTags?.keywords || 'solar panels, lifepo4 battery, bms, inverter, bangladesh, engineering'
        }
      };

      setSettings(merged);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || !e.target.files[0] || !settings) return;
    try {
      setUploadingField(fieldName);
      const url = await adminApi.uploadImage(e.target.files[0]);

      if (fieldName === 'logo') setSettings({ ...settings, logo: url });
      else if (fieldName === 'footerLogo') setSettings({ ...settings, footerLogo: url });
      else if (fieldName === 'favicon') setSettings({ ...settings, favicon: url });
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  // Nav Links Helpers
  const addNavLink = () => {
    if (!settings) return;
    const current = settings.navLinks || [];
    setSettings({
      ...settings,
      navLinks: [...current, { label: 'New Link', url: '/', isExternal: false }]
    });
  };

  const updateNavLink = (index: number, field: keyof NavLinkItem, value: any) => {
    if (!settings || !settings.navLinks) return;
    const updated = [...settings.navLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, navLinks: updated });
  };

  const removeNavLink = (index: number) => {
    if (!settings || !settings.navLinks) return;
    const updated = settings.navLinks.filter((_, i) => i !== index);
    setSettings({ ...settings, navLinks: updated });
  };

  // Hero Trust Feature Helpers
  const updateTrustFeature = (index: number, field: keyof TrustFeature, value: string) => {
    if (!settings || !settings.hero) return;
    const features = [...(settings.hero.trustFeatures || [])];
    features[index] = { ...features[index], [field]: value };
    setSettings({
      ...settings,
      hero: { ...settings.hero, trustFeatures: features }
    });
  };

  if (loading || !settings) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading Site Settings...</div>
        <p style={{ fontSize: '13px', marginTop: '6px' }}>Fetching configuration from MongoDB Atlas...</p>
      </div>
    );
  }

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
    { id: 'general', label: 'General & Logos', icon: <Globe size={16} /> },
    { id: 'delivery', label: 'Delivery & Shipping', icon: <Truck size={16} /> },
    { id: 'header_nav', label: 'Header & Nav', icon: <MenuIcon size={16} /> },
    { id: 'hero', label: 'Hero Section', icon: <Sparkles size={16} /> },
    { id: 'footer', label: 'Footer & Newsletter', icon: <LayoutTemplate size={16} /> },
    { id: 'contact', label: 'Contact Info', icon: <PhoneCall size={16} /> },
    { id: 'social', label: 'Social & Chat', icon: <Share2 size={16} /> },
    { id: 'policies', label: 'Terms & Policies', icon: <ShieldCheck size={16} /> },
    { id: 'seo', label: 'SEO & Meta', icon: <Search size={16} /> }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Global Site Settings</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            Full control panel for brand identities, delivery charges, header, nav, hero, footer, contact info, and legal policies.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontSize: '14px', boxShadow: '0 4px 12px rgba(255, 102, 0, 0.25)' }}
          disabled={saving}
        >
          {savedSuccess ? <><Check size={16} /> Saved to Database!</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      {/* Tabs Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '2px',
          marginBottom: '24px'
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: isActive ? '#fff' : 'transparent',
                color: isActive ? '#ff6600' : '#64748b',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13.5px',
                borderRadius: '8px 8px 0 0',
                borderBottom: isActive ? '3px solid #ff6600' : '3px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave}>
        {/* ================= TAB 1: GENERAL & LOGOS ================= */}
        {activeTab === 'general' && (
          <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              Branding & Logos
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Store / Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.siteName}
                  onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline / Motto</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.tagline}
                  onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                />
              </div>
            </div>

            {/* Logo Uploads */}
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              {/* Header Logo */}
              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Header Logo</label>
                <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '6px', marginBottom: '10px', overflow: 'hidden' }}>
                  {settings.logo ? (
                    <img src={settings.logo} alt="Header Logo" style={{ maxHeight: '50px', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>No logo selected</span>
                  )}
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Image URL https://..."
                  style={{ fontSize: '12px', marginBottom: '8px' }}
                  value={settings.logo}
                  onChange={e => setSettings({ ...settings, logo: e.target.value })}
                />
                <label className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                  <Upload size={14} />
                  {uploadingField === 'logo' ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, 'logo')} />
                </label>
              </div>

              {/* Footer Logo */}
              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Footer Logo</label>
                <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', border: '1px dashed #475569', borderRadius: '6px', marginBottom: '10px', overflow: 'hidden' }}>
                  {settings.footerLogo ? (
                    <img src={settings.footerLogo} alt="Footer Logo" style={{ maxHeight: '50px', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Dark background preview</span>
                  )}
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Image URL https://..."
                  style={{ fontSize: '12px', marginBottom: '8px' }}
                  value={settings.footerLogo}
                  onChange={e => setSettings({ ...settings, footerLogo: e.target.value })}
                />
                <label className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                  <Upload size={14} />
                  {uploadingField === 'footerLogo' ? 'Uploading...' : 'Upload Image'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, 'footerLogo')} />
                </label>
              </div>

              {/* Favicon */}
              <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#fafafa' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Browser Favicon</label>
                <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '6px', marginBottom: '10px' }}>
                  {settings.favicon ? (
                    <img src={settings.favicon} alt="Favicon" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>32x32 icon preview</span>
                  )}
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Favicon URL"
                  style={{ fontSize: '12px', marginBottom: '8px' }}
                  value={settings.favicon}
                  onChange={e => setSettings({ ...settings, favicon: e.target.value })}
                />
                <label className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                  <Upload size={14} />
                  {uploadingField === 'favicon' ? 'Uploading...' : 'Upload Icon'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, 'favicon')} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: DELIVERY & SHIPPING ================= */}
        {activeTab === 'delivery' && (
          <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              Shipping Charges & Delivery Timelines (Bangladesh)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Inside Dhaka City Delivery Charge (৳)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={settings.deliveryRates.insideDhaka}
                  onChange={e => setSettings({
                    ...settings,
                    deliveryRates: { ...settings.deliveryRates, insideDhaka: Number(e.target.value) }
                  })}
                  required
                />
                <span style={{ fontSize: '12px', color: '#64748b' }}>Standard metropolitan courier fee</span>
              </div>

              <div className="form-group">
                <label className="form-label">Outside Dhaka (All 64 Districts) Delivery Charge (৳)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={settings.deliveryRates.outsideDhaka}
                  onChange={e => setSettings({
                    ...settings,
                    deliveryRates: { ...settings.deliveryRates, outsideDhaka: Number(e.target.value) }
                  })}
                  required
                />
                <span style={{ fontSize: '12px', color: '#64748b' }}>Currier / SA Paribahan / Sundarban fee</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Free Delivery Threshold (৳)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={settings.deliveryRates.freeDeliveryThreshold ?? 0}
                  onChange={e => setSettings({
                    ...settings,
                    deliveryRates: { ...settings.deliveryRates, freeDeliveryThreshold: Number(e.target.value) }
                  })}
                />
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Set 0 to disable free delivery promotion</span>
              </div>

              <div className="form-group">
                <label className="form-label">Inside Dhaka Estimated Time</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.deliveryRates.insideDhakaTime || '24 - 48 Hours'}
                  onChange={e => setSettings({
                    ...settings,
                    deliveryRates: { ...settings.deliveryRates, insideDhakaTime: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Outside Dhaka Estimated Time</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.deliveryRates.outsideDhakaTime || '2 - 4 Days'}
                  onChange={e => setSettings({
                    ...settings,
                    deliveryRates: { ...settings.deliveryRates, outsideDhakaTime: e.target.value }
                  })}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  id="codToggle"
                  checked={settings.deliveryRates.codAvailable ?? true}
                  onChange={e => setSettings({
                    ...settings,
                    deliveryRates: { ...settings.deliveryRates, codAvailable: e.target.checked }
                  })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="codToggle" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                  Enable Cash on Delivery (COD) for Checkout
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Cash on Delivery Notice / Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.deliveryRates.codNote || ''}
                  onChange={e => setSettings({
                    ...settings,
                    deliveryRates: { ...settings.deliveryRates, codNote: e.target.value }
                  })}
                  placeholder="e.g. Inspect packages before payment..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: HEADER & NAVIGATION ================= */}
        {activeTab === 'header_nav' && (
          <div className="table-card" style={{ padding: '24px' }}>
            {/* Top Announcement Bar */}
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              Header Top Announcement Bar
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <input
                type="checkbox"
                id="showAnnouncement"
                checked={settings.header?.showAnnouncement ?? true}
                onChange={e => setSettings({
                  ...settings,
                  header: {
                    ...settings.header!,
                    showAnnouncement: e.target.checked
                  }
                })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="showAnnouncement" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                Display Announcement Bar on Top of Storefront
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">Announcement Text</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.header?.announcementText || ''}
                  onChange={e => setSettings({
                    ...settings,
                    header: {
                      ...settings.header!,
                      announcementText: e.target.value
                    }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Announcement Target Link</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="/#deals"
                  value={settings.header?.announcementLink || ''}
                  onChange={e => setSettings({
                    ...settings,
                    header: {
                      ...settings.header!,
                      announcementLink: e.target.value
                    }
                  })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">Header Hotline Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.header?.hotline || ''}
                  onChange={e => setSettings({
                    ...settings,
                    header: {
                      ...settings.header!,
                      hotline: e.target.value
                    }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Customer Support Working Hours</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.header?.supportHours || ''}
                  onChange={e => setSettings({
                    ...settings,
                    header: {
                      ...settings.header!,
                      supportHours: e.target.value
                    }
                  })}
                />
              </div>
            </div>

            {/* Navigation Menu Links */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Main Navigation Menu Links</h3>
              <button type="button" onClick={addNavLink} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add Menu Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(settings.navLinks || []).map((link, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 100px 40px', gap: '10px', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Link Label"
                    value={link.label}
                    onChange={e => updateNavLink(idx, 'label', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="/category/slug or https://..."
                    value={link.url}
                    onChange={e => updateNavLink(idx, 'url', e.target.value)}
                  />
                  <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#64748b' }}>
                    <input
                      type="checkbox"
                      checked={link.isExternal ?? false}
                      onChange={e => updateNavLink(idx, 'isExternal', e.target.checked)}
                    />
                    New Tab
                  </label>
                  <button
                    type="button"
                    onClick={() => removeNavLink(idx)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '6px' }}
                    title="Remove Link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: HERO SECTION ================= */}
        {activeTab === 'hero' && (
          <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              Homepage Hero Section & Call To Actions
            </h3>

            <div className="form-group">
              <label className="form-label">Hero Top Highlight Badge</label>
              <input
                type="text"
                className="form-input"
                value={settings.hero?.badge || ''}
                onChange={e => setSettings({
                  ...settings,
                  hero: { ...settings.hero!, badge: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Main Hero Headline</label>
              <textarea
                className="form-input"
                rows={2}
                value={settings.hero?.headline || ''}
                onChange={e => setSettings({
                  ...settings,
                  hero: { ...settings.hero!, headline: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subheadline / Supporting Pitch</label>
              <textarea
                className="form-input"
                rows={3}
                value={settings.hero?.subheadline || ''}
                onChange={e => setSettings({
                  ...settings,
                  hero: { ...settings.hero!, subheadline: e.target.value }
                })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Primary Button (Action)</h4>
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Button Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.hero?.primaryBtnText || ''}
                    onChange={e => setSettings({
                      ...settings,
                      hero: { ...settings.hero!, primaryBtnText: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Target URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.hero?.primaryBtnUrl || ''}
                    onChange={e => setSettings({
                      ...settings,
                      hero: { ...settings.hero!, primaryBtnUrl: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Secondary Button</h4>
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Button Text</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.hero?.secondaryBtnText || ''}
                    onChange={e => setSettings({
                      ...settings,
                      hero: { ...settings.hero!, secondaryBtnText: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Target URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.hero?.secondaryBtnUrl || ''}
                    onChange={e => setSettings({
                      ...settings,
                      hero: { ...settings.hero!, secondaryBtnUrl: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Trust Highlights */}
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>4 Hero Trust Highlights (Cards under Hero)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {(settings.hero?.trustFeatures || []).slice(0, 4).map((feat, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff6600', textTransform: 'uppercase' }}>Feature {idx + 1}</span>
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: '4px', marginBottom: '6px', fontWeight: 600 }}
                    placeholder="Feature Title"
                    value={feat.title}
                    onChange={e => updateTrustFeature(idx, 'title', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ fontSize: '12.5px' }}
                    placeholder="Description text"
                    value={feat.description}
                    onChange={e => updateTrustFeature(idx, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: FOOTER & NEWSLETTER ================= */}
        {activeTab === 'footer' && (
          <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              Footer Information & Newsletter Box
            </h3>

            <div className="form-group">
              <label className="form-label">About Store Text (Footer Left Column)</label>
              <textarea
                className="form-input"
                rows={3}
                value={settings.footer?.aboutText || ''}
                onChange={e => setSettings({
                  ...settings,
                  footer: { ...settings.footer!, aboutText: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Copyright Notice Text</label>
              <input
                type="text"
                className="form-input"
                value={settings.footer?.copyrightText || ''}
                onChange={e => setSettings({
                  ...settings,
                  footer: { ...settings.footer!, copyrightText: e.target.value }
                })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Newsletter Banner Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.footer?.newsletterTitle || ''}
                  onChange={e => setSettings({
                    ...settings,
                    footer: { ...settings.footer!, newsletterTitle: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Newsletter Subtitle / Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.footer?.newsletterSubtitle || ''}
                  onChange={e => setSettings({
                    ...settings,
                    footer: { ...settings.footer!, newsletterSubtitle: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '10px' }}>
              <label className="form-label">Payment Accepted Methods Banner Text</label>
              <input
                type="text"
                className="form-input"
                value={settings.footer?.paymentBannerText || ''}
                onChange={e => setSettings({
                  ...settings,
                  footer: { ...settings.footer!, paymentBannerText: e.target.value }
                })}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 6: CONTACT INFORMATION ================= */}
        {activeTab === 'contact' && (
          <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              Store Contact, Office & Showroom Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Customer Support Phone Hotline</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.contact?.phone || settings.phone}
                  onChange={e => setSettings({
                    ...settings,
                    phone: e.target.value,
                    contact: { ...settings.contact!, phone: e.target.value }
                  })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Helpline Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.contact?.whatsapp || settings.socialLinks.whatsapp}
                  onChange={e => setSettings({
                    ...settings,
                    contact: { ...settings.contact!, whatsapp: e.target.value },
                    socialLinks: { ...settings.socialLinks, whatsapp: e.target.value }
                  })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Official Support Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={settings.contact?.email || settings.email}
                  onChange={e => setSettings({
                    ...settings,
                    email: e.target.value,
                    contact: { ...settings.contact!, email: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Showroom Business & Working Hours</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.contact?.supportHours || ''}
                  onChange={e => setSettings({
                    ...settings,
                    contact: { ...settings.contact!, supportHours: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Physical Showroom / Warehouse Address</label>
              <textarea
                className="form-input"
                rows={2}
                value={settings.contact?.address || settings.address}
                onChange={e => setSettings({
                  ...settings,
                  address: e.target.value,
                  contact: { ...settings.contact!, address: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Google Maps Location Link / Embed URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://maps.google.com/..."
                value={settings.contact?.googleMapsUrl || ''}
                onChange={e => setSettings({
                  ...settings,
                  contact: { ...settings.contact!, googleMapsUrl: e.target.value }
                })}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 7: SOCIAL & LIVE CHAT ================= */}
        {activeTab === 'social' && (
          <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              Social Media Accounts & Floating Chat Widgets
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">WhatsApp Floating Chat Number</label>
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
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Opens WhatsApp chat automatically on click</span>
              </div>

              <div className="form-group">
                <label className="form-label">Facebook Messenger Username / Page ID</label>
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
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Opens m.me/username for instant chat</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Facebook Page URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://facebook.com/..."
                  value={settings.socialLinks.facebook}
                  onChange={e => setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, facebook: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">YouTube Channel URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://youtube.com/@..."
                  value={settings.socialLinks.youtube}
                  onChange={e => setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, youtube: e.target.value }
                  })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Instagram Profile URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://instagram.com/..."
                  value={settings.socialLinks.instagram}
                  onChange={e => setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, instagram: e.target.value }
                  })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn Company Page URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://linkedin.com/company/..."
                  value={settings.socialLinks.linkedin || ''}
                  onChange={e => setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, linkedin: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 8: TERMS, PRIVACY & LEGAL POLICIES ================= */}
        {activeTab === 'policies' && (
          <div className="table-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Legal Policies & Customer Terms</h3>
                <p style={{ fontSize: '12.5px', color: '#64748b' }}>Edits here synchronize directly to the MongoDB pages collection and update the website instantly.</p>
              </div>
            </div>

            {/* Policy Sub-Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              {[
                { id: 'terms', label: 'Terms & Conditions' },
                { id: 'privacy', label: 'Privacy Policy' },
                { id: 'returnPolicy', label: 'Return & Refund Policy' },
                { id: 'warranty', label: 'Warranty Policy' },
                { id: 'shipping', label: 'Shipping Rules' }
              ].map(sub => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setPolicyTab(sub.id as any)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: policyTab === sub.id ? 600 : 500,
                    border: 'none',
                    borderRadius: '6px',
                    background: policyTab === sub.id ? '#ffffff' : 'transparent',
                    color: policyTab === sub.id ? '#0f172a' : '#64748b',
                    boxShadow: policyTab === sub.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Content (Markdown & Plain text supported)</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {(settings.policies?.[policyTab] || '').length} characters
                </span>
              </label>
              <textarea
                className="form-input"
                rows={14}
                style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6 }}
                value={settings.policies?.[policyTab] || ''}
                onChange={e => setSettings({
                  ...settings,
                  policies: {
                    ...settings.policies,
                    [policyTab]: e.target.value
                  }
                })}
                placeholder={`Write or paste ${policyTab} content here...`}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 9: SEO & META ================= */}
        {activeTab === 'seo' && (
          <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              Search Engine Optimization (SEO) & Social Sharing Tags
            </h3>

            {/* Google Snippet Live Preview */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Google Search Result Preview</span>
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '18px', color: '#1a0dab', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}>
                  {settings.metaTags.title || 'maxitshop - Solar & Engineering Store Bangladesh'}
                </div>
                <div style={{ fontSize: '13px', color: '#006621', marginTop: '2px' }}>
                  https://maxitecom.maxapi.esp32.site
                </div>
                <div style={{ fontSize: '13px', color: '#4d5156', marginTop: '4px', lineHeight: 1.4 }}>
                  {settings.metaTags.description || 'Buy solar panels, batteries, BMS, inverters, power tools and electronics parts in Bangladesh.'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Meta Title Tag (Recommended: 50-60 characters)</label>
              <input
                type="text"
                className="form-input"
                value={settings.metaTags.title}
                onChange={e => setSettings({
                  ...settings,
                  metaTags: { ...settings.metaTags, title: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Meta Description (Recommended: 150-160 characters)</label>
              <textarea
                className="form-input"
                rows={3}
                value={settings.metaTags.description}
                onChange={e => setSettings({
                  ...settings,
                  metaTags: { ...settings.metaTags, description: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Meta Keywords (Comma separated)</label>
              <input
                type="text"
                className="form-input"
                value={settings.metaTags.keywords || ''}
                onChange={e => setSettings({
                  ...settings,
                  metaTags: { ...settings.metaTags, keywords: e.target.value }
                })}
                placeholder="solar panels, lifepo4 battery, bms, bangladesh"
              />
            </div>
          </div>
        )}

        {/* Sticky Action Footer */}
        <div
          style={{
            position: 'sticky',
            bottom: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 50,
            marginTop: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <Info size={16} /> All changes are saved directly to your live MongoDB database.
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {savedSuccess && (
              <span style={{ fontSize: '13.5px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={16} /> Saved Successfully
              </span>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 600 }}
              disabled={saving}
            >
              {saving ? 'Saving...' : <><Save size={16} /> Save All Settings</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
