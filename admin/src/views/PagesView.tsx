import React, { useState, useEffect } from 'react';
import { PageContent } from '../types';
import { adminApi } from '../api';
import { FileText, Save, Check } from 'lucide-react';

export const PagesView: React.FC = () => {
  const [pages, setPages] = useState<Array<{ slug: string; title: string }>>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('order-procedure');
  const [pageData, setPageData] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchPageList = async () => {
    try {
      setLoading(true);
      const list = await adminApi.getPages();
      setPages(list);
      if (list.length > 0 && !selectedSlug) {
        setSelectedSlug(list[0].slug);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageContent = async (slug: string) => {
    try {
      const data = await adminApi.getPage(slug);
      setPageData(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPageList();
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      fetchPageContent(selectedSlug);
    }
  }, [selectedSlug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageData) return;
    try {
      setSaving(true);
      await adminApi.updatePage(selectedSlug, pageData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Policy & CMS Pages</h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Edit order procedures, delivery rules, return guidelines, and privacy policies.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        {/* Left: Page Selector */}
        <div className="table-card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Pages</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {pages.map(p => (
              <button
                key={p.slug}
                className={`nav-item ${selectedSlug === p.slug ? 'active' : ''}`}
                style={{ padding: '10px 12px', fontSize: '13px' }}
                onClick={() => setSelectedSlug(p.slug)}
              >
                <FileText size={15} /> {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Content Editor */}
        <div className="table-card" style={{ padding: '24px' }}>
          {pageData ? (
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Editing: {pageData.title}</h3>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {savedSuccess ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Page Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.title}
                  onChange={e => setPageData({ ...pageData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">SEO Meta Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pageData.metaTitle || ''}
                    onChange={e => setPageData({ ...pageData, metaTitle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SEO Meta Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pageData.metaDescription || ''}
                    onChange={e => setPageData({ ...pageData, metaDescription: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Page Body Content (HTML / Text)</label>
                <textarea
                  className="form-textarea"
                  rows={14}
                  style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}
                  value={pageData.content}
                  onChange={e => setPageData({ ...pageData, content: e.target.value })}
                  required
                />
              </div>
            </form>
          ) : (
            <p>Loading page content...</p>
          )}
        </div>
      </div>
    </div>
  );
};
