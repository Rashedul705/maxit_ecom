import React, { useState, useEffect, useRef } from 'react';
import { PageContent } from '../types';
import { adminApi } from '../api';
import {
  FileText,
  Save,
  Check,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Link as LinkIcon,
  Sparkles,
  Eye,
  Edit3,
  ShieldCheck,
  Clock,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { htmlToCleanPlainText, plainTextToCleanHtml } from '../utils/htmlTextConverter';

export const PagesView: React.FC = () => {
  const [pages, setPages] = useState<Array<{ slug: string; title: string }>>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('order-procedure');
  const [pageData, setPageData] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [notice, setNotice] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchPageList = async () => {
    try {
      setLoading(true);
      const list = await adminApi.getPages();
      setPages(list);
      if (list.length > 0 && !selectedSlug) {
        setSelectedSlug(list[0].slug);
      }
    } catch (err: any) {
      console.error('Failed to load page list:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageContent = async (slug: string) => {
    try {
      const data = await adminApi.getPage(slug);
      // Ensure content is presented in clean, friendly plain text for non-technical users
      const cleanContent = htmlToCleanPlainText(data.content || '');
      setPageData({
        ...data,
        content: cleanContent
      });
    } catch (err: any) {
      console.error('Failed to load page content:', err);
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

  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current || !pageData) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = pageData.content || '';
    const selectedText = currentVal.substring(start, end);

    let replacement = '';
    if (selectedText.length > 0) {
      replacement = `${prefix}${selectedText}${suffix}`;
    } else {
      replacement = `${prefix}${suffix}`;
    }

    const updated = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    setPageData({ ...pageData, content: updated });

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleCleanToPlainText = () => {
    if (!pageData) return;
    const cleaned = htmlToCleanPlainText(pageData.content);
    setPageData({ ...pageData, content: cleaned });
    setNotice('Content cleaned to pure readable plain text.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageData) return;
    try {
      setSaving(true);
      // Save the clean plain text/markdown directly
      await adminApi.updatePage(selectedSlug, pageData);
      setSavedSuccess(true);
      setNotice('Page saved successfully!');
      setTimeout(() => {
        setSavedSuccess(false);
        setNotice(null);
      }, 3000);
    } catch (err: any) {
      alert('Save failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Policy & CMS Pages</h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
          Edit website policies, delivery guidelines, return terms, and about us content using easy plain text.
        </p>
      </div>

      {notice && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} color="#16a34a" /> {notice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left: Page Selector */}
        <div className="table-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Select Page
            </h4>
            <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {pages.length} Pages
            </span>
          </div>

          {loading && pages.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>Loading pages...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {pages.map(p => (
                <button
                  key={p.slug}
                  type="button"
                  className={`nav-item ${selectedSlug === p.slug ? 'active' : ''}`}
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    textAlign: 'left',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedSlug(p.slug);
                    setViewMode('edit');
                  }}
                >
                  <FileText size={15} style={{ flexShrink: 0, opacity: selectedSlug === p.slug ? 1 : 0.6 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Content Editor / Preview */}
        <div className="table-card" style={{ padding: '24px' }}>
          {pageData ? (
            <form onSubmit={handleSave}>
              {/* Header Action Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid #f1f5f9',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                    Editing: {pageData.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Slug: <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', color: '#0284c7' }}>/page/{selectedSlug}</code>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* View Mode Toggle: Edit vs Live Preview */}
                  <div style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    padding: '3px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('edit')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: 'none',
                        background: viewMode === 'edit' ? '#ffffff' : 'transparent',
                        color: viewMode === 'edit' ? '#ff6600' : '#64748b',
                        boxShadow: viewMode === 'edit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit3 size={14} /> Edit Plain Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: 'none',
                        background: viewMode === 'preview' ? '#ffffff' : 'transparent',
                        color: viewMode === 'preview' ? '#ff6600' : '#64748b',
                        boxShadow: viewMode === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={14} /> Live Preview
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 18px',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                  >
                    {savedSuccess ? (
                      <><Check size={16} /> Saved!</>
                    ) : (
                      <><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</>
                    )}
                  </button>
                </div>
              </div>

              {/* Title & SEO Meta */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Page Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.title}
                  onChange={e => setPageData({ ...pageData, title: e.target.value })}
                  placeholder="e.g. Order Procedure"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>SEO Meta Title (Browser Tab)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pageData.metaTitle || ''}
                    onChange={e => setPageData({ ...pageData, metaTitle: e.target.value })}
                    placeholder="e.g. Order Procedure | MaxiTShop Bangladesh"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>SEO Meta Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pageData.metaDescription || ''}
                    onChange={e => setPageData({ ...pageData, metaDescription: e.target.value })}
                    placeholder="Brief description for Google search results..."
                  />
                </div>
              </div>

              {/* Body Content: Edit or Preview */}
              {viewMode === 'edit' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                      Page Content (Plain Text)
                    </label>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Non-technical friendly. No HTML tags needed.
                    </span>
                  </div>

                  {/* Formatting Toolbar */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderBottom: 'none',
                    borderRadius: '8px 8px 0 0',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => insertFormatting('**', '**')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                        title="Bold (**text**)"
                      >
                        <Bold size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('*', '*')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                        title="Italic (*text*)"
                      >
                        <Italic size={15} />
                      </button>
                      <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 4px' }} />
                      <button
                        type="button"
                        onClick={() => insertFormatting('## ')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                        title="Heading 2 (## Section Title)"
                      >
                        <Heading2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('### ')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                        title="Heading 3 (### Sub-section Title)"
                      >
                        <Heading3 size={15} />
                      </button>
                      <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 4px' }} />
                      <button
                        type="button"
                        onClick={() => insertFormatting('• ')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                        title="Bullet List (• Item)"
                      >
                        <List size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('1. ')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                        title="Numbered List (1. Item)"
                      >
                        <ListOrdered size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('\n\n---\n\n')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                        title="Divider Line (---)"
                      >
                        <Minus size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting('[Link Title](https://example.com)')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                        title="Link ([Title](URL))"
                      >
                        <LinkIcon size={15} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCleanToPlainText}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                      title="Convert any pasted HTML tags into clean, human-readable plain text"
                    >
                      <Sparkles size={13} color="#ff6600" /> Clean HTML to Plain Text
                    </button>
                  </div>

                  <textarea
                    ref={textareaRef}
                    className="form-textarea"
                    rows={15}
                    value={pageData.content}
                    onChange={e => setPageData({ ...pageData, content: e.target.value })}
                    placeholder="Write your page content here in natural plain text. Press Enter twice for new paragraphs, use bullets (•) or numbers (1, 2, 3) for lists."
                    style={{
                      borderRadius: '0 0 8px 8px',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      padding: '16px',
                      color: '#1e293b'
                    }}
                    required
                  />

                  {/* Helpful Non-Technical Guide */}
                  <div style={{
                    marginTop: '16px',
                    padding: '14px 18px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <HelpCircle size={14} color="#ff6600" /> Plain Text Formatting Guide for Non-Technical Users:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', lineHeight: '1.5' }}>
                      <div>
                        <strong style={{ color: '#0f172a' }}>Paragraphs:</strong> Press <em>Enter twice</em> to start a new paragraph.
                      </div>
                      <div>
                        <strong style={{ color: '#0f172a' }}>Headings:</strong> Start a line with <code>## Title</code> for major sections or <code>### Title</code> for sub-sections.
                      </div>
                      <div>
                        <strong style={{ color: '#0f172a' }}>Bullet Lists:</strong> Start each line with <code>• </code> or <code>- </code>.
                      </div>
                      <div>
                        <strong style={{ color: '#0f172a' }}>Numbered Lists:</strong> Start each line with <code>1. </code>, <code>2. </code>, etc.
                      </div>
                      <div>
                        <strong style={{ color: '#0f172a' }}>Bold Text:</strong> Wrap words with two asterisks: <code>**bold words**</code>.
                      </div>
                      <div>
                        <strong style={{ color: '#0f172a' }}>Web Links:</strong> Write <code>[Website Name](https://...)</code>.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Live Preview Mode (Replicates Storefront Layout) */
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: '#94a3b8',
                    marginBottom: '16px'
                  }}>
                    <span>Home</span>
                    <span>›</span>
                    <span>Policy</span>
                    <span>›</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{pageData.title}</span>
                  </div>

                  <div style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '28px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      marginBottom: '24px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: '#fff7ed',
                        color: '#ff6600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FileText size={22} />
                      </div>
                      <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {pageData.title}
                        </h1>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '4px',
                          fontSize: '11px',
                          color: '#94a3b8'
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#10b981', fontWeight: 600 }}>
                            <ShieldCheck size={13} /> Official MaxiTShop Policy
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={13} /> Live Storefront Preview
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rendered HTML */}
                    <div
                      style={{ fontSize: '14px', lineHeight: '1.7', color: '#334155' }}
                      dangerouslySetInnerHTML={{ __html: plainTextToCleanHtml(pageData.content) }}
                    />
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Select a page from the left to edit its content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
